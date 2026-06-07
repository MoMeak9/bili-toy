import { RotateCcw, Route } from "lucide-react";
import { getPresetMeta } from "../../audio/presets";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";

export function EffectChainPanel() {
  const currentPreset = useEditorStore((state) => state.currentPreset);
  const setPreset = useEditorStore((state) => state.setPreset);
  const metadata = getPresetMeta(currentPreset);

  const resetPreset = () => {
    setPreset("none");
    engine.applyPreset("none");
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Route size={16} className="text-indigo-500" />
          专业效果链
        </div>
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          onClick={resetPreset}
          title="重置预设"
          type="button"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-indigo-100 bg-white/80 p-3">
        <div className="text-sm font-semibold text-slate-800">{metadata.label}</div>
        <div className="mt-1 text-xs text-slate-500">{metadata.description}</div>

        <ol className="mt-3 flex flex-col gap-2">
          {metadata.chain.map((step, index) => (
            <li className="flex gap-3" key={`${step.label}-${index}`}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-700">{step.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{step.summary}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
