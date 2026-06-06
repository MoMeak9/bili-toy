import { Loader2 } from "lucide-react";

interface LoadingPanelProps {
  text?: string;
}

export function LoadingPanel({ text = "正在解析音频..." }: LoadingPanelProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="animate-spin text-blue-600" size={34} />
      <p className="text-sm">{text}</p>
    </div>
  );
}
