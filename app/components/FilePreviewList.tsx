// app/components/FilePreviewList.tsx

'use client';

import type { FileEntry, ConversionProgress } from '../types/batch';
import type { OutputFormat } from '@matbee/libreoffice-converter/types';
import FilePreviewRow from './FilePreviewRow';

interface FilePreviewListProps {
  files: FileEntry[];
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  progress: ConversionProgress;
  outputFormat: OutputFormat;
  isConverting: boolean;
  onConvert: () => void;
  onDownload: () => void;
  hasZipReady: boolean;
}

export default function FilePreviewList({
  files,
  selectedFileId,
  onSelectFile,
  progress,
  outputFormat,
  isConverting,
  onConvert,
  onDownload,
  hasZipReady,
}: FilePreviewListProps) {
  const eligibleCount = files.filter(
    (f) => f.status !== 'unsupported'
  ).length;

  const isComplete = progress.current === progress.total && progress.total > 0;

  return (
    <div className="file-preview-list-container">
      {/* Header with stats */}
      <div className="file-preview-list-header">
        <div className="preview-header-title">
          <div className="card-icon">🖼️</div>
          <div>
            <div className="card-title">File Preview</div>
            <div className="card-subtitle">Click to view pages</div>
          </div>
        </div>
        <div className="preview-stats">
          <div className="stat">
            <div className="stat-value">{files.length}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat">
            <div className="stat-value">{eligibleCount}</div>
            <div className="stat-label">Eligible</div>
          </div>
          {progress.total > 0 && (
            <>
              <div className="stat">
                <div className="stat-value">{progress.converted}</div>
                <div className="stat-label">Converted</div>
              </div>
              <div className="stat">
                <div className="stat-value">{progress.failed}</div>
                <div className="stat-label">Failed</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="file-preview-list">
        {files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📑</div>
            <h3>No files loaded</h3>
            <p>Drop files or folders to get started</p>
          </div>
        ) : (
          files.map((file) => (
            <FilePreviewRow
              key={file.id}
              file={file}
              onClick={() => onSelectFile(file.id)}
              isSelected={selectedFileId === file.id}
            />
          ))
        )}
      </div>

      {/* Sticky footer */}
      {files.length > 0 && (
        <div className="sticky-footer">
          {isConverting ? (
            <div className="sticky-footer-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                Processing {progress.current} of {progress.total}...
              </span>
            </div>
          ) : isComplete && hasZipReady ? (
            <button className="btn btn-primary" onClick={onDownload}>
              Download ZIP
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={onConvert}
              disabled={eligibleCount === 0}
            >
              Convert {eligibleCount} File{eligibleCount !== 1 ? 's' : ''} to{' '}
              {outputFormat.toUpperCase()}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
