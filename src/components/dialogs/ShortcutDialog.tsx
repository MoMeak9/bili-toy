import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: "Space", description: "播放 / 暂停" },
  { keys: "?", description: "打开快捷键" },
];

interface ShortcutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShortcutDialog({ open, onOpenChange }: ShortcutDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-lg bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-slate-950">快捷键</Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="关闭"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                type="button"
              >
                <X size={17} />
              </button>
            </Dialog.Close>
          </div>
          <ul className="grid gap-3">
            {SHORTCUTS.map((shortcut) => (
              <li
                className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                key={shortcut.keys}
              >
                <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                  {shortcut.keys}
                </kbd>
                <span className="text-slate-600">{shortcut.description}</span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
