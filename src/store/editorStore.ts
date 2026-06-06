import { create } from "zustand";
import type { ABState, EditParams, PresetId } from "../audio/types";
import { DEFAULT_PARAMS } from "../audio/types";

interface EditorState {
  currentPreset: PresetId;
  abState: ABState;
  isPlaying: boolean;
  playhead: number; // 秒
  params: EditParams;
  setPreset: (id: PresetId) => void;
  setAB: (ab: ABState) => void;
  setPlaying: (playing: boolean) => void;
  setPlayhead: (sec: number) => void;
  setParams: (partial: Partial<EditParams>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentPreset: "none",
  abState: "B", // 默认处理后
  isPlaying: false,
  playhead: 0,
  params: DEFAULT_PARAMS,
  setPreset: (currentPreset) => set({ currentPreset }),
  setAB: (abState) => set({ abState }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlayhead: (playhead) => set({ playhead }),
  setParams: (partial) =>
    set((s) => ({ params: { ...s.params, ...partial } })),
  reset: () =>
    set({
      currentPreset: "none",
      abState: "B",
      isPlaying: false,
      playhead: 0,
      params: DEFAULT_PARAMS,
    }),
}));
