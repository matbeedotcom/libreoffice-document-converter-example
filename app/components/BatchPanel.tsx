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

  const progressPercent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div 
      className="batch-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-dialog-title"
      aria-describedby="batch-dialog-description"
    >
      <div className="batch-panel">
        <div className="batch-panel-header">
          <div>
            <h2 id="batch-dialog-title">Batch Conversion</h2>
            <p id="batch-dialog-description" className="batch-folder-name">
              Converting files from: {folderName}
            </p>
          </div>
          <button
            className="batch-close-btn"
            onClick={onCancel}
            disabled={isConverting}
            aria-label="Close batch conversion dialog"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="batch-summary" role="group" aria-label="Conversion statistics">
          <div className="batch-stat">
            <span className="batch-stat-value" aria-label={`${files.length} total files`}>{files.length}</span>
            <span className="batch-stat-label">Total</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value" aria-label={`${eligibleFiles} eligible files`}>{eligibleFiles}</span>
            <span className="batch-stat-label">Eligible</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value" aria-label={`${progress.converted} converted`}>{progress.converted}</span>
            <span className="batch-stat-label">Converted</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value" aria-label={`${progress.copied} copied`}>{progress.copied}</span>
            <span className="batch-stat-label">Copied</span>
          </div>
          <div className="batch-stat">
            <span className="batch-stat-value" aria-label={`${progress.failed} failed`}>{progress.failed}</span>
            <span className="batch-stat-label">Failed</span>
          </div>
        </div>

        {isConverting && (
          <div 
            className="batch-progress"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Batch conversion progress"
          >
            <div className="batch-progress-bar">
              <div
                className="batch-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="batch-progress-text" aria-live="polite">
              Processing {progress.current} of {progress.total}...
            </p>
          </div>
        )}

        <div className="batch-file-list" role="list" aria-label="Files to convert">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="batch-file-item"
              role="listitem"
              aria-label={`${file.file.name}, ${formatBytes(file.file.size)}, ${getStatusLabel(file.status)}`}
            >
              <div className="batch-file-info">
                <span className="batch-file-name">{file.file.name}</span>
                <span className="batch-file-size" aria-hidden="true">
                  {formatBytes(file.file.size)}
                </span>
              </div>
              <span 
                className={`batch-file-status ${getStatusClass(file.status)}`}
                role="status"
                aria-live={file.status === 'converting' ? 'polite' : 'off'}
              >
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
                aria-disabled={eligibleFiles === 0}
              >
                Convert {eligibleFiles} Files to {outputFormat.toUpperCase()}
              </button>
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            </>
          )}

          {isComplete && zipFiles.length > 0 && (
            <div className="batch-downloads" role="region" aria-label="Download converted files">
              <h3>Downloads Ready</h3>
              <div className="batch-zip-list" role="list" aria-label="Available downloads">
                {zipFiles.map((zip, index) => (
                  <button
                    key={index}
                    className="btn btn-primary batch-download-btn"
                    onClick={() => onDownload(zip)}
                    role="listitem"
                    aria-label={`Download ${zip.name}, size ${formatBytes(zip.blob.size)}`}
                  >
                    <span aria-hidden="true">📥</span> Download {zip.name} ({formatBytes(zip.blob.size)})
                  </button>
                ))}
              </div>
              {showSupportPrompt && (
                <a 
                  href="https://buymeacoffee.com/matbee" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="batch-support-link"
                  aria-label="Support this tool - Buy me a coffee (opens in new tab)"
                >
                  <span aria-hidden="true">☕</span> Enjoying this tool? Buy me a coffee
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
