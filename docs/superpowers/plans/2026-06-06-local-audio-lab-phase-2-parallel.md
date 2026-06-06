# Local Audio Lab Phase 2 Parallel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phase 2 of Local Audio Lab: recording loop, enhanced export, V1.5 effects, analysis panel, and performance-oriented lazy loading.

**Architecture:** Implement a small shared base first, then run four independent feature tracks in parallel. The shared base owns type/state contracts, recording/export routing placeholders, and the unified `AudioBuffer` entry path; each feature track owns a disjoint UI/audio slice. Performance lazy loading runs after feature tracks because true Tone lazy loading touches shared engine and preset-node boundaries.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind CSS + Radix UI + Lucide + Zustand + Tone.js + wavesurfer.js + MediaRecorder + browser-local encoders/analyzers.

**Source Specs:**
- `docs/superpowers/specs/2026-06-06-local-audio-lab-phase-2-design.md`
- `docs/superpowers/specs/2026-06-06-phase-2-recording-loop-summary.md`
- `docs/superpowers/specs/2026-06-06-phase-2-export-enhancement-summary.md`
- `docs/superpowers/specs/2026-06-06-phase-2-effect-upgrade-summary.md`
- `docs/superpowers/specs/2026-06-06-phase-2-analysis-summary.md`
- `docs/superpowers/specs/2026-06-06-phase-2-performance-summary.md`

**Testing Convention:** This project currently has no unit-test runner and the MVP spec explicitly uses manual verification plus static checks. For each task, run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. For UI/audio tasks, also verify in the browser at `http://127.0.0.1:5173/`.

For browser checks, first start or reuse the Vite dev server:

```bash
npm run dev -- --host 127.0.0.1
```

If Vite selects a port other than `5173`, use the printed local URL for the browser checks.

---

## Parallelization Model

Task 1 is serial and must land first. After Task 1 is committed, Tasks 2-5 can run in parallel if each worker keeps to its write ownership. Task 6 runs after Tasks 2-5 are integrated. Treat `src/app/App.tsx` and `src/app/AppShell.tsx` as integrator-owned during parallel work; feature tracks produce components/APIs plus integration notes, and Task 7 mounts them into the shared app/layout.

```text
Task 1 Shared Base
├── Task 2 Recording Loop
├── Task 3 Export Enhancement
├── Task 4 Effect Upgrade
└── Task 5 Analysis Panel
    ↓
Task 6 Performance Lazy Loading
    ↓
Task 7 Integration QA
```

## File Structure

Shared base:

```text
src/audio/types.ts                  # Phase 2 shared types
src/audio/loadAudio.ts              # Unified AudioBuffer entry helper
src/store/appStore.ts               # mode/error helpers
src/store/projectStore.ts           # recording source + metadata + analysis fields
src/store/exportStore.ts            # export format/status/progress/error
src/store/recordingStore.ts         # recording permission/status/elapsed/error
src/app/App.tsx                     # mode routing and shared callbacks
```

Recording:

```text
src/audio/recording.ts              # MediaRecorder helpers
src/components/recording/RecordingPanel.tsx
src/components/landing/EmptyLanding.tsx
integration note for src/app/App.tsx
```

Export:

```text
src/audio/exportAudio.ts            # format router
src/audio/mp3Encoder.ts             # lazy MP3 adapter
src/components/dialogs/ExportDialog.tsx
src/store/exportStore.ts
integration note for src/app/App.tsx
package.json / package-lock.json    # install the selected MP3 encoder during Task 3
```

Effects:

```text
src/audio/types.ts
src/audio/presets.ts
src/components/preset-panel/PresetPanel.tsx
src/components/effect-chain/EffectChainPanel.tsx
integration note for src/app/AppShell.tsx
```

Analysis:

```text
src/audio/analysis/types.ts
src/audio/analysis/summary.ts
src/audio/analysis/spectrum.ts
src/components/analysis/AnalysisPanel.tsx
src/store/projectStore.ts
src/audio/loadAudio.ts
integration note for src/app/AppShell.tsx
```

