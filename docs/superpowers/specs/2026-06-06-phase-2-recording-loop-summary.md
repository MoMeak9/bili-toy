# 二阶段子 Spec 摘要：录音闭环

- 日期：2026-06-06
- 父 spec：[本地音频实验室二阶段设计文档](./2026-06-06-local-audio-lab-phase-2-design.md)
- 并行 Track：A

## 目标

将首页“开始录音”从禁用占位升级为真实录音流程：同页请求麦克风权限，录制音频，停止后生成 `AudioBuffer`，复用统一载入入口进入编辑器。

## 范围

包含：

- `RecordingPanel`。
- 麦克风权限请求。
- `MediaRecorder` 录制。
- 录音计时、停止、取消。
- Blob 到 ArrayBuffer，再到 AudioBuffer。
- source = `"recording"` 的项目载入。
- 权限拒绝、设备不可用、解码失败的恢复提示。

不包含：

- 多轨录音。
- 录音过程实时波形。
- 输入设备选择器。
- 降噪、自动增益、AI 处理。

## 状态

录音内部状态建议：

```ts
type RecordingStatus =
  | "idle"
  | "requesting"
  | "recording"
  | "processing"
  | "unsupported"
  | "error";
```

`AppMode` 使用：

- 点击首页录音 CTA 后进入 `recording`。
- 停止并处理成功后进入 `editor`。
- 取消后回 `landing`。
- 不支持或拒绝权限时显示错误并允许返回 `landing`。

## 关键接口

录音完成后必须调用共享载入入口：

```ts
enterEditorWithBuffer({
  buffer,
  fileName: "录音 YYYY-MM-DD HH-mm.wav",
  source: "recording",
});
```

## UI 验收

- 首页“开始录音”可点击。
- 录音面板显示权限说明。
- 录音中显示计时、停止、取消。
- 停止后进入编辑器并显示波形。
- 移动端可完成录音主流程。

## 技术验收

- `npx tsc --noEmit` 通过。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器验证权限允许与拒绝两个路径。
