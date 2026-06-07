import type { PresetId } from "../../audio/types";
import presetBroadcast from "../../assets/preset_broadcast.png";
import presetDemon from "../../assets/preset_demon.png";
import presetPhone from "../../assets/preset_phone.png";
import presetRobot from "../../assets/preset_robot.png";
import presetSquirrel from "../../assets/preset_squirrel.png";

export interface PresetVisual {
  icon: string;
  image?: string;
  tint: string;
  active: string;
}

const FALLBACK: PresetVisual = {
  icon: "♪",
  tint: "bg-slate-50 text-slate-600 ring-slate-200",
  active: "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-indigo-200/50",
};

export const PRESET_VISUALS: Record<PresetId, PresetVisual> = {
  none: {
    icon: "☆",
    tint: "bg-slate-50 text-slate-500 ring-slate-200",
    active: "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-indigo-200/50",
  },
  robot: {
    icon: "🤖",
    image: presetRobot,
    tint: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    active: "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-cyan-200/60",
  },
  devil: {
    icon: "😈",
    image: presetDemon,
    tint: "bg-pink-50 text-pink-700 ring-pink-100",
    active: "border-pink-200 bg-pink-50 text-pink-800 shadow-pink-200/60",
  },
  chipmunk: {
    icon: "🐿️",
    image: presetSquirrel,
    tint: "bg-amber-50 text-amber-700 ring-amber-100",
    active: "border-amber-200 bg-amber-50 text-amber-800 shadow-amber-200/60",
  },
  phone: {
    icon: "☎️",
    image: presetPhone,
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    active: "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-200/60",
  },
  broadcast: {
    icon: "🎧",
    image: presetBroadcast,
    tint: "bg-orange-50 text-orange-700 ring-orange-100",
    active: "border-orange-200 bg-orange-50 text-orange-800 shadow-orange-200/60",
  },
  alien: {
    icon: "👽",
    tint: "bg-violet-50 text-violet-700 ring-violet-100",
    active: "border-violet-200 bg-violet-50 text-violet-800 shadow-violet-200/60",
  },
  tape: {
    icon: "📼",
    tint: "bg-lime-50 text-lime-700 ring-lime-100",
    active: "border-lime-200 bg-lime-50 text-lime-800 shadow-lime-200/60",
  },
  cave: {
    icon: "⛰️",
    tint: "bg-sky-50 text-sky-700 ring-sky-100",
    active: "border-sky-200 bg-sky-50 text-sky-800 shadow-sky-200/60",
  },
  eightBit: {
    icon: "▦",
    tint: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
    active: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800 shadow-fuchsia-200/60",
  },
};

export function getPresetVisual(id: PresetId): PresetVisual {
  return PRESET_VISUALS[id] ?? FALLBACK;
}
