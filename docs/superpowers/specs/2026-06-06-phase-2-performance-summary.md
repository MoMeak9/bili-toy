# 二阶段子 Spec 摘要：性能整理

- 日期：2026-06-06
- 父 spec：[本地音频实验室二阶段设计文档](./2026-06-06-local-audio-lab-phase-2-design.md)
- 并行 Track：E

## 目标

降低首屏主包体积，让首页 CTA 更快可见可点击，并减少当前 build 中主 chunk 过大的警告。

## 范围

包含：

- `wavesurfer.js` 进入编辑器后动态导入。
- Tone 相关模块封装为懒加载边界。
- MP3 编码库仅导出 MP3 时加载。
- 频谱图模块仅打开分析面板时加载。
- 保持示例音频点击后加载。
- build 体积对比记录。

不包含：

- 服务端渲染。
- CDN 拆分。
- 复杂性能监控系统。
- 改变产品功能范围。

## 模块边界

建议整理为：

```text
src/audio/lazyTone.ts
src/audio/lazyWaveform.ts
src/audio/mp3Encoder.ts
src/audio/analysis/
```

具体路径可在实现计划中根据现有文件职责调整。

## 验收

- 首页可在不加载 wavesurfer/MP3/频谱图的情况下渲染。
- 打开示例后波形仍正常。
- 播放、预设、导出仍正常。
- `npm run build` 主 chunk 体积较 MVP 有明显下降，或大 chunk 警告减少。
- `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。
