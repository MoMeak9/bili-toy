import type { ABState, EditParams, PresetId } from "./types";
import { buildPresetNodes } from "./presets";
import { loadTone } from "./lazyTone";
import type { ToneModule } from "./presets";
import type * as ToneType from "tone";

// 引擎单例：持有 Player（变速/淡入淡出）+ 全局变调 + 预设链 + 音量。
// 音频图（B 态）：player -> globalPitch -> [presetNodes...] -> volume -> destination
// A 态：player -> volume -> destination（旁路链）
class ToneEngine {
  private Tone: ToneModule | null = null;
  private player: ToneType.Player | null = null;
  private globalPitch: ToneType.PitchShift | null = null;
  private volume: ToneType.Volume | null = null;
  private presetNodes: ToneType.ToneAudioNode[] = [];
  private buffer: AudioBuffer | null = null;

  private preset: PresetId = "none";
  private ab: ABState = "B";
  private params: EditParams = { volumeDb: 0, rate: 1, pitch: 0, fadeIn: 0, fadeOut: 0 };

  private startedAt = 0;      // Tone.now() 时刻
  private offsetAt = 0;       // 起播在素材内的偏移（秒）
  private playing = false;
  private rafId = 0;

  private tickCb: ((pos: number) => void) | null = null;
  private endedCb: (() => void) | null = null;

  private async ensureTone(): Promise<ToneModule> {
    this.Tone ??= await loadTone();
    return this.Tone;
  }

  async start(): Promise<void> {
    const Tone = await this.ensureTone();
    await Tone.start();
  }

  async loadBuffer(buffer: AudioBuffer): Promise<void> {
    const Tone = await this.ensureTone();
    this.dispose();
    this.buffer = buffer;
    this.player = new Tone.Player({
      url: new Tone.ToneAudioBuffer(buffer),
      loop: false,
      playbackRate: this.params.rate,
      fadeIn: this.params.fadeIn,
      fadeOut: this.params.fadeOut,
      onstop: () => {
        // GrainPlayer 在自然播放结束时也会触发；用位置判断是否真正到尾
        if (this.playing && this.currentPos() >= this.duration() - 0.05) {
          this.handleEnded();
        }
      },
    });
    this.globalPitch = new Tone.PitchShift({ pitch: this.params.pitch });
    this.volume = new Tone.Volume(this.params.volumeDb);
    this.rebuildGraph();
  }

  // 根据 ab 与 preset 重新连接音频图
  private rebuildGraph(): void {
    if (!this.Tone || !this.player || !this.globalPitch || !this.volume) return;
    this.player.disconnect();
    this.globalPitch.disconnect();
    this.presetNodes.forEach((n) => n.dispose());
    this.presetNodes = [];

    if (this.ab === "A") {
      this.player.connect(this.volume);
    } else {
      this.presetNodes = buildPresetNodes(this.Tone, this.preset);
      const chain: ToneType.ToneAudioNode[] = [
        this.player,
        this.globalPitch,
        ...this.presetNodes,
        this.volume,
      ];
      for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
    }
    this.volume.toDestination();
  }

  applyPreset(id: PresetId): void {
    this.preset = id;
    this.rebuildGraph();
  }

  setABState(ab: ABState): void {
    this.ab = ab;
    this.rebuildGraph();
  }

  setParams(p: EditParams): void {
    this.params = p;
    if (this.player) {
      this.player.playbackRate = p.rate;
      this.player.fadeIn = p.fadeIn;
      this.player.fadeOut = p.fadeOut;
    }
    if (this.globalPitch) this.globalPitch.pitch = p.pitch;
    if (this.volume) this.volume.volume.value = p.volumeDb;
  }

  async play(): Promise<void> {
    if (!this.player || this.playing) return;
    const Tone = await this.ensureTone();
    void Tone.start().catch(() => {
      // The browser may keep AudioContext suspended until a direct gesture;
      // playback UI should not hang behind that resume attempt.
    });
    const offset = this.offsetAt;
    this.player.start(undefined, offset);
    this.startedAt = Tone.now();
    this.playing = true;
    this.loop();
  }

  pause(): void {
    if (!this.player || !this.playing) return;
    this.offsetAt = this.currentPos();
    this.player.stop();
    this.playing = false;
    cancelAnimationFrame(this.rafId);
  }

  seek(seconds: number): void {
    const wasPlaying = this.playing;
    if (wasPlaying) this.pause();
    this.offsetAt = Math.max(0, Math.min(seconds, this.duration()));
    if (this.tickCb) this.tickCb(this.offsetAt);
    if (wasPlaying) void this.play();
  }

  duration(): number {
    return this.buffer ? this.buffer.duration : 0;
  }

  private currentPos(): number {
    if (!this.playing) return this.offsetAt;
    const elapsed = ((this.Tone?.now() ?? this.startedAt) - this.startedAt) * this.params.rate;
    return Math.min(this.offsetAt + elapsed, this.duration());
  }

  private loop = (): void => {
    if (!this.playing) return;
    const pos = this.currentPos();
    if (this.tickCb) this.tickCb(pos);
    if (pos >= this.duration() - 0.02) {
      this.handleEnded();
      return;
    }
    this.rafId = requestAnimationFrame(this.loop);
  };

  private handleEnded(): void {
    this.player?.stop();
    this.playing = false;
    this.offsetAt = 0;
    cancelAnimationFrame(this.rafId);
    if (this.tickCb) this.tickCb(0);
    if (this.endedCb) this.endedCb();
  }

  onTick(cb: (pos: number) => void): void {
    this.tickCb = cb;
  }
  onEnded(cb: () => void): void {
    this.endedCb = cb;
  }

  // 供离线渲染读取当前配置
  getConfig() {
    return { buffer: this.buffer, preset: this.preset, params: this.params };
  }

  dispose(): void {
    cancelAnimationFrame(this.rafId);
    this.player?.dispose();
    this.globalPitch?.dispose();
    this.volume?.dispose();
    this.presetNodes.forEach((n) => n.dispose());
    this.player = null;
    this.globalPitch = null;
    this.volume = null;
    this.presetNodes = [];
    this.playing = false;
    this.offsetAt = 0;
  }
}

export const engine = new ToneEngine();
