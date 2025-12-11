#!/usr/bin/env npx tsx
/**
 * Batch Upload Script
 *
 * Uploads an entire directory of documents to the conversion API
 * and saves the resulting ZIP file.
 *
 * Usage:
 *   npx tsx scripts/batch-upload.ts <directory> [options]
 *
 * Options:
 *   --format, -f    Output format (default: pdf)
 *   --output, -o    Output ZIP file path (default: converted-<timestamp>.zip)
 *   --url, -u       API URL (default: http://localhost:3000/api/convert)
 *   --recursive, -r Include subdirectories
 *   --dry-run       Show files that would be uploaded without uploading
 *
 * Examples:
 *   npx tsx scripts/batch-upload.ts ./documents
 *   npx tsx scripts/batch-upload.ts ./documents --format docx
 *   npx tsx scripts/batch-upload.ts ./documents -f pdf -o output.zip
 *   npx tsx scripts/batch-upload.ts ./documents --recursive
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPPORTED_EXTENSIONS = new Set([
  '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt',
  '.odt', '.ods', '.odp', '.rtf', '.txt', '.csv', '.html',
  '.pdf', '.png', '.jpg', '.jpeg', '.svg'
]);

interface Options {
  directory: string;
  format: string;
  output: string;
  url: string;
  recursive: boolean;
  dryRun: boolean;
}

function parseArgs(): Options {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Batch Upload Script - Upload a directory of documents for conversion

Usage:
  npx tsx scripts/batch-upload.ts <directory> [options]

Options:
  --format, -f    Output format (default: pdf)
  --output, -o    Output ZIP file path (default: converted-<timestamp>.zip)
  --url, -u       API URL (default: http://localhost:3000/api/convert)
  --recursive, -r Include subdirectories
  --dry-run       Show files that would be uploaded without uploading

Supported input formats:
  Documents: docx, doc, odt, rtf, txt, html
  Spreadsheets: xlsx, xls, ods, csv
  Presentations: pptx, ppt, odp
  Images: pdf, png, jpg, jpeg, svg

Examples:
  npx tsx scripts/batch-upload.ts ./documents
  npx tsx scripts/batch-upload.ts ./documents --format docx
  npx tsx scripts/batch-upload.ts ./documents -f pdf -o output.zip --recursive
`);
    process.exit(0);
  }

  const options: Options = {
    directory: args[0],
    format: 'pdf',
    output: `converted-${Date.now()}.zip`,
    url: 'http://localhost:3000/api/convert',
    recursive: false,
    dryRun: false,
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--format':
      case '-f':
        options.format = args[++i];
        break;
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--url':
      case '-u':
        options.url = args[++i];
        break;
      case '--recursive':
      case '-r':
        options.recursive = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
    }
  }

  return options;
}

function collectFiles(dir: string, recursive: boolean): string[] {
  const files: string[] = [];

  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          scan(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.has(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  scan(dir);
  return files;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function uploadFiles(files: string[], options: Options): Promise<void> {
  const formData = new FormData();
  formData.append('outputFormat', options.format);

  let totalSize = 0;

  console.log(`\nPreparing ${files.length} files for upload...\n`);

  for (const filePath of files) {
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const blob = new Blob([buffer]);
    const fileName = path.basename(filePath);

    formData.append('files', blob, fileName);
    totalSize += stats.size;

    console.log(`  ${fileName} (${formatBytes(stats.size)})`);
  }

  console.log(`\nTotal: ${files.length} files, ${formatBytes(totalSize)}`);
  console.log(`Output format: ${options.format.toUpperCase()}`);
  console.log(`\nUploading to ${options.url}...`);

  const startTime = Date.now();

  const response = await fetch(options.url, {
    method: 'POST',
    body: formData,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (!response.ok) {
    const error = await response.json();
    console.error(`\n❌ Upload failed (${response.status}):`, error);
    process.exit(1);
  }

  // Parse summary from header
  const summaryHeader = response.headers.get('X-Conversion-Summary');
  if (summaryHeader) {
    const summary = JSON.parse(summaryHeader);
    console.log(`\n✅ Conversion complete in ${elapsed}s`);
    console.log(`   Converted: ${summary.converted}`);
    console.log(`   Copied: ${summary.copied}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Skipped: ${summary.skipped}`);

    if (summary.failures && summary.failures.length > 0) {
      console.log(`\n⚠️  Failed files:`);
      for (const failure of summary.failures) {
        console.log(`   - ${failure.file}: ${failure.error}`);
      }
    }
  }

  // Save the ZIP file
  const arrayBuffer = await response.arrayBuffer();
  const zipBuffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(options.output, zipBuffer);
  console.log(`\n📦 Saved: ${options.output} (${formatBytes(zipBuffer.length)})`);
}

async function main() {
  const options = parseArgs();

  // Validate directory
  if (!fs.existsSync(options.directory)) {
    console.error(`Error: Directory not found: ${options.directory}`);
    process.exit(1);
  }

  const stats = fs.statSync(options.directory);
  if (!stats.isDirectory()) {
    console.error(`Error: Not a directory: ${options.directory}`);
    process.exit(1);
  }

  // Collect files
  console.log(`\nScanning: ${path.resolve(options.directory)}`);
  console.log(`Recursive: ${options.recursive ? 'yes' : 'no'}`);

  const files = collectFiles(options.directory, options.recursive);

  if (files.length === 0) {
    console.log('\nNo supported files found in directory.');
    console.log('Supported extensions:', [...SUPPORTED_EXTENSIONS].join(', '));
    process.exit(0);
  }

  console.log(`\nFound ${files.length} supported files`);

  if (options.dryRun) {
    console.log('\n[Dry run] Files that would be uploaded:\n');
    for (const file of files) {
      const stats = fs.statSync(file);
      const relativePath = path.relative(options.directory, file);
      console.log(`  ${relativePath} (${formatBytes(stats.size)})`);
    }
    console.log(`\nTotal: ${files.length} files`);
    console.log('Run without --dry-run to upload.');
    process.exit(0);
  }

  await uploadFiles(files, options);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
