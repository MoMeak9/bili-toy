import * as Tone from "tone";
import type { EditParams, PresetId } from "./types";
import { buildPresetNodes } from "./presets";

// 用 Tone.Offline 离线渲染「处理后」音频，返回原生 AudioBuffer 供 WAV 编码。
// 图与实时 B 态一致：player -> globalPitch -> [preset...] -> volume -> dest
export async function renderProcessed(
  source: AudioBuffer,
  preset: PresetId,
  params: EditParams
): Promise<AudioBuffer> {
  const renderDuration = source.duration / params.rate + 0.2;

  const rendered = await Tone.Offline(({ transport }) => {
    const player = new Tone.GrainPlayer({
      url: new Tone.ToneAudioBuffer(source),
      playbackRate: params.rate,
    });
    const globalPitch = new Tone.PitchShift({ pitch: params.pitch });
    const volume = new Tone.Volume(params.volumeDb);
    const presetNodes = buildPresetNodes(preset);

    const chain: Tone.ToneAudioNode[] = [player, globalPitch, ...presetNodes, volume];
    for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
    volume.toDestination();

    player.start(0);
    transport.start();
  }, renderDuration, source.numberOfChannels, source.sampleRate);

  return rendered.get() as AudioBuffer;
}
