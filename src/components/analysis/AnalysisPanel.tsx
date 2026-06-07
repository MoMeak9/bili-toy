import { BarChart3, Loader2 } from "lucide-react";
import { useState } from "react";
import type { SpectrumPoint } from "../../audio/analysis/types";
import { useProjectStore } from "../../store/projectStore";
import { formatNumber, formatTime } from "../ui/format";

const formatMagnitude = (value: number) => formatNumber(value, 3);
const formatFrequency = (frequency: number) =>
  frequency >= 1000 ? `${formatNumber(frequency / 1000, 1)}kHz` : `${Math.round(frequency)}Hz`;

export function AnalysisPanel() {
  const analysisSummary = useProjectStore((state) => state.analysisSummary);
  const buffer = useProjectStore((state) => state.buffer);
  const [spectrum, setSpectrum] = useState<SpectrumPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSpectrum = async () => {
    if (!buffer) {
      setError("没有可分析的音频。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { calculateSpectrum } = await import("../../audio/analysis/spectrum");
      setSpectrum(calculateSpectrum(buffer));
    } catch {
      setError("频谱生成失败，请重试。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <BarChart3 size={16} className="text-indigo-500" />
        分析
      </div>

      {analysisSummary ? (
        <dl className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">时长</dt>
            <dd className="tabular-nums font-medium text-slate-800">
              {formatTime(analysisSummary.duration)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">采样率</dt>
            <dd className="tabular-nums font-medium text-slate-800">
              {analysisSummary.sampleRate.toLocaleString()}Hz
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">声道</dt>
            <dd className="tabular-nums font-medium text-slate-800">
              {analysisSummary.numberOfChannels}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">Peak</dt>
            <dd className="tabular-nums font-medium text-slate-800">
              {formatMagnitude(analysisSummary.peak)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-500">RMS</dt>
            <dd className="tabular-nums font-medium text-slate-800">
              {formatMagnitude(analysisSummary.rms)}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          载入音频后显示分析数据。
        </p>
      )}

      <button
        className="lab-button-primary h-10 min-h-0 px-3 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!buffer || isGenerating}
        onClick={generateSpectrum}
        type="button"
      >
        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <BarChart3 size={16} />}
        生成频谱
      </button>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>
      ) : null}

      {spectrum.length > 0 ? (
        <div className="flex h-28 items-end gap-1 rounded-2xl bg-slate-950 p-2" aria-label="频谱图">
          {spectrum.map((point) => (
            <div
              className="min-w-0 flex-1 rounded-sm bg-indigo-300"
              key={point.frequency}
              style={{ height: `${Math.max(point.magnitude * 100, 2)}%` }}
              title={`${formatFrequency(point.frequency)} ${formatMagnitude(point.magnitude)}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
