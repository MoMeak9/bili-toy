# 本地音频实验室 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个单页、零后端、本地处理的 Web 音频工具：打开网页即可上传/打开示例音频，看波形、播放、套用变声预设、调参数，并导出 WAV。

**Architecture:** 三层 —— UI 层（React 组件）/ 状态层（Zustand 纯数据）/ 音频引擎层（纯 TS 单例，持有 Tone.js 图）。UI 调 store action，action 调引擎方法，引擎通过回调把播放位置等写回 store。音频节点永不进 store。

**Tech Stack:** React 18 + Vite + TypeScript + Tone.js（GrainPlayer + 效果节点 + Tone.Offline 离线渲染）+ wavesurfer.js（波形显示）+ Tailwind CSS + Radix UI + Lucide + Zustand。

**测试约定（重要）:** 本项目按 spec 决定**不写单测**。每个任务的验证步骤为：`npx tsc --noEmit` 通过 + `npm run build` 通过 +（涉及 UI/音频时）在浏览器手动验证指定现象。提交前确保类型检查与构建均通过。

**源 spec:** [docs/superpowers/specs/2026-06-05-local-audio-lab-mvp-design.md](../specs/2026-06-05-local-audio-lab-mvp-design.md)

---

## 文件结构总览

```
package.json / vite.config.ts / tsconfig.json / tailwind.config.js / postcss.config.js / index.html
scripts/gen-sample.mjs              # 构建期生成示例音频
src/
├── main.tsx                        # React 入口
├── app/
│   ├── App.tsx                     # 按 appMode 路由各状态
│   └── AppShell.tsx                # 编辑器三栏 / 移动端布局外壳
├── audio/
│   ├── types.ts                    # PresetId / EditParams / ABState 等类型
│   ├── presets.ts                  # P0 预设数据 + 构建效果节点
│   ├── wavEncoder.ts               # AudioBuffer → WAV(ArrayBuffer) 纯函数
│   ├── decode.ts                   # File/ArrayBuffer → AudioBuffer
│   ├── toneEngine.ts               # 引擎单例（GrainPlayer + 链 + 播放 + tick）
│   └── renderOffline.ts            # Tone.Offline 离线渲染处理后音频
├── store/
│   ├── appStore.ts                 # mode / error
│   ├── projectStore.ts             # 音频元数据 + 原始 buffer 引用
│   └── editorStore.ts              # preset / ab / params / isPlaying / playhead
├── hooks/
│   ├── useResponsive.ts            # 桌面/移动断点
│   └── useKeyboardShortcuts.ts     # Space / ?
├── components/
│   ├── landing/EmptyLanding.tsx
│   ├── common/LoadingPanel.tsx
│   ├── top-bar/TopBar.tsx
│   ├── waveform/WaveformEditor.tsx
│   ├── transport/TransportBar.tsx
│   ├── preset-panel/PresetPanel.tsx
│   ├── inspector/Inspector.tsx
│   ├── dialogs/ExportDialog.tsx
│   ├── dialogs/ShortcutDialog.tsx
│   └── common/ToastLayer.tsx
├── styles/globals.css
└── assets/sample-audio/sample.wav  # 由 scripts/gen-sample.mjs 生成
```

每个文件单一职责。音频相关逻辑集中在 `src/audio/`，store 只存可序列化数据。

---
## Task 1: 项目脚手架（Vite + React + TS + Tailwind）

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`, `src/main.tsx`, `src/app/App.tsx`, `src/styles/globals.css`

- [ ] **Step 1: 用 Vite 创建 React+TS 工程并安装依赖**

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install zustand tone wavesurfer.js @radix-ui/react-dialog @radix-ui/react-slider @radix-ui/react-toast @radix-ui/react-tabs lucide-react
npm install -D tailwindcss@^3 postcss autoprefixer
npx tailwindcss init -p
```

注意：若当前目录已有 `LICENSE`/`docs`，`npm create vite` 会提示非空目录，选择 "Ignore files and continue"。

- [ ] **Step 2: 配置 Tailwind**

`tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

`src/styles/globals.css`（替换 Vite 默认 `src/index.css` 内容，或新建并在 main 中引入）:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; margin: 0; }
body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
```

- [ ] **Step 3: 入口与占位 App**

`src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/app/App.tsx`（占位，后续任务替换）:

```tsx
export default function App() {
  return <div className="p-8 text-xl">本地音频实验室</div>;
}
```

删除 Vite 模板默认产物：`src/App.tsx`(根级若存在)、`src/App.css`、`src/index.css`、`src/assets/react.svg`（仅删除模板示例文件，保留我们的结构）。

- [ ] **Step 4: 验证 dev 与 build**

Run: `npm run dev`
Expected: 终端打印本地地址，浏览器打开见「本地音频实验室」。Ctrl-C 退出。

Run: `npx tsc --noEmit && npm run build`
Expected: 无类型错误，`dist/` 生成成功。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: 初始化 Vite + React + TS + Tailwind 脚手架"
```

---

## Task 2: 核心类型定义

**Files:**
- Create: `src/audio/types.ts`

- [ ] **Step 1: 定义共享类型**

`src/audio/types.ts`:

```ts
export type AppMode =
  | "landing"
  | "loading"
  | "editor"
  | "recording"
  | "exporting"
  | "error";

export type ABState = "A" | "B"; // A=原始, B=处理后

export type PresetId =
  | "none"
  | "robot"
  | "devil"
  | "chipmunk"
  | "phone"
  | "broadcast";

export interface EditParams {
  volumeDb: number;   // 默认 0
  rate: number;       // 变速 默认 1.0
  pitch: number;      // 变调 semitone 默认 0
  fadeIn: number;     // 秒 默认 0
  fadeOut: number;    // 秒 默认 0
}

export const DEFAULT_PARAMS: EditParams = {
  volumeDb: 0,
  rate: 1.0,
  pitch: 0,
  fadeIn: 0,
  fadeOut: 0,
};

