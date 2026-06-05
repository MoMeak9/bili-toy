# 本地音频实验室 MVP 设计文档

- 日期：2026-06-05
- 范围：聚焦版 MVP（第一个里程碑）
- 来源需求：[docs/PRD.md](../../PRD.md)、线框图 docs/show_design.png

## 1. 目标与范围

实现一个**单页、零后端、本地处理**的 Web 音频工具。用户打开网页即可上传音频或打开示例，查看波形、播放、套用变声预设、调整基础参数，并导出为 WAV 文件。全程不登录、不上传、不依赖后端接口、不使用 AI。

### 1.1 MVP 范围（本里程碑实现）

- LandingState 首页：产品名 + 一句话价值 + 三个 CTA（上传 / 录音 / 示例）+ 隐私说明
- 上传音频 → 同页进入编辑器
- 打开内置示例音频 → 同页进入编辑器
- 波形展示（wavesurfer.js）+ A/B 切换（A=原始，B=处理后）
- 播放控制：播放 / 暂停 / 进度 / 时间
- P0 变声预设：机器人、魔鬼低音、松鼠音、电话音、广播主持
- 基础参数 Inspector：音量、变速、变调、淡入、淡出
- 导出：WAV 格式，整段，弹窗内完成并下载
- 快捷键：Space 播放/暂停、? 打开快捷键弹窗
- 响应式：桌面三栏 / 移动端底部抽屉
- 统一错误态与 Toast 提示

### 1.2 明确延后（二期，不在本里程碑）

- 麦克风录音（首页「开始录音」CTA 占位且禁用）
- MP3 / OGG 导出（ffmpeg.wasm / lamejs）
- PWA 离线（vite-plugin-pwa）
- 效果链可视化排序、V1.5 预设（外星人/复古磁带/山洞回声/8-bit）
- 频谱图、专业分析

### 1.3 非目标

- 任何后端、账号、云存储、AI 服务
- 多页面路由（仅保留 `/`，可选 hash 仅用于刷新恢复 UI 状态）
- 任何 `.env` 必填配置

## 2. 关键决策

| 决策项 | 选择 | 理由 |
|---|---|---|
| 首个里程碑范围 | 聚焦版 MVP | 最快得到可用应用，spec/plan 紧凑 |
| 状态管理 | Zustand | 轻量、样板少，与 Tone.js 这类组件树之外的命令式对象配合好 |
| 示例音频 | 构建期脚本用 Web Audio 合成 ~8s 音调序列，打包为小 WAV | 零版权风险、完全自包含、确定性 |
| 测试策略 | 不写单测，依赖 TypeScript 类型检查 + 手动浏览器验证 | 用户决定；逻辑仍按可测试方式组织 |
| 音频引擎与 React 边界 | 引擎单例（纯 TS）+ 纯数据 Store | 音频内部不触发 React 重渲染，边界最清晰，契合 PRD audio/ 目录 |

## 3. 整体架构

三层架构，职责单一、相互隔离。

```
UI 层 (React 组件)
  AppShell / EmptyLanding / WaveformEditor /
  PresetPanel / Inspector / TransportBar / ExportDialog
        │ 读状态 / 调 action
状态层 (Zustand,纯可序列化数据)
  appStore(mode/error) / projectStore(音频元数据) /
  editorStore(预设、参数、A/B、播放位置、isPlaying)
        │ 命令式调用 ↓ / 事件回调 ↑
音频引擎层 (纯 TS 单例,持有 Tone.js 图)
  toneEngine / player / effectChain /
  presets / renderOffline / exportAudio
```

### 3.1 数据流

1. UI 调用 store 的 action（如 `editorStore.applyPreset(id)`）
2. action 调用引擎方法（`engine.applyPreset(id)`）
3. 引擎操作 Tone.js 节点
4. 引擎通过回调把 playhead 位置、播放结束、时长等事件写回 store
5. React 订阅 store 变化重新渲染

**音频节点本身永远不进 store**，store 只保存可序列化的数据快照。

### 3.2 状态机 AppMode

```ts
type AppMode = "landing" | "loading" | "editor" | "recording" | "exporting" | "error";
```

`recording` 在 MVP 保留枚举但不实现。状态切换（MVP 范围）：

```
landing ──上传/示例──▶ loading ──解析完成──▶ editor
editor  ──导出──▶ exporting ──完成──▶ editor
editor  ──新建项目──▶ landing
任意态  ──出错──▶ error ──恢复──▶ landing / editor
```

## 4. 音频引擎层

### 4.1 对外接口

```ts
// audio/toneEngine.ts — 单例,持有 AudioContext 与音频图
interface ToneEngine {
  start(): Promise<void>;                 // 首次用户交互触发 Tone.start()
  loadBuffer(buf: AudioBuffer): void;     // 上传/示例解析后载入
  play(): void;
  pause(): void;
  seek(seconds: number): void;
  setABState(state: "A" | "B"): void;     // A=原始,B=处理后
  applyPreset(id: PresetId): void;        // 套用变声预设
  setParams(p: EditParams): void;         // 音量/变速/变调/淡入淡出
  onTick(cb: (pos: number) => void): void;// 播放位置回调 → 写回 store
  onEnded(cb: () => void): void;
}
```

### 4.2 音频图结构

```
B 态（处理后）：Player → [变速/变调] → [预设效果节点] → [音量] → Destination
A 态（原始）：  旁路效果链,Player → Destination
```

### 4.3 预设定义（P0,纯数据驱动）

每个预设是一组 Tone.js 节点参数：

