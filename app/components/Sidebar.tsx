"use client";

import { useEffect, useState, useRef } from "react";
import { useVLMContext } from "../context/VLMContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    previewData: Uint8Array | null;
    width: number;
    height: number;
    documentType: string;
    pageIndex: number;
    onLoadFullImage?: (pageIndex: number) => Promise<{ data: Uint8Array; width: number; height: number } | null>;
}

export default function Sidebar({ isOpen, onClose, previewData, width, height, documentType, pageIndex, onLoadFullImage }: SidebarProps) {
    const [analysis, setAnalysis] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { isLoaded, isLoading, loadModel, runInference, error } = useVLMContext();

    // Helper to draw bounding boxes
    const drawBoundingBoxes = (boxes: any[], imgData: Uint8Array, imgWidth: number, imgHeight: number) => {
        if (!canvasRef.current) return;

        console.log(`Drawing boxes on image: ${imgWidth}x${imgHeight}`);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Calculate inference dimensions (max 1024x1024)
        const maxDim = 1024;
        const scale = Math.min(1, maxDim / Math.max(imgWidth, imgHeight));
        const inferenceWidth = Math.round(imgWidth * scale);
        const inferenceHeight = Math.round(imgHeight * scale);

        console.log(`Visualizing on inference dimensions: ${inferenceWidth}x${inferenceHeight} (Original: ${imgWidth}x${imgHeight})`);

        // Resize canvas to inference dimensions
        if (canvas.width !== inferenceWidth || canvas.height !== inferenceHeight) {
            canvas.width = inferenceWidth;
            canvas.height = inferenceHeight;
        }

        // Draw scaled image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imgWidth;
        tempCanvas.height = imgHeight;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            const originalImageData = new ImageData(
                new Uint8ClampedArray(imgData),
                imgWidth,
                imgHeight
            );
            tempCtx.putImageData(originalImageData, 0, 0);

            // Draw scaled down to main canvas
            ctx.drawImage(tempCanvas, 0, 0, inferenceWidth, inferenceHeight);
        }

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2; // Thinner line for smaller image
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "red";

        boxes.forEach((box, i) => {
            if (box.box_2d && box.box_2d.length === 4) {
                // Model seems to prefer [xmin, ymin, xmax, ymax] based on testing
                const [xmin, ymin, xmax, ymax] = box.box_2d;

                // Map normalized coords (0-1000) to inference dimensions
                const x = (xmin / 1000) * inferenceWidth;
                const y = (ymin / 1000) * inferenceHeight;
                const w = ((xmax - xmin) / 1000) * inferenceWidth;
                const h = ((ymax - ymin) / 1000) * inferenceHeight;

                console.log(`Box ${i} (${box.label}): [${xmin}, ${ymin}, ${xmax}, ${ymax}] -> [x:${Math.round(x)}, y:${Math.round(y)}, w:${Math.round(w)}, h:${Math.round(h)}]`);

                ctx.strokeRect(x, y, w, h);
                if (box.label) {
                    ctx.fillText(box.label, x, y - 5);
                }
            }
        });
    };

    // Draw preview to canvas
    useEffect(() => {
        if (isOpen && previewData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                canvas.width = width;
                canvas.height = height;
                const imageData = new ImageData(
                    new Uint8ClampedArray(previewData),
                    width,
                    height
                );
                ctx.putImageData(imageData, 0, 0);
            }
        }
    }, [isOpen, previewData, width, height]);

    // Run AI analysis when sidebar opens with new data
    useEffect(() => {
        if (!isOpen || !previewData) return;

        const analyze = async () => {
            setIsAnalyzing(true);
            setAnalysis("");

            try {
                // 0. Load full resolution image if available
                let imageToAnalyze = previewData;
                let imageWidth = width;
                let imageHeight = height;

                if (onLoadFullImage) {
                    setAnalysis("Loading full resolution image...");
                    try {
                        const fullImage = await onLoadFullImage(pageIndex);
                        if (fullImage) {
                            imageToAnalyze = fullImage.data;
                            imageWidth = fullImage.width;
                            imageHeight = fullImage.height;

                            // Update canvas with full res image for better visualization and inference
                            if (canvasRef.current) {
                                const canvas = canvasRef.current;
                                const ctx = canvas.getContext("2d");
                                if (ctx) {
                                    canvas.width = imageWidth;
                                    canvas.height = imageHeight;
                                    const imageData = new ImageData(
                                        new Uint8ClampedArray(imageToAnalyze),
                                        imageWidth,
                                        imageHeight
                                    );
                                    ctx.putImageData(imageData, 0, 0);
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Failed to load full image, falling back to preview:", err);
                    }
                }

                // 1. Load Model if not loaded
                if (!isLoaded && !isLoading) {
                    setAnalysis("Loading model...");
                    await loadModel((msg: string, percentage: number) => {
                        setAnalysis(`${msg} (${Math.round(percentage)}%)`);
                    });
                } else if (isLoading) {
                    setAnalysis("Model is loading...");
                    // Wait for it? The context doesn't expose a promise here easily, 
                    // but we can just return and let the next effect trigger or 
                    // we can rely on isLoaded changing.
                    // Actually, loadModel returns a promise we can await if we call it,
                    // but if it's already loading, we might need to wait.
                    // For now, let's assume if it's loading, we wait for isLoaded to become true.
                    return;
                }

                // 2. Run Inference
                if (isLoaded) {
                    setAnalysis("Generating analysis...");

                    let imageUrl = "";
                    if (canvasRef.current) {
                        imageUrl = canvasRef.current.toDataURL("image/png");
                    }

                    const prompt = `Analyze the document layout. Return a JSON object with a "regions" key containing an array of regions. Each region should have a "label" and a "box_2d" array [xmin, ymin, xmax, ymax] where coordinates are normalized from 0 to 1000. Example: { "regions": [{ "label": "Title", "box_2d": [0, 0, 500, 100] }] }`;

                    const result = await runInference(
                        imageUrl,
                        prompt,
                        (text: string) => setAnalysis(text), // Update analysis with streamed text
                        (stats: any) => console.log("Inference stats:", stats)
                    );

                    // Parse JSON and draw boxes
                    try {
                        const allRegions: any[] = [];

                        // 1. Try to find markdown json blocks first
                        const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
                        let match;
                        let foundBlocks = false;

                        while ((match = jsonBlockRegex.exec(result)) !== null) {
                            foundBlocks = true;
                            try {
                                const parsed = JSON.parse(match[1]);
                                if (parsed.regions && Array.isArray(parsed.regions)) {
                                    allRegions.push(...parsed.regions);
                                }
                                // Also check for address_boxes or other structures if needed, 
                                // but for now we focus on regions as per prompt.
                                // The user example showed "address_boxes" with "sub_regions".
                                // Let's try to flatten those into regions if possible, or just ignore for now.
                                if (parsed.address_boxes && Array.isArray(parsed.address_boxes)) {
                                    parsed.address_boxes.forEach((box: any) => {
                                        if (box.box_2d) allRegions.push(box);
                                        if (box.sub_regions && Array.isArray(box.sub_regions)) {
                                            box.sub_regions.forEach((sub: any) => {
                                                if (sub.coords) {
                                                    // Convert coords [xmin, ymin, xmax, ymax] or similar to our format?
                                                    // User example: "coords": [320, 205, 680, 225] -> likely [xmin, ymin, xmax, ymax]
                                                    // Our format: [ymin, xmin, ymax, xmax] (normalized 0-1000)
                                                    // Wait, user example coords look like pixels or 0-1000? 
                                                    // "320, 205" in a 1000x1000 grid seems reasonable.
                                                    // Let's assume they are consistent with the prompt request if the model follows it.
                                                    // But if the model invents "coords", we might need to be careful.
                                                    // For now, let's just stick to "regions" key which we explicitly asked for.
                                                }
                                            });
                                        }
                                    });
                                }
                            } catch (e) {
                                console.error("Failed to parse JSON block:", e);
                            }
                        }

                        // 2. If no blocks found, try to find a raw JSON object
                        if (!foundBlocks) {
                            const jsonMatch = result.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                try {
                                    const parsed = JSON.parse(jsonMatch[0]);
                                    if (parsed.regions && Array.isArray(parsed.regions)) {
                                        allRegions.push(...parsed.regions);
                                    }
                                } catch (e) {
                                    console.error("Failed to parse raw JSON:", e);
                                }
                            }
                        }

                        if (allRegions.length > 0) {
                            if (imageToAnalyze) {
                                drawBoundingBoxes(allRegions, imageToAnalyze, imageWidth, imageHeight);
                            }
                            // Pretty print the aggregated regions or the full result?
                            // Let's show the full raw result text so the user can see what the model said,
                            // but maybe append the parsed regions count.
                            // Or just leave the text as is.
                        }

                    } catch (e) {
                        console.error("Failed to parse JSON:", e);
                    }
                }

            } catch (error: any) {
                console.error("AI Analysis failed:", error);
                setAnalysis(`Error: ${error.message || error}`);
            } finally {
                setIsAnalyzing(false);
            }
        };

        analyze();
    }, [isOpen, previewData, documentType, width, height, isLoaded, isLoading, loadModel, runInference, pageIndex, onLoadFullImage]);

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-50 flex flex-col border-l border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-800">Page Analysis</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Preview Image */}
                <div className="border rounded-lg overflow-hidden shadow-sm bg-gray-100">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto block"
                    />
                </div>

                {/* AI Analysis */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">AI Insights</h3>
                        {isAnalyzing && (
                            <span className="text-xs text-blue-600 animate-pulse font-medium">
                                Processing...
                            </span>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 min-h-[100px] whitespace-pre-wrap border border-gray-100">
                        {analysis || "Waiting for analysis..."}
                    </div>
                </div>
            </div>
        </div>
    );
}