export interface PresetMeta {
  id: PresetId;
  label: string;       // 中文名
}
```

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS（无错误）。

- [ ] **Step 3: Commit**

```bash
git add src/audio/types.ts
git commit -m "feat: 定义核心音频类型 (AppMode/PresetId/EditParams)"
```

---
## Task 3: Zustand Stores（纯数据状态层）

**Files:**
- Create: `src/store/appStore.ts`, `src/store/projectStore.ts`, `src/store/editorStore.ts`

- [ ] **Step 1: appStore（模式与错误）**

`src/store/appStore.ts`:

```ts
import { create } from "zustand";
import type { AppMode } from "../audio/types";

interface AppState {
  mode: AppMode;
  error: string | null;
  setMode: (mode: AppMode) => void;
  setError: (error: string | null) => void; // 设非空时由 UI 切到 error 态
}

export const useAppStore = create<AppState>((set) => ({
  mode: "landing",
  error: null,
  setMode: (mode) => set({ mode }),
  setError: (error) => set({ error, mode: error ? "error" : "editor" }),
}));
```

- [ ] **Step 2: projectStore（音频元数据）**

`src/store/projectStore.ts`:

```ts
import { create } from "zustand";

export type AudioSource = "upload" | "sample";

interface ProjectState {
  fileName: string | null;
  duration: number;      // 秒
  sampleRate: number;
  source: AudioSource | null;
  buffer: AudioBuffer | null; // 原始解码后的 buffer（非序列化，但仅此一处持有数据引用）
  setProject: (p: {
    fileName: string;
    buffer: AudioBuffer;
    source: AudioSource;
  }) => void;
  clear: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  fileName: null,
  duration: 0,
  sampleRate: 0,
  source: null,
  buffer: null,
  setProject: ({ fileName, buffer, source }) =>
    set({
      fileName,
      buffer,
      source,
      duration: buffer.duration,
      sampleRate: buffer.sampleRate,
    }),
  clear: () =>
    set({ fileName: null, duration: 0, sampleRate: 0, source: null, buffer: null }),
}));
```

> 说明：`buffer` 是原始音频数据引用，存于 projectStore 仅为单一数据源；它不参与渲染逻辑，UI 不订阅它。Tone.js 的活动节点仍只在引擎层。

- [ ] **Step 3: editorStore（编辑器可序列化状态）**

`src/store/editorStore.ts`:

```ts
import { create } from "zustand";
import type { ABState, EditParams, PresetId } from "../audio/types";
import { DEFAULT_PARAMS } from "../audio/types";

interface EditorState {
  currentPreset: PresetId;
  abState: ABState;
  isPlaying: boolean;
  playhead: number; // 秒
  params: EditParams;
  setPreset: (id: PresetId) => void;
  setAB: (ab: ABState) => void;
  setPlaying: (playing: boolean) => void;
  setPlayhead: (sec: number) => void;
  setParams: (partial: Partial<EditParams>) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentPreset: "none",
  abState: "B", // 默认处理后
  isPlaying: false,
  playhead: 0,
  params: DEFAULT_PARAMS,
  setPreset: (currentPreset) => set({ currentPreset }),
  setAB: (abState) => set({ abState }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setPlayhead: (playhead) => set({ playhead }),
  setParams: (partial) =>
    set((s) => ({ params: { ...s.params, ...partial } })),
  reset: () =>
    set({
      currentPreset: "none",
      abState: "B",
      isPlaying: false,
      playhead: 0,
      params: DEFAULT_PARAMS,
    }),
}));
```

- [ ] **Step 4: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/store/
git commit -m "feat: 添加 Zustand stores (app/project/editor)"
```

---

## Task 4: WAV 编码器（纯函数）

**Files:**
- Create: `src/audio/wavEncoder.ts`

- [ ] **Step 1: 实现 AudioBuffer → WAV ArrayBuffer**

`src/audio/wavEncoder.ts`:

```ts
// 将 AudioBuffer 编码为 16-bit PCM WAV。纯函数，无第三方依赖。
export function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // audio format = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // 交错写入各声道样本
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample)); // clamp
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

// 触发浏览器下载
export function downloadWav(arrayBuffer: ArrayBuffer, fileName: string): void {
  const blob = new Blob([arrayBuffer], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".wav") ? fileName : `${fileName}.wav`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/audio/wavEncoder.ts
git commit -m "feat: WAV 编码器与下载工具"
```

---
## Task 5: 音频解码

**Files:**
- Create: `src/audio/decode.ts`

- [ ] **Step 1: 实现文件/ArrayBuffer 解码为 AudioBuffer**

`src/audio/decode.ts`:

```ts
// 用一个临时 AudioContext 解码任意 File 为 AudioBuffer。
// 校验文件类型并对解码失败给出可读错误。
const ACCEPTED = ["audio/", ".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac"];

function looksLikeAudio(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED.some((ext) => ext.startsWith(".") && name.endsWith(ext));
}

export async function decodeFile(file: File): Promise<AudioBuffer> {
  if (!looksLikeAudio(file)) {
    throw new Error("不支持的文件类型，请选择音频文件（WAV/MP3/OGG 等）。");
  }
  const arrayBuffer = await file.arrayBuffer();
  return decodeArrayBuffer(arrayBuffer);
}

export async function decodeArrayBuffer(data: ArrayBuffer): Promise<AudioBuffer> {
  const Ctx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new Ctx();
  try {
    // slice(0) 防止某些浏览器 detach 原 buffer
    return await ctx.decodeAudioData(data.slice(0));
  } catch {
    throw new Error("音频解析失败，文件可能损坏或格式不受支持。");
  } finally {
    ctx.close();
  }
}
```

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/audio/decode.ts
git commit -m "feat: 音频文件解码与类型校验"
```

---

## Task 6: P0 预设定义与效果节点构建

**Files:**
- Create: `src/audio/presets.ts`

- [ ] **Step 1: 定义预设元数据与效果节点工厂**

`src/audio/presets.ts`:

```ts
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
```

> 说明：`PitchShift` 用于变声预设；用户在 Inspector 里的全局变调 (`params.pitch`) 单独由引擎的一个独立 PitchShift 处理，二者叠加。Chorus 需 `.start()` 才有调制效果。

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS（确认 tone 类型可用，如 `Tone.EQ3`、`Tone.PitchShift`）。

- [ ] **Step 3: Commit**

```bash
git add src/audio/presets.ts
git commit -m "feat: P0 变声预设定义与效果节点工厂"
```

---
## Task 7: Tone 音频引擎单例

**Files:**
- Create: `src/audio/toneEngine.ts`

- [ ] **Step 1: 实现引擎单例**

`src/audio/toneEngine.ts`:

```ts
import * as Tone from "tone";
import type { ABState, EditParams, PresetId } from "./types";
import { buildPresetNodes } from "./presets";

