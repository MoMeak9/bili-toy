import {
  Download,
  FilePlus2,
  HelpCircle,
  Keyboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "lucide-react";

interface TopBarProps {
  onExport: () => void;
  onNewProject: () => void;
  onShortcuts: () => void;
}

export function TopBar({ onExport, onNewProject, onShortcuts }: TopBarProps) {
  return (
    <header className="mx-3 mt-3 hidden h-14 shrink-0 items-center justify-between gap-3 rounded-t-2xl border border-indigo-100/80 border-b-slate-100 bg-white/[0.88] px-4 shadow-[0_10px_34px_rgba(94,96,162,0.12)] backdrop-blur md:flex sm:mx-5 sm:mt-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
          <Sparkles size={19} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-950 sm:text-lg">
            百变小音
          </div>
          <div className="hidden text-xs text-slate-400 sm:block">
            基于 Tone.js · 本地处理 · 安全隐私
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          aria-label="新建项目"
          className="lab-button h-9 min-h-0 px-2.5 sm:px-3"
          onClick={onNewProject}
          type="button"
        >
          <FilePlus2 size={17} />
          <span className="hidden sm:inline">新建</span>
        </button>
        <button
          aria-label="快捷键"
          className="lab-button h-9 min-h-0 px-2.5 sm:px-3"
          onClick={onShortcuts}
          type="button"
        >
          <Keyboard size={17} />
          <span className="hidden sm:inline">快捷键 (?)</span>
        </button>
        <button
          aria-label="帮助"
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 sm:inline-flex"
          type="button"
        >
          <HelpCircle size={17} />
        </button>
        <div className="hidden h-8 items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 text-slate-500 sm:flex">
          <Sun size={16} />
          <span className="h-4 w-px bg-slate-200" />
          <Moon size={15} className="text-slate-300" />
        </div>
        <button
          aria-label="设置"
          className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 sm:inline-flex"
          type="button"
        >
          <Settings size={17} />
        </button>
        <button className="lab-button-primary h-9 min-h-0 px-3" onClick={onExport} type="button">
          <Download size={17} />
          <span>导出</span>
        </button>
      </div>
    </header>
  );
}