Performance:

```text
src/audio/lazyWaveform.ts
src/audio/renderOffline.ts
src/components/waveform/WaveformEditor.tsx
src/audio/lazyTone.ts
```

---

### Task 1: Shared Phase 2 Base

**Files:**
- Modify: `src/audio/types.ts`
- Create: `src/audio/loadAudio.ts`
- Modify: `src/store/projectStore.ts`
- Create: `src/store/exportStore.ts`
- Create: `src/store/recordingStore.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/components/landing/EmptyLanding.tsx`
- Modify: `src/components/dialogs/ExportDialog.tsx`

- [ ] **Step 1: Extend shared types**

Update `src/audio/types.ts` with shared phase-2 contracts:

```ts
export type AudioSource = "upload" | "sample" | "recording";

export type RecordingStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "unsupported"
  | "error";

export type ExportFormat = "wav" | "mp3";

export type ExportStatus =
  | "idle"
  | "rendering"
  | "encoding"
  | "downloading"
  | "done"
  | "error";

export interface AnalysisSummary {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peak: number;
  rms: number;
}
```

- [ ] **Step 2: Move `AudioSource` out of `projectStore`**

Modify `src/store/projectStore.ts` to import `AudioSource` from `../audio/types`, add `numberOfChannels`, and optional `analysisSummary`.

Expected final state shape:

```ts
interface ProjectState {
  fileName: string | null;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  source: AudioSource | null;
  buffer: AudioBuffer | null;
  analysisSummary: AnalysisSummary | null;
  setProject: (p: { fileName: string; buffer: AudioBuffer; source: AudioSource }) => void;
  setAnalysisSummary: (summary: AnalysisSummary | null) => void;
  clear: () => void;
}
```

- [ ] **Step 3: Add `exportStore`**

Create `src/store/exportStore.ts`:

```ts
import { create } from "zustand";
import type { ExportFormat, ExportStatus } from "../audio/types";

interface ExportState {
  format: ExportFormat;
  status: ExportStatus;
  progress: number;
  error: string | null;
  setFormat: (format: ExportFormat) => void;
  setStatus: (status: ExportStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useExportStore = create<ExportState>((set) => ({
  format: "wav",
  status: "idle",
  progress: 0,
  error: null,
  setFormat: (format) => set({ format }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  reset: () => set({ format: "wav", status: "idle", progress: 0, error: null }),
}));
```

- [ ] **Step 4: Add `recordingStore`**

Create `src/store/recordingStore.ts`:

```ts
import { create } from "zustand";
import type { RecordingStatus } from "../audio/types";

interface RecordingState {
  status: RecordingStatus;
  elapsed: number;
  error: string | null;
  setStatus: (status: RecordingStatus) => void;
  setElapsed: (elapsed: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  status: "idle",
  elapsed: 0,
  error: null,
  setStatus: (status) => set({ status }),
  setElapsed: (elapsed) => set({ elapsed }),
  setError: (error) => set({ error, status: error ? "error" : "idle" }),
  reset: () => set({ status: "idle", elapsed: 0, error: null }),
}));
```

- [ ] **Step 5: Extract unified audio entry helper**

Create `src/audio/loadAudio.ts`:

```ts
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
```

- [ ] **Step 6: Rewire `App.tsx` to use the helper**

Modify `src/app/App.tsx`:

- Remove local `enterEditor`.
- Call `enterEditorWithBuffer({ buffer, fileName, source })` in upload and sample flows.
- Keep Toast messages in `App.tsx` after helper returns.
- Add `handleRecordingClick` that sets `mode` to `"recording"`.
- Pass `onRecording={handleRecordingClick}` to `EmptyLanding`.
- Add a recording placeholder branch:

```tsx
if (mode === "recording") {
  return <LoadingPanel text="录音功能准备中..." />;
}
```

