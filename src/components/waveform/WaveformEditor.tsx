import { useEffect, useMemo, useRef } from "react";
import type WaveSurfer from "wavesurfer.js";
import { loadWaveSurfer } from "../../audio/lazyWaveform";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";
import { formatTime } from "../ui/format";

function makePeaks(buffer: AudioBuffer): Array<Float32Array | number[]> {
  return Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index),
  );
}

export function WaveformEditor() {
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
        cursorColor: "#2563eb",
        height: 128,
        interact: true,
        normalize: true,
        progressColor: "#2563eb",
        waveColor: "#cbd5e1",
      });

      waveSurfer.load("", peaks, duration);
      waveSurfer.on("interaction", (relativeX) => {
        const nextTime =
          typeof relativeX === "number" ? relativeX * duration : waveSurfer?.getCurrentTime() ?? 0;
        engine.seek(nextTime);
      });

      waveSurferRef.current = waveSurfer;
    });

    return () => {
      active = false;
      waveSurfer?.destroy();
      waveSurferRef.current = null;
    };
  }, [buffer, duration, peaks]);

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
    <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900">
            {fileName ?? "未命名音频"}
          </h2>
          <p className="mt-1 text-xs tabular-nums text-slate-500">
            {formatTime(duration)} · {sampleRate ? `${sampleRate.toLocaleString()}Hz` : "本地音频"}
          </p>
        </div>
        <div className="inline-flex h-9 w-fit overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            className={`rounded-md px-3 text-sm font-medium transition ${
              abState === "A" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
            onClick={() => switchAB("A")}
            type="button"
          >
            A 原始
          </button>
          <button
            className={`rounded-md px-3 text-sm font-medium transition ${
              abState === "B" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"
            }`}
            onClick={() => switchAB("B")}
            type="button"
          >
            B 处理后
          </button>
        </div>
      </div>
      <div className="min-h-32 rounded-lg bg-slate-50 p-3">
        <div ref={containerRef} />
      </div>
    </section>
  );
}
