export function isRecordingSupported(): boolean {
  return Boolean(
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
      typeof window.MediaRecorder !== "undefined",
  );
}

export async function requestMicrophoneStream(): Promise<MediaStream> {
  if (!isRecordingSupported()) {
    throw new Error("当前浏览器不支持录音。");
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

export function createRecorder(stream: MediaStream): MediaRecorder {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
  return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
}

export function stopStream(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
