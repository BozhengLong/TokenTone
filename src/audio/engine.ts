import { Sampler } from './sampler';
import { Scheduler } from './scheduler';
import { RateLimiter } from '../pty/rate-limiter';
import { Theme } from '../themes/types';

export interface AudioEngineOptions {
  volume: number;
  theme: Theme;
  enabled: boolean;
}

export class AudioEngine {
  private sampler: Sampler;
  private scheduler: Scheduler;
  private rateLimiter: RateLimiter;
  private options: AudioEngineOptions;
  private enabled: boolean;

  constructor(options: Partial<AudioEngineOptions> = {}) {
    this.options = {
      volume: options.volume ?? 0.7,
      theme: options.theme!,
      enabled: options.enabled ?? true,
    };

    this.enabled = this.options.enabled;
    this.sampler = new Sampler();
    this.scheduler = new Scheduler(this.options.theme?.bpm ?? 80);
    this.rateLimiter = new RateLimiter();
  }

  async initialize(): Promise<void> {
    if (this.options.theme) {
      await this.sampler.loadTheme(this.options.theme);
    }
  }

  onToken(token: string): void {
    if (!this.enabled || !this.options.theme) {
      return;
    }

    const { play, volume } = this.rateLimiter.shouldPlayNote();
    if (!play) {
      return;
    }

    // Schedule the note to play on the next beat subdivision
    const delay = this.scheduler.getNextBeatDelay();

    setTimeout(() => {
      this.playNote(token, volume * this.options.volume);
    }, delay);
  }

  private playNote(token: string, volume: number): void {
    // Select sample based on token characteristics
    const sampleIndex = this.getSampleIndex(token);
    this.sampler.play(sampleIndex, volume);
  }

  private getSampleIndex(token: string): number {
    // Simple hash to select sample based on token
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = ((hash << 5) - hash) + token.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  setVolume(volume: number): void {
    this.options.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  setTheme(theme: Theme): void {
    this.options.theme = theme;
    this.scheduler.setBPM(theme.bpm);
    this.sampler.loadTheme(theme);
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