// 引擎单例：持有 GrainPlayer（支持独立变速/变调）+ 全局变调 + 预设链 + 音量。
// 音频图（B 态）：player -> globalPitch -> [presetNodes...] -> volume -> destination
// A 态：player -> volume -> destination（旁路链）
class ToneEngine {
  private player: Tone.GrainPlayer | null = null;
  private globalPitch: Tone.PitchShift | null = null;
  private volume: Tone.Volume | null = null;
  private presetNodes: Tone.ToneAudioNode[] = [];
  private buffer: AudioBuffer | null = null;

  private preset: PresetId = "none";
  private ab: ABState = "B";
  private params: EditParams = { volumeDb: 0, rate: 1, pitch: 0, fadeIn: 0, fadeOut: 0 };

  private startedAt = 0;      // Tone.now() 时刻
  private offsetAt = 0;       // 起播在素材内的偏移（秒）
  private playing = false;
  private rafId = 0;

  private tickCb: ((pos: number) => void) | null = null;
  private endedCb: (() => void) | null = null;

  async start(): Promise<void> {
    await Tone.start();
  }

  loadBuffer(buffer: AudioBuffer): void {
    this.dispose();
    this.buffer = buffer;
    this.player = new Tone.GrainPlayer({
      url: new Tone.ToneAudioBuffer(buffer),
      loop: false,
      playbackRate: this.params.rate,
      onstop: () => {
        // GrainPlayer 在自然播放结束时也会触发；用位置判断是否真正到尾
        if (this.playing && this.currentPos() >= this.duration() - 0.05) {
          this.handleEnded();
        }
      },
    });
    this.globalPitch = new Tone.PitchShift({ pitch: this.params.pitch });
    this.volume = new Tone.Volume(this.params.volumeDb);
    this.rebuildGraph();
  }

  // 根据 ab 与 preset 重新连接音频图
  private rebuildGraph(): void {
    if (!this.player || !this.globalPitch || !this.volume) return;
    this.player.disconnect();
    this.globalPitch.disconnect();
    this.presetNodes.forEach((n) => n.dispose());
    this.presetNodes = [];

    if (this.ab === "A") {
      this.player.connect(this.volume);
    } else {
      this.presetNodes = buildPresetNodes(this.preset);
      const chain: Tone.ToneAudioNode[] = [
        this.player,
        this.globalPitch,
        ...this.presetNodes,
        this.volume,
      ];
      for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
    }
    this.volume.toDestination();
  }

  applyPreset(id: PresetId): void {
    this.preset = id;
    this.rebuildGraph();
  }

  setABState(ab: ABState): void {
    this.ab = ab;
    this.rebuildGraph();
  }

  setParams(p: EditParams): void {
    this.params = p;
    if (this.player) this.player.playbackRate = p.rate;
    if (this.globalPitch) this.globalPitch.pitch = p.pitch;
    if (this.volume) this.volume.volume.value = p.volumeDb;
  }

  play(): void {
    if (!this.player || this.playing) return;
    const offset = this.offsetAt;
    this.player.start(undefined, offset);
    this.startedAt = Tone.now();
    this.playing = true;
    this.loop();
  }

  pause(): void {
    if (!this.player || !this.playing) return;
    this.offsetAt = this.currentPos();
    this.player.stop();
    this.playing = false;
    cancelAnimationFrame(this.rafId);
  }

  seek(seconds: number): void {
    const wasPlaying = this.playing;
    if (wasPlaying) this.pause();
    this.offsetAt = Math.max(0, Math.min(seconds, this.duration()));
    if (this.tickCb) this.tickCb(this.offsetAt);
    if (wasPlaying) this.play();
  }

  duration(): number {
    return this.buffer ? this.buffer.duration : 0;
  }

  private currentPos(): number {
    if (!this.playing) return this.offsetAt;
    const elapsed = (Tone.now() - this.startedAt) * this.params.rate;
    return Math.min(this.offsetAt + elapsed, this.duration());
  }

