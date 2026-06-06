import * as Dialog from "@radix-ui/react-dialog";
import { Download, Loader2, X } from "lucide-react";
import { useEffect } from "react";
import { exportProcessedAudio } from "../../audio/exportAudio";
import type { ExportFormat, ExportStatus } from "../../audio/types";
import { useEditorStore } from "../../store/editorStore";
import { useExportStore } from "../../store/exportStore";
import { useProjectStore } from "../../store/projectStore";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onError: (message: string) => void;
  onExportStart?: () => void;
  onExportEnd?: () => void;
}

export function ExportDialog({
  open,
  onOpenChange,
  onError,
  onExportStart,
  onExportEnd,
}: ExportDialogProps) {
  const buffer = useProjectStore((state) => state.buffer);
  const fileName = useProjectStore((state) => state.fileName);
  const currentPreset = useEditorStore((state) => state.currentPreset);
  const params = useEditorStore((state) => state.params);
  const format = useExportStore((state) => state.format);
  const status = useExportStore((state) => state.status);
  const progress = useExportStore((state) => state.progress);
  const error = useExportStore((state) => state.error);
  const setFormat = useExportStore((state) => state.setFormat);
  const setStatus = useExportStore((state) => state.setStatus);
  const setProgress = useExportStore((state) => state.setProgress);
  const setError = useExportStore((state) => state.setError);
  const resetExport = useExportStore((state) => state.reset);

  const exporting = status === "rendering" || status === "encoding" || status === "downloading";

  useEffect(() => {
    if (open) resetExport();
  }, [open, resetExport]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && exporting) return;
    onOpenChange(nextOpen);
  };

  const exportAudio = async () => {
    if (!buffer || exporting) return;
    setProgress(0);
    setError(null);
    setStatus("rendering");
    onExportStart?.();
    try {
      const audio = await exportProcessedAudio({
        source: buffer,
        preset: currentPreset,
        params,
        format,
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          if (nextProgress >= 0.65 && nextProgress < 1) setStatus("encoding");
        },
      });
      setStatus("downloading");
      const baseName = (fileName ?? "audio").replace(/\.[^.]+$/, "");
      downloadAudio(audio, `${baseName}-processed.${format}`, format);
      setStatus("done");
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "导出失败，请稍后再试。";
      setError(message);
      onError(message);
    } finally {
      onExportEnd?.();
    }
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={exporting}
                type="button"
              >
                <X size={17} />
              </button>
            </Dialog.Close>
          </div>

          <dl className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">格式</dt>
              <dd
                aria-label="导出格式"
                className="grid grid-cols-2 rounded-md bg-white p-0.5 shadow-sm ring-1 ring-slate-200"
                role="radiogroup"
              >
                {(["wav", "mp3"] as const).map((option) => (
                  <button
                    aria-checked={format === option}
                    className={`h-8 rounded px-3 text-xs font-semibold uppercase transition ${
                      format === option
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                    disabled={exporting}
                    key={option}
                    onClick={() => setFormat(option)}
                    role="radio"
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">范围</dt>
              <dd className="font-medium text-slate-800">整段</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">状态</dt>
              <dd className="font-medium text-slate-800">{statusLabel(status)}</dd>
            </div>
          </dl>

          {exporting ? (
            <div className="flex flex-col gap-2">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <div className="text-right text-xs tabular-nums text-slate-500">
                {Math.round(progress * 100)}%
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={exporting || !buffer}
            onClick={exportAudio}
            type="button"
          >
            {exporting ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
            {exporting ? "正在导出..." : "导出并下载"}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function downloadAudio(arrayBuffer: ArrayBuffer, fileName: string, format: ExportFormat): void {
  const blob = new Blob([arrayBuffer], {
    type: format === "wav" ? "audio/wav" : "audio/mpeg",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function statusLabel(status: ExportStatus): string {
  switch (status) {
    case "rendering":
      return "离线渲染";
    case "encoding":
      return "编码";
    case "downloading":
      return "下载";
    case "done":
      return "完成";
    case "error":
      return "失败";
    case "idle":
    default:
      return "待导出";
  }
}
