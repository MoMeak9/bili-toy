# 二阶段子 Spec 摘要：效果升级

- 日期：2026-06-06
- 父 spec：[本地音频实验室二阶段设计文档](./2026-06-06-local-audio-lab-phase-2-design.md)
- 并行 Track：C

## 目标

新增 V1.5 趣味预设，并提供效果链可视化入口，让用户理解当前预设由哪些处理节点组成。

## 范围

包含：

- 新增预设：外星人、复古磁带、山洞回声、8-bit 游戏音。
- 扩展 `PresetId`、`PRESET_LIST`、`buildPresetNodes`。
- 为预设补充可展示的效果链元数据。
- 新增效果链可视化入口。
- 支持一键重置为“无预设”。

不包含：

- 单个效果开关。
- 拖拽排序。
- 任意效果参数矩阵。
- 用户自定义预设保存。

## 数据策略

预设继续数据驱动。建议新增元数据：

```ts
interface PresetMeta {
  id: PresetId;
  label: string;
  description?: string;
  chain: Array<{
    label: string;
    summary: string;
  }>;
}
```

Tone 节点构建仍由 `buildPresetNodes` 负责，UI 不直接依赖 Tone 节点实例。

## UI 验收

- P0 与 V1.5 预设都可见。
- 选择新预设后自动切到 B 态。
- 效果链入口可展示当前预设链路。
- 桌面和移动端都能访问效果链入口。

## 技术验收

- 新预设可播放、A/B 对比、导出。
- 预设 UI 不硬编码节点实现。
- `npx tsc --noEmit`、`npm run lint`、`npm run build` 通过。
