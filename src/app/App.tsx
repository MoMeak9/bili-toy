import { useEffect, useRef, useState } from "react";
import { decodeArrayBuffer, decodeFile } from "../audio/decode";
import { enterEditorWithBuffer } from "../audio/loadAudio";
import { engine } from "../audio/toneEngine";
import { LoadingPanel } from "../components/common/LoadingPanel";
import { ToastLayer } from "../components/common/ToastLayer";
import { ExportDialog } from "../components/dialogs/ExportDialog";
import { RecordingPanel } from "../components/recording/RecordingPanel";
import { ShortcutDialog } from "../components/dialogs/ShortcutDialog";
import { EmptyLanding } from "../components/landing/EmptyLanding";
import { TopBar } from "../components/top-bar/TopBar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useAppStore } from "../store/appStore";
import { useEditorStore } from "../store/editorStore";
import { useProjectStore } from "../store/projectStore";
import { useRecordingStore } from "../store/recordingStore";
import { AppShell } from "./AppShell";

type ToastState = {
  open: boolean;
  message: string;
  variant: "info" | "error";
};

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mode = useAppStore((state) => state.mode);
  const error = useAppStore((state) => state.error);
  const setError = useAppStore((state) => state.setError);
  const setMode = useAppStore((state) => state.setMode);
  const clearProject = useProjectStore((state) => state.clear);
  const isPlaying = useEditorStore((state) => state.isPlaying);
  const resetEditor = useEditorStore((state) => state.reset);
  const setPlayhead = useEditorStore((state) => state.setPlayhead);
  const setPlaying = useEditorStore((state) => state.setPlaying);
  const [exportOpen, setExportOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    variant: "info",
  });

  useEffect(() => {
    engine.onTick((position) => setPlayhead(position));
    engine.onEnded(() => setPlaying(false));
  }, [setPlayhead, setPlaying]);

  const fail = (message: string) => {
    setError(message);
    setToast({ open: true, message, variant: "error" });
  };

  const handleUploadClick = () => {
    void engine.start();
    fileInputRef.current?.click();
  };

  const handleRecordingClick = () => {
    setError(null);
    setMode("recording");
  };

  const handleRecorded = async (buffer: AudioBuffer, fileName: string) => {
    await enterEditorWithBuffer({ buffer, fileName, source: "recording" });
    setToast({ open: true, message: "录音已载入。", variant: "info" });
  };

  const handleRecordingError = (message: string) => {
    useRecordingStore.getState().setError(message);
    setToast({ open: true, message, variant: "error" });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMode("loading");
    setError(null);
    try {
      const buffer = await decodeFile(file);
      await enterEditorWithBuffer({ buffer, fileName: file.name, source: "upload" });
      setToast({ open: true, message: "音频已载入。", variant: "info" });
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "音频解析失败。");
    }
  };

  const handleSample = async () => {
    void engine.start();
    setMode("loading");
    setError(null);
    try {
      const url = (await import("../assets/sample-audio/sample.wav?url")).default;
      const response = await fetch(url);
      if (!response.ok) throw new Error("示例音频加载失败。");
      const buffer = await decodeArrayBuffer(await response.arrayBuffer());
      await enterEditorWithBuffer({ buffer, fileName: "示例音频.wav", source: "sample" });
      setToast({
        open: true,
        message: "示例已打开。试试点击机器人或魔鬼低音。",
        variant: "info",
      });
    } catch (caught) {
      fail(caught instanceof Error ? caught.message : "示例音频加载失败。");
    }
  };

  const handleNewProject = () => {
    engine.pause();
    engine.dispose();
    clearProject();
    resetEditor();
    setError(null);
    setExportOpen(false);
    setMode("landing");
  };

  const togglePlayback = async () => {
    if (mode !== "editor") return;
    if (isPlaying) {
      engine.pause();
      setPlaying(false);
      return;
    }
    await engine.play();
    setPlaying(true);
  };

  useKeyboardShortcuts({
    onShowShortcuts: () => setShortcutOpen(true),
    onTogglePlay: togglePlayback,
  });

  const showError = (message: string) => {
    setToast({ open: true, message, variant: "error" });
  };

  const handleExportStart = () => setMode("exporting");
  const handleExportEnd = () => {
    const appStore = useAppStore.getState();
    if (appStore.mode === "exporting") {
      appStore.setMode("editor");
    }
  };

  const renderBody = () => {
    if (mode === "loading") return <LoadingPanel />;
    if (mode === "recording") {
      return (
        <RecordingPanel
          onCancel={handleNewProject}
          onError={handleRecordingError}
          onRecorded={handleRecorded}
        />
      );
    }
    if (mode === "editor" || mode === "exporting") return <AppShell />;
    if (mode === "error") {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 px-5 text-center">
          <h1 className="text-2xl font-semibold text-slate-950">处理失败</h1>
          <p className="max-w-md text-sm leading-6 text-slate-500">
            {error ?? "发生了未知错误。"}
          </p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={handleNewProject}
            type="button"
          >
            返回首页
          </button>
        </div>
      );
    }
    return (
      <EmptyLanding
        onRecording={handleRecordingClick}
        onSample={handleSample}
        onUpload={handleUploadClick}
      />
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-slate-950">
      {mode === "editor" || mode === "exporting" ? (
        <TopBar
          onExport={() => setExportOpen(true)}
          onNewProject={handleNewProject}
          onShortcuts={() => setShortcutOpen(true)}
        />
      ) : null}
      <input
        accept="audio/*,.wav,.mp3,.ogg,.m4a,.aac,.flac"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />
      <div className="min-h-0 flex-1">{renderBody()}</div>
      <ExportDialog
        onError={showError}
        onExportEnd={handleExportEnd}
        onExportStart={handleExportStart}
        onOpenChange={setExportOpen}
        open={exportOpen}
      />
      <ShortcutDialog onOpenChange={setShortcutOpen} open={shortcutOpen} />
      <ToastLayer
        message={toast.message}
        onOpenChange={(open) => setToast((current) => ({ ...current, open }))}
        open={toast.open}
        variant={toast.variant}
      />
    </div>
  );
}
