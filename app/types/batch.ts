// app/types/batch.ts

export type BatchFileStatus =
  | 'ready'
  | 'converting'
  | 'done'
  | 'copied'
  | 'failed'
  | 'unsupported';

export interface BatchFile {
  id: string;
  file: File;
  status: BatchFileStatus;
  error?: string;
  storageKey?: string;
  resultSize?: number;
  outputName?: string;
}

export interface BatchProgress {
  current: number;
  total: number;
  converted: number;
  copied: number;
  failed: number;
}

export interface BatchState {
  isActive: boolean;
  files: BatchFile[];
  progress: BatchProgress;
  folderName: string;
}
