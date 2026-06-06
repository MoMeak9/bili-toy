import { Mic, PlayCircle, ShieldCheck, Upload } from "lucide-react";

interface EmptyLandingProps {
  onUpload: () => void;
  onSample: () => void;
}

export function EmptyLanding({ onUpload, onSample }: EmptyLandingProps) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-7 px-5 py-10 text-center">
      <div className="flex max-w-2xl flex-col items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          Local Audio Lab
        </p>
        <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">
          本地音频实验室
        </h1>
        <p className="max-w-xl text-base leading-7 text-slate-500">
          打开网页，即刻在浏览器本地剪辑、变声和导出你的声音。
        </p>
      </div>

      <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
          onClick={onUpload}
          type="button"
        >
          <Upload size={18} />
          上传音频
        </button>
        <button
          className="inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-400"
          disabled
          title="录音功能将在二期推出"
          type="button"
        >
          <Mic size={18} />
          开始录音
        </button>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
          onClick={onSample}
          type="button"
        >
          <PlayCircle size={18} />
          打开示例
        </button>
      </div>

      <p className="inline-flex items-center gap-2 text-sm text-slate-500">
        <ShieldCheck size={16} />
        文件不会上传，全部在你的浏览器本地处理。
      </p>
    </main>
  );
}
