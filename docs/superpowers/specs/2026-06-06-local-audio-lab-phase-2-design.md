# 本地音频实验室二阶段设计文档

- 日期：2026-06-06
- 范围：MVP 后二阶段
- 来源需求：[docs/PRD.md](../../PRD.md)、MVP 实现状态、用户二阶段规划
- 形态：一个二阶段总 spec + 五个子 spec 摘要，支持后续并行实现

## 1. 目标与范围

二阶段在已完成 MVP 的单页、本地处理音频工具之上，补齐 PRD 中仍未落地的核心能力：录音闭环、导出增强、效果升级、专业分析，以及首屏性能整理。

二阶段仍保持这些产品原则：

- 单页应用，不新增多页面路由。
- 不登录、不上传音频、不依赖后端、不使用 AI。
- 音频处理、录音、分析、导出均在浏览器本地完成。
- 首页继续开箱即用，移动端保留核心入口。

## 2. 当前基线

MVP 已完成：

- Landing 首页：上传、录音占位、打开示例、本地隐私说明。
- 上传/示例进入编辑器。
- 波形展示、播放控制、A/B 切换。
- P0 预设：机器人、魔鬼低音、松鼠音、电话音、广播主持。
- Inspector 参数：音量、变速、变调、淡入、淡出。
- WAV 整段导出。
- 快捷键弹窗、Toast、错误态、桌面三栏和移动端 Tab 布局。
- README 与零配置启动说明。

二阶段差距：

- “开始录音”仍是禁用占位。
- `recording` / `exporting` AppMode 还未形成真实全局流程。
- 导出仅支持 WAV，缺少 MP3 路线、进度、恢复体验。OGG 继续延后，不进入二阶段完成定义。
- V1.5 预设和效果链可视化入口未实现。
- 没有频谱图和基础分析面板。
- Tone.js / wavesurfer.js 仍进入较大的主包，build 有 chunk 体积提醒。

## 3. 二阶段总体方案

采用“共享基座 + 五条并行子任务”的设计。

```text
Phase 2 Shared Base
├── 状态契约扩展：recording / exporting / analysis / effect chain
├── 统一 AudioBuffer 载入入口
├── 懒加载边界和错误恢复约定
└── 验证基线：typecheck + lint + build + 浏览器手动验证

Parallel Tracks
├── A. 录音闭环
├── B. 导出增强
├── C. 效果升级
├── D. 专业分析
└── E. 性能整理
```

先实现共享基座，再让五条线并行。共享基座必须足够小，只定义接口、状态和边界，不提前做各子功能内部实现。

## 4. 共享基座设计

### 4.1 AppMode 使用

沿用当前类型：

```ts
type AppMode =
  | "landing"
  | "loading"
  | "editor"
  | "recording"
  | "exporting"
  | "error";
```

二阶段要求：

- `recording`：用户点击“开始录音”后进入，显示 `RecordingPanel`。
- `exporting`：用户确认导出后进入，保留导出弹窗或覆盖层，显示进度。
- `error`：错误可恢复，不丢失已加载项目，除非错误发生在首次载入前。

### 4.2 统一载入入口

当前上传和示例已有 `enterEditor` 路径。二阶段将其抽成更明确的应用级 helper，支持三种来源：

```ts
type AudioSource = "upload" | "sample" | "recording";
```

统一入口职责：

1. 接收 `AudioBuffer`、文件名、来源。
2. 重置编辑器状态。
3. 加载音频到 engine。
4. 写入 `projectStore`。
5. 切到 `editor`。
6. 显示来源对应 Toast。

录音、上传、示例都必须走这个入口，避免三套载入逻辑分叉。

### 4.3 Store 扩展

建议新增或扩展以下 store。具体文件可在实现计划中决定是否拆分。

```text
appStore
  mode/error

projectStore
  fileName/duration/sampleRate/source/buffer
  numberOfChannels
  analysisSummary

editorStore
  currentPreset/abState/isPlaying/playhead/params
  effectChainView state

recordingStore
  permission/status/elapsed/blob/error

exportStore
  format/progress/status/error
```

