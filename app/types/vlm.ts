export type VLMContextValue = {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  loadModel: (
    onProgress?: (msg: string, percentage: number) => void,
  ) => Promise<void>;
  runInference: (
    input: HTMLVideoElement | string,
    instruction: string,
    onTextUpdate?: (text: string) => void,
    onStatsUpdate?: (stats: { tps?: number; ttft?: number }) => void,
  ) => Promise<string>;
  imageSize: number;
  setImageSize: (size: number) => void;
};
