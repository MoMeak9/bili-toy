import { Headphones, Mic, Music2, PlayCircle, ShieldCheck, Sparkles, Upload } from "lucide-react";
import { PRESET_LIST } from "../../audio/presets";
import { getPresetVisual } from "../ui/presetVisuals";

interface EmptyLandingProps {
  onUpload: () => void;
  onSample: () => void;
  onRecording: () => void;
}

const FEATURED_PRESETS = PRESET_LIST.slice(0, 5);

export function EmptyLanding({ onUpload, onSample, onRecording }: EmptyLandingProps) {
  return (
    <main className="flex min-h-full items-center justify-center px-5 py-10">
      <section className="lab-panel w-full max-w-[760px] overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
            <Sparkles size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">百变小音</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            基于 Tone.js 的本地音频编辑器，变声与音效的秘密武器。
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <LandingAction
            description="支持 WAV、MP3、OGG"
            icon={<Upload size={23} />}
            onClick={onUpload}
            title="上传音频"
            tone="pink"
          />
          <LandingAction
            description="使用麦克风录制"
            icon={<Mic size={23} />}
            onClick={onRecording}
            title="开始录音"
            tone="indigo"
          />
          <LandingAction
            description="内置音频示例"
            icon={<PlayCircle size={23} />}
            onClick={onSample}
            title="打开示例"
            tone="amber"
          />
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Headphones size={17} className="text-indigo-500" />
              趣味预设一键体验
            </div>
            <span className="hidden text-xs text-slate-400 sm:inline">机器人 · 魔鬼低音 · 松鼠音</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {FEATURED_PRESETS.map((preset) => {
              const visual = getPresetVisual(preset.id);
              return (
                <div
                  className="rounded-xl border border-slate-200 bg-white/80 px-2 py-3 text-center shadow-sm"
                  key={preset.id}
                >
                  <div
                    className={`mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl text-xl ring-1 ${visual.tint}`}
                  >
                    {visual.image ? (
                      <img alt="" className="h-full w-full object-contain" src={visual.image} />
                    ) : (
                      visual.icon
                    )}
                  </div>
                  <div className="mt-2 truncate text-xs font-bold text-slate-700">{preset.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-center text-xs text-slate-500 sm:flex-row">
          <ShieldCheck size={16} className="text-indigo-500" />
          <span>所有处理在本地完成，文件不会上传，无 AI、无追踪、保护隐私。</span>
          <Music2 size={16} className="hidden text-violet-300 sm:block" />
        </div>
      </section>
    </main>
  );
}

function LandingAction({
  description,
  icon,
  onClick,
  title,
  tone,
}: {
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  tone: "pink" | "indigo" | "amber";
}) {
  const toneClass = {
    amber: "border-amber-100 bg-amber-50/60 text-amber-600 hover:border-amber-200",
    indigo: "border-indigo-100 bg-indigo-50/70 text-indigo-600 hover:border-indigo-200",
    pink: "border-pink-100 bg-pink-50/60 text-pink-600 hover:border-pink-200",
  }[tone];

  return (
    <button
      className={`flex min-h-[112px] flex-col items-center justify-center rounded-2xl border px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${toneClass}`}
      onClick={onClick}
      type="button"
    >
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-800">{title}</span>
      <span className="mt-1 text-[11px] text-slate-400">{description}</span>
    </button>
  );
}
