import { create } from "zustand";
import type { RecordingStatus } from "../audio/types";

interface RecordingState {
  status: RecordingStatus;
  elapsed: number;
  error: string | null;
  setStatus: (status: RecordingStatus) => void;
  setElapsed: (elapsed: number) => void;
  setError: (error: string | null) => void;
  tickElapsed: () => void;
  beginRequest: () => void;
  beginRecording: () => void;
  beginProcessing: () => void;
  setUnsupported: (message: string) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  status: "idle",
  elapsed: 0,
  error: null,
  setStatus: (status) =>
    set((state) => ({ status, error: status === "error" ? state.error : null })),
  setElapsed: (elapsed) => set({ elapsed }),
  setError: (error) => set((state) => ({ error, status: error ? "error" : state.status })),
  tickElapsed: () =>
    set((state) => ({ elapsed: state.status === "recording" ? state.elapsed + 1 : state.elapsed })),
  beginRequest: () => set({ status: "requesting", elapsed: 0, error: null }),
  beginRecording: () => set({ status: "recording", elapsed: 0, error: null }),
  beginProcessing: () => set({ status: "processing", error: null }),
  setUnsupported: (message) => set({ status: "unsupported", error: message }),
  reset: () => set({ status: "idle", elapsed: 0, error: null }),
}));
