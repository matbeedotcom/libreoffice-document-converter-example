/**
 * AWS Lambda Handler for Document Conversion
 *
 * Accepts multipart/form-data with files and outputFormat
 * Returns a ZIP file with converted documents (base64 encoded)
 */

import { LibreOfficeConverter } from '@matbee/libreoffice-converter/server';
import { createRequire } from 'module';
import JSZip from 'jszip';

const require = createRequire(import.meta.url);
const wasmLoader = require('@matbee/libreoffice-converter/wasm/loader');

// Supported formats
const SUPPORTED_FORMATS = new Set([
  'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
  'odt', 'ods', 'odp', 'rtf', 'txt', 'csv', 'html',
  'pdf', 'png', 'jpg', 'jpeg', 'svg'
]);

const OUTPUT_FORMATS = new Set([
  'pdf', 'docx', 'odt', 'rtf', 'txt', 'html',
  'xlsx', 'ods', 'csv',
  'pptx', 'odp',
  'png', 'svg'
]);

// Lazy-loaded converter
let converter = null;
let converterPromise = null;

async function getConverter() {
  if (converter) {
    console.log('[Converter] Returning cached instance');
    return converter;
  }

  if (converterPromise) {
    return converterPromise;
  }

  console.log('[Converter] Initializing...');
  const startTime = Date.now();

  converterPromise = (async () => {
    const conv = new LibreOfficeConverter({
      verbose: true,
      wasmLoader,
      onProgress: (progress) => {
        console.log(`[Progress] ${progress.phase} - ${progress.percent}% - ${progress.message}`);
      },
    });
    await conv.initialize();
    console.log(`[Converter] Initialized in ${Date.now() - startTime}ms`);
    converter = conv;
    return converter;
  })();

  return converterPromise;
}

function getFileExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function parseMultipartFormData(body, contentType) {
  // Extract boundary from content-type
  const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/);
  if (!boundaryMatch) {
    throw new Error('No boundary found in content-type');
  }
  const boundary = boundaryMatch[1] || boundaryMatch[2];

  const parts = [];
  const bodyBuffer = Buffer.from(body, 'base64');
  const boundaryBuffer = Buffer.from(`--${boundary}`);

  let start = bodyBuffer.indexOf(boundaryBuffer) + boundaryBuffer.length + 2; // skip CRLF

  while (start < bodyBuffer.length) {
    const end = bodyBuffer.indexOf(boundaryBuffer, start);
    if (end === -1) break;

    const partBuffer = bodyBuffer.slice(start, end - 2); // -2 for CRLF before boundary
    const headerEnd = partBuffer.indexOf('\r\n\r\n');

    if (headerEnd !== -1) {
      const headers = partBuffer.slice(0, headerEnd).toString();
      const content = partBuffer.slice(headerEnd + 4);

      const nameMatch = headers.match(/name="([^"]+)"/);
      const filenameMatch = headers.match(/filename="([^"]+)"/);

      if (nameMatch) {
        parts.push({
          name: nameMatch[1],
          filename: filenameMatch?.[1],
          data: filenameMatch ? content : content.toString(),
        });
      }
    }

    start = end + boundaryBuffer.length + 2;
  }

  return parts;
}

export async function handler(event) {
  console.log('[Lambda] Request received');

  try {
    // Handle CORS preflight
    if (event.requestContext?.http?.method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: '',
      };
    }

    // Health check
    if (event.requestContext?.http?.method === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          status: 'ok',
          supportedInputFormats: [...SUPPORTED_FORMATS],
          supportedOutputFormats: [...OUTPUT_FORMATS],
        }),
      };
    }

    // Parse multipart form data
    const contentType = event.headers?.['content-type'] || event.headers?.['Content-Type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
      };
    }

    const parts = parseMultipartFormData(event.body, contentType);

    // Extract outputFormat and files
    const outputFormatPart = parts.find(p => p.name === 'outputFormat');
    const outputFormat = outputFormatPart?.data?.trim();

    if (!outputFormat || !OUTPUT_FORMATS.has(outputFormat)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: `Invalid output format: ${outputFormat}. Valid: ${[...OUTPUT_FORMATS].join(', ')}`,
        }),
      };
    }

    const fileParts = parts.filter(p => p.name === 'files' && p.filename);
    if (fileParts.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No files provided' }),
      };
    }

    // Initialize converter
    const conv = await getConverter();

    // Process files
    const results = [];
    for (const filePart of fileParts) {
      const ext = getFileExtension(filePart.filename);
      const outputName = filePart.filename.replace(/\.[^.]+$/, `.${outputFormat}`);

      if (!SUPPORTED_FORMATS.has(ext)) {
        results.push({
          filename: outputName,
          originalName: filePart.filename,
          status: 'failed',
          error: `Unsupported format: ${ext}`,
        });
        continue;
      }

      // Same format = copy
      if (ext === outputFormat) {
        results.push({
          filename: outputName,
          originalName: filePart.filename,
          data: new Uint8Array(filePart.data),
          status: 'copied',
        });
        continue;
      }

      // Convert
      try {
        console.log(`[Lambda] Converting ${filePart.filename}...`);
        const startTime = Date.now();
        const result = await conv.convert(
          new Uint8Array(filePart.data),
          { outputFormat },
          filePart.filename
        );
        console.log(`[Lambda] Converted ${filePart.filename} in ${Date.now() - startTime}ms`);

        results.push({
          filename: outputName,
          originalName: filePart.filename,
          data: result.data,
          status: 'converted',
        });
      } catch (error) {
        console.error(`[Lambda] Failed to convert ${filePart.filename}:`, error);
        results.push({
          filename: outputName,
          originalName: filePart.filename,
          status: 'failed',
          error: error.message,
        });
      }
    }

    // Build ZIP
    const zip = new JSZip();
    const successfulResults = results.filter(r => r.status !== 'failed' && r.data);

    if (successfulResults.length === 0) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          error: 'All conversions failed',
          details: results.map(r => ({ file: r.originalName, error: r.error })),
        }),
      };
    }

    for (const result of successfulResults) {
      zip.file(result.filename, result.data);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    // Summary
    const summary = {
      total: fileParts.length,
      converted: results.filter(r => r.status === 'converted').length,
      copied: results.filter(r => r.status === 'copied').length,
      failed: results.filter(r => r.status === 'failed').length,
      failures: results.filter(r => r.status === 'failed').map(r => ({
        file: r.originalName,
        error: r.error,
      })),
    };

    console.log(`[Lambda] Complete: ${summary.converted} converted, ${summary.copied} copied, ${summary.failed} failed`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="converted-files.zip"',
        'X-Conversion-Summary': JSON.stringify(summary),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Conversion-Summary',
      },
      body: Buffer.from(zipBuffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('[Lambda] Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
    };
  }
}
