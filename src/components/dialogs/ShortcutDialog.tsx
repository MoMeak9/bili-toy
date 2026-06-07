import * as Dialog from "@radix-ui/react-dialog";
import { Music2, X } from "lucide-react";

const SHORTCUTS = [
  { keys: "Space", description: "播放 / 暂停" },
  { keys: "← / →", description: "后退 / 前进 5 秒" },
  { keys: "Shift + ← / →", description: "后退 / 前进 1 秒" },
  { keys: "A", description: "A/B 对比切换" },
  { keys: "1 ~ 9", description: "切换预设" },
  { keys: "?", description: "显示 / 隐藏快捷键" },
];

interface ShortcutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutDialog({ open, onOpenChange }: ShortcutDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-[0_24px_70px_rgba(94,96,162,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-bold text-slate-950">键盘快捷键</Dialog.Title>
            <Dialog.Description className="sr-only">
              查看本地音频实验室支持的键盘操作。
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                aria-label="关闭"
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <X size={17} />
              </button>
            </Dialog.Close>
          </div>
          <ul className="grid gap-3">
            {SHORTCUTS.map((shortcut) => (
              <li
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm"
                key={shortcut.keys}
              >
                <kbd className="rounded-lg border border-indigo-100 bg-white px-2 py-1 font-mono text-xs font-semibold text-indigo-700">
                  {shortcut.keys}
                </kbd>
                <span className="text-slate-600">{shortcut.description}</span>
              </li>
            ))}
          </ul>
          <button
            className="lab-button h-10 min-h-0 justify-center"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            关闭
          </button>
          <Music2 className="absolute bottom-5 right-5 text-indigo-200" size={34} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
