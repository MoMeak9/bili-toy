import * as Tone from "tone";
import type { PresetId, PresetMeta } from "./types";

export const PRESET_LIST: PresetMeta[] = [
  { id: "robot", label: "机器人" },
  { id: "devil", label: "魔鬼低音" },
  { id: "chipmunk", label: "松鼠音" },
  { id: "phone", label: "电话音" },
  { id: "broadcast", label: "广播主持" },
];

// 为某个预设构建一串 Tone 效果节点（按顺序串联）。
// 返回的节点未连接；调用方负责 chain。none 返回空数组（直通）。
export function buildPresetNodes(id: PresetId): Tone.ToneAudioNode[] {
  switch (id) {
    case "robot":
      return [
        new Tone.PitchShift({ pitch: 0 }),
        new Tone.Chorus({ frequency: 4, delayTime: 2.5, depth: 0.7 }).start(),
        new Tone.Distortion({ distortion: 0.2, wet: 0.3 }),
      ];
    case "devil":
      return [
        new Tone.PitchShift({ pitch: -7 }),
        new Tone.Filter({ type: "lowpass", frequency: 1200 }),
      ];
    case "chipmunk":
      return [new Tone.PitchShift({ pitch: 8 })];
    case "phone":
      return [
        new Tone.Filter({ type: "bandpass", frequency: 1500, Q: 1.2 }),
        new Tone.Distortion({ distortion: 0.05, wet: 0.2 }),
      ];
    case "broadcast":
      return [
        new Tone.Compressor({ threshold: -24, ratio: 4, attack: 0.003, release: 0.25 }),
        new Tone.EQ3({ low: 1, mid: 0, high: 3 }),
      ];
    case "none":
    default:
      return [];
  }
}
