import { create } from "zustand";
import type { AnalysisSummary, AudioSource } from "../audio/types";

interface ProjectState {
  fileName: string | null;
  duration: number;      // 秒
  sampleRate: number;
  numberOfChannels: number;
  source: AudioSource | null;
  buffer: AudioBuffer | null; // 原始解码后的 buffer（非序列化，但仅此一处持有数据引用）
  analysisSummary: AnalysisSummary | null;
  setProject: (p: {
    fileName: string;
    buffer: AudioBuffer;
    source: AudioSource;
  }) => void;
  setAnalysisSummary: (summary: AnalysisSummary | null) => void;
  clear: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  fileName: null,
  duration: 0,
  sampleRate: 0,
  numberOfChannels: 0,
  source: null,
  buffer: null,
  analysisSummary: null,
  setProject: ({ fileName, buffer, source }) =>
    set({
      fileName,
      buffer,
      source,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
      numberOfChannels: buffer.numberOfChannels,
      analysisSummary: null,
    }),
  setAnalysisSummary: (analysisSummary) => set({ analysisSummary }),
  clear: () =>
    set({
      fileName: null,
      duration: 0,
      sampleRate: 0,
      numberOfChannels: 0,
      source: null,
      buffer: null,
      analysisSummary: null,
    }),
}));
