import { renderProcessed } from "./renderOffline";
import type { EditParams, ExportFormat, PresetId } from "./types";
import { encodeWav } from "./wavEncoder";

interface ExportProcessedAudioOptions {
  source: AudioBuffer;
  preset: PresetId;
  params: EditParams;
  format: ExportFormat;
  onProgress?: (progress: number) => void;
}

export async function exportProcessedAudio({
  source,
  preset,
  params,
  format,
  onProgress,
}: ExportProcessedAudioOptions): Promise<ArrayBuffer> {
  onProgress?.(0.2);
  const rendered = await renderProcessed(source, preset, params);
  onProgress?.(0.65);

  if (format === "wav") {
    const wav = encodeWav(rendered);
    onProgress?.(1);
    return wav;
  }

  const { encodeMp3 } = await import("./mp3Encoder");
  const mp3 = await encodeMp3(rendered);
  onProgress?.(1);
  return mp3;
}