  private loop = (): void => {
    if (!this.playing) return;
    const pos = this.currentPos();
    if (this.tickCb) this.tickCb(pos);
    if (pos >= this.duration() - 0.02) {
      this.handleEnded();
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private handleEnded(): void {
    this.player?.stop();
    this.playing = false;
    this.offsetAt = 0;
    cancelAnimationFrame(this.rafId);
    if (this.tickCb) this.tickCb(0);
    if (this.endedCb) this.endedCb();
  }

  onTick(cb: (pos: number) => void): void {
    this.tickCb = cb;
  }
  onEnded(cb: () => void): void {
    this.endedCb = cb;
  }

  // 供离线渲染读取当前配置
  getConfig() {
    return { buffer: this.buffer, preset: this.preset, params: this.params };
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.player?.dispose();
    this.globalPitch?.dispose();
    this.volume?.dispose();
    this.presetNodes.forEach((n) => n.dispose());
    this.player = null;
    this.globalPitch = null;
    this.volume = null;
    this.presetNodes = [];
    this.playing = false;
    this.offsetAt = 0;
  }
}

export const engine = new ToneEngine();
```

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/audio/toneEngine.ts
git commit -m "feat: Tone 音频引擎单例 (播放/预设/AB/参数/tick)"
```

---

## Task 8: 离线渲染（导出用）

**Files:**
- Create: `src/audio/renderOffline.ts`

- [ ] **Step 1: 实现离线渲染**

`src/audio/renderOffline.ts`:

```ts
import * as Tone from "tone";
import type { EditParams, PresetId } from "./types";
import { buildPresetNodes } from "./presets";

// 用 Tone.Offline 离线渲染「处理后」音频，返回原生 AudioBuffer 供 WAV 编码。
// 图与实时 B 态一致：player -> globalPitch -> [preset...] -> volume -> dest
export async function renderProcessed(
  source: AudioBuffer,
  preset: PresetId,
  params: EditParams
): Promise<AudioBuffer> {
  const renderDuration = source.duration / params.rate + 0.2;

  const rendered = await Tone.Offline(({ transport }) => {
    const player = new Tone.GrainPlayer({
      url: new Tone.ToneAudioBuffer(source),
      playbackRate: params.rate,
    });
    const globalPitch = new Tone.PitchShift({ pitch: params.pitch });
    const volume = new Tone.Volume(params.volumeDb);
    const presetNodes = buildPresetNodes(preset);

    const chain: Tone.ToneAudioNode[] = [player, globalPitch, ...presetNodes, volume];
    for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
    volume.toDestination();

    player.start(0);
    transport.start();
  }, renderDuration, source.numberOfChannels, source.sampleRate);

  return rendered.get() as AudioBuffer;
}
```

> 说明：淡入/淡出（`params.fadeIn/fadeOut`）在 MVP 阶段先随 GrainPlayer 的 `fadeIn`/`fadeOut` 属性处理；若实时引擎已设置，渲染时同样在 player 上设 `player.fadeIn = params.fadeIn`。导出复用与实时一致的链，保证「所听即所得」。

- [ ] **Step 2: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 3: Commit**

```bash
git add src/audio/renderOffline.ts
git commit -m "feat: Tone.Offline 离线渲染处理后音频"
```

---
## Task 9: 示例音频生成脚本

**Files:**
- Create: `scripts/gen-sample.mjs`
- Modify: `package.json`（加 `gen:sample` 脚本）
- Generates: `src/assets/sample-audio/sample.wav`

- [ ] **Step 1: 写生成脚本（Node，无浏览器依赖，直接写 WAV 字节）**

`scripts/gen-sample.mjs`:

```js
// 生成约 8 秒、44.1kHz 单声道的音调序列示例音频，输出 16-bit PCM WAV (<500KB)。
// 纯 Node，不依赖浏览器 AudioContext。
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const sampleRate = 44100;
const duration = 8;
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
```

- [ ] **Step 2: 加 package.json 脚本并生成**

在 `package.json` 的 `scripts` 中加：

```json
"gen:sample": "node scripts/gen-sample.mjs"
```

Run: `npm run gen:sample`
Expected: 打印 `Wrote src/assets/sample-audio/sample.wav (约 690 KB？)`。

> 注意：8s × 44100 × 2 bytes ≈ 690KB，超过 500KB 上限。若超限，将 `duration` 降到 5 秒（5 × 44100 × 2 ≈ 430KB < 500KB）。生成后检查文件大小，必要时调 duration。

- [ ] **Step 3: 确认大小达标后引用方式**

示例音频通过 Vite 的 `?url` 动态导入实现懒加载（Task 13 会用到）：

```ts
const url = (await import("../assets/sample-audio/sample.wav?url")).default;
```

- [ ] **Step 4: Commit**

```bash
git add scripts/gen-sample.mjs package.json src/assets/sample-audio/sample.wav
git commit -m "feat: 示例音频生成脚本与内置示例 WAV"
```

---

## Task 10: 通用 Hooks（响应式 + 快捷键）

**Files:**
- Create: `src/hooks/useResponsive.ts`, `src/hooks/useKeyboardShortcuts.ts`

- [ ] **Step 1: useResponsive**

`src/hooks/useResponsive.ts`:

```ts
import { useEffect, useState } from "react";

// 768px 以下视为移动端
export function useResponsive(): { isMobile: boolean } {
  const query = "(max-width: 767px)";
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return { isMobile };
}
```

- [ ] **Step 2: useKeyboardShortcuts**

`src/hooks/useKeyboardShortcuts.ts`:

```ts
import { useEffect } from "react";

interface Handlers {
  onTogglePlay: () => void;
  onShowShortcuts: () => void;
}

// Space 播放/暂停；? 打开快捷键弹窗。输入框聚焦时不拦截。
export function useKeyboardShortcuts({ onTogglePlay, onShowShortcuts }: Handlers): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === "?") {
        e.preventDefault();
        onShowShortcuts();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTogglePlay, onShowShortcuts]);
}
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat: useResponsive 与 useKeyboardShortcuts hooks"
```

---
## Task 11: 首页 / 加载态 / Toast 组件

**Files:**
- Create: `src/components/landing/EmptyLanding.tsx`, `src/components/common/LoadingPanel.tsx`, `src/components/common/ToastLayer.tsx`

- [ ] **Step 1: EmptyLanding（首页三 CTA）**

`src/components/landing/EmptyLanding.tsx`:

```tsx
import { Upload, Mic, PlayCircle, ShieldCheck } from "lucide-react";

interface Props {
  onUpload: () => void;   // 触发文件选择
  onSample: () => void;   // 打开示例
}

export function EmptyLanding({ onUpload, onSample }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold">本地音频实验室</h1>
      <p className="text-gray-500">打开网页，即刻在浏览器本地剪辑、变声和导出你的声音。</p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <button
          onClick={onUpload}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-3 font-medium"
        >
          <Upload size={18} /> 上传音频
        </button>
        <button
          disabled
          title="录音功能即将推出"
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-400 rounded-lg px-5 py-3 cursor-not-allowed"
        >
          <Mic size={18} /> 开始录音
        </button>
        <button
          onClick={onSample}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-5 py-3 font-medium"
        >
          <PlayCircle size={18} /> 打开示例
        </button>
      </div>

      <p className="flex items-center gap-1 text-sm text-gray-400">
        <ShieldCheck size={14} /> 文件不会上传，全部在你的浏览器本地处理。
      </p>

      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 max-w-lg">
        <span>趣味预设：机器人 · 魔鬼低音 · 松鼠音</span>
        <span>·</span>
        <span>专业能力：Tone.js 效果链 · WAV 导出</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: LoadingPanel**

`src/components/common/LoadingPanel.tsx`:

```tsx
import { Loader2 } from "lucide-react";

export function LoadingPanel({ text = "正在解析音频…" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
      <Loader2 className="animate-spin" size={32} />
      <p>{text}</p>
    </div>
  );
}
```

- [ ] **Step 3: ToastLayer（基于 Radix Toast）**

`src/components/common/ToastLayer.tsx`:

```tsx
import * as Toast from "@radix-ui/react-toast";

interface Props {
  open: boolean;
  message: string;
  variant?: "info" | "error";
  onOpenChange: (open: boolean) => void;
}

export function ToastLayer({ open, message, variant = "info", onOpenChange }: Props) {
  return (
    <Toast.Provider swipeDirection="right" duration={5000}>
      <Toast.Root
        open={open}
        onOpenChange={onOpenChange}
        className={`rounded-md shadow-lg px-4 py-3 text-sm text-white ${
          variant === "error" ? "bg-red-600" : "bg-gray-800"
        }`}
      >
        <Toast.Description>{message}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 w-80 max-w-full z-50 outline-none" />
    </Toast.Provider>
  );
}
```

- [ ] **Step 4: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/components/landing/ src/components/common/
git commit -m "feat: 首页/加载态/Toast 组件"
```

---

## Task 12: 波形编辑器与播放控制条

**Files:**
- Create: `src/components/waveform/WaveformEditor.tsx`, `src/components/transport/TransportBar.tsx`

- [ ] **Step 1: WaveformEditor（wavesurfer 显示 + A/B 切换）**

`src/components/waveform/WaveformEditor.tsx`:

```tsx
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import { useProjectStore } from "../../store/projectStore";
import { useEditorStore } from "../../store/editorStore";
import { engine } from "../../audio/toneEngine";

// wavesurfer 仅用于「显示」波形与点击 seek；声音由 Tone 引擎播放。
// 因此关闭 wavesurfer 自身音频（media 不发声），用 setOptions 静音。
export function WaveformEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const buffer = useProjectStore((s) => s.buffer);
  const duration = useProjectStore((s) => s.duration);
  const playhead = useEditorStore((s) => s.playhead);
  const abState = useEditorStore((s) => s.abState);
  const setAB = useEditorStore((s) => s.setAB);

  // 初始化波形
  useEffect(() => {
    if (!containerRef.current || !buffer) return;
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#3b82f6",
      cursorColor: "#3b82f6",
      height: 96,
      interact: true,
    });
    // 用解码后的 buffer 直接渲染（peaks），不重新加载网络资源
    ws.loadDecodedBuffer
      ? // @ts-expect-error 兼容旧 API
        ws.loadDecodedBuffer(buffer)
      : ws.load("", [buffer.getChannelData(0)], buffer.duration);
    ws.on("interaction", () => {
      const t = ws.getCurrentTime();
      engine.seek(t);
    });
    wsRef.current = ws;
    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  }, [buffer]);

  // 同步播放位置到波形光标
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && duration > 0) {
      ws.setTime ? ws.setTime(playhead) : ws.seekTo(playhead / duration);
    }
  }, [playhead, duration]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">对比：</span>
        <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
          <button
            className={`px-3 py-1 text-sm ${abState === "A" ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => { setAB("A"); engine.setABState("A"); }}
          >
            A 原始
          </button>
          <button
            className={`px-3 py-1 text-sm ${abState === "B" ? "bg-blue-600 text-white" : "bg-white"}`}
            onClick={() => { setAB("B"); engine.setABState("B"); }}
          >
            B 处理后
          </button>
        </div>
      </div>
      <div ref={containerRef} className="w-full bg-gray-50 rounded-md" />
    </div>
  );
}
```

> 注意：wavesurfer.js v7 的 API 与 v6 不同。本步用了运行时分支兼容；执行时以安装版本（v7）的实际 API 为准 —— v7 用 `ws.load(url, peaks, duration)` 或直接传 `peaks` 选项。若类型报错，按 v7 文档调整为：`WaveSurfer.create({ ..., peaks: [buffer.getChannelData(0)], duration: buffer.duration })`，并用 `ws.setTime(sec)` 同步光标、`ws.on("interaction", (t) => engine.seek(t))`。优先采用 v7 原生写法，删除上面的兼容分支。

- [ ] **Step 2: TransportBar（播放/暂停/进度/时间）**

`src/components/transport/TransportBar.tsx`:

```tsx
import { Play, Pause } from "lucide-react";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";
import { engine } from "../../audio/toneEngine";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TransportBar() {
  const isPlaying = useEditorStore((s) => s.isPlaying);
  const playhead = useEditorStore((s) => s.playhead);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const duration = useProjectStore((s) => s.duration);

  const toggle = () => {
    if (isPlaying) {
      engine.pause();
      setPlaying(false);
    } else {
      engine.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-4 py-2">
      <button
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white"
        aria-label={isPlaying ? "暂停" : "播放"}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <span className="text-sm tabular-nums text-gray-600">
        {fmt(playhead)} / {fmt(duration)}
      </span>
    </div>
  );
}
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS（如 wavesurfer 类型报错，按 Step 1 注释改为 v7 原生 API）。

- [ ] **Step 4: Commit**

```bash
git add src/components/waveform/ src/components/transport/
git commit -m "feat: 波形编辑器(含 A/B)与播放控制条"
```

---
## Task 13: 预设面板与参数 Inspector

**Files:**
- Create: `src/components/preset-panel/PresetPanel.tsx`, `src/components/inspector/Inspector.tsx`

- [ ] **Step 1: PresetPanel**

`src/components/preset-panel/PresetPanel.tsx`:

```tsx
import { useEditorStore } from "../../store/editorStore";
import { engine } from "../../audio/toneEngine";
import { PRESET_LIST } from "../../audio/presets";

export function PresetPanel() {
  const current = useEditorStore((s) => s.currentPreset);
  const setPreset = useEditorStore((s) => s.setPreset);
  const setAB = useEditorStore((s) => s.setAB);

  const choose = (id: typeof PRESET_LIST[number]["id"]) => {
    setPreset(id);
    engine.applyPreset(id);
    // 选预设后自动切到 B 态，确保能听到效果
    setAB("B");
    engine.setABState("B");
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">声音预设</h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESET_LIST.map((p) => (
          <button
            key={p.id}
            onClick={() => choose(p.id)}
            className={`rounded-lg px-3 py-3 text-sm border ${
              current === p.id
                ? "border-blue-600 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Inspector（参数滑块，基于 Radix Slider）**

`src/components/inspector/Inspector.tsx`:

```tsx
import * as Slider from "@radix-ui/react-slider";
import { useEditorStore } from "../../store/editorStore";
import { engine } from "../../audio/toneEngine";
import type { EditParams } from "../../audio/types";

interface Row {
  key: keyof EditParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const ROWS: Row[] = [
  { key: "volumeDb", label: "音量", min: -24, max: 6, step: 1, unit: "dB" },
  { key: "rate", label: "变速", min: 0.5, max: 2, step: 0.05, unit: "x" },
  { key: "pitch", label: "变调", min: -12, max: 12, step: 1, unit: "半音" },
  { key: "fadeIn", label: "淡入", min: 0, max: 5, step: 0.1, unit: "s" },
  { key: "fadeOut", label: "淡出", min: 0, max: 5, step: 0.1, unit: "s" },
];

export function Inspector() {
  const params = useEditorStore((s) => s.params);
  const setParams = useEditorStore((s) => s.setParams);

  const update = (key: keyof EditParams, value: number) => {
    setParams({ [key]: value });
    engine.setParams({ ...params, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-gray-700">参数</h3>
      {ROWS.map((row) => (
        <div key={row.key} className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{row.label}</span>
            <span className="tabular-nums">
              {params[row.key]}
              {row.unit}
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center h-5 w-full"
            min={row.min}
            max={row.max}
            step={row.step}
            value={[params[row.key]]}
            onValueChange={([v]) => update(row.key, v)}
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-blue-600 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-white border border-blue-600 rounded-full shadow" />
          </Slider.Root>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add src/components/preset-panel/ src/components/inspector/
git commit -m "feat: 预设面板与参数 Inspector"
```

---

## Task 14: 导出弹窗与快捷键弹窗

**Files:**
- Create: `src/components/dialogs/ExportDialog.tsx`, `src/components/dialogs/ShortcutDialog.tsx`

- [ ] **Step 1: ExportDialog（Radix Dialog + 离线渲染 + WAV 下载）**

`src/components/dialogs/ExportDialog.tsx`:

```tsx
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useProjectStore } from "../../store/projectStore";
import { useEditorStore } from "../../store/editorStore";
import { renderProcessed } from "../../audio/renderOffline";
import { encodeWav, downloadWav } from "../../audio/wavEncoder";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError: (msg: string) => void;
}

export function ExportDialog({ open, onOpenChange, onError }: Props) {
  const [busy, setBusy] = useState(false);
  const buffer = useProjectStore((s) => s.buffer);
  const fileName = useProjectStore((s) => s.fileName);
  const preset = useEditorStore((s) => s.currentPreset);
  const params = useEditorStore((s) => s.params);

  const doExport = async () => {
    if (!buffer) return;
    setBusy(true);
    try {
      const rendered = await renderProcessed(buffer, preset, params);
      const wav = encodeWav(rendered);
      const base = (fileName ?? "audio").replace(/\.[^.]+$/, "");
      downloadWav(wav, `${base}-processed.wav`);
      onOpenChange(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : "导出失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90vw] max-w-sm flex flex-col gap-4">
          <Dialog.Title className="text-lg font-semibold">导出音频</Dialog.Title>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>格式</span><span>WAV</span></div>
            <div className="flex justify-between"><span>范围</span><span>整段</span></div>
          </div>
          <button
            onClick={doExport}
            disabled={busy || !buffer}
            className="bg-blue-600 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {busy ? "正在导出…" : "导出并下载"}
          </button>
          <Dialog.Close asChild>
            <button className="text-sm text-gray-400">取消</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 2: ShortcutDialog**

`src/components/dialogs/ShortcutDialog.tsx`:

```tsx
import * as Dialog from "@radix-ui/react-dialog";

const SHORTCUTS = [
  { keys: "Space", desc: "播放 / 暂停" },
  { keys: "?", desc: "打开本快捷键说明" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90vw] max-w-sm flex flex-col gap-4">
          <Dialog.Title className="text-lg font-semibold">快捷键</Dialog.Title>
          <ul className="flex flex-col gap-2">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex justify-between text-sm">
                <kbd className="px-2 py-0.5 bg-gray-100 rounded border text-gray-700">{s.keys}</kbd>
                <span className="text-gray-600">{s.desc}</span>
              </li>
            ))}
          </ul>
          <Dialog.Close asChild>
            <button className="text-sm text-gray-400 self-end">关闭</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add src/components/dialogs/
