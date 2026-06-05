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
