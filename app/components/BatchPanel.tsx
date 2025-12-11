// app/components/BatchPanel.tsx

'use client';

import { useCallback } from 'react';
import type { BatchFile, BatchProgress } from '../types/batch';
import type { ZipFile } from '../utils/zipBuilder';
import type { OutputFormat } from '@matbee/libreoffice-converter/types';

interface BatchPanelProps {
  files: BatchFile[];
  progress: BatchProgress;
  outputFormat: OutputFormat;
  folderName: string;
  isConverting: boolean;
  zipFiles: ZipFile[];
  showSupportPrompt: boolean;
  onConvert: () => void;
  onCancel: () => void;
  onDownload: (zipFile: ZipFile) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getStatusLabel(status: BatchFile['status']): string {
  switch (status) {
    case 'ready':
      return 'Ready';
    case 'converting':
      return 'Converting...';
    case 'done':
      return 'Done';
    case 'copied':
      return 'Copied (same format)';
    case 'failed':
      return 'Failed';
    case 'unsupported':
      return 'Unsupported';
    default:
      return status;
  }
}

function getStatusClass(status: BatchFile['status']): string {
  switch (status) {
    case 'done':
    case 'copied':
      return 'status-success';
    case 'failed':
    case 'unsupported':
      return 'status-error';
    case 'converting':
      return 'status-active';
    default:
      return '';
  }
}

export default function BatchPanel({
  files,
  progress,
  outputFormat,
  folderName,
  isConverting,
  zipFiles,
  showSupportPrompt,
  onConvert,
  onCancel,
  onDownload,
}: BatchPanelProps) {
  const isComplete = progress.current === progress.total && progress.total > 0;
  const hasFiles = files.length > 0;
  const eligibleFiles = files.filter(
    (f) => f.status !== 'unsupported'
  ).length;

  return (
    <div className="batch-panel-overlay">
      <div className="batch-panel">
        <div className="batch-panel-header">
          <div>
            <h2>Batch Conversion</h2>
            <p className="batch-folder-name">{folderName}</p>
          </div>
          <button
            className="batch-close-btn"
            onClick={onCancel}
            disabled={isConverting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="batch-summary">
          <div className="batch-stat">
            <span className="batch-stat-value">{files.length}</span>
            <span className="batch-stat-label">Total</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value">{eligibleFiles}</span>
            <span className="batch-stat-label">Eligible</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value">{progress.converted}</span>
            <span className="batch-stat-label">Converted</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value">{progress.copied}</span>
            <span className="batch-stat-label">Copied</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value">{progress.failed}</span>
            <span className="batch-stat-label">Failed</span>
          </div>
        </div>

        {isConverting && (
          <div className="batch-progress">
            <div className="batch-progress-bar">
              <div
                className="batch-progress-fill"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              />
            </div>
            <p className="batch-progress-text">
              Processing {progress.current} of {progress.total}...
            </p>
          </div>
        )}

        <div className="batch-file-list">
          {files.map((file) => (
            <div key={file.id} className="batch-file-item">
              <div className="batch-file-info">
                <span className="batch-file-name">{file.file.name}</span>
                <span className="batch-file-size">
                  {formatBytes(file.file.size)}
                </span>
              </div>
              <span className={`batch-file-status ${getStatusClass(file.status)}`}>
                {file.error || getStatusLabel(file.status)}
              </span>
            </div>
          ))}
        </div>

        <div className="batch-actions">
          {!isComplete && !isConverting && (
            <>
              <button
                className="btn btn-primary"
                onClick={onConvert}
                disabled={eligibleFiles === 0}
              >
                Convert {eligibleFiles} Files to {outputFormat.toUpperCase()}
              </button>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}

          {isComplete && zipFiles.length > 0 && (
            <div className="batch-downloads">
              <h3>Downloads Ready</h3>
              <div className="batch-zip-list">
                {zipFiles.map((zip, index) => (
                  <button
                    key={index}
                    className="btn btn-primary batch-download-btn"
                    onClick={() => onDownload(zip)}
                  >
                    Download {zip.name} ({formatBytes(zip.blob.size)})
                  </button>
                ))}
              </div>
              {showSupportPrompt && (
                <a 
                  href="https://buymeacoffee.com/matbee" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="batch-support-link"
                >
                  ☕ Enjoying this tool? Buy me a coffee
                </a>
              )}
              <button className="btn btn-secondary" onClick={onCancel}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
