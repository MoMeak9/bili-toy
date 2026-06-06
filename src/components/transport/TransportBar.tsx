import { Pause, Play } from "lucide-react";
import { engine } from "../../audio/toneEngine";
import { useEditorStore } from "../../store/editorStore";
import { useProjectStore } from "../../store/projectStore";
import { formatTime } from "../ui/format";

export function TransportBar() {
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

  return (
    <div className="flex h-16 items-center gap-4 rounded-lg border border-slate-200 bg-white px-4">
      <button
        aria-label={isPlaying ? "暂停" : "播放"}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
        onClick={togglePlayback}
        type="button"
      >
        {isPlaying ? <Pause size={19} /> : <Play size={19} />}
      </button>
      <div className="min-w-[6.5rem] text-sm tabular-nums text-slate-600">
        {formatTime(playhead)} / {formatTime(duration)}
      </div>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${duration > 0 ? Math.min(100, (playhead / duration) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}
