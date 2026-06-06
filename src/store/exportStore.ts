import { create } from "zustand";
import type { ExportFormat, ExportStatus } from "../audio/types";

interface ExportState {
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  error: string | null;
  setFormat: (format: ExportFormat) => void;
  setStatus: (status: ExportStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useExportStore = create<ExportState>((set) => ({
  format: "wav",
  status: "idle",
  progress: 0,
  error: null,
  setFormat: (format) => set({ format }),
  setStatus: (status) =>
    set((state) => ({ status, error: status === "error" ? state.error : null })),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set((state) => ({ error, status: error ? "error" : state.status })),
  reset: () => set({ format: "wav", status: "idle", progress: 0, error: null }),
}));