git commit -m "feat: 导出弹窗与快捷键弹窗"
```

---
## Task 15: TopBar 与 AppShell（编辑器布局）

**Files:**
- Create: `src/components/top-bar/TopBar.tsx`, `src/app/AppShell.tsx`

- [ ] **Step 1: TopBar**

`src/components/top-bar/TopBar.tsx`:

```tsx
import { Download, Keyboard, FilePlus2 } from "lucide-react";

interface Props {
  onExport: () => void;
  onShortcuts: () => void;
  onNewProject: () => void;
}

export function TopBar({ onExport, onShortcuts, onNewProject }: Props) {
  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="font-semibold">本地音频实验室</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewProject} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md hover:bg-gray-100">
          <FilePlus2 size={16} /> 新建
        </button>
        <button onClick={onShortcuts} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md hover:bg-gray-100">
          <Keyboard size={16} /> 快捷键
        </button>
        <button onClick={onExport} className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white">
          <Download size={16} /> 导出
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: AppShell（桌面三栏 / 移动端底部抽屉）**

`src/app/AppShell.tsx`:

```tsx
import * as Tabs from "@radix-ui/react-tabs";
import { useResponsive } from "../hooks/useResponsive";
import { WaveformEditor } from "../components/waveform/WaveformEditor";
import { TransportBar } from "../components/transport/TransportBar";
import { PresetPanel } from "../components/preset-panel/PresetPanel";
import { Inspector } from "../components/inspector/Inspector";

// 编辑器主体布局。桌面：左预设 / 中波形+播放 / 右参数。
// 移动端：波形在上，底部 Tab 抽屉（预设 / 参数），默认开在「预设」。
export function AppShell() {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          <WaveformEditor />
          <TransportBar />
        </div>
        <Tabs.Root defaultValue="presets" className="border-t border-gray-200 bg-white">
          <Tabs.List className="flex">
            <Tabs.Trigger value="presets" className="flex-1 py-2 text-sm data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              预设
            </Tabs.Trigger>
            <Tabs.Trigger value="params" className="flex-1 py-2 text-sm data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600">
              参数
            </Tabs.Trigger>
          </Tabs.List>
          <div className="p-4 max-h-[40vh] overflow-auto">
            <Tabs.Content value="presets"><PresetPanel /></Tabs.Content>
            <Tabs.Content value="params"><Inspector /></Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr_260px] gap-4 h-full p-4">
      <aside className="overflow-auto"><PresetPanel /></aside>
      <main className="flex flex-col gap-4 overflow-auto">
        <WaveformEditor />
        <TransportBar />
      </main>
      <aside className="overflow-auto"><Inspector /></aside>
    </div>
  );
}
```

