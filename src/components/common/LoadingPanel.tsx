import { Loader2 } from "lucide-react";

interface LoadingPanelProps {
  text?: string;
}

export function LoadingPanel({ text = "正在解析音频..." }: LoadingPanelProps) {
  return (
    <div className="flex min-h-full items-center justify-center px-5">
      <div className="lab-panel flex min-w-64 flex-col items-center justify-center gap-3 p-8 text-slate-500">
        <Loader2 className="animate-spin text-indigo-500" size={34} />
        <p className="text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}
