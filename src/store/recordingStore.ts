import { create } from "zustand";
import type { RecordingStatus } from "../audio/types";

interface RecordingState {
  status: RecordingStatus;
  elapsed: number;
  error: string | null;
  setStatus: (status: RecordingStatus) => void;
  setElapsed: (elapsed: number) => void;
  setError: (error: string | null) => void;
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
  reset: () => set({ status: "idle", elapsed: 0, error: null }),
}));
