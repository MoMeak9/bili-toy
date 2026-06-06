// lamejs is dynamically imported so the first screen stays lightweight.
export async function encodeMp3(buffer: AudioBuffer, kbps = 128): Promise<ArrayBuffer> {
  const { Mp3Encoder } = await import("lamejs");
  const channelCount = Math.min(buffer.numberOfChannels, 2);
  const encoder = new Mp3Encoder(channelCount, buffer.sampleRate, kbps);
  const blockSize = 1152;
  const parts: Int8Array[] = [];
  const left = buffer.getChannelData(0);
  const right = channelCount > 1 ? buffer.getChannelData(1) : undefined;

  for (let offset = 0; offset < buffer.length; offset += blockSize) {
    const end = Math.min(offset + blockSize, buffer.length);
    const leftBlock = toInt16Block(left, offset, end);
    const encoded = right
      ? encoder.encodeBuffer(leftBlock, toInt16Block(right, offset, end))
      : encoder.encodeBuffer(leftBlock);

    if (encoded.length > 0) parts.push(encoded);
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) parts.push(flushed);

  return concatInt8(parts);
}

function toInt16Block(samples: Float32Array, start: number, end: number): Int16Array {
  const block = new Int16Array(end - start);

  for (let i = start; i < end; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    block[i - start] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }

  return block;
}

function concatInt8(parts: Int8Array[]): ArrayBuffer {
  const byteLength = parts.reduce((total, part) => total + part.length, 0);
  const output = new Int8Array(byteLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output.buffer;
}
