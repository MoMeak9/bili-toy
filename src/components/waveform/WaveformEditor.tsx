import { useEffect, useMemo, useRef } from "react";
import { Maximize2 } from "lucide-react";
import type WaveSurfer from "wavesurfer.js";
import { loadWaveSurfer } from "../../audio/lazyWaveform";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";
import { formatTime } from "../ui/format";

interface WaveformEditorProps {
  compact?: boolean;
}

function makePeaks(buffer: AudioBuffer): Array<Float32Array | number[]> {
  return Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index),
  );
}

export function WaveformEditor({ compact = false }: WaveformEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const buffer = useProjectStore((state) => state.buffer);
  const duration = useProjectStore((state) => state.duration);
  const fileName = useProjectStore((state) => state.fileName);
  const sampleRate = useProjectStore((state) => state.sampleRate);
  const abState = useEditorStore((state) => state.abState);
  const playhead = useEditorStore((state) => state.playhead);
  const setAB = useEditorStore((state) => state.setAB);

  const peaks = useMemo(() => (buffer ? makePeaks(buffer) : []), [buffer]);

  useEffect(() => {
    if (!containerRef.current || !buffer) return;

    let active = true;
    let waveSurfer: WaveSurfer | null = null;
    const container = containerRef.current;

    void loadWaveSurfer().then((WaveSurferCtor) => {
      if (!active || !container) return;
      waveSurfer = WaveSurferCtor.create({
        barGap: 2,
        barRadius: 2,
        barWidth: 3,
        container,
        cursorColor: "#6d5dfc",
        height: compact ? 118 : 168,
        interact: true,
        normalize: true,
        progressColor: "#6d5dfc",
        waveColor: "#c7c2ff",
      });

      waveSurfer.load("", peaks, duration);
      waveSurfer.on("interaction", (time) => {
        const nextTime = typeof time === "number" ? time : waveSurfer?.getCurrentTime() ?? 0;
        engine.seek(nextTime);
      });

      waveSurferRef.current = waveSurfer;
    });

    return () => {
      active = false;
      waveSurfer?.destroy();
      waveSurferRef.current = null;
    };
  }, [buffer, compact, duration, peaks]);

  useEffect(() => {
    const waveSurfer = waveSurferRef.current;
    if (!waveSurfer || duration <= 0) return;
    waveSurfer.setTime(playhead);
  }, [duration, playhead]);

  const switchAB = (nextAB: "A" | "B") => {
    setAB(nextAB);
    engine.setABState(nextAB);
  };

  return (
    <section className="lab-card flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-900">
            {fileName ?? "未命名音频"}
          </h2>
          <p className="mt-1 text-xs tabular-nums text-slate-500">
            {formatTime(duration)} · {sampleRate ? `${sampleRate.toLocaleString()}Hz` : "本地音频"}
          </p>
        </div>
        {!compact ? (
          <div className="inline-flex h-9 w-fit overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/60 p-0.5">
            <ABButton active={abState === "A"} label="A 原始" onClick={() => switchAB("A")} />
            <ABButton active={abState === "B"} label="B 处理后" onClick={() => switchAB("B")} />
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-indigo-50/40 p-3">
        <div className="mb-1 flex items-center justify-between text-xs tabular-nums text-slate-400">
          <span>{formatTime(playhead)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div ref={containerRef} />
        {compact ? (
          <button
            aria-label="全屏"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-slate-500 shadow-sm"
            type="button"
          >
            <Maximize2 size={15} />
          </button>
        ) : null}
      </div>

      {!compact ? (
        <div className="flex h-12 items-center gap-1 overflow-hidden rounded-xl bg-indigo-50 px-2">
          {Array.from({ length: 92 }, (_, index) => (
            <span
              className="w-1 rounded-full bg-indigo-200"
              key={index}
              style={{ height: `${8 + Math.abs(Math.sin(index * 0.42)) * 28}px` }}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ABButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-lg px-3 text-sm font-semibold transition ${
        active ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
