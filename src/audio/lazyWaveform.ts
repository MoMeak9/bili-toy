export async function loadWaveSurfer() {
  const mod = await import("wavesurfer.js");
  return mod.default;
}
