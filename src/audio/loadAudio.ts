import { engine } from "./toneEngine";
import type { AudioSource } from "./types";
import { useAppStore } from "../store/appStore";
import { useEditorStore } from "../store/editorStore";
import { useProjectStore } from "../store/projectStore";

export interface EnterEditorInput {
  buffer: AudioBuffer;
  fileName: string;
  source: AudioSource;
}

export function enterEditorWithBuffer({ buffer, fileName, source }: EnterEditorInput): void {
  useEditorStore.getState().reset();
  engine.loadBuffer(buffer);
  engine.applyPreset("none");
  engine.setABState("B");
  useProjectStore.getState().setProject({ buffer, fileName, source });
  useAppStore.getState().setMode("editor");
  useAppStore.getState().setError(null);
}