| 预设 | 实现思路 |
|---|---|
| 机器人 | PitchShift + 轻微失真/调制 |
| 魔鬼低音 | PitchShift 降调 + 低通 |
| 松鼠音 | PitchShift 升调 |
| 电话音 | 带通滤波（模拟话筒频响） |
| 广播主持 | 压缩 + EQ 提亮 |

### 4.4 导出（MVP 仅 WAV）

```
audio/renderOffline.ts → 用 Tone.Offline 离线渲染处理后音频得到 AudioBuffer
audio/exportAudio.ts   → AudioBuffer 编码为 WAV(自写轻量编码器,不引 ffmpeg),触发浏览器下载
```

### 4.5 示例音频

构建期脚本用 Web Audio 合成一段约 8 秒的音调序列，输出 `src/assets/sample-audio/sample.wav`（<500KB），随主包打包。点击「打开示例」时加载，不自动播放，并高亮预设区域、显示提示「试试点击『机器人』或『魔鬼低音』听听效果」。

## 5. 状态层（Zustand）

| Store | 字段 |
|---|---|
| appStore | `mode: AppMode`、`error: string \| null` |
| projectStore | 文件名、时长、采样率、原始 AudioBuffer 引用、来源（upload/sample） |
| editorStore | `currentPreset`、`abState`、`isPlaying`、`playhead`、`params`（音量/变速/变调/淡入/淡出） |

## 6. UI 组件树

```
AppShell（按 appMode 渲染对应态）
├── TopBar           产品名 + 导出按钮 + 快捷键入口
├── MainCanvas
│   ├── EmptyLanding     产品名 + 一句话 + 三 CTA + 隐私说明（录音 CTA 占位禁用）
│   ├── LoadingPanel     解析/生成波形中
│   └── WaveformEditor   wavesurfer 波形 + A/B 切换
├── LeftPanel          PresetPanel（P0 五个预设）+ 专业效果库入口（占位）
├── RightInspector     参数 Inspector（音量/变速/变调/淡入/淡出）
├── TransportBar       播放/暂停 + 进度 + 时间
├── ExportDialog       Radix Dialog,格式=WAV,范围=整段,导出+下载
├── ShortcutDialog     Radix Dialog,快捷键说明
└── ToastLayer         首次进编辑器提示 + 错误提示
```

### 6.1 响应式

- 桌面：三栏（左预设/效果 · 中波形+播放 · 右 Inspector）
- 移动端：波形在上，底部抽屉（Radix）默认开在「预设」标签，左/右栏折叠进抽屉
- 由 `hooks/useResponsive.ts` 切换

### 6.2 快捷键

`hooks/useKeyboardShortcuts.ts`：`Space` 播放/暂停、`?` 打开快捷键弹窗。

### 6.3 默认配置（对照 PRD 8.1）

默认显示预设面板；默认 A/B = B（处理后）；默认效果链空；默认导出 WAV / 整段；音量 0dB；变速 1.0x；变调 0 semitone；淡入淡出 0s。

## 7. 错误处理

统一 `error` 态。文件解析失败、不支持格式、导出失败均写入 `appStore.error` 并显示可恢复错误提示（回 landing 或 editor），不崩溃白屏。外部输入（用户文件）视为不可信，解析前校验类型与可解码性。

## 8. 懒加载策略

| 模块 | 加载时机 |
|---|---|
| 首页 UI | 首屏 |
| Tone.js | 首次音频交互前后 |
| wavesurfer.js | 进入编辑器时 |
| WAV 编码器 | 用户导出时 |
| 示例音频 | 点击打开示例时 |

ffmpeg.wasm / PWA / 频谱图不在 MVP。

## 9. 技术栈与目录

技术栈：React + Vite + TypeScript + Tone.js + wavesurfer.js + Tailwind CSS + Radix UI + Lucide Icons + Zustand。无 `.env`，`npm install && npm run dev` 即可运行。

目录结构遵循 PRD 9.2（`src/app`、`src/audio`、`src/components`、`src/hooks`、`src/store`、`src/styles`、`src/assets`）。

## 10. 验收对照

| 场景 | 验收标准 | MVP |
|---|---|---|
| 打开首页 | 不跳转即可见上传/录音/示例三 CTA | ✅ |
| 上传音频 | 同一页面切换到编辑器 | ✅ |
| 打开示例 | 同一页面加载示例并进入编辑器 | ✅ |
| 套用预设 | 实时听到变化 | ✅ |
| 导出 | 弹窗内完成，不跳转页面 | ✅（WAV） |
| 查看快捷键 | Dialog 内完成 | ✅ |
| 新建项目 | 返回 landing，不刷新页面 | ✅ |
| 移动端切换功能 | 通过底部抽屉/Tab 完成，不跳页 | ✅ |
| 无账号 | 核心功能可用 | ✅ |
| 无配置 | `npm install && npm run dev` 后可运行 | ✅ |
| 无后端 | Network 不出现音频上传请求 | ✅ |
| 桌面端 | Space 直接播放/暂停 | ✅ |
| 开始录音 | 进入录音态 | ⏸ 占位禁用，二期 |
| MP3/OGG 导出 | — | ⏸ 二期 |
| PWA 离线 | — | ⏸ 二期 |

## 11. README 要求（对照 PRD 15）

README 首段体现开箱即用，含快速开始（`npm install` / `npm run dev`），并说明：不上传音频、不依赖后端、不使用 AI、Tone.js 用于播放与离线渲染、wavesurfer.js 用于波形、本地编码器用于导出、移动端支持核心编辑、桌面端支持快捷键。