- Keep export dialog mounted for `editor` and `exporting` modes.
- Add callbacks for export mode transitions that Task 3 can reuse:

```tsx
const handleExportStart = () => setMode("exporting");
const handleExportEnd = () => setMode("editor");
```

Pass these callbacks to `ExportDialog` as props in Step 8 below.

- [ ] **Step 7: Enable landing CTA wiring**

Modify `src/components/landing/EmptyLanding.tsx`:

- Add `onRecording: () => void` prop.
- Remove `disabled` and `cursor-not-allowed` from recording button.
- Call `onRecording` on click.

- [ ] **Step 8: Add export transition props**

Modify `src/components/dialogs/ExportDialog.tsx` props:

```ts
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError: (message: string) => void;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}
```

Call `onExportStart?.()` before current export work starts and `onExportEnd?.()` in the `finally` block after `setBusy(false)`. This keeps Task 3 from needing to edit `App.tsx` for global export mode wiring.

- [ ] **Step 9: Verify shared base**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected:

- Typecheck passes.
- Lint passes.
- Build passes.
- Browser still opens homepage, upload button, sample button.
- Clicking recording enters the temporary recording placeholder.

- [ ] **Step 10: Commit shared base**

```bash
git add src/audio/types.ts src/audio/loadAudio.ts src/store/projectStore.ts src/store/exportStore.ts src/store/recordingStore.ts src/app/App.tsx src/components/landing/EmptyLanding.tsx src/components/dialogs/ExportDialog.tsx
git commit -m "feat: add phase 2 shared state base"
```

---

### Task 2: Track A Recording Loop

**Parallel:** Can start after Task 1.

**Files:**
- Create: `src/audio/recording.ts`
- Create: `src/components/recording/RecordingPanel.tsx`
- Modify: `src/store/recordingStore.ts`
- Do not modify: `src/app/App.tsx` during parallel execution

- [ ] **Step 1: Implement recorder helper**

Create `src/audio/recording.ts`:

```ts
export function isRecordingSupported(): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!isRecordingSupported()) {
    throw new Error("当前浏览器不支持录音。");
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
}

export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
```

- [ ] **Step 2: Build `RecordingPanel`**

Create `src/components/recording/RecordingPanel.tsx` with props:

```ts
interface RecordingPanelProps {
  onCancel: () => void;
  onRecorded: (buffer: AudioBuffer, fileName: string) => void;
  onError: (message: string) => void;
}
```

Behavior:

- On “开始录音”, request stream, create recorder, collect chunks.
- Show elapsed timer while recording.
- On stop, decode Blob via `decodeArrayBuffer`.
- Call `onRecorded(buffer, fileName)`.
- On permission or recorder errors, call `useRecordingStore.getState().setError(message)` and then `onError(message)`.
- Always stop media tracks on stop/cancel/unmount.

- [ ] **Step 3: Write recording app integration note**

Add this note to the task final report for Task 7:

```tsx
if (mode === "recording") {
  return (
    <RecordingPanel
      onCancel={handleNewProject}
      onError={(message) => {
        useRecordingStore.getState().setError(message);
        setToast({ open: true, message, variant: "error" });
      }}
      onRecorded={(buffer, fileName) => {
        enterEditorWithBuffer({ buffer, fileName, source: "recording" });
        setToast({ open: true, message: "录音已载入。", variant: "info" });
      }}
    />
  );
}
```

Do not call the global `fail` helper for recoverable recording errors because it switches the whole app to `error`.

- [ ] **Step 4: Verify recording**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Browser checks:

- Track-level browser checks are deferred to Task 7 because `RecordingPanel` is not mounted into `App.tsx` during parallel execution.
- In this task, verify static checks and inspect the component manually for the allow/deny/cancel paths.

- [ ] **Step 5: Commit recording**

```bash
git add src/audio/recording.ts src/components/recording/RecordingPanel.tsx src/store/recordingStore.ts
git commit -m "feat: add browser recording loop"
```

---

### Task 3: Track B Export Enhancement

