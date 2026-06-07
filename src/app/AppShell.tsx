import * as Tabs from "@radix-ui/react-tabs";
import { Download, FileAudio, Menu, Mic, Settings, SlidersHorizontal } from "lucide-react";
import { AnalysisPanel } from "../components/analysis/AnalysisPanel";
import { EffectChainPanel } from "../components/effect-chain/EffectChainPanel";
import { Inspector } from "../components/inspector/Inspector";
import { PresetPanel } from "../components/preset-panel/PresetPanel";
import { TransportBar } from "../components/transport/TransportBar";
import { WaveformEditor } from "../components/waveform/WaveformEditor";
import { useResponsive } from "../hooks/useResponsive";

interface AppShellProps {
  onExport: () => void;
  onRecording: () => void;
  onUpload: () => void;
}

export function AppShell({ onExport, onRecording, onUpload }: AppShellProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <main className="flex min-h-0 flex-1 justify-center overflow-auto px-4 py-5">
        <div className="flex min-h-[calc(100vh-2.5rem)] w-full max-w-[390px] flex-col overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-[0_24px_70px_rgba(94,96,162,0.22)]">
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            <button
              aria-label="菜单"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-indigo-50"
              type="button"
            >
              <Menu size={19} />
            </button>
            <div className="text-sm font-bold text-slate-950">本地音频实验室</div>
            <button
              aria-label="设置"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-indigo-50"
              type="button"
            >
              <Settings size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto px-4 pb-3">
            <WaveformEditor compact />
            <div className="mt-3">
              <TransportBar compact />
            </div>

            <Tabs.Root
              className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_rgba(94,96,162,0.10)]"
              defaultValue="presets"
            >
              <Tabs.List className="grid h-12 grid-cols-3 bg-slate-50/90 p-1">
                <Tabs.Trigger
                  className="rounded-xl text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                  value="presets"
                >
                  预设
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="rounded-xl text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                  value="effects"
                >
                  效果链
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="rounded-xl text-sm font-semibold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm"
                  value="params"
                >
                  参数
                </Tabs.Trigger>
              </Tabs.List>
              <div className="max-h-[42vh] overflow-auto p-4">
                <Tabs.Content value="presets">
                  <PresetPanel compact />
                </Tabs.Content>
                <Tabs.Content value="effects">
                  <EffectChainPanel />
                </Tabs.Content>
                <Tabs.Content value="params">
                  <Inspector />
                </Tabs.Content>
              </div>
            </Tabs.Root>
          </div>

          <nav className="grid h-16 shrink-0 grid-cols-4 border-t border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-500">
            <MobileNavItem icon={<FileAudio size={18} />} label="文件" onClick={onUpload} />
            <MobileNavItem icon={<Mic size={18} />} label="录音" onClick={onRecording} />
            <MobileNavItem icon={<SlidersHorizontal size={18} />} label="效果" active />
            <MobileNavItem icon={<Download size={18} />} label="导出" onClick={onExport} />
          </nav>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-3 mb-3 grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_260px] gap-4 rounded-b-2xl border border-t-0 border-indigo-100/80 bg-white/[0.72] p-4 shadow-[0_24px_70px_rgba(94,96,162,0.16)] backdrop-blur sm:mx-5 sm:mb-5">
      <aside className="lab-panel min-h-0 overflow-auto p-4">
        <div className="flex flex-col gap-5">
          <PresetPanel />
          <EffectChainPanel />
        </div>
      </aside>

      <section className="flex min-w-0 flex-col gap-4 overflow-auto">
        <WaveformEditor />
        <TransportBar />
        <div className="lab-card min-h-[9rem] border-dashed p-4">
          <div className="mb-3 flex items-center gap-2">
            {["选择", "裁剪", "插入淡出", "分割", "复制", "删除"].map((tool, index) => (
              <button
                className={`h-9 rounded-xl border px-3 text-sm font-semibold transition ${
                  index === 0
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }`}
                key={tool}
                type="button"
              >
                {tool}
              </button>
            ))}
          </div>
          <div className="flex min-h-[5.5rem] items-center justify-center rounded-xl border border-dashed border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 text-center">
            <div>
              <div className="text-sm font-semibold text-slate-600">暂无选区</div>
              <div className="mt-1 text-xs text-slate-400">
                在波形上拖拽或选择一段音频以进行编辑
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="lab-panel min-h-0 overflow-auto p-4">
        <div className="flex flex-col gap-5">
          <Inspector />
          <AnalysisPanel />
          <section className="flex flex-col gap-3">
            <div className="text-sm font-bold text-slate-800">导出设置</div>
            <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
              {[
                ["格式", "WAV"],
                ["采样率", "44100 Hz"],
                ["声道", "立体声"],
                ["位深", "16-bit"],
              ].map(([label, value]) => (
                <div className="flex items-center justify-between gap-3" key={label}>
                  <span className="text-slate-500">{label}</span>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <button className="lab-button-primary h-11 min-h-0" onClick={onExport} type="button">
              导出音频
            </button>
          </section>
        </div>
      </aside>
    </main>
  );
}

function MobileNavItem({
  active = false,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className={`flex flex-col items-center justify-center gap-1 rounded-xl transition ${
        active ? "text-indigo-700" : "text-slate-500 hover:bg-indigo-50"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
