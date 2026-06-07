import * as Slider from "@radix-ui/react-slider";
import { SlidersHorizontal } from "lucide-react";
import { engine } from "../../audio/toneEngine";
import type { EditParams } from "../../audio/types";
import { useEditorStore } from "../../store/editorStore";
import { formatNumber } from "../ui/format";

interface ParamRow {
  key: keyof EditParams;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  fractionDigits?: number;
}

const PARAM_ROWS: ParamRow[] = [
  { key: "volumeDb", label: "音量", min: -24, max: 6, step: 1, unit: "dB" },
  { key: "rate", label: "变速", min: 0.5, max: 2, step: 0.05, unit: "x", fractionDigits: 2 },
  { key: "pitch", label: "变调", min: -12, max: 12, step: 1, unit: "半音" },
  { key: "fadeIn", label: "淡入", min: 0, max: 5, step: 0.1, unit: "s", fractionDigits: 1 },
  { key: "fadeOut", label: "淡出", min: 0, max: 5, step: 0.1, unit: "s", fractionDigits: 1 },
];

export function Inspector() {
  const params = useEditorStore((state) => state.params);
  const setParams = useEditorStore((state) => state.setParams);

  const updateParam = (key: keyof EditParams, value: number) => {
    const nextParams = { ...params, [key]: value };
    setParams({ [key]: value });
    engine.setParams(nextParams);
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <SlidersHorizontal size={16} />
        参数
      </div>
      {PARAM_ROWS.map((row) => {
        const value = params[row.key];
        return (
          <div className="flex flex-col gap-2" key={row.key}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-600">{row.label}</span>
              <span className="tabular-nums text-slate-500">
                {formatNumber(value, row.fractionDigits ?? 1)}
                {row.unit}
              </span>
            </div>
            <Slider.Root
              className="relative flex h-5 w-full touch-none select-none items-center"
              max={row.max}
              min={row.min}
              onValueChange={([nextValue]) => updateParam(row.key, nextValue)}
              step={row.step}
              value={[value]}
            >
              <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-slate-200">
                <Slider.Range className="absolute h-full rounded-full bg-indigo-500" />
              </Slider.Track>
              <Slider.Thumb
                aria-label={row.label}
                className="block h-4 w-4 rounded-full border border-indigo-500 bg-white shadow-sm outline-none ring-indigo-200 transition focus:ring-4"
              />
            </Slider.Root>
          </div>
        );
      })}
    </section>
  );
}