### 4.4 懒加载边界

二阶段默认懒加载：

- wavesurfer.js：进入编辑器时加载。
- Tone.js：首次需要播放、录音后载入、离线渲染时加载。
- MP3 编码库：用户选择 MP3 并点击导出时加载。
- 频谱图模块：用户打开分析面板时加载。
- PWA 相关注册：首屏后注册，不阻塞首页。

### 4.5 错误恢复

统一错误策略：

- 麦克风权限拒绝：回到 `landing`，Toast 提示。
- 录音设备不可用：停留或回到 `landing`，Toast 提示。
- 录音 Blob 解码失败：回到 `recording` 或 `landing`，不进入编辑器。
- 导出失败：回到 `editor`，保留当前项目和参数。
- 懒加载失败：显示可重试错误，不崩溃白屏。

## 5. 子 Spec A：录音闭环

### 5.1 目标

把首页“开始录音”从禁用占位变成真实流程：请求麦克风权限、录制音频、停止后生成 `AudioBuffer`，并进入编辑器。

### 5.2 UI

新增 `src/components/recording/RecordingPanel.tsx`。

状态：

- `idle`：展示开始录音按钮和权限说明。
- `requesting`：请求麦克风权限中。
- `recording`：显示计时、停止、取消。
- `processing`：录音 Blob 转 AudioBuffer 中。
- `unsupported` / `error`：显示恢复按钮。

首页 CTA：

- “开始录音”变为可点击。
- 点击后同页进入 `recording`，不弹新页面。

### 5.3 技术

- 使用 `navigator.mediaDevices.getUserMedia({ audio: true })` 请求麦克风。
- 使用 `MediaRecorder` 录制。
- 停止后组合 Blob，读取 ArrayBuffer。
- 复用 `decodeArrayBuffer` 得到 AudioBuffer。
- 通过统一载入入口进入编辑器，source = `"recording"`。

### 5.4 验收

- 支持浏览器中点击录音并进入录音面板。
- 用户拒绝权限时显示可理解错误。
- 停止录音后进入编辑器，波形、播放、预设、导出可用。
- 取消录音返回 landing，不刷新页面。

## 6. 子 Spec B：导出增强

### 6.1 目标

把导出从单一 WAV 弹窗升级为可恢复的全局导出流程，并增加 MP3 导出。

### 6.2 UI

更新 `ExportDialog`：

- 格式选择：WAV / MP3。
- 范围仍为整段。
- 显示导出状态：准备、离线渲染、编码、下载。
- 失败时显示错误和重试按钮。

### 6.3 技术

- WAV：沿用 `encodeWav`。
- MP3：通过 `mp3Encoder` 适配器封装编码库并动态导入。实现计划必须先做编码库选择 spike，选定库后再实现导出；二阶段完成定义要求 MP3 可用，不能降级为仅实验入口。
- 导出时设置 `AppMode = "exporting"`，完成或失败后回 `editor`。
- 导出进度写入 `exportStore`。

### 6.4 验收

- WAV 导出保持可用。
- MP3 编码库不进入首屏主包。
- 导出失败不丢失编辑器状态。
- 导出期间 UI 不可重复触发多个导出任务。

## 7. 子 Spec C：效果升级

### 7.1 目标

增加 V1.5 预设，并提供效果链可视化入口，让用户理解当前声音是如何被处理的。

### 7.2 新增预设

```text
外星人
复古磁带
山洞回声
8-bit 游戏音
```

预设仍通过 `PresetId`、`PRESET_LIST`、`buildPresetNodes` 数据驱动。

### 7.3 效果链入口

二阶段先做轻量版本：

- 显示当前预设对应的处理链。
- 支持一键重置为“无预设”。
- 支持一键重置为“无预设”。
- 不做单个效果开关、拖拽排序、任意参数矩阵。

### 7.4 验收

- 新预设可选择、可播放、可导出。
- A/B 对比仍正常。
- 效果链入口在桌面和移动端都可访问。
- 预设数据与 UI 不硬编码耦合。

