import type { AnalysisSummary } from "../types";

export function analyzeBuffer(buffer: AudioBuffer): AnalysisSummary {
  let peak = 0;
  let sumSquares = 0;
  let sampleCount = 0;

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);

    for (let index = 0; index < data.length; index += 1) {
      const sample = data[index];
      const magnitude = Math.abs(sample);

      if (magnitude > peak) {
        peak = magnitude;
      }

      sumSquares += sample * sample;
      sampleCount += 1;
    }
  }

  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    numberOfChannels: buffer.numberOfChannels,
    peak,
    rms: sampleCount > 0 ? Math.sqrt(sumSquares / sampleCount) : 0,
  };
}
