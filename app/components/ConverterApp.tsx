"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    ConversionResult,
    OutputFormat,
    InputFormat,
} from '@matbee/libreoffice-converter';

import { WorkerBrowserConverter, createWasmPaths } from '@matbee/libreoffice-converter/browser';
import type { BatchFile, BatchProgress, BatchFileStatus } from '../types/batch';
import type { ZipFile } from '../utils/zipBuilder';
import { storeConvertedFile, clearAllConvertedFiles } from '../utils/batchStorage';
import { buildZipFiles, downloadZipFile } from '../utils/zipBuilder';

// Output format options
const OUTPUT_FORMATS: { value: OutputFormat; label: string; group: string }[] = [
    { value: 'pdf', label: 'PDF', group: 'Documents' },
    { value: 'docx', label: 'DOCX (Word)', group: 'Documents' },
    { value: 'odt', label: 'ODT (OpenDocument)', group: 'Documents' },
    { value: 'rtf', label: 'RTF', group: 'Documents' },
    { value: 'txt', label: 'Plain Text', group: 'Documents' },
    { value: 'html', label: 'HTML', group: 'Documents' },
    { value: 'xlsx', label: 'XLSX (Excel)', group: 'Spreadsheets' },
    { value: 'ods', label: 'ODS (OpenDocument)', group: 'Spreadsheets' },
    { value: 'csv', label: 'CSV', group: 'Spreadsheets' },
    { value: 'pptx', label: 'PPTX (PowerPoint)', group: 'Presentations' },
    { value: 'odp', label: 'ODP (OpenDocument)', group: 'Presentations' },
    { value: 'png', label: 'PNG', group: 'Images' },
    { value: 'svg', label: 'SVG', group: 'Images' },
];

// Supported input formats for batch processing
const SUPPORTED_INPUT_EXTENSIONS = new Set([
    'docx', 'doc', 'odt', 'rtf', 'txt', 'html', 'htm',
    'xlsx', 'xls', 'ods', 'csv',
    'pptx', 'ppt', 'odp',
    'pdf', 'png', 'jpg', 'jpeg', 'svg'
]);

function isSupportedFormat(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return SUPPORTED_INPUT_EXTENSIONS.has(ext);
}

function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

// Recursively read directory entries
async function readDirectoryEntries(
    entry: FileSystemDirectoryEntry
): Promise<File[]> {
    const files: File[] = [];
    const reader = entry.createReader();

    const readBatch = (): Promise<FileSystemEntry[]> => {
        return new Promise((resolve, reject) => {
            reader.readEntries(resolve, reject);
        });
    };

    const getFile = (fileEntry: FileSystemFileEntry): Promise<File> => {
        return new Promise((resolve, reject) => {
            fileEntry.file(resolve, reject);
        });
    };

    // Read in batches (readEntries may not return all at once)
    let batch: FileSystemEntry[];
    do {
        batch = await readBatch();
        for (const item of batch) {
            if (item.isFile) {
                const file = await getFile(item as FileSystemFileEntry);
                files.push(file);
            } else if (item.isDirectory) {
                const subFiles = await readDirectoryEntries(
                    item as FileSystemDirectoryEntry
                );
                files.push(...subFiles);
            }
        }
    } while (batch.length > 0);

    return files;
}

interface PagePreview {
    page: number;
    data: Uint8Array;
    width: number;
    height: number;
}

interface DocumentInfo {
    documentType: number;
    documentTypeName: string;
    validOutputFormats: string[];
    pageCount: number;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });
const BatchPanel = dynamic(() => import('./BatchPanel'), { ssr: false });

