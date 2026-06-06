import * as Dialog from "@radix-ui/react-dialog";
import { Download, Loader2, X } from "lucide-react";
import { useState } from "react";
import { renderProcessed } from "../../audio/renderOffline";
import { downloadWav, encodeWav } from "../../audio/wavEncoder";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError: (message: string) => void;
}

export function ExportDialog({ open, onOpenChange, onError }: ExportDialogProps) {
  const [busy, setBusy] = useState(false);
  const buffer = useProjectStore((state) => state.buffer);
  const fileName = useProjectStore((state) => state.fileName);
  const currentPreset = useEditorStore((state) => state.currentPreset);
  const params = useEditorStore((state) => state.params);

  const exportWav = async () => {
    if (!buffer || busy) return;
    setBusy(true);
    try {
      const rendered = await renderProcessed(buffer, currentPreset, params);
      const wav = encodeWav(rendered);
      const baseName = (fileName ?? "audio").replace(/\.[^.]+$/, "");
      downloadWav(wav, `${baseName}-processed.wav`);
      onOpenChange(false);
    } catch (error) {
      onError(error instanceof Error ? error.message : "导出失败，请稍后再试。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/45" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-lg bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-950">
                导出音频
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                WAV · 整段 · 本地离线渲染
              </Dialog.Description>
            </div>
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

          <dl className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">格式</dt>
              <dd className="font-medium text-slate-800">WAV</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">范围</dt>
              <dd className="font-medium text-slate-800">整段</dd>
            </div>
          </dl>

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy || !buffer}
            onClick={exportWav}
            type="button"
          >
            {busy ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
            {busy ? "正在导出..." : "导出并下载"}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