**Parallel:** Can start after Task 1.

**Files:**
- Create: `src/audio/exportAudio.ts`
- Create: `src/audio/mp3Encoder.ts`
- Modify: `src/components/dialogs/ExportDialog.tsx`
- Modify: `src/store/exportStore.ts`
- Do not modify: `src/app/App.tsx` during parallel execution
- Modify: `package.json`, `package-lock.json` only after MP3 library spike

- [ ] **Step 1: Run MP3 encoder spike**

Evaluate one lightweight browser MP3 encoder and document the chosen package in the plan commit message or a short comment in `src/audio/mp3Encoder.ts`.

Preferred order:

1. `lamejs` if it works cleanly with current TypeScript/Vite.
2. If `lamejs` fails Vite build or cannot encode a playable browser MP3, stop and update this plan with the selected replacement before coding the adapter.

Install only the chosen package:

```bash
npm install lamejs
```

If TypeScript types are missing, add a small local declaration file rather than weakening project-wide strictness:

```text
src/types/lamejs.d.ts
```

- [ ] **Step 2: Add MP3 adapter**

Always create `src/types/lamejs.d.ts` with the declaration below, even if package types later become available. This keeps the commit path stable and documents the adapter surface:

```ts
declare module "lamejs" {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
    flush(): Int8Array;
  }
}
```

Create `src/audio/mp3Encoder.ts`:

```ts
export async function encodeMp3(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const { Mp3Encoder } = await import("lamejs");
  const channels = Math.min(2, buffer.numberOfChannels);
  const kbps = 128;
  const blockSize = 1152;
  const encoder = new Mp3Encoder(channels, buffer.sampleRate, kbps);
  const left = floatToInt16(buffer.getChannelData(0));
  const right = channels === 2 ? floatToInt16(buffer.getChannelData(1)) : undefined;
  const chunks: Int8Array[] = [];

  for (let offset = 0; offset < left.length; offset += blockSize) {
    const leftBlock = left.subarray(offset, offset + blockSize);
    const encoded = right
      ? encoder.encodeBuffer(leftBlock, right.subarray(offset, offset + blockSize))
      : encoder.encodeBuffer(leftBlock);
    if (encoded.length) chunks.push(encoded);
  }

  const tail = encoder.flush();
  if (tail.length) chunks.push(tail);
  return concatChunks(chunks);
}

function floatToInt16(data: Float32Array): Int16Array {
  const out = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    out[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return out;
}

function concatChunks(chunks: Int8Array[]): ArrayBuffer {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged.buffer;
}
```

Implementation requirements:

- Clamp samples to [-1, 1].
- Support mono and stereo.
- Use the first two channels if more than two exist.
- Keep the import dynamic.

- [ ] **Step 3: Add export router**

Create `src/audio/exportAudio.ts`:

```ts
import type { ExportFormat, PresetId, EditParams } from "./types";
import { renderProcessed } from "./renderOffline";
import { encodeWav } from "./wavEncoder";

interface ExportProcessedInput {
  source: AudioBuffer;
  preset: PresetId;
  params: EditParams;
  format: ExportFormat;
  onProgress?: (progress: number) => void;
}

export async function exportProcessedAudio(input: ExportProcessedInput): Promise<ArrayBuffer> {
  input.onProgress?.(0.2);
  const rendered = await renderProcessed(input.source, input.preset, input.params);
  input.onProgress?.(0.65);
  if (input.format === "wav") return encodeWav(rendered);
  const { encodeMp3 } = await import("./mp3Encoder");
  const encoded = await encodeMp3(rendered);
  input.onProgress?.(1);
  return encoded;
}
```

- [ ] **Step 4: Update `ExportDialog`**

Modify `src/components/dialogs/ExportDialog.tsx`:

- Read/write `format`, `status`, `progress`, and `error` from `useExportStore`.
- Add WAV/MP3 segmented control.
- Disable close/format switch while exporting.
- Use `exportProcessedAudio`.
- Download file with `.wav` or `.mp3` extension.
- Call `onError` for unrecoverable errors but keep editor state.

