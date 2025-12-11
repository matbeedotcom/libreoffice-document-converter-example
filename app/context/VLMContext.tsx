"use client";
import React, { useState, useRef, useCallback, createContext, useContext } from "react";
import {
  AutoProcessor,
  AutoModelForImageTextToText,
  RawImage,
  TextStreamer,
} from "@huggingface/transformers";
import type {
  Tensor,
  PixtralProcessor,
  Ministral3ForCausalLM,
  ProgressInfo,
} from "@huggingface/transformers";
import type { VLMContextValue } from "../types/vlm";

// Create Context
export const VLMContext = createContext<VLMContextValue | null>(null);

// Custom Hook
export function useVLMContext(): VLMContextValue {
  const ctx = useContext(VLMContext);
  if (!ctx) throw new Error("useVLMContext must be inside VLMProvider");
  return ctx;
}

const MODEL_ID = "mistralai/Ministral-3-3B-Instruct-2512-ONNX";
const MAX_NEW_TOKENS = 512;

export const VLMProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(1024); // Reduced to 1024 to avoid WebGPU buffer limits

  const processorRef = useRef<PixtralProcessor | null>(null);
  const modelRef = useRef<Ministral3ForCausalLM | null>(null);
  const loadPromiseRef = useRef<Promise<void> | null>(null);
  const inferenceLock = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageSizeRef = useRef(1024);

  const updateImageSize = useCallback((size: number) => {
    setImageSize(size);
    imageSizeRef.current = size;
    if (processorRef.current?.image_processor) {
      processorRef.current.image_processor.size = { longest_edge: size };
    }
  }, []);

  const loadModel = useCallback(
    async (onProgress?: (msg: string, percentage: number) => void) => {
      if (isLoaded) {
        onProgress?.("Model already loaded!", 100);
        return;
      }

      if (loadPromiseRef.current) {
        return loadPromiseRef.current;
      }

      setIsLoading(true);
      setError(null);

      loadPromiseRef.current = (async () => {
        try {
          onProgress?.("Loading processor...", 0);
          processorRef.current = await AutoProcessor.from_pretrained(MODEL_ID);
          processorRef.current.image_processor!.size = {
            longest_edge: imageSizeRef.current,
          };
          onProgress?.("Processor loaded. Loading model...", 0);

          const progressMap = new Map<string, number>();
          const progressCallback = (info: ProgressInfo) => {
            if (
              info.status === "progress" &&
              info.file.endsWith(".onnx_data")
            ) {
              progressMap.set(info.file, info.loaded / info.total);
              const total = Array.from(progressMap.values()).reduce(
                (a, b) => a + b,
                0,
              );
              const percentage = (total / 3) * 100; // 3 model files to download
              onProgress?.("Downloading model...", percentage);
            }
          };

          modelRef.current = await AutoModelForImageTextToText.from_pretrained(
            MODEL_ID,
            {
              dtype: {
                embed_tokens: "fp16",
                vision_encoder: "q4", // q4 is slightly faster than q4f16 (+ better quality)
                decoder_model_merged: "q4f16",
              },
              device: "webgpu",
              progress_callback: progressCallback,
            },
          );
          onProgress?.("Model loaded successfully!", 100);
          setIsLoaded(true);
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          setError(errorMessage);
          console.error("Error loading model:", e);
          throw e;
        } finally {
          setIsLoading(false);
          loadPromiseRef.current = null;
        }
      })();

      return loadPromiseRef.current;
    },
    [isLoaded],
  );

  const runInference = useCallback(
    async (
      input: HTMLVideoElement | string,
      instruction: string,
      onTextUpdate?: (text: string) => void,
      onStatsUpdate?: (stats: { tps?: number; ttft?: number }) => void,
    ): Promise<string> => {
      if (inferenceLock.current) {
        return ""; // Return empty string to signal a skip
      }
      inferenceLock.current = true;

      try {
        if (!processorRef.current || !modelRef.current) {
          throw new Error("Model/processor not loaded");
        }

        let rawImg: RawImage;

        if (typeof input === "string") {
          // It's an image URL
          rawImg = await RawImage.fromURL(input);
        } else {
          // It's a video element
          if (!canvasRef.current) {
            canvasRef.current = document.createElement("canvas");
          }
          const canvas = canvasRef.current;

          // Resize input if it exceeds imageSize to save memory
          const scale = Math.min(1, imageSizeRef.current / Math.max(input.videoWidth, input.videoHeight));
          const scaledWidth = Math.round(input.videoWidth * scale);
          const scaledHeight = Math.round(input.videoHeight * scale);

          canvas.width = scaledWidth;
          canvas.height = scaledHeight;

          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) throw new Error("Could not get canvas context");

          ctx.drawImage(input, 0, 0, scaledWidth, scaledHeight);

          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          rawImg = new RawImage(frame.data, frame.width, frame.height, 4);
        }

        const messages = [
          {
            role: "system",
            content: `You are a helpful visual AI assistant. Respond concisely and accurately to the user's query in one sentence.`,
          },
          { role: "user", content: `[IMG]${instruction}` },
        ];
        const prompt = processorRef.current.apply_chat_template(messages);
        const inputs = await processorRef.current(rawImg, prompt, {
          add_special_tokens: false,
        });

        let streamed = "";
        const start = performance.now();
        let decodeStart: number | undefined;
        let numTokens = 0;
        const streamer = new TextStreamer(processorRef.current.tokenizer!, {
          skip_prompt: true,
          skip_special_tokens: true,
          callback_function: (t: string) => {
            if (streamed.length === 0) {
              const latency = performance.now() - start;
              onStatsUpdate?.({ ttft: latency });
            }
            streamed += t;
            onTextUpdate?.(streamed.trim());
          },
          token_callback_function: () => {
            decodeStart ??= performance.now();
            numTokens++;
            const elapsed = (performance.now() - decodeStart) / 1000;
            if (elapsed > 0) {
              onStatsUpdate?.({ tps: numTokens / elapsed });
            }
          },
        });

        const outputs = (await modelRef.current.generate({
          ...inputs,
          max_new_tokens: MAX_NEW_TOKENS,
          do_sample: false,
          streamer,
          repetition_penalty: 1.2,
        })) as Tensor;
        const generated = outputs.slice(null, [
          inputs.input_ids.dims.at(-1),
          null,
        ]);
        const decodeEnd = performance.now();
        if (decodeStart) {
          const numTokens = generated.dims[1];
          const tps = numTokens / ((decodeEnd - decodeStart) / 1000);
          onStatsUpdate?.({ tps });
        }

        const decoded = processorRef.current.batch_decode(generated, {
          skip_special_tokens: true,
        });
        return decoded[0].trim();
      } finally {
        inferenceLock.current = false;
      }
    },
    [],
  );

  return (
    <VLMContext.Provider
      value={{
        isLoaded,
        isLoading,
        error,
        loadModel,
        runInference,
        imageSize,
        setImageSize: updateImageSize,
      }}
    >
      {children}
    </VLMContext.Provider>
  );
};

export default VLMProvider;
