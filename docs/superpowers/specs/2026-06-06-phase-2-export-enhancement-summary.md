# 二阶段子 Spec 摘要：导出增强

- 日期：2026-06-06
- 父 spec：[本地音频实验室二阶段设计文档](./2026-06-06-local-audio-lab-phase-2-design.md)
- 并行 Track：B

## 目标

将 MVP 的单一 WAV 导出升级为全局可恢复导出流程，并新增 MP3 导出。导出仍在本地完成，不上传音频。

## 范围

包含：

- `exporting` 全局状态接线。
- `exportStore` 或等价导出状态。
- WAV / MP3 格式选择。
- 导出阶段展示：准备、离线渲染、编码、下载。
- MP3 编码库动态导入。
- 导出失败的错误提示、重试和返回编辑器。

不包含：

- OGG 导出。
- 分段导出。
- 批量导出。
- 云端转码。

## 格式策略

- WAV：沿用当前 `encodeWav`。
- MP3：通过 `mp3Encoder` 适配器封装第三方编码库。
- MP3 编码库选择必须在实现计划中作为 spike 处理。
- 二阶段完成定义要求 MP3 可用，不允许只留实验入口。

## 状态

```ts
type ExportFormat = "wav" | "mp3";

type ExportStatus =
  | "idle"
  | "rendering"
  | "encoding"
  | "downloading"
  | "done"
  | "error";
```

## UI 验收

- 导出弹窗显示 WAV / MP3 选择。
- 导出时不可重复触发导出。
- 失败时可以重试或返回编辑器。
- 导出完成后关闭导出状态并保留编辑器项目。

## 技术验收

- MP3 编码库不进入首屏主包。
- WAV 导出回归通过。
- `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。
