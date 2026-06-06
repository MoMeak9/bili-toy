// 用一个临时 AudioContext 解码任意 File 为 AudioBuffer。
// 校验文件类型并对解码失败给出可读错误。
const ACCEPTED = ["audio/", ".wav", ".mp3", ".ogg", ".m4a", ".aac", ".flac"];

type AudioContextConstructor = new () => AudioContext;

type WindowWithWebkitAudioContext = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

function looksLikeAudio(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const name = file.name.toLowerCase();
  return ACCEPTED.some((ext) => ext.startsWith(".") && name.endsWith(ext));
}

export async function decodeFile(file: File): Promise<AudioBuffer> {
  if (!looksLikeAudio(file)) {
    throw new Error("不支持的文件类型，请选择音频文件（WAV/MP3/OGG 等）。");
  }
  const arrayBuffer = await file.arrayBuffer();
  return decodeArrayBuffer(arrayBuffer);
}

export async function decodeArrayBuffer(data: ArrayBuffer): Promise<AudioBuffer> {
  const Ctx = window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;
  if (!Ctx) {
    throw new Error("当前浏览器不支持 Web Audio。");
  }
  const ctx = new Ctx();
  try {
    // slice(0) 防止某些浏览器 detach 原 buffer
    return await ctx.decodeAudioData(data.slice(0));
  } catch {
    throw new Error("音频解析失败，文件可能损坏或格式不受支持。");
  } finally {
    ctx.close();
  }
}
