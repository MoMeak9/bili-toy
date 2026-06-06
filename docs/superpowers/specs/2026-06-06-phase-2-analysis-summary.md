# 二阶段子 Spec 摘要：专业分析

- 日期：2026-06-06
- 父 spec：[本地音频实验室二阶段设计文档](./2026-06-06-local-audio-lab-phase-2-design.md)
- 并行 Track：D

## 目标

提供只读音频分析能力：基础素材信息和频谱图，帮助用户理解素材，不改变音频处理链。

## 范围

包含：

- 时长、采样率、声道数。
- 峰值电平。
- 近似 RMS / 响度指标。
- 分析面板。
- 频谱图懒加载。
- 大文件分析失败或超时的恢复提示。

不包含：

- 频谱编辑。
- 降噪或修复。
- LUFS 级专业响度标准完整实现。
- 导出分析报告。

## 分析策略

基础分析从 `AudioBuffer` 计算：

```ts
interface AnalysisSummary {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peak: number;
  rms: number;
}
```

频谱图仅在用户打开分析面板时加载和计算。

## UI 验收

- 编辑器可进入分析面板。
- 分析面板显示基础信息。
- 频谱图为只读展示。
- 移动端可通过底部 Tab 或更多入口访问。

## 技术验收

- 分析不改变播放、预设、导出结果。
- 频谱图模块不进入首屏主包。
- `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。
