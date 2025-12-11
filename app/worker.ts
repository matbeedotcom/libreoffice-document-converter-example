import {
    AutoProcessor,
    AutoModelForImageTextToText,
    TextStreamer,
    RawImage,
    env,
} from "@huggingface/transformers";

// Disable multithreading to avoid known issues in web workers
// if (env.backends.onnx.wasm) {
//     env.backends.onnx.wasm.numThreads = 1;
// }

const MODEL_ID = "mistralai/Ministral-3-3B-Instruct-2512-ONNX";

let processor: any = null;
let model: any = null;

self.onmessage = async (e: MessageEvent) => {
    const { type, payload } = e.data;
    console.log(`Worker received message: ${type}`);

    try {
        if (type === "load") {
            if (model && processor) {
                console.log("Model already loaded");
                self.postMessage({ type: "status", status: "ready" });
                return;
            }

            console.log("Starting model load...");
            self.postMessage({ type: "status", status: "loading" });

            console.log(`Loading processor for ${MODEL_ID}...`);
            processor = await AutoProcessor.from_pretrained(MODEL_ID);
            console.log("Processor loaded.");

            console.log(`Loading model for ${MODEL_ID}...`);
            model = await AutoModelForImageTextToText.from_pretrained(MODEL_ID, {
                device: "webgpu",
                dtype: "q4", // Use quantized weights to save memory
                progress_callback: (progress: any) => {
                    console.log("Model load progress:", progress);
                    self.postMessage({ type: "progress", progress });
                },
            });
            console.log("Model loaded.");

            self.postMessage({ type: "status", status: "ready" });
        } else if (type === "generate") {
            if (!model || !processor) {
                throw new Error("Model not loaded");
            }

            console.log("Starting generation...");
            const { imageUrl, promptText } = payload;
            console.log("Image URL received (length):", imageUrl?.length);

            const messages = [
                {
                    role: "user",
                    content: [
                        { type: "image" },
                        {
                            type: "text",
                            text: promptText || "Provide the major layout bounding boxes of the document.",
                        },
                    ],
                },
            ];

            console.log("Applying chat template...");
            const textInput = processor.apply_chat_template(messages);

            console.log("Loading image from URL...");
            const image = await RawImage.fromURL(imageUrl);

            console.log("Processing inputs...");
            const inputs = await processor(image, textInput);

            console.log("Initializing streamer...");
            const streamer = new TextStreamer(processor.tokenizer, {
                skip_prompt: true,
                callback_function: (text: string) => {
                    console.log("Streamer callback:", text);
                    self.postMessage({ type: "output", text });
                },
            });

            console.log("Calling model.generate...");
            await model.generate({
                ...inputs,
                max_new_tokens: 2048,
                streamer,
            });
            console.log("Generation complete.");

            self.postMessage({ type: "complete" });
        }
    } catch (error: any) {
        console.error("Worker error (full):", error);
        self.postMessage({
            type: "error",
            error: error.message || error.toString() || "Unknown error"
        });
    }
};
