import { create } from "zustand";
import type { AppMode } from "../audio/types";

interface AppState {
  mode: AppMode;
  error: string | null;
  setMode: (mode: AppMode) => void;
  setError: (error: string | null) => void; // 设非空时由 UI 切到 error 态
}

export const useAppStore = create<AppState>((set) => ({
  mode: "landing",
  error: null,
  setMode: (mode) => set({ mode }),
  setError: (error) =>
    set((state) => ({
      error,
      mode: error ? "error" : state.mode,
    })),
}));
