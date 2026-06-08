import { useEffect } from "react";

interface Handlers {
  onTogglePlay: () => void;
  onShowShortcuts: () => void;
  onSeek: (delta: number) => void;       // 相对快进/快退（秒）
  onToggleAB: () => void;                // A/B 对比切换
  onSelectPreset: (index: number) => void; // 0 基预设索引
}

// Space 播放/暂停；? 打开快捷键弹窗；←/→ 快退/快进 5 秒，
// Shift+←/→ 微调 1 秒；A 切换 A/B；1~9 切换预设。输入框聚焦时不拦截。
export function useKeyboardShortcuts({
  onTogglePlay,
  onShowShortcuts,
  onSeek,
  onToggleAB,
  onSelectPreset,
}: Handlers): void {
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
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onSeek(e.shiftKey ? -1 : -5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onSeek(e.shiftKey ? 1 : 5);
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        onToggleAB();
      } else if (e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        onSelectPreset(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTogglePlay, onShowShortcuts, onSeek, onToggleAB, onSelectPreset]);
}
