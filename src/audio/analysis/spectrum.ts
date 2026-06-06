import type { SpectrumPoint } from "./types";

const MAX_SAMPLES = 4096;
const BIN_COUNT = 64;

export function calculateSpectrum(buffer: AudioBuffer): SpectrumPoint[] {
  if (buffer.length === 0 || buffer.numberOfChannels === 0) {
    return [];
  }

  const sampleCount = Math.min(buffer.length, MAX_SAMPLES);
  if (sampleCount === 0) {
    return [];
  }

  const channelData = buffer.getChannelData(0).subarray(0, sampleCount);
  const points: SpectrumPoint[] = [];
  let maxMagnitude = 0;

  for (let bin = 0; bin < BIN_COUNT; bin += 1) {
    let real = 0;
    let imaginary = 0;

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      const angle = (2 * Math.PI * bin * sampleIndex) / sampleCount;
      const sample = channelData[sampleIndex];
      real += sample * Math.cos(angle);
      imaginary -= sample * Math.sin(angle);
    }

    const magnitude = Math.sqrt(real * real + imaginary * imaginary) / sampleCount;
    maxMagnitude = Math.max(maxMagnitude, magnitude);
    points.push({
      frequency: bin * (buffer.sampleRate / sampleCount),
      magnitude,
    });
  }

  if (maxMagnitude === 0) {
    return points;
  }

  return points.map((point) => ({
    ...point,
    magnitude: point.magnitude / maxMagnitude,
  }));
}
