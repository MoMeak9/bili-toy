export type AppMode =
  | "landing"
  | "loading"
  | "editor"
  | "recording"
  | "exporting"
  | "error";

export type ABState = "A" | "B"; // A=原始, B=处理后

export type AudioSource = "upload" | "sample" | "recording";

export type RecordingStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "unsupported"
  | "error";

export type ExportFormat = "wav" | "mp3";

export type ExportStatus =
  | "idle"
  | "rendering"
  | "encoding"
  | "downloading"
  | "done"
  | "error";

export type PresetId =
  | "none"
  | "robot"
  | "devil"
  | "chipmunk"
  | "phone"
  | "broadcast"
  | "alien"
  | "tape"
  | "cave"
  | "eightBit";

export interface EditParams {
  volumeDb: number;   // 默认 0
  rate: number;       // 变速 默认 1.0
  pitch: number;      // 变调 semitone 默认 0
  fadeIn: number;     // 秒 默认 0
  fadeOut: number;    // 秒 默认 0
}

export interface AnalysisSummary {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peak: number;
  rms: number;
}

export const DEFAULT_PARAMS: EditParams = {
  volumeDb: 0,
  rate: 1.0,
  pitch: 0,
  fadeIn: 0,
  fadeOut: 0,
};

export interface PresetChainStep {
  label: string;
  summary: string;
}

export interface PresetMeta {
  id: PresetId;
  label: string;
  description: string;
  chain: PresetChainStep[];
}