- [ ] **Step 5: Use shared export transition props**

Do not modify `src/app/App.tsx`. Task 1 added `onExportStart` and `onExportEnd` props to `ExportDialog`.

Modify `src/components/dialogs/ExportDialog.tsx`:

- Call `onExportStart?.()` before invoking `exportProcessedAudio`.
- Call `onExportEnd?.()` after success or failure.
- Keep dialog state recoverable through `exportStore`.

- [ ] **Step 6: Verify export**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Browser checks:

- WAV export still downloads.
- MP3 export downloads a playable MP3.
- MP3 encoder appears in a separate lazy chunk in build output.
- Export failure path keeps current editor project.

- [ ] **Step 7: Commit export enhancement**

```bash
git add package.json package-lock.json src/audio/exportAudio.ts src/audio/mp3Encoder.ts src/types/lamejs.d.ts src/components/dialogs/ExportDialog.tsx src/store/exportStore.ts
git commit -m "feat: add mp3 export workflow"
```

---

### Task 4: Track C Effect Upgrade

**Parallel:** Can start after Task 1.

**Files:**
- Modify: `src/audio/types.ts`
- Modify: `src/audio/presets.ts`
- Modify: `src/components/preset-panel/PresetPanel.tsx`
- Create: `src/components/effect-chain/EffectChainPanel.tsx`
- Do not modify: `src/app/AppShell.tsx` during parallel execution

- [ ] **Step 1: Extend preset metadata**

Update `src/audio/types.ts`:

```ts
export interface PresetChainStep {
  label: string;
  summary: string;
}

export interface PresetMeta {
  id: PresetId;
  label: string;
  description: string;
  chain: PresetChainStep[];
}
```

Extend `PresetId`:

```ts
| "alien"
| "tape"
| "cave"
| "eightBit"
```

- [ ] **Step 2: Add V1.5 presets**

Modify `src/audio/presets.ts`:

- Replace `PRESET_LIST` entries so every preset has `description` and `chain`.
- Include `NONE_PRESET` separately and keep `PRESET_LIST` as user-facing effect presets.
- Every current P0 preset and every V1.5 preset must satisfy the new `PresetMeta` type in the same commit.
- Implement `buildPresetNodes` for:
  - `alien`: pitch shift + chorus or frequency shifter style treatment.
  - `tape`: filter + mild distortion + subtle wow/flutter using available Tone nodes.
  - `cave`: reverb/delay based space.
  - `eightBit`: bitcrusher + filter.

- [ ] **Step 3: Add chain lookup helper**

In `src/audio/presets.ts`, export:

```ts
export function getPresetMeta(id: PresetId): PresetMeta {
  return PRESET_LIST.find((preset) => preset.id === id) ?? NONE_PRESET;
}
```

Also export `NONE_PRESET`:

```ts
export const NONE_PRESET: PresetMeta = {
  id: "none",
  label: "无预设",
  description: "直通原始声音",
  chain: [{ label: "直通", summary: "不添加额外效果" }],
};
```

- [ ] **Step 4: Update `PresetPanel`**

Modify `src/components/preset-panel/PresetPanel.tsx`:

- Render `description` from metadata instead of local `PRESET_HELP`.
- Include V1.5 presets in the list.
- Keep selecting a preset switching A/B to B.

- [ ] **Step 5: Add `EffectChainPanel`**

Create `src/components/effect-chain/EffectChainPanel.tsx`:

```ts
export function EffectChainPanel() {
  // Read current preset from editorStore.
  // Show each chain step from getPresetMeta(currentPreset).chain.
  // Provide reset button: set preset to "none", engine.applyPreset("none").
}
```

- [ ] **Step 6: Write effect chain layout integration note**

Add this note to the task final report for Task 7:

- Desktop left panel: show `PresetPanel`, then `EffectChainPanel`.
- Mobile tabs: add third tab `效果`.

