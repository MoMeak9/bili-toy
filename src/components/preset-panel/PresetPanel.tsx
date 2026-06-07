import { Wand2 } from "lucide-react";
import type { PresetId } from "../../audio/types";
import { PRESET_LIST } from "../../audio/presets";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";
import { getPresetVisual } from "../ui/presetVisuals";

interface PresetPanelProps {
  compact?: boolean;
}

export function PresetPanel({ compact = false }: PresetPanelProps) {
  const currentPreset = useEditorStore((state) => state.currentPreset);
  const setAB = useEditorStore((state) => state.setAB);
  const setPreset = useEditorStore((state) => state.setPreset);

  const choosePreset = (id: PresetId) => {
    setPreset(id);
    setAB("B");
    engine.applyPreset(id);
    engine.setABState("B");
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Wand2 size={16} className="text-indigo-500" />
          声音预设
        </div>
        {compact ? <span className="text-xs text-slate-400">查看全部</span> : null}
      </div>
      <div className={compact ? "grid grid-cols-5 gap-2" : "grid grid-cols-2 gap-2"}>
        {PRESET_LIST.map((preset) => {
          const visual = getPresetVisual(preset.id);
          const active = currentPreset === preset.id;
          return (
            <button
              className={`rounded-2xl border p-2 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                active
                  ? `${visual.active} shadow-lg`
                  : "border-slate-200 bg-white/[0.88] text-slate-700 hover:border-indigo-100 hover:bg-indigo-50/50"
              }`}
              key={preset.id}
              onClick={() => choosePreset(preset.id)}
              type="button"
            >
              <span
                className={`mx-auto flex items-center justify-center overflow-hidden rounded-2xl text-xl ring-1 ${visual.tint} ${
                  compact ? "h-10 w-10" : "h-12 w-12"
                }`}
              >
                {visual.image ? (
                  <img alt="" className="h-full w-full object-contain" src={visual.image} />
                ) : (
                  visual.icon
                )}
              </span>
              <span className="mt-2 block truncate text-xs font-bold">{preset.label}</span>
              {!compact ? (
                <span className="mt-1 block truncate text-[11px] text-slate-400">
                  {preset.description}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
