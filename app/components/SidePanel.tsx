// app/components/SidePanel.tsx

'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { FileEntry, PagePreview } from '../types/batch';

interface SidePanelProps {
  file: FileEntry | null;
  onClose: () => void;
  onLoadPage: (fileId: string, pageIndex: number) => Promise<void>;
}

function PageCanvas({ preview }: { preview: PagePreview }) {
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

  return <canvas ref={canvasRef} />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function SidePanel({ file, onClose, onLoadPage }: SidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (file) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [file, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (file) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [file, onClose]);

  const handlePageVisible = useCallback(
    async (pageIndex: number) => {
      if (!file || !file.documentInfo) return;
      if (file.loadedPages?.has(pageIndex)) return;
      if (loadingPages.has(pageIndex)) return;

      setLoadingPages((prev) => new Set(prev).add(pageIndex));
      try {
        await onLoadPage(file.id, pageIndex);
      } finally {
        setLoadingPages((prev) => {
          const next = new Set(prev);
          next.delete(pageIndex);
          return next;
        });
      }
    },
    [file, loadingPages, onLoadPage]
  );

  if (!file) return null;

  const pageCount = file.documentInfo?.pageCount || 0;
  const previews = file.pagePreviews || [];

  return (
    <div className="side-panel-overlay">
      <div className="side-panel" ref={panelRef}>
        <div className="side-panel-header">
          <div className="side-panel-title">
            <h3>{file.file.name}</h3>
            <p>
              {formatBytes(file.file.size)}
              {file.documentInfo && (
                <>
                  {' • '}
                  {file.documentInfo.documentTypeName}
                  {' • '}
                  {pageCount} page{pageCount !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>
          <button className="side-panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="side-panel-content">
          {pageCount === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>Loading document...</h3>
            </div>
          ) : (
            <div className="pages-grid">
              {Array.from({ length: pageCount }, (_, i) => {
                const preview = previews.find((p) => p.page === i);
                const isLoading =
                  (file.loadedPages?.has(i) && !preview) || loadingPages.has(i);

                return (
                  <LazyPageCard
                    key={i}
                    pageIndex={i}
                    preview={preview}
                    isLoading={isLoading}
                    onVisible={() => handlePageVisible(i)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LazyPageCard({
  pageIndex,
  preview,
  isLoading,
  onVisible,
}: {
  pageIndex: number;
  preview: PagePreview | undefined;
  isLoading: boolean;
  onVisible: () => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: '100px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onVisible]);

  return (
    <div ref={elementRef} className="page-card">
      <div className={`page-preview ${!preview && !isLoading ? 'skeleton' : ''}`}>
        {preview ? (
          <PageCanvas preview={preview} />
        ) : isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <>
            <span className="skeleton-icon">📄</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scroll to load
            </span>
          </>
        )}
      </div>
      <div className="page-info">
        <span className="page-number">Page {pageIndex + 1}</span>
        <span className={`page-badge ${preview ? 'loaded' : ''}`}>
          {preview
            ? `${preview.width}×${preview.height}`
            : isLoading
            ? 'loading...'
            : 'pending'}
        </span>
      </div>
    </div>
  );
}
