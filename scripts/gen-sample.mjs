// 生成约 8 秒、44.1kHz 单声道的音调序列示例音频，输出 16-bit PCM WAV (<500KB)。
// 纯 Node，不依赖浏览器 AudioContext。
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const sampleRate = 44100;
const duration = 5;
const numFrames = sampleRate * duration;

// 简单旋律：每 0.5s 一个音，C 大调音阶往返，带 ADSR 包络模拟"嗓音感"
const notes = [262, 294, 330, 349, 392, 440, 494, 523, 494, 440, 392, 349, 330, 294, 262, 330];
const noteDur = duration / notes.length;

const data = new Float32Array(numFrames);
for (let i = 0; i < numFrames; i++) {
  const t = i / sampleRate;
  const noteIndex = Math.min(notes.length - 1, Math.floor(t / noteDur));
  const freq = notes[noteIndex];
  const localT = t - noteIndex * noteDur;
  // 包络：快起 + 衰减
  const env = Math.min(1, localT * 20) * Math.exp(-localT * 2.5);
  // 基频 + 二次谐波，更有"音色"
  const sample =
    0.6 * Math.sin(2 * Math.PI * freq * t) +
    0.2 * Math.sin(2 * Math.PI * freq * 2 * t);
  data[i] = sample * env * 0.5;
}

// 编码 16-bit PCM WAV
const bytesPerSample = 2;
const dataSize = numFrames * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);            // mono
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * bytesPerSample, 28);
buffer.writeUInt16LE(bytesPerSample, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

let offset = 44;
for (let i = 0; i < numFrames; i++) {
  let s = Math.max(-1, Math.min(1, data[i]));
  buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7fff, offset);
  offset += 2;
}

const outPath = "src/assets/sample-audio/sample.wav";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
