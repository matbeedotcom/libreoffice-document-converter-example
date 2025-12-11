#!/usr/bin/env npx tsx
/**
 * Test script for the /api/convert endpoint
 *
 * Usage:
 *   npx tsx scripts/test-convert-api.ts <file1> [file2] ... [--format <format>] [--url <url>]
 *
 * Examples:
 *   npx tsx scripts/test-convert-api.ts ./document.docx
 *   npx tsx scripts/test-convert-api.ts ./doc1.docx ./doc2.xlsx --format pdf
 *   npx tsx scripts/test-convert-api.ts ./documents/*.docx --format pdf --url http://localhost:3000
 */

import { readFileSync, writeFileSync, statSync, readdirSync } from 'fs';
import { basename, extname, resolve } from 'path';

const DEFAULT_URL = 'http://localhost:3000';
const DEFAULT_FORMAT = 'pdf';

interface Args {
  files: string[];
  format: string;
  url: string;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const files: string[] = [];
  let format = DEFAULT_FORMAT;
  let url = DEFAULT_URL;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' && args[i + 1]) {
      format = args[i + 1];
      i++;
    } else if (arg === '--url' && args[i + 1]) {
      url = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Test script for /api/convert endpoint

Usage:
  npx tsx scripts/test-convert-api.ts <files...> [options]

Options:
  --format <format>  Output format (default: pdf)
  --url <url>        API base URL (default: http://localhost:3000)
  --help, -h         Show this help

Examples:
  npx tsx scripts/test-convert-api.ts ./document.docx
  npx tsx scripts/test-convert-api.ts ./doc1.docx ./doc2.xlsx --format pdf
  npx tsx scripts/test-convert-api.ts ./documents/ --format docx
`);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      // Check if it's a directory
      try {
        const stat = statSync(arg);
        if (stat.isDirectory()) {
          // Add all files in directory
          const dirFiles = readdirSync(arg)
            .filter((f) => !f.startsWith('.'))
            .map((f) => resolve(arg, f))
            .filter((f) => statSync(f).isFile());
          files.push(...dirFiles);
        } else {
          files.push(arg);
        }
      } catch {
        console.error(`Warning: Cannot access ${arg}`);
      }
    }
  }

  return { files, format, url };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  const { files, format, url } = parseArgs();

  if (files.length === 0) {
    console.error('Error: No files provided');
    console.log('Usage: npx tsx scripts/test-convert-api.ts <files...> [--format <format>]');
    process.exit(1);
  }

  console.log(`\nTesting /api/convert endpoint`);
  console.log(`URL: ${url}/api/convert`);
  console.log(`Output format: ${format}`);
  console.log(`Files: ${files.length}`);
  console.log('');

  // Check API health first
  try {
    const healthRes = await fetch(`${url}/api/convert`);
    if (!healthRes.ok) {
      console.error(`API health check failed: ${healthRes.status}`);
      process.exit(1);
    }
    const healthData = await healthRes.json();
    console.log('API Info:', healthData);
    console.log('');
  } catch (error) {
    console.error(`Cannot connect to API at ${url}/api/convert`);
    console.error('Make sure the server is running with: npm run dev');
    process.exit(1);
  }

  // Build form data
  const formData = new FormData();
  formData.append('outputFormat', format);

  for (const filePath of files) {
    try {
      const buffer = readFileSync(filePath);
      const blob = new Blob([buffer]);
      const filename = basename(filePath);
      formData.append('files', blob, filename);
      console.log(`  Adding: ${filename} (${formatBytes(buffer.byteLength)})`);
    } catch (error) {
      console.error(`  Skipping ${filePath}: ${(error as Error).message}`);
    }
  }

  console.log('');
  console.log('Sending request...');
  const startTime = Date.now();

  try {
    const response = await fetch(`${url}/api/convert`, {
      method: 'POST',
      body: formData,
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`\nConversion failed (${response.status}):`);
      console.error(JSON.stringify(errorData, null, 2));
      process.exit(1);
    }

    // Get summary from header
    const summaryHeader = response.headers.get('X-Conversion-Summary');
    if (summaryHeader) {
      const summary = JSON.parse(summaryHeader);
      console.log('\nConversion Summary:');
      console.log(`  Total: ${summary.total}`);
      console.log(`  Converted: ${summary.converted}`);
      console.log(`  Copied: ${summary.copied}`);
      console.log(`  Failed: ${summary.failed}`);
      console.log(`  Skipped: ${summary.skipped}`);

      if (summary.failures?.length > 0) {
        console.log('\nFailures:');
        for (const failure of summary.failures) {
          console.log(`  - ${failure.file}: ${failure.error}`);
        }
      }
    }

    // Save the ZIP file
    const arrayBuffer = await response.arrayBuffer();
    const outputPath = `converted-files-${Date.now()}.zip`;
    writeFileSync(outputPath, Buffer.from(arrayBuffer));

    console.log(`\nSuccess!`);
    console.log(`  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`  Output: ${outputPath} (${formatBytes(arrayBuffer.byteLength)})`);
  } catch (error) {
    console.error('\nRequest failed:', (error as Error).message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
