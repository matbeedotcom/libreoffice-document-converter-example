// app/components/FileList.tsx

'use client';

import type { FileEntry, FileStatus } from '../types/batch';

interface FileListProps {
  files: FileEntry[];
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getStatusBadge(status: FileStatus): { label: string; className: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', className: 'badge-pending' };
    case 'loading':
      return { label: 'Loading...', className: 'badge-loading' };
    case 'ready':
      return { label: 'Ready', className: 'badge-ready' };
    case 'converting':
      return { label: 'Converting...', className: 'badge-converting' };
    case 'done':
      return { label: 'Done', className: 'badge-done' };
    case 'copied':
      return { label: 'Copied', className: 'badge-done' };
    case 'failed':
      return { label: 'Failed', className: 'badge-failed' };
    case 'unsupported':
      return { label: 'Unsupported', className: 'badge-unsupported' };
    default:
      return { label: status, className: '' };
  }
}

export default function FileList({ files, onRemoveFile, onClearAll, disabled }: FileListProps) {
  if (files.length === 0) return null;

  // Single file: compact display
  if (files.length === 1) {
    const file = files[0];
    return (
      <div className="file-info show">
        <span className="file-icon">📎</span>
        <div className="file-details">
          <div className="file-name">{file.file.name}</div>
          <div className="file-meta">{formatBytes(file.file.size)}</div>
        </div>
        <button
          className="file-remove-btn"
          onClick={() => onClearAll()}
          disabled={disabled}
          aria-label="Remove file"
        >
          ×
        </button>
      </div>
    );
  }

  // Multiple files: list display
  return (
    <div className="file-list">
      <div className="file-list-header">
        <span className="file-list-count">{files.length} files</span>
        <button
          className="file-list-clear-btn"
          onClick={onClearAll}
          disabled={disabled}
        >
          Clear All
        </button>
      </div>
      <div className="file-list-items">
        {files.map((file) => {
          const badge = getStatusBadge(file.status);
          return (
            <div key={file.id} className="file-list-item">
              <div className="file-list-item-info">
                <span className="file-list-item-name" title={file.file.name}>
                  {file.file.name}
                </span>
                <span className="file-list-item-size">
                  {formatBytes(file.file.size)}
                </span>
              </div>
              <div className="file-list-item-actions">
                <span className={`file-list-item-badge ${badge.className}`}>
                  {file.error || badge.label}
                </span>
                <button
                  className="file-list-item-remove"
                  onClick={() => onRemoveFile(file.id)}
                  disabled={disabled}
                  aria-label={`Remove ${file.file.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