Do not edit `src/app/AppShell.tsx` here when running in parallel.

- [ ] **Step 7: Verify effects**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Browser checks:

- P0 and V1.5 presets render.
- New presets play without console errors.
- A/B still works.
- Effect chain panel checks are deferred to Task 7 because `EffectChainPanel` is not mounted into `AppShell.tsx` during parallel execution.
- In this task, verify `PresetPanel` still renders existing presets and the new preset metadata compiles.

- [ ] **Step 8: Commit effects**

```bash
git add src/audio/types.ts src/audio/presets.ts src/components/preset-panel/PresetPanel.tsx src/components/effect-chain/EffectChainPanel.tsx
git commit -m "feat: add v1.5 presets and effect chain view"
```

---

### Task 5: Track D Analysis Panel

**Parallel:** Can start after Task 1.

**Files:**
- Create: `src/audio/analysis/types.ts`
- Create: `src/audio/analysis/summary.ts`
- Create: `src/audio/analysis/spectrum.ts`
- Create: `src/components/analysis/AnalysisPanel.tsx`
- Modify: `src/store/projectStore.ts`
- Modify: `src/audio/loadAudio.ts`
- Do not modify: `src/app/AppShell.tsx` during parallel execution

- [ ] **Step 1: Add analysis type re-export**

Create `src/audio/analysis/types.ts`:

```ts
export interface SpectrumPoint {
  frequency: number;
  magnitude: number;
}
```

Use the shared `AnalysisSummary` from `src/audio/types.ts`.

- [ ] **Step 2: Add summary calculator**

Create `src/audio/analysis/summary.ts`:

```ts
import type { AnalysisSummary } from "../types";

export function analyzeBuffer(buffer: AudioBuffer): AnalysisSummary {
  let peak = 0;
  let sumSquares = 0;
  let count = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
      sumSquares += data[i] * data[i];
      count++;
    }
  }
  return {
    duration: buffer.duration,
    sampleRate: buffer.sampleRate,
    numberOfChannels: buffer.numberOfChannels,
    peak,
    rms: count ? Math.sqrt(sumSquares / count) : 0,
  };
}
```

- [ ] **Step 3: Store analysis summary on load**

Modify `src/audio/loadAudio.ts`:

- Import `analyzeBuffer`.
- Call `setAnalysisSummary(analyzeBuffer(buffer))` during unified entry.

- [ ] **Step 4: Add lazy spectrum calculator**

Create `src/audio/analysis/spectrum.ts`:

- Export `calculateSpectrum(buffer: AudioBuffer): SpectrumPoint[]`.
- Use a deterministic no-dependency implementation:
  - Use channel 0.
  - Read at most the first 4096 samples.
  - Compute 64 DFT bins.
  - Normalize magnitudes to 0-1.
  - Return `{ frequency, magnitude }[]`.
- Do not introduce a full FFT dependency in phase 2.
- For empty buffers, return an empty array and let the UI show a recoverable message.

- [ ] **Step 5: Add `AnalysisPanel`**

Create `src/components/analysis/AnalysisPanel.tsx`:

- Read `analysisSummary` and `buffer` from `projectStore`.
- Show duration, sample rate, channels, peak, RMS.
- Add “生成频谱” button.
- On click, dynamically import `../../audio/analysis/spectrum`.
- Render a simple bar chart with CSS divs.
- Show recoverable error on failure.

- [ ] **Step 6: Write analysis layout integration note**

Add this note to the task final report for Task 7:

- Desktop right panel: show `Inspector`, then `AnalysisPanel`.
- Mobile tabs: add `分析` tab.

Do not edit `src/app/AppShell.tsx` here when running in parallel.

- [ ] **Step 7: Verify analysis**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Browser checks:

- Track-level browser checks are deferred to Task 7 because `AnalysisPanel` is not mounted into `AppShell.tsx` during parallel execution.
- In this task, verify static checks and ensure `analyzeBuffer` is called from `enterEditorWithBuffer`.

