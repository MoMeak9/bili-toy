import { Mic, Square, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { decodeArrayBuffer } from "../../audio/decode";
import {
  createRecorder,
  isRecordingSupported,
  requestMicrophoneStream,
  stopStream,
} from "../../audio/recording";
import { useRecordingStore } from "../../store/recordingStore";
import { formatTime } from "../ui/format";

interface RecordingPanelProps {
  onCancel: () => void;
  onRecorded: (buffer: AudioBuffer, fileName: string) => void;
  onError: (message: string) => void;
}

function createRecordingFileName(date = new Date()): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  const second = pad(date.getSeconds());

  return `recording-${year}${month}${day}-${hour}${minute}${second}.webm`;
}

function reportRecordingError(message: string, onError: (message: string) => void): void {
  useRecordingStore.getState().setError(message);
  onError(message);
}

export function RecordingPanel({ onCancel, onError, onRecorded }: RecordingPanelProps) {
  const status = useRecordingStore((state) => state.status);
  const elapsed = useRecordingStore((state) => state.elapsed);
  const error = useRecordingStore((state) => state.error);
  const beginRequest = useRecordingStore((state) => state.beginRequest);
  const beginRecording = useRecordingStore((state) => state.beginRecording);
  const beginProcessing = useRecordingStore((state) => state.beginProcessing);
  const setUnsupported = useRecordingStore((state) => state.setUnsupported);
  const tickElapsed = useRecordingStore((state) => state.tickElapsed);
  const reset = useRecordingStore((state) => state.reset);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finishedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (isRecordingSupported()) {
      reset();
      return;
    }

    setUnsupported("当前浏览器不支持录音。");
  }, [reset, setUnsupported]);

  useEffect(() => {
    if (status !== "recording") return;

    const timer = window.setInterval(tickElapsed, 1000);
    return () => window.clearInterval(timer);
  }, [status, tickElapsed]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      finishedRef.current = true;
      recorderRef.current = null;
      if (streamRef.current) {
        stopStream(streamRef.current);
        streamRef.current = null;
      }
    };
  }, []);

  const clearRecorder = () => {
    recorderRef.current = null;
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
  };

  const handleStart = async () => {
    if (!isRecordingSupported()) {
      const message = "当前浏览器不支持录音。";
      setUnsupported(message);
      onError(message);
      return;
    }

    beginRequest();
    chunksRef.current = [];
    finishedRef.current = false;

    try {
      const stream = await requestMicrophoneStream();
      if (!mountedRef.current) {
        stopStream(stream);
        return;
      }

      streamRef.current = stream;
      const recorder = createRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        finishedRef.current = true;
        reportRecordingError("录音过程中发生错误。", onError);
        if (recorder.state !== "inactive") recorder.stop();
        clearRecorder();
      };

      recorder.onstop = () => {
        void handleRecorderStop(recorder.mimeType || "audio/webm");
      };

      recorder.start();
      beginRecording();
    } catch (caught) {
      clearRecorder();
      reportRecordingError(caught instanceof Error ? caught.message : "无法开始录音。", onError);
    }
  };

  const handleRecorderStop = async (mimeType: string) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    beginProcessing();

    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      if (blob.size === 0) {
        throw new Error("没有录到音频，请再试一次。");
      }

      const buffer = await decodeArrayBuffer(await blob.arrayBuffer());
      onRecorded(buffer, createRecordingFileName());
    } catch (caught) {
      reportRecordingError(caught instanceof Error ? caught.message : "录音解析失败。", onError);
    } finally {
      clearRecorder();
    }
  };

  const handleStop = () => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
  };

  const handleCancel = () => {
    const recorder = recorderRef.current;
    finishedRef.current = true;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    clearRecorder();
    reset();
    onCancel();
  };

  const isRecording = status === "recording";
  const isBusy = status === "requesting" || status === "processing";
  const startDisabled = isBusy || isRecording || status === "unsupported";

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <div className="flex max-w-xl flex-col items-center gap-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mic size={26} />
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">浏览器录音</h1>
        <p className="max-w-md text-sm leading-6 text-slate-500">
          {isRecording ? "正在录制你的声音。" : "使用麦克风录制一段声音，完成后会自动载入编辑器。"}
        </p>
      </div>

      <div className="min-w-[8rem] rounded-lg border border-slate-200 bg-white px-5 py-4">
        <p className="text-xs font-semibold uppercase text-slate-400">Elapsed</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-950">
          {formatTime(elapsed)}
        </p>
      </div>

      {error ? <p className="max-w-md text-sm leading-6 text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {isRecording ? (
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-700"
            onClick={handleStop}
            type="button"
          >
            <Square size={18} />
            停止录音
          </button>
        ) : (
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={startDisabled}
            onClick={() => void handleStart()}
            type="button"
          >
            <Mic size={18} />
            {status === "requesting" ? "请求麦克风..." : "开始录音"}
          </button>
        )}
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
          onClick={handleCancel}
          type="button"
        >
          <X size={18} />
          取消
        </button>
      </div>

      {status === "processing" ? <p className="text-sm text-slate-500">正在载入录音...</p> : null}
    </main>
  );
}
