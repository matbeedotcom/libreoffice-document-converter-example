// app/utils/zipBuilder.ts

import JSZip from 'jszip';
import { getConvertedFile } from './batchStorage';

const MAX_ZIP_SIZE = 250 * 1024 * 1024; // 250MB

export interface ZipFile {
  name: string;
  blob: Blob;
}

export interface FileToZip {
  outputName: string;
  storageKey: string;
  size: number;
}

export async function buildZipFiles(
  files: FileToZip[],
  baseName: string
): Promise<ZipFile[]> {
  const zipFiles: ZipFile[] = [];
  let currentZip = new JSZip();
  let currentSize = 0;
  let zipIndex = 1;

  for (const file of files) {
    const data = await getConvertedFile(file.storageKey);
    if (!data) continue;

    // If single file exceeds max, it gets its own ZIP
    if (file.size > MAX_ZIP_SIZE) {
      if (currentSize > 0) {
        // Finalize current ZIP first
        const blob = await currentZip.generateAsync({ type: 'blob' });
        zipFiles.push({
          name: `${baseName}-${String(zipIndex).padStart(3, '0')}.zip`,
          blob,
        });
        zipIndex++;
        currentZip = new JSZip();
        currentSize = 0;
      }

      // Create dedicated ZIP for large file
      const largeZip = new JSZip();
      largeZip.file(file.outputName, data);
      const blob = await largeZip.generateAsync({ type: 'blob' });
      zipFiles.push({
        name: `${baseName}-${String(zipIndex).padStart(3, '0')}.zip`,
        blob,
      });
      zipIndex++;
      continue;
    }

    // Check if adding this file would exceed limit
    if (currentSize + file.size > MAX_ZIP_SIZE && currentSize > 0) {
      // Finalize current ZIP
      const blob = await currentZip.generateAsync({ type: 'blob' });
      zipFiles.push({
        name: `${baseName}-${String(zipIndex).padStart(3, '0')}.zip`,
        blob,
      });
      zipIndex++;
      currentZip = new JSZip();
      currentSize = 0;
    }

    // Add file to current ZIP
    currentZip.file(file.outputName, data);
    currentSize += file.size;
  }

  // Finalize last ZIP if it has content
  if (currentSize > 0) {
    const blob = await currentZip.generateAsync({ type: 'blob' });
    const name = zipFiles.length === 0
      ? `${baseName}.zip`
      : `${baseName}-${String(zipIndex).padStart(3, '0')}.zip`;
    zipFiles.push({ name, blob });
  }

  return zipFiles;
}

export function downloadZipFile(zipFile: ZipFile): void {
  const url = URL.createObjectURL(zipFile.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFile.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
