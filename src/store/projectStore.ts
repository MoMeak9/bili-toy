import { create } from "zustand";

export type AudioSource = "upload" | "sample";

interface ProjectState {
  fileName: string | null;
  duration: number;      // 秒
  sampleRate: number;
  source: AudioSource | null;
  buffer: AudioBuffer | null; // 原始解码后的 buffer（非序列化，但仅此一处持有数据引用）
  setProject: (p: {
    fileName: string;
    buffer: AudioBuffer;
    source: AudioSource;
  }) => void;
  clear: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  fileName: null,
  duration: 0,
  sampleRate: 0,
  source: null,
  buffer: null,
  setProject: ({ fileName, buffer, source }) =>
    set({
      fileName,
      buffer,
      source,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    }),
  clear: () =>
    set({ fileName: null, duration: 0, sampleRate: 0, source: null, buffer: null }),
}));