- [ ] **Step 8: Commit analysis**

```bash
git add src/audio/analysis src/components/analysis/AnalysisPanel.tsx src/store/projectStore.ts src/audio/loadAudio.ts
git commit -m "feat: add local audio analysis panel"
```

---

### Task 6: Track E Performance Lazy Loading

**Serial after feature tracks:** Start only after Tasks 2-5 are merged into the integration branch.

**Files:**
- Create: `src/audio/lazyWaveform.ts`
- Modify: `src/components/waveform/WaveformEditor.tsx`
- Create: `src/audio/lazyTone.ts`
- Modify: `src/audio/renderOffline.ts`
- Modify: `src/audio/toneEngine.ts`
- Modify: `src/audio/presets.ts`
- Modify: `src/audio/loadAudio.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/components/transport/TransportBar.tsx`

- [ ] **Step 1: Record baseline build output**

Run:

```bash
npm run build
```

Record current main JS chunk size in this plan or commit message. Current MVP baseline was about `570 kB` minified main JS.

- [ ] **Step 2: Lazy-load wavesurfer**

Create `src/audio/lazyWaveform.ts`:

```ts
export async function loadWaveSurfer() {
  const mod = await import("wavesurfer.js");
  return mod.default;
}
```

Modify `src/components/waveform/WaveformEditor.tsx`:

- Remove static `import WaveSurfer from "wavesurfer.js"`.
- Use `loadWaveSurfer()` inside the effect.
- Guard against component unmount before import resolves.
- Keep TypeScript type with a type-only import:

```ts
import type WaveSurfer from "wavesurfer.js";
```

- [ ] **Step 3: Refactor preset node factory for lazy Tone**

Modify `src/audio/presets.ts`:

- Remove static runtime `import * as Tone from "tone"`.
- Use type-only imports for Tone node types.
- Change the factory signature to accept the Tone module:

```ts
import type * as ToneType from "tone";

export type ToneModule = typeof ToneType;

export function buildPresetNodes(Tone: ToneModule, id: PresetId): ToneType.ToneAudioNode[] {
  // existing switch, but construct nodes from the passed Tone module
}
```

Update all call sites after `loadTone()` is available.

- [ ] **Step 4: Introduce Tone lazy boundary**

Create `src/audio/lazyTone.ts`:

```ts
export async function loadTone() {
  return import("tone");
}
```

Modify `src/audio/renderOffline.ts`:

- Remove static `import * as Tone from "tone"`.
- Import `loadTone` and call it inside `renderProcessed`.
- Pass the loaded Tone module into `buildPresetNodes(Tone, preset)`.
- Keep the existing public `renderProcessed(source, preset, params)` API unchanged.

Modify `src/audio/toneEngine.ts`:

- Remove static runtime `import * as Tone from "tone"`.
- Lazily load Tone in `start()` and `loadBuffer()`.
- Store the loaded module in a private field.
- Make `loadBuffer(buffer)` async if necessary, and update callers to await it.
- Pass the loaded Tone module into `buildPresetNodes(Tone, id)`.

Modify `src/audio/loadAudio.ts`:

- Make `enterEditorWithBuffer` async if `engine.loadBuffer` becomes async.
- Await `engine.loadBuffer(buffer)` before calling `engine.applyPreset("none")` and `engine.setABState("B")`.
- Update upload/sample/recording call sites to await `enterEditorWithBuffer`.

Modify `src/app/App.tsx` and `src/components/transport/TransportBar.tsx`:

- Await async `engine.loadBuffer` / `engine.play` call sites if signatures change.
- Keep homepage rendering without importing Tone through `engine` startup paths.

- [ ] **Step 5: Verify heavy modules remain lazy**

After Tasks 3 and 5 are merged:

- Confirm `mp3Encoder.ts` imports the MP3 encoder dynamically.
- Confirm `AnalysisPanel` imports `spectrum.ts` only on user action.
- Inspect `npm run build` output and confirm Tone code is no longer bundled into the initial main chunk.

