import { Wand2 } from "lucide-react";
import type { PresetId } from "../../audio/types";
import { PRESET_LIST } from "../../audio/presets";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";

export function PresetPanel() {
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
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Wand2 size={16} />
        声音预设
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
        {PRESET_LIST.map((preset) => (
          <button
            className={`rounded-lg border px-3 py-3 text-left transition ${
              currentPreset === preset.id
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"
            }`}
            key={preset.id}
            onClick={() => choosePreset(preset.id)}
            type="button"
          >
            <span className="block text-sm font-semibold">{preset.label}</span>
            <span className="mt-1 block text-xs text-slate-500">{preset.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
