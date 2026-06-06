import { analyzeBuffer } from "./analysis/summary";
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

export async function enterEditorWithBuffer({
  buffer,
  fileName,
  source,
}: EnterEditorInput): Promise<void> {
  useEditorStore.getState().reset();
  await engine.loadBuffer(buffer);
  engine.applyPreset("none");
  engine.setABState("B");
  const projectStore = useProjectStore.getState();
  projectStore.setProject({ buffer, fileName, source });
  projectStore.setAnalysisSummary(analyzeBuffer(buffer));
  useAppStore.getState().setMode("editor");
  useAppStore.getState().setError(null);
}