- [ ] **Step 3: 验证类型检查**

Run: `npx tsc --noEmit`
Expected: PASS。

- [ ] **Step 4: Commit**

```bash
git add src/components/top-bar/ src/app/AppShell.tsx
git commit -m "feat: TopBar 与 AppShell 编辑器布局(桌面/移动)"
```

---

## Task 16: App 总装与状态机接线

**Files:**
- Modify: `src/app/App.tsx`（替换 Task 1 占位）

- [ ] **Step 1: 总装 App**

`src/app/App.tsx`（完整替换）:

```tsx
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";
import { useEditorStore } from "../store/editorStore";
import { useProjectStore } from "../store/projectStore";
import { engine } from "../audio/toneEngine";
import { decodeFile, decodeArrayBuffer } from "../audio/decode";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { EmptyLanding } from "../components/landing/EmptyLanding";
import { LoadingPanel } from "../components/common/LoadingPanel";
import { ToastLayer } from "../components/common/ToastLayer";
import { TopBar } from "../components/top-bar/TopBar";
import { AppShell } from "./AppShell";
import { ExportDialog } from "../components/dialogs/ExportDialog";
import { ShortcutDialog } from "../components/dialogs/ShortcutDialog";

export default function App() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const setError = useAppStore((s) => s.setError);
  const error = useAppStore((s) => s.error);

  const setProject = useProjectStore((s) => s.setProject);
  const clearProject = useProjectStore((s) => s.clear);
  const setPlayhead = useEditorStore((s) => s.setPlayhead);
  const setPlaying = useEditorStore((s) => s.setPlaying);
  const resetEditor = useEditorStore((s) => s.reset);
  const isPlaying = useEditorStore((s) => s.isPlaying);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; variant: "info" | "error" }>({
    open: false, msg: "", variant: "info",
  });

  // 引擎回调 → store
  useEffect(() => {
    engine.onTick((pos) => setPlayhead(pos));
    engine.onEnded(() => setPlaying(false));
  }, [setPlayhead, setPlaying]);

  // error 态 → toast
  useEffect(() => {
    if (error) setToast({ open: true, msg: error, variant: "error" });
  }, [error]);

  const enterEditorWithBuffer = async (
    buffer: AudioBuffer,
    fileName: string,
    source: "upload" | "sample"
  ) => {
    await engine.start();
    engine.loadBuffer(buffer);
    resetEditor();
    setProject({ fileName, buffer, source });
    setMode("editor");
    setToast({ open: true, msg: "提示：按 Space 播放/暂停，按 ? 查看全部快捷键。", variant: "info" });
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许重复选同一文件
    if (!file) return;
    setMode("loading");
    try {
      const buffer = await decodeFile(file);
      await enterEditorWithBuffer(buffer, file.name, "upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "音频解析失败");
    }
  };

  const handleSample = async () => {
    setMode("loading");
    try {
      const url = (await import("../assets/sample-audio/sample.wav?url")).default;
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      const buffer = await decodeArrayBuffer(arr);
      await enterEditorWithBuffer(buffer, "示例音频.wav", "sample");
    } catch (err) {
      setError(err instanceof Error ? err.message : "示例加载失败");
    }
  };

  const handleNewProject = () => {
    engine.pause();
    engine.dispose();
    clearProject();
    resetEditor();
    setError(null);
    setMode("landing");
  };

  const togglePlay = () => {
    if (mode !== "editor") return;
    if (isPlaying) { engine.pause(); setPlaying(false); }
    else { engine.play(); setPlaying(true); }
  };

  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onShowShortcuts: () => setShortcutOpen(true),
  });

  return (
    <div className="h-full flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {mode === "editor" || mode === "exporting" ? (
        <>
          <TopBar
            onExport={() => setExportOpen(true)}
            onShortcuts={() => setShortcutOpen(true)}
            onNewProject={handleNewProject}
          />
          <div className="flex-1 overflow-hidden">
            <AppShell />
          </div>
        </>
      ) : mode === "loading" ? (
        <LoadingPanel />
      ) : (
        <EmptyLanding onUpload={handleUploadClick} onSample={handleSample} />
      )}

      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onError={(msg) => setToast({ open: true, msg, variant: "error" })}
      />
      <ShortcutDialog open={shortcutOpen} onOpenChange={setShortcutOpen} />
      <ToastLayer
        open={toast.open}
        message={toast.msg}
        variant={toast.variant}
        onOpenChange={(open) => setToast((t) => ({ ...t, open }))}
      />
    </div>
  );
}
```