export default function ConverterApp() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
    const [outputFormat, setOutputFormat] = useState<OutputFormat>('pdf');
    const [isConverting, setIsConverting] = useState(false);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [progress, setProgress] = useState({ percent: 0, message: '' });
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
    const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

    // Batch mode state
    const [isBatchMode, setIsBatchMode] = useState(false);
    const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
    const [batchProgress, setBatchProgress] = useState<BatchProgress>({
        current: 0,
        total: 0,
        converted: 0,
        copied: 0,
        failed: 0,
    });
    const [batchFolderName, setBatchFolderName] = useState('converted-files');
    const [isBatchConverting, setIsBatchConverting] = useState(false);
    const [zipFiles, setZipFiles] = useState<ZipFile[]>([]);

    const converterRef = useRef<WorkerBrowserConverter | null>(null);
    const initializationPromiseRef = useRef<Promise<WorkerBrowserConverter> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize converter
    const getConverter = useCallback(async () => {
        if (converterRef.current?.isReady()) {
            return converterRef.current;
        }

        if (initializationPromiseRef.current) {
            return initializationPromiseRef.current;
        }

        initializationPromiseRef.current = (async () => {
            try {
                const { WorkerBrowserConverter, createWasmPaths } = await import('@matbee/libreoffice-converter/browser');

                const converter = new WorkerBrowserConverter({
                    ...createWasmPaths('/wasm/'),
                    browserWorkerJs: '/dist/browser.worker.global.js',
                    verbose: false,
                    onProgress: (p) => setProgress({ percent: p.percent, message: p.message }),
                });

                await converter.initialize();
                converterRef.current = converter;
                return converter;
            } finally {
                initializationPromiseRef.current = null;
            }
        })();

        return initializationPromiseRef.current;
    }, []);

    // Auto-initialize on mount
    useEffect(() => {
        getConverter().catch(console.error);
    }, [getConverter]);

    // Handle file selection
    const handleFile = useCallback(async (file: File) => {
        setSelectedFile(file);
        setStatus(null);
        setPagePreviews([]);
        setLoadedPages(new Set());
        setDocumentInfo(null);

        const buffer = await file.arrayBuffer();
        setFileBuffer(buffer);

        // Get document info
        try {
            const converter = await getConverter();
            const ext = (file.name.split('.').pop()?.toLowerCase() || 'docx') as InputFormat;
            const info = await converter.getDocumentInfo(new Uint8Array(buffer), { inputFormat: ext });
            setDocumentInfo(info);
        } catch (error) {
            console.error('Failed to get document info:', error);
            setStatus({ type: 'error', message: `Failed to load document: ${(error as Error).message}` });
        }
    }, [getConverter]);

    // Initialize batch mode with files
    const initBatchMode = useCallback((files: File[], folderName: string) => {
        const batchFiles: BatchFile[] = files.map((file, index) => {
            const ext = getFileExtension(file.name);
            const isSupported = isSupportedFormat(file.name);

            let status: BatchFileStatus = 'ready';
            if (!isSupported) {
                status = 'unsupported';
            }

            return {
                id: `${Date.now()}-${index}`,
                file,
                status,
                outputName: file.name.replace(/\.[^.]+$/, `.${outputFormat}`),
            };
        });

        setBatchFiles(batchFiles);
        setBatchFolderName(folderName);
        setBatchProgress({
            current: 0,
            total: batchFiles.filter((f) => f.status !== 'unsupported').length,
            converted: 0,
            copied: 0,
            failed: 0,
        });
        setZipFiles([]);
        setIsBatchMode(true);
    }, [outputFormat]);

    // Process batch conversion
    const handleBatchConvert = useCallback(async () => {
        setIsBatchConverting(true);
        await clearAllConvertedFiles();

        const converter = await getConverter();
        const timestamp = Date.now();
        let converted = 0;
        let copied = 0;
        let failed = 0;
        let current = 0;

        const eligibleFiles = batchFiles.filter(
            (f) => f.status !== 'unsupported'
        );

        for (const batchFile of eligibleFiles) {
            current++;
            const ext = getFileExtension(batchFile.file.name);
            const storageKey = `batch-${timestamp}-${batchFile.id}`;

            // Update status to converting
            setBatchFiles((prev) =>
                prev.map((f) =>
                    f.id === batchFile.id ? { ...f, status: 'converting' as BatchFileStatus } : f
                )
            );

            try {
                let resultData: Uint8Array;

                if (ext === outputFormat) {
                    // Same format: copy as-is
                    const buffer = await batchFile.file.arrayBuffer();
                    resultData = new Uint8Array(buffer);
                    copied++;

                    setBatchFiles((prev) =>
                        prev.map((f) =>
                            f.id === batchFile.id
                                ? {
                                      ...f,
                                      status: 'copied' as BatchFileStatus,
                                      storageKey,
                                      resultSize: resultData.byteLength,
                                  }
                                : f
                        )
                    );
                } else {
                    // Convert the file
                    const inputFormat = ext as InputFormat;
                    const result = await converter.convertFile(batchFile.file, {
                        inputFormat,
                        outputFormat,
                    });
                    resultData = result.data;
                    converted++;

                    setBatchFiles((prev) =>
                        prev.map((f) =>
                            f.id === batchFile.id
                                ? {
                                      ...f,
                                      status: 'done' as BatchFileStatus,
                                      storageKey,
                                      resultSize: resultData.byteLength,
                                  }
                                : f
                        )
                    );
                }

                // Store in IndexedDB
                await storeConvertedFile(storageKey, resultData);
            } catch (error) {
                failed++;
                setBatchFiles((prev) =>
                    prev.map((f) =>
                        f.id === batchFile.id
                            ? {
                                  ...f,
                                  status: 'failed' as BatchFileStatus,
                                  error: (error as Error).message,
                              }
                            : f
                    )
                );
            }

            setBatchProgress((prev) => ({
                ...prev,
                current,
                converted,
                copied,
                failed,
            }));
        }

        // Build ZIP files
        // Need to get updated batchFiles with storageKeys
        setBatchFiles((currentFiles) => {
            const updatedFilesToZip = currentFiles
                .filter((f) => f.storageKey && (f.status === 'done' || f.status === 'copied'))
                .map((f) => ({
                    outputName: f.outputName || f.file.name,
                    storageKey: f.storageKey!,
                    size: f.resultSize || 0,
                }));

            if (updatedFilesToZip.length > 0) {
                buildZipFiles(updatedFilesToZip, batchFolderName).then((zips) => {
                    setZipFiles(zips);
                    setIsBatchConverting(false);
                });
            } else {
                setIsBatchConverting(false);
            }

            return currentFiles;
        });
    }, [batchFiles, outputFormat, batchFolderName, getConverter]);

    // Cancel batch mode
    const handleBatchCancel = useCallback(async () => {
        await clearAllConvertedFiles();
        setBatchFiles([]);
        setBatchProgress({
            current: 0,
            total: 0,
            converted: 0,
            copied: 0,
            failed: 0,
        });
        setZipFiles([]);
        setIsBatchMode(false);
        setIsBatchConverting(false);
    }, []);

    // Download a ZIP file
    const handleBatchDownload = useCallback((zipFile: ZipFile) => {
        downloadZipFile(zipFile);
    }, []);

    const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
    const visiblePagesRef = useRef<Set<number>>(new Set());
    const processingQueueRef = useRef<boolean>(false);
    const queueRef = useRef<number[]>([]);
    const loadedPagesRef = useRef<Set<number>>(new Set());

    // Sync loadedPagesRef with state
    useEffect(() => {
        loadedPagesRef.current = loadedPages;
    }, [loadedPages]);

    // Sync visiblePagesRef with state
    useEffect(() => {
        visiblePagesRef.current = visiblePages;
    }, [visiblePages]);

    // Load a single page preview (Internal function)
    const loadPagePreview = useCallback(async (pageIndex: number) => {
        if (!selectedFile || !fileBuffer) return;

        // Double check loaded state
        if (loadedPagesRef.current.has(pageIndex)) return;

        console.log('Loading page', pageIndex);
        setLoadedPages((prev) => new Set(prev).add(pageIndex));

        try {
            const converter = await getConverter();
            const ext = (selectedFile.name.split('.').pop()?.toLowerCase() || 'docx') as InputFormat;
            const preview = await converter.renderSinglePage(
                new Uint8Array(fileBuffer).slice(),
                { inputFormat: ext },
                pageIndex,
                200
            );
            console.log(`Page ${pageIndex + 1} rendered: ${preview.width}×${preview.height}`);

            // Ensure the preview object has the correct 0-based page index
            const previewWithCorrectIndex = { ...preview, page: pageIndex };

            setPagePreviews((prev) => {
                const existing = prev.findIndex((p) => p.page === pageIndex);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = previewWithCorrectIndex;
                    return updated;
                }
                return [...prev, previewWithCorrectIndex].sort((a, b) => a.page - b.page);
            });
        } catch (error) {
            console.error(`Failed to load page ${pageIndex}:`, error);
            setLoadedPages((prev) => {
                const next = new Set(prev);
                next.delete(pageIndex);
                return next;
            });
        }
    }, [selectedFile, fileBuffer, getConverter]);

    // Process the load queue
    const processQueue = useCallback(async () => {
        if (processingQueueRef.current) return;
        processingQueueRef.current = true;

        try {
            while (queueRef.current.length > 0) {
                // Get next page from queue
                const pageIndex = queueRef.current[0];

                // Check if still visible and not loaded
                // We use refs for latest values in the async loop
                const isVisible = visiblePagesRef.current.has(pageIndex);
                const isLoaded = loadedPagesRef.current.has(pageIndex);

                if (!isVisible || isLoaded) {
                    // Skip if no longer visible or already loaded
                    queueRef.current.shift();
                    continue;
                }

                // Load the page
                try {
                    await loadPagePreview(pageIndex);
                } catch (e) {
                    console.error(`Error processing page ${pageIndex}`, e);
                }

                // Remove from queue after processing
                queueRef.current.shift();
            }
        } finally {
            processingQueueRef.current = false;
        }
    }, [loadPagePreview]); // Removed visiblePages dependency

    // Handle visibility changes
    const handleVisibilityChange = useCallback((pageIndex: number, isVisible: boolean) => {
        // Update ref immediately so processQueue sees the latest state
        const prevVisible = visiblePagesRef.current;
        const nextVisible = new Set(prevVisible);
        if (isVisible) {
            nextVisible.add(pageIndex);
        } else {
            nextVisible.delete(pageIndex);
        }
        visiblePagesRef.current = nextVisible;

        // Update state to trigger re-renders if needed (though we mostly rely on refs for logic now)
        setVisiblePages(nextVisible);

        if (isVisible && !loadedPagesRef.current.has(pageIndex)) {
            // Add to queue if visible and not loaded
            if (!queueRef.current.includes(pageIndex)) {
                queueRef.current.push(pageIndex);
                // Sort queue by page index to load in order? Or just FIFO?
                // FIFO is usually better for scrolling.
                processQueue();
            }
        }
    }, [processQueue]);

    // Trigger queue processing when visiblePages changes (in case we skipped something that became visible again?)
    // Actually, handleVisibilityChange adds to queue, so that covers it.
    // But if we scroll back, we re-add to queue.



    // Load all pages (Optional manual trigger)
    const loadAllPages = useCallback(async () => {
        if (!documentInfo) return;
        setIsLoadingPreviews(true);

        // Add all to queue? Or just iterate?
        // Let's just iterate for "Load All" button, bypassing the visibility queue
        // to ensure they all load.
        for (let i = 0; i < documentInfo.pageCount; i++) {
            if (!loadedPages.has(i)) {
                await loadPagePreview(i);
            }
        }

        setIsLoadingPreviews(false);
    }, [documentInfo, loadedPages, loadPagePreview]);

    // Convert document
    const handleConvert = useCallback(async () => {
        if (!selectedFile) return;

        setIsConverting(true);
        setStatus(null);
        setProgress({ percent: 0, message: 'Starting...' });

        try {
            const converter = await getConverter();
            const ext = (selectedFile.name.split('.').pop()?.toLowerCase() || 'docx') as InputFormat;

            const result: ConversionResult = await converter.convertFile(selectedFile, {
                inputFormat: ext,
                outputFormat,
            });

            converter.download(result);
            setStatus({ type: 'success', message: `Conversion complete! Download started.` });
        } catch (error) {
            setStatus({ type: 'error', message: `Error: ${(error as Error).message}` });
        } finally {
            setIsConverting(false);
        }
    }, [selectedFile, outputFormat, getConverter]);

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        const collectedFiles: File[] = [];
        let folderName = 'converted-files';

        // Check for directories or multiple files
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const entry = item.webkitGetAsEntry?.();

            if (entry?.isDirectory) {
                folderName = entry.name;
                const dirFiles = await readDirectoryEntries(
                    entry as FileSystemDirectoryEntry
                );
                collectedFiles.push(...dirFiles);
            } else if (entry?.isFile) {
                const file = e.dataTransfer.files[i];
                if (file) collectedFiles.push(file);
            }
        }

        // If multiple files or folder, enter batch mode
        if (collectedFiles.length > 1) {
            const supportedFiles = collectedFiles.filter((f) =>
                isSupportedFormat(f.name)
            );
            if (supportedFiles.length > 0) {
                initBatchMode(collectedFiles, folderName);
                return;
            }
        }

        // Single file: use existing behavior
        if (collectedFiles.length === 1) {
            handleFile(collectedFiles[0]);
        } else if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile, initBatchMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            converterRef.current?.destroy();
        };
    }, []);

    // Load full resolution page for AI analysis
    const loadFullPage = useCallback(async (pageIndex: number) => {
        if (!selectedFile || !fileBuffer) return null;

        try {
            const converter = await getConverter();
            const ext = (selectedFile.name.split('.').pop()?.toLowerCase() || 'docx') as InputFormat;

            // Request a larger width for better AI analysis (e.g., 1600px)
            const preview = await converter.renderSinglePage(
                new Uint8Array(fileBuffer).slice(),
                { inputFormat: ext },
                pageIndex,
                1600
            );

            return {
                data: preview.data,
                width: preview.width,
                height: preview.height
            };
        } catch (error) {
            console.error(`Failed to load full page ${pageIndex}:`, error);
            return null;
        }
    }, [selectedFile, fileBuffer, getConverter]);

    return (
        <>
            <div className="bg-pattern" />
            <div className="container">
                <header>
                    <h1>Free Office Document Converter</h1>
                    <p className="tagline">
                        100% private — your files never leave your browser. No uploads, no server, no data collection.
                    </p>
                    <p className="powered-by">
                        Powered by @matbee/libreoffice-converter
                    </p>
                </header>

                <div className="main-grid">
                    {/* Sidebar */}
                    <aside className="sidebar">
                        <div className="card">
                            <div className="card-header">
                                <div className="card-icon">📁</div>
                                <div>
                                    <div className="card-title">Upload Document</div>
                                    <div className="card-subtitle">Supports Office, PDF, and more</div>
                                </div>
                            </div>

                            <div
                                className={`drop-zone ${isDragging ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="drop-icon">📄</div>
                                <h3>Drop your document here</h3>
                                <p>or click to browse files</p>
                            </div>

                            {selectedFile && (
                                <div className="file-info show">
                                    <span className="file-icon">📎</span>
                                    <div className="file-details">
                                        <div className="file-name">{selectedFile.name}</div>
                                        <div className="file-meta">{formatBytes(selectedFile.size)}</div>
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                hidden
                                onChange={(e) => {
                                    const files = e.target.files;
                                    if (files?.length) handleFile(files[0]);
                                }}
                            />

                            {documentInfo && (
                                <div className="doc-info show">
                                    📄 {documentInfo.documentTypeName} • {documentInfo.pageCount} page
                                    {documentInfo.pageCount !== 1 ? 's' : ''}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="outputFormat">Convert to</label>
                                <select
                                    id="outputFormat"
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                                    disabled={isConverting}
                                >
                                    {['Documents', 'Spreadsheets', 'Presentations', 'Images'].map((group) => (
                                        <optgroup key={group} label={group}>
                                            {OUTPUT_FORMATS.filter((f) => f.group === group).map((format) => (
                                                <option
                                                    key={format.value}
                                                    value={format.value}
                                                    disabled={
                                                        documentInfo
                                                            ? !documentInfo.validOutputFormats.includes(format.value)
                                                            : false
                                                    }
                                                >
                                                    {format.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={handleConvert}
                                disabled={!selectedFile || isConverting}
                            >
                                <span>⚡</span> {isConverting ? 'Converting...' : 'Convert & Download'}
                            </button>

                            {isConverting && (
                                <div className="progress-container show">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
                                    </div>
                                    <p className="progress-text">{progress.message}</p>
                                </div>
                            )}

                            {status && (
                                <div className={`status show ${status.type}`}>
                                    {status.type === 'success' ? '✓' : '✗'} {status.message}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Preview Area */}
                    <section className="card preview-section">
                        <div className="preview-header">
                            <div className="card-header" style={{ marginBottom: 0 }}>
                                <div className="card-icon">🖼️</div>
                                <div>
                                    <div className="card-title">Page Preview</div>
                                    <div className="card-subtitle">Click pages to load</div>
                                </div>
                            </div>
                            {documentInfo && documentInfo.pageCount > 0 && (
                                <button
                                    className="btn btn-secondary"
                                    onClick={loadAllPages}
                                    disabled={isLoadingPreviews}
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginTop: 0, width: 'auto' }}
                                >
                                    {isLoadingPreviews ? 'Loading...' : 'Load All Pages'}
                                </button>
                            )}
                            {documentInfo && (
                                <div className="preview-stats">
                                    <div className="stat">
                                        <div className="stat-value">{documentInfo.pageCount}</div>
                                        <div className="stat-label">Pages</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-value">{loadedPages.size}</div>
                                        <div className="stat-label">Loaded</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div id="pagesContainer">
                            {!documentInfo ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📑</div>
                                    <h3>No document loaded</h3>
                                    <p>Upload a document to see page previews</p>
                                </div>
                            ) : (
                                <div className="pages-grid">
                                    {Array.from({ length: documentInfo.pageCount }, (_, i) => {
                                        const preview = pagePreviews.find((p) => p.page === i);
                                        const isLoading = loadedPages.has(i) && !preview;

                                        return (
                                            <LazyPagePreview
                                                key={i}
                                                pageIndex={i}
                                                preview={preview}
                                                isLoading={isLoading}
                                                onVisibilityChange={handleVisibilityChange}
                                                onClick={() => {
                                                    if (preview) {
                                                        setSelectedPageIndex(i);
                                                    }
                                                }}
                                            />
                                        );
                                    })}
                                </div >
                            )
                            }
                        </div >
                    </section >
                </div >

                <footer>
                    <p>
                        Powered by <a href="https://www.libreoffice.org/" target="_blank" rel="noreferrer">LibreOffice</a>{' '}
                        compiled to WebAssembly •{' '}
                        <a href="https://www.npmjs.com/package/@matbee/libreoffice-converter" target="_blank" rel="noreferrer">
                            NPM Package
                        </a>
                    </p>
                </footer>
            </div >

            {/* <Sidebar
                isOpen={selectedPageIndex !== null}
                onClose={() => setSelectedPageIndex(null)}
                previewData={selectedPageIndex !== null ? pagePreviews.find(p => p.page === selectedPageIndex)?.data || null : null}
                width={selectedPageIndex !== null ? pagePreviews.find(p => p.page === selectedPageIndex)?.width || 0 : 0}
                height={selectedPageIndex !== null ? pagePreviews.find(p => p.page === selectedPageIndex)?.height || 0 : 0}
                documentType={documentInfo?.documentTypeName || ''}
                pageIndex={selectedPageIndex || 0}
                onLoadFullImage={loadFullPage}
            /> */}
        </>
    );
}

// Component to handle lazy loading of page previews
function LazyPagePreview({
    pageIndex,
    preview,
    isLoading,
    onVisibilityChange,
    onClick
}: {
    pageIndex: number;
    preview: PagePreview | undefined;
    isLoading: boolean;
    onVisibilityChange: (index: number, isVisible: boolean) => void;
    onClick: () => void;
}) {
    const elementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const isVisible = entries[0].isIntersecting;
                onVisibilityChange(pageIndex, isVisible);
            },
            { rootMargin: '100px' }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
            // Report hidden on unmount/cleanup
            onVisibilityChange(pageIndex, false);
        };
    }, [pageIndex, onVisibilityChange]);

    return (
        <div
            ref={elementRef}
            className="page-card"
            style={{ cursor: preview ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            <div className={`page-preview ${!preview && !isLoading ? 'skeleton' : ''}`}>
                {preview ? (
                    <PageCanvas preview={preview} />
                ) : isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                ) : (
                    <>
                        <span className="skeleton-icon">📄</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Scrolling loads...
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


// Component to render RGBA preview data to canvas
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
