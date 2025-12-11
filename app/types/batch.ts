// app/types/batch.ts

export type FileStatus =
  | 'pending'      // Just added, not yet processed
  | 'loading'      // Loading document info
  | 'ready'        // Document info loaded, ready to convert
  | 'converting'   // Currently converting
  | 'done'         // Successfully converted
  | 'copied'       // Same format, copied as-is
  | 'failed'       // Conversion failed
  | 'unsupported'; // Unsupported file type

export interface PagePreview {
  page: number;
  data: Uint8Array;
  width: number;
  height: number;
}

export interface DocumentInfo {
  documentType: number;
  documentTypeName: string;
  validOutputFormats: string[];
  pageCount: number;
}

export interface FileEntry {
  id: string;
  file: File;
  status: FileStatus;
  documentInfo?: DocumentInfo;
  firstPagePreview?: PagePreview;
  pagePreviews?: PagePreview[];
  loadedPages?: Set<number>;
  storageKey?: string;
  resultSize?: number;
  outputName?: string;
  error?: string;
}

export interface ConversionProgress {
  current: number;
  total: number;
  converted: number;
  copied: number;
  failed: number;
}

// Legacy export for compatibility during migration
export type BatchFileStatus = FileStatus;
export type BatchFile = FileEntry;
export type BatchProgress = ConversionProgress;
