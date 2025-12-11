/**
 * Server-side Batch Document Conversion API
 *
 * Handles document conversion using LibreOffice WASM on the server.
 * Uses Node.js runtime (not Edge) because the converter requires
 * full Emscripten runtime with filesystem support.
 *
 * POST /api/convert
 * - Content-Type: multipart/form-data
 * - Fields:
 *   - files: File[] - documents to convert
 *   - outputFormat: string - target format (pdf, docx, xlsx, etc.)
 *
 * Returns: application/zip with converted files
 */

import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { LibreOfficeConverter } from '@matbee/libreoffice-converter/server'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const wasmLoader = require('@matbee/libreoffice-converter/wasm/loader');

const converter = new LibreOfficeConverter({
  verbose: true,
  wasmLoader,
  onProgress: (progress) => {
    console.log(`[Converter Progress] ${progress.phase} - ${progress.percent}% - ${progress.message}`);
  },
});

// Force Node.js runtime (required for WASM with Emscripten)
export const runtime = 'nodejs';

// Increase timeout for batch conversions (default is 10s)
export const maxDuration = 300; // 5 minutes

// Supported input formats
const SUPPORTED_FORMATS = new Set([
  'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt',
  'odt', 'ods', 'odp', 'rtf', 'txt', 'csv', 'html',
  'pdf', 'png', 'jpg', 'jpeg', 'svg'
]);

// Valid output formats
const OUTPUT_FORMATS = new Set([
  'pdf', 'docx', 'odt', 'rtf', 'txt', 'html',
  'xlsx', 'ods', 'csv',
  'pptx', 'odp',
  'png', 'svg'
]);

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function isSupportedFormat(filename: string): boolean {
  const ext = getFileExtension(filename);
  return SUPPORTED_FORMATS.has(ext);
}

interface ConversionResult {
  filename: string;
  originalName: string;
  data: Uint8Array;
  size: number;
  status: 'converted' | 'copied' | 'failed';
  error?: string;
}

// Converter instance (lazily loaded)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let converterPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getConverter(): Promise<any> {
  if (converterPromise) {
    console.log('[Converter] Returning cached converter instance');
    return converterPromise;
  }

  console.log('[Converter] Starting initialization...');
  const startTime = Date.now();

  converterPromise = (async () => {
    console.log('[Converter] Calling converter.initialize()...');
    await converter.initialize();
    console.log(`[Converter] Initialized in ${Date.now() - startTime}ms`);
    return converter;
  })();

  return converterPromise;
}

export async function POST(request: NextRequest) {
  console.log('[API] POST /api/convert - Request received');
  try {
    console.log('[API] Parsing formData...');
    const formData = await request.formData();
    console.log('[API] FormData parsed');
    const outputFormat = formData.get('outputFormat') as string;
    const files = formData.getAll('files') as File[];

    // Validate output format
    if (!outputFormat || !OUTPUT_FORMATS.has(outputFormat)) {
      return NextResponse.json(
        { error: `Invalid output format: ${outputFormat}. Valid formats: ${[...OUTPUT_FORMATS].join(', ')}` },
        { status: 400 }
      );
    }

    // Validate files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Filter and validate files
    const validFiles = files.filter((file) => {
      if (!(file instanceof File)) return false;
      return isSupportedFormat(file.name);
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No supported files found. Supported formats: ' + [...SUPPORTED_FORMATS].join(', ') },
        { status: 400 }
      );
    }

    // Initialize converter
    console.log(`[API] ${validFiles.length} valid files, initializing converter...`);
    const converter = await getConverter();
    console.log('[API] Converter ready, starting conversions...');

    // Process files
    const results: ConversionResult[] = [];
    const maxRetries = 2;

    for (const file of validFiles) {
      const ext = getFileExtension(file.name);
      const outputName = file.name.replace(/\.[^.]+$/, `.${outputFormat}`);

      let result: ConversionResult;

      // If same format, just copy
      if (ext === outputFormat) {
        const buffer = await file.arrayBuffer();
        result = {
          filename: outputName,
          originalName: file.name,
          data: new Uint8Array(buffer),
          size: buffer.byteLength,
          status: 'copied',
        };
      } else {
        // Convert the file
        let lastError: Error | null = null;
        let converted = false;

        for (let attempt = 0; attempt <= maxRetries && !converted; attempt++) {
          try {
            console.log(`[API] Converting ${file.name} (attempt ${attempt + 1})...`);
            const buffer = await file.arrayBuffer();
            const conversionStart = Date.now();
            const conversionResult = await converter.convert(
              new Uint8Array(buffer),
              { outputFormat: outputFormat as any },
              file.name
            );
            console.log(`[API] Converted ${file.name} in ${Date.now() - conversionStart}ms`);

            result = {
              filename: outputName,
              originalName: file.name,
              data: conversionResult.data,
              size: conversionResult.data.byteLength,
              status: 'converted',
            };
            converted = true;
          } catch (error) {
            lastError = error as Error;
            console.error(`Conversion attempt ${attempt + 1} failed for ${file.name}:`, error);
            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        }

        if (!converted) {
          result = {
            filename: outputName,
            originalName: file.name,
            data: new Uint8Array(0),
            size: 0,
            status: 'failed',
            error: lastError?.message || 'Unknown error',
          };
        }
      }

      results.push(result!);
    }

    // Build ZIP file
    const zip = new JSZip();
    const successfulResults = results.filter((r) => r.status !== 'failed');

    if (successfulResults.length === 0) {
      return NextResponse.json(
        {
          error: 'All conversions failed',
          details: results.map((r) => ({
            file: r.originalName,
            error: r.error,
          })),
        },
        { status: 500 }
      );
    }

    for (const result of successfulResults) {
      zip.file(result.filename, result.data);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });

    // Build summary
    const summary = {
      total: files.length,
      converted: results.filter((r) => r.status === 'converted').length,
      copied: results.filter((r) => r.status === 'copied').length,
      failed: results.filter((r) => r.status === 'failed').length,
      skipped: files.length - validFiles.length,
      failures: results
        .filter((r) => r.status === 'failed')
        .map((r) => ({ file: r.originalName, error: r.error })),
    };

    // Return ZIP file
    return new NextResponse(Buffer.from(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="converted-files.zip"`,
        'X-Conversion-Summary': JSON.stringify(summary),
      },
    });
  } catch (error) {
    console.error('Batch conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint for health check and info
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    supportedInputFormats: [...SUPPORTED_FORMATS],
    supportedOutputFormats: [...OUTPUT_FORMATS],
    maxFiles: 100,
    maxFileSizeMB: 50,
  });
}