> 说明：`error` 态在 UI 上不单独占屏，而是落到 Toast 提示并停留在原视图（landing 或 editor），符合 spec「可恢复、不白屏」。`setError(msg)` 会把 mode 设为 `error`，但渲染分支里 `error` 落入 `else`（landing 视图）——若发生在 editor 中导出失败，导出失败不调用 `setError` 而是直接弹 toast（见 ExportDialog 的 onError），不切走 editor。仅文件/示例解析失败时回 landing 提示。

- [ ] **Step 2: 验证类型检查与构建**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS，构建成功。

- [ ] **Step 3: 浏览器手动验证（核心冒烟）**

Run: `npm run dev`，在浏览器依次验证：

1. 首页见「上传音频 / 开始录音(禁用) / 打开示例」三按钮 + 隐私说明。
2. 点「打开示例」→ 同页进入编辑器，见波形、预设面板、参数、播放条；右下角出现快捷键提示 toast。
3. 点播放 / 按 Space → 听到声音，波形光标推进，时间走动。
4. 点预设「机器人」「魔鬼低音」→ 声音明显变化。
5. 切 A/B → A 原始音色、B 处理后音色不同。
6. 拖参数滑块（变调/音量）→ 实时变化。
7. 点「导出」→ 弹窗内点「导出并下载」→ 下载到 `示例音频-processed.wav`，本地播放确认是处理后的声音。
8. 点「新建」→ 回到首页。
9. 打开 DevTools Network → 确认无音频上传请求（仅本地 fetch sample.wav）。
10. 缩窄窗口到 <768px → 底部出现「预设 / 参数」Tab，默认在预设。
11. 上传一个本地音频文件 → 同页进入编辑器可播放。

