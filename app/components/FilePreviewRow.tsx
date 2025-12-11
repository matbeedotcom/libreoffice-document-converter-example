// app/components/FilePreviewRow.tsx

'use client';

import { useRef, useEffect } from 'react';
import type { FileEntry, FileStatus, PagePreview } from '../types/batch';

interface FilePreviewRowProps {
  file: FileEntry;
  onClick: () => void;
  isSelected: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function getStatusInfo(status: FileStatus): { label: string; className: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', className: 'status-pending' };
    case 'loading':
      return { label: 'Loading...', className: 'status-loading' };
    case 'ready':
      return { label: 'Ready', className: 'status-ready' };
    case 'converting':
      return { label: 'Converting...', className: 'status-converting' };
    case 'done':
      return { label: 'Done', className: 'status-done' };
    case 'copied':
      return { label: 'Copied', className: 'status-done' };
    case 'failed':
      return { label: 'Failed', className: 'status-failed' };
    case 'unsupported':
      return { label: 'Unsupported', className: 'status-unsupported' };
    default:
      return { label: status, className: '' };
  }
}

function ThumbnailCanvas({ preview }: { preview: PagePreview }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = preview.width;
    canvas.height = preview.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = new ImageData(
      new Uint8ClampedArray(preview.data),
      preview.width,
      preview.height
    );
    ctx.putImageData(imageData, 0, 0);
  }, [preview]);

  return <canvas ref={canvasRef} className="file-preview-thumbnail-canvas" />;
}

export default function FilePreviewRow({ file, onClick, isSelected }: FilePreviewRowProps) {
  const statusInfo = getStatusInfo(file.status);

  return (
    <div
      className={`file-preview-row ${isSelected ? 'selected' : ''} ${statusInfo.className}`}
      onClick={onClick}
    >
      <div className="file-preview-thumbnail">
        {file.firstPagePreview ? (
          <ThumbnailCanvas preview={file.firstPagePreview} />
        ) : (
          <div className="file-preview-thumbnail-placeholder">
            {file.status === 'loading' ? (
              <span className="loading-spinner-small">⏳</span>
            ) : (
              <span>📄</span>
            )}
          </div>
        )}
      </div>

      <div className="file-preview-info">
        <div className="file-preview-name" title={file.file.name}>
          {file.file.name}
        </div>
        <div className="file-preview-meta">
          <span>{formatBytes(file.file.size)}</span>
          {file.documentInfo && (
            <>
              <span className="meta-separator">•</span>
              <span>{file.documentInfo.documentTypeName}</span>
              <span className="meta-separator">•</span>
              <span>
                {file.documentInfo.pageCount} page
                {file.documentInfo.pageCount !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="file-preview-status">
        <span className={`file-preview-badge ${statusInfo.className}`}>
          {file.error || statusInfo.label}
        </span>
      </div>
    </div>
  );
}