## 8. 子 Spec D：专业分析

### 8.1 目标

提供只读的音频信息和频谱分析，帮助用户理解素材。

### 8.2 基础信息

在编辑器中展示：

- 时长。
- 采样率。
- 声道数。
- 峰值电平。
- 近似 RMS / 响度指标。

### 8.3 频谱图

- 用户打开“分析”面板时懒加载频谱图模块。
- 频谱图只读，不改变音频。
- 移动端通过底部 Tab 或“更多”入口访问。

### 8.4 验收

- 打开分析面板后能看到基础信息。
- 频谱图模块不进入首屏主包。
- 大音频文件分析失败时显示可恢复错误。

## 9. 子 Spec E：性能整理

### 9.1 目标

降低首屏包体积，让首页 CTA 更快可见可点，并消除或显著降低当前 build 的大 chunk 警告。

### 9.2 策略

- 将 `wavesurfer.js` 从静态 import 改为进入编辑器后动态 import。
- 将 Tone 相关重模块按音频交互路径动态加载，或封装在 lazy engine module 中。
- MP3 编码、频谱图只在对应功能打开时加载。
- 示例音频继续点击后加载，不阻塞首页。

### 9.3 验收

- `npm run build` 通过。
- 首屏主 chunk 明显下降。
- 首页无需加载音频编辑相关模块即可显示 CTA。
- 打开示例、播放、导出、分析仍能按需加载并工作。

## 10. 并行实施顺序

### 10.1 必须串行的前置任务

1. 新建二阶段分支。
2. 建立共享基座：
   - Store 类型扩展。
   - 统一载入入口。
   - `recording` / `exporting` UI 状态接线。
   - 动态导入约定。

### 10.2 可并行任务

共享基座完成后：

- Track A：录音闭环。
- Track B：导出增强。
- Track C：效果升级。
- Track D：专业分析。
- Track E：性能整理。

### 10.3 集成顺序建议

1. 共享基座。
2. 录音闭环和导出增强优先合入，因为它们补 PRD 核心验收。
3. 效果升级和专业分析第二批合入。
4. 性能整理贯穿进行，但最后统一验证 bundle 和手动流程。

## 11. 测试与验证策略

沿用 MVP 当前测试约定：

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- 浏览器手动验证关键流程

二阶段额外手动验证：

- 录音权限允许 / 拒绝。
- 录音停止后进入编辑器。
- WAV / MP3 导出成功与失败恢复。
- 新预设播放与导出。
- 分析面板懒加载。
- 移动端录音、预设、参数、分析入口可访问。
- build 后检查 chunk 体积变化。

## 12. 非目标

二阶段不做：

- 后端上传、账号、云项目。
- AI 音频处理。
- 多轨编辑。
- 任意效果拖拽排序。
- 完整 DAW 级参数自动化。
- 复杂项目保存与云同步。

## 13. 风险与应对

| 风险 | 应对 |
|---|---|
| MediaRecorder 格式在不同浏览器差异大 | 优先使用浏览器支持的 mimeType，停止后统一走 `decodeArrayBuffer`，失败给出可恢复提示 |
| MP3 编码库体积大 | 必须动态导入；实现计划先做库选择 spike，若首选库体积不可接受，必须换库或调整编码策略，不能取消 MP3 完成目标 |
| 多条并行线修改同一 store | 先落共享基座，后续子任务只追加各自字段 |
| Tone / wavesurfer 动态导入打破现有 API | 先封装模块边界，再替换调用点 |
| 分析大文件卡顿 | 二阶段只做基础分析，必要时限制采样窗口或异步处理 |

## 14. 完成定义

二阶段完成时，用户可以：

1. 不准备文件，打开示例体验效果。
2. 直接录音，录完进入编辑器处理。
3. 使用 P0 + V1.5 预设变声。
4. 查看基础分析和频谱。
5. 导出 WAV 或 MP3。
6. 在移动端完成核心录音、编辑、导出。
7. 首屏仍保持单页、开箱即用、无后端、无 AI。