- [ ] **Step 6: Verify performance**

Run:

```bash
npm run build
npx tsc --noEmit
npm run lint
```

Expected:

- Main chunk is smaller than baseline and Tone is absent from the initial main chunk.
- Opening homepage still works.
- Opening sample loads waveform.
- Playback, export, analysis still work.

- [ ] **Step 7: Commit performance changes**

```bash
git add src/audio/lazyWaveform.ts src/audio/lazyTone.ts src/components/waveform/WaveformEditor.tsx src/audio/renderOffline.ts src/audio/toneEngine.ts src/audio/presets.ts src/audio/loadAudio.ts src/app/App.tsx src/components/transport/TransportBar.tsx
git commit -m "perf: lazy load audio-heavy modules"
```

---

### Task 7: Final Integration QA

**Files:**
- Modify only files needed to resolve integration conflicts.
- Update: `README.md` if phase 2 user-facing capabilities are complete.

- [ ] **Step 1: Merge all parallel tracks**

Merge in this order:

1. Shared base.
2. Recording.
3. Export.
4. Effects.
5. Analysis.
6. Performance.

Resolve conflicts by preserving shared base contracts and latest user-facing behavior.

Mount the parallel UI panels into `src/app/AppShell.tsx` here:

- Desktop left panel: `PresetPanel`, then `EffectChainPanel`.
- Desktop right panel: `Inspector`, then `AnalysisPanel`.
- Mobile tabs: `预设`, `效果`, `参数`, `分析`.

Mount `RecordingPanel` into `src/app/App.tsx` here using the note from Task 2.

- [ ] **Step 2: Update README**

Modify `README.md`:

- Add recording support.
- Add MP3 export.
- Add V1.5 presets.
- Add analysis panel.
- Mention local-only recording/export.

- [ ] **Step 3: Run full static verification**

Run:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Expected:

- All pass.
- Build chunk output reviewed and recorded.

- [ ] **Step 4: Browser QA desktop**

Start or reuse the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

At `http://127.0.0.1:5173/`:

- Home shows upload, recording, sample.
- Open sample → editor.
- Select P0 and V1.5 presets.
- Open effect chain panel.
- Play/pause with button and Space.
- Open analysis panel and generate spectrum.
- Export WAV.
- Export MP3.
- New project returns to landing.

- [ ] **Step 5: Browser QA recording**

Manual checks:

- Permission allowed → record → stop → editor.
- Permission denied → readable error → landing recovery.
- Cancel recording → landing.

- [ ] **Step 6: Browser QA mobile**

Use a mobile viewport:

- Home CTAs visible.
- Recording flow reachable.
- Editor bottom tabs include presets/effects/params/analysis.
- Export dialog usable.

- [ ] **Step 7: Inspect status before staging**

Run:

```bash
git status --short
```

Confirm only intended phase-2 integration files are modified. Do not stage unrelated local files.

- [ ] **Step 8: Commit integration**

Stage only files listed by `git status --short` that belong to the completed phase-2 integration. Use explicit file paths, not directory pathspecs. Example shape:

```bash
git add README.md src/app/App.tsx src/app/AppShell.tsx
git add src/audio/loadAudio.ts src/audio/toneEngine.ts
git add src/components/recording/RecordingPanel.tsx
git commit -m "chore: integrate phase 2 tracks"
```

The exact `git add` list must be derived from the status output in Step 7.

---

## Execution Recommendation

Use `superpowers:subagent-driven-development` after this plan is approved.

Suggested worker ownership:

- Worker 0: Task 1 shared base.
- Worker A: Task 2 recording.
- Worker B: Task 3 export.
- Worker C: Task 4 effects.
- Worker D: Task 5 analysis.
- Worker E: Task 6 performance.
- Main integrator: Task 7 QA and conflict resolution.

Do not start Tasks 2-6 until Task 1 is committed.
