import { Download, FilePlus2, Keyboard } from "lucide-react";

interface TopBarProps {
  onExport: () => void;
  onNewProject: () => void;
  onShortcuts: () => void;
}

export function TopBar({ onExport, onNewProject, onShortcuts }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-950 sm:text-base">
          本地音频实验室
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          aria-label="新建项目"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm text-slate-600 hover:bg-slate-100 sm:px-3"
          onClick={onNewProject}
          type="button"
        >
          <FilePlus2 size={17} />
          <span className="hidden sm:inline">新建</span>
        </button>
        <button
          aria-label="快捷键"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2.5 text-sm text-slate-600 hover:bg-slate-100 sm:px-3"
          onClick={onShortcuts}
          type="button"
        >
          <Keyboard size={17} />
          <span className="hidden sm:inline">快捷键</span>
        </button>
        <button
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
          onClick={onExport}
          type="button"
        >
          <Download size={17} />
          <span>导出</span>
        </button>
      </div>
    </header>
  );
}
