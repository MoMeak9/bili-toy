import * as Tabs from "@radix-ui/react-tabs";
import { Inspector } from "../components/inspector/Inspector";
import { PresetPanel } from "../components/preset-panel/PresetPanel";
import { TransportBar } from "../components/transport/TransportBar";
import { WaveformEditor } from "../components/waveform/WaveformEditor";
import { useResponsive } from "../hooks/useResponsive";

export function AppShell() {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3">
          <WaveformEditor />
          <TransportBar />
        </main>
        <Tabs.Root className="shrink-0 border-t border-slate-200 bg-white" defaultValue="presets">
          <Tabs.List className="grid h-11 grid-cols-2">
            <Tabs.Trigger
              className="border-b-2 border-transparent text-sm font-medium text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              value="presets"
            >
              预设
            </Tabs.Trigger>
            <Tabs.Trigger
              className="border-b-2 border-transparent text-sm font-medium text-slate-500 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700"
              value="params"
            >
              参数
            </Tabs.Trigger>
          </Tabs.List>
          <div className="max-h-[42vh] overflow-auto p-4">
            <Tabs.Content value="presets">
              <PresetPanel />
            </Tabs.Content>
            <Tabs.Content value="params">
              <Inspector />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    );
  }

  return (
    <main className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_260px] gap-4 bg-slate-50 p-4">
      <aside className="overflow-auto rounded-lg border border-slate-200 bg-white p-4">
        <PresetPanel />
      </aside>
      <section className="flex min-w-0 flex-col gap-4 overflow-auto">
        <WaveformEditor />
        <TransportBar />
      </section>
      <aside className="overflow-auto rounded-lg border border-slate-200 bg-white p-4">
        <Inspector />
      </aside>
    </main>
  );
}