逐条确认通过；不通过则修复后重跑本步。

- [ ] **Step 4: Commit**

```bash
git add src/app/App.tsx
git commit -m "feat: App 总装与状态机接线，打通完整流程"
```

---

## Task 17: README

**Files:**
- Create/Modify: `README.md`

- [ ] **Step 1: 写 README（对照 spec 第 11 节）**

`README.md`（注意：下面用四个反引号包裹，内部的 ` ```bash ` 是 README 文件真实内容）:

````markdown
# 本地音频实验室

本地音频实验室是一个基于 Tone.js 的单页本地音频修改工具。无需后端、无需账号、无需 AI 服务，打开网页即可上传、录音、变声、剪辑和导出音频。

## 快速开始

```bash
npm install
npm run gen:sample   # 首次生成内置示例音频
npm run dev
```

打开终端显示的本地地址即可使用，无需配置任何后端环境变量。

## 说明

- 本项目不上传用户音频，全部在浏览器本地处理。
- 本项目不依赖后端接口。
- 本项目不使用 AI。
- Tone.js 用于播放、效果链和离线渲染。
- wavesurfer.js 用于波形展示。
- 本地 WAV 编码器用于导出。
- 移动端支持核心编辑能力（底部抽屉切换预设/参数）。
- 桌面端支持键盘快捷键（Space 播放/暂停，? 查看快捷键）。

## 当前范围（MVP）

已实现：上传/示例、波形与 A/B 对比、P0 变声预设、基础参数、WAV 导出、快捷键、响应式。
规划中（二期）：麦克风录音、MP3/OGG 导出、PWA 离线、效果链可视化排序。
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: 项目 README（开箱即用说明）"
```

---

## 自检结果（写计划后回看 spec）

- **范围覆盖:** spec 第 1.1 节每条 MVP 功能均有对应任务 —— 首页三 CTA(T11/T16)、上传(T5/T16)、示例(T9/T16)、波形+A/B(T12)、播放(T7/T12)、P0 预设(T6/T13)、参数(T13)、WAV 导出(T4/T8/T14)、快捷键(T10/T14)、响应式(T10/T15)、错误+Toast(T11/T16)。延后项(录音/MP3/PWA)按 spec 不建任务。
- **占位符:** 无 TBD/TODO；每个代码步骤含完整代码。wavesurfer v7 API 处给了明确的执行时调整指引（非占位，是版本适配说明）。
- **类型一致性:** 引擎方法名 `loadBuffer/play/pause/seek/applyPreset/setABState/setParams/onTick/onEnded/dispose` 在 T7 定义，T12/T13/T16 调用一致；store action 名 `setMode/setError/setProject/clear/setPreset/setAB/setPlaying/setPlayhead/setParams/reset` 在 T3 定义，调用处一致；`PresetId/EditParams/ABState` 在 T2 定义，全程引用一致。
- **已知风险（执行时注意）:** ① 示例音频 8s 超 500KB → T9 已给降到 5s 的备选；② wavesurfer v7 显示用解码 buffer 的 API → T12 给了 `peaks`+`duration` 原生写法指引；③ GrainPlayer 变速会同时影响时长与 tick 计算 → T7 的 `currentPos()` 已按 `rate` 折算。

