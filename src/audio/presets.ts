import type * as ToneType from "tone";
import type { PresetId, PresetMeta } from "./types";

export type ToneModule = typeof ToneType;

export const NONE_PRESET: PresetMeta = {
  id: "none",
  label: "无预设",
  description: "直通原始声音",
  chain: [{ label: "直通", summary: "不添加额外效果" }],
};

export const PRESET_LIST: PresetMeta[] = [
  {
    id: "robot",
    label: "机器人",
    description: "调制与轻微失真",
    chain: [
      { label: "音高保持", summary: "保留原始音高作为调制基底" },
      { label: "合唱调制", summary: "加入机械化的周期摆动" },
      { label: "轻微失真", summary: "增加合成器质感" },
    ],
  },
  {
    id: "devil",
    label: "魔鬼低音",
    description: "低沉降调",
    chain: [
      { label: "降调", summary: "下移 7 个半音" },
      { label: "低通滤波", summary: "压暗高频，保留厚重低频" },
    ],
  },
  {
    id: "chipmunk",
    label: "松鼠音",
    description: "明亮升调",
    chain: [{ label: "升调", summary: "上移 8 个半音" }],
  },
  {
    id: "phone",
    label: "电话音",
    description: "窄频电话感",
    chain: [
      { label: "带通滤波", summary: "收窄到电话听筒频段" },
      { label: "轻微染色", summary: "加入少量失真模拟压缩话筒" },
    ],
  },
  {
    id: "broadcast",
    label: "广播主持",
    description: "压缩提亮",
    chain: [
      { label: "动态压缩", summary: "让音量更稳定靠前" },
      { label: "均衡增强", summary: "轻微提升高频清晰度" },
    ],
  },
  {
    id: "alien",
    label: "外星人",
    description: "怪异移频与合唱",
    chain: [
      { label: "轻微降调", summary: "制造非人声的音高偏移" },
      { label: "移频调制", summary: "破坏自然谐波关系" },
      { label: "宽厚合唱", summary: "叠加漂浮的合成声层" },
    ],
  },
  {
    id: "tape",
    label: "磁带机",
    description: "温暖磁带染色",
    chain: [
      { label: "高频柔化", summary: "削去刺耳高频" },
      { label: "温和过载", summary: "加入磁带饱和感" },
      { label: "Wow/Flutter", summary: "用微弱颤音模拟走带波动" },
    ],
  },
  {
    id: "cave",
    label: "山洞回声",
    description: "宽阔混响与延迟",
    chain: [
      { label: "反馈延迟", summary: "产生可感知的空间回声" },
      { label: "房间混响", summary: "拉开深邃的洞穴尾音" },
      { label: "暗色滤波", summary: "让反射声更远更柔和" },
    ],
  },
  {
    id: "eightBit",
    label: "8-bit",
    description: "低保真像素音色",
    chain: [
      { label: "位深压缩", summary: "降低解析度形成颗粒感" },
      { label: "低通滤波", summary: "收束刺耳数字噪声" },
    ],
  },
];

// 为某个预设构建一串 Tone 效果节点（按顺序串联）。
// 返回的节点未连接；调用方负责 chain。none 返回空数组（直通）。
export function buildPresetNodes(Tone: ToneModule, id: PresetId): ToneType.ToneAudioNode[] {
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
    case "alien":
      return [
        new Tone.PitchShift({ pitch: -3, feedback: 0.08, wet: 0.85 }),
        new Tone.FrequencyShifter({ frequency: 42, wet: 0.35 }),
        new Tone.Chorus({ frequency: 2.2, delayTime: 3.5, depth: 0.85, wet: 0.45 }).start(),
      ];
    case "tape":
      return [
        new Tone.Filter({ type: "lowpass", frequency: 4200, Q: 0.7 }),
        new Tone.Distortion({ distortion: 0.12, wet: 0.22 }),
        new Tone.Vibrato({ frequency: 5.5, depth: 0.08, wet: 0.28 }),
      ];
    case "cave":
      return [
        new Tone.FeedbackDelay({ delayTime: 0.32, feedback: 0.35, wet: 0.35 }),
        new Tone.JCReverb({ roomSize: 0.78, wet: 0.5 }),
        new Tone.Filter({ type: "lowpass", frequency: 5200 }),
      ];
    case "eightBit":
      return [
        setWet(new Tone.BitCrusher(4), 0.8),
        new Tone.Filter({ type: "lowpass", frequency: 3600, Q: 0.9 }),
      ];
    case "none":
    default:
      return [];
  }
}

export function getPresetMeta(id: PresetId): PresetMeta {
  return PRESET_LIST.find((preset) => preset.id === id) ?? NONE_PRESET;
}

function setWet<T extends ToneType.ToneAudioNode & { wet: { value: number } }>(
  node: T,
  wet: number,
): T {
  node.wet.value = wet;
  return node;
}
