import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";
import { formatTime } from "../ui/format";

interface TransportBarProps {
  compact?: boolean;
}

export function TransportBar({ compact = false }: TransportBarProps) {
  const duration = useProjectStore((state) => state.duration);
  const isPlaying = useEditorStore((state) => state.isPlaying);
  const playhead = useEditorStore((state) => state.playhead);
  const setPlaying = useEditorStore((state) => state.setPlaying);

  const togglePlayback = async () => {
    if (isPlaying) {
      engine.pause();
      setPlaying(false);
      return;
    }
    await engine.play();
    setPlaying(true);
  };

  if (compact) {
    return (
      <div className="lab-card flex flex-col gap-4 p-4">
        <div className="flex items-center justify-center gap-9">
          <button
            aria-label="后退 5 秒"
            className="text-slate-500 transition hover:text-indigo-600"
            onClick={() => engine.seekBy(-5)}
            type="button"
          >
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button
            aria-label={isPlaying ? "暂停" : "播放"}
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_14px_30px_rgba(99,102,241,0.35)]"
            onClick={togglePlayback}
            type="button"
          >
            {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={23} fill="currentColor" />}
          </button>
          <button
            aria-label="前进 5 秒"
            className="text-slate-500 transition hover:text-indigo-600"
            onClick={() => engine.seekBy(5)}
            type="button"
          >
            <SkipForward size={22} fill="currentColor" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums text-slate-400">
          <span>{formatTime(playhead)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${duration > 0 ? Math.min(100, (playhead / duration) * 100) : 0}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-card flex h-16 items-center gap-4 px-4">
      <button
        aria-label="后退 5 秒"
        className="hidden text-slate-500 transition hover:text-indigo-600 sm:block"
        onClick={() => engine.seekBy(-5)}
        type="button"
      >
        <SkipBack size={20} fill="currentColor" />
      </button>
      <button
        aria-label={isPlaying ? "暂停" : "播放"}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.32)] transition hover:from-indigo-600 hover:to-violet-600"
        onClick={togglePlayback}
        type="button"
      >
        {isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
      </button>
      <button
        aria-label="前进 5 秒"
        className="hidden text-slate-500 transition hover:text-indigo-600 sm:block"
        onClick={() => engine.seekBy(5)}
        type="button"
      >
        <SkipForward size={20} fill="currentColor" />
      </button>
      <div className="min-w-[6.5rem] text-sm tabular-nums text-slate-500">
        {formatTime(playhead)} / {formatTime(duration)}
      </div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          style={{ width: `${duration > 0 ? Math.min(100, (playhead / duration) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}
