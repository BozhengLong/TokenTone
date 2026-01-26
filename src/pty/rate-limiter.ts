export interface RateLimiterOptions {
  maxNotesPerSecond: number;  // Maximum notes per second (default: 8)
  fadeStartRate: number;      // Rate at which fading begins (default: 6)
  minVolume: number;          // Minimum volume during fade (default: 0.1)
  recoveryRate: number;       // How fast volume recovers (default: 1.5x decay)
}

export class RateLimiter {
  private options: RateLimiterOptions;
  private noteTimestamps: number[] = [];
  private currentVolume = 1.0;
  private lastUpdateTime = Date.now();

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.options = {
      maxNotesPerSecond: options.maxNotesPerSecond ?? 8,
      fadeStartRate: options.fadeStartRate ?? 6,
      minVolume: options.minVolume ?? 0.1,
      recoveryRate: options.recoveryRate ?? 1.5,
    };
  }

  shouldPlayNote(): { play: boolean; volume: number } {
    const now = Date.now();
    this.updateVolume(now);

    // Clean old timestamps (keep last second)
    this.noteTimestamps = this.noteTimestamps.filter(t => now - t < 1000);

    const currentRate = this.noteTimestamps.length;

    // Check if we're at max rate
    if (currentRate >= this.options.maxNotesPerSecond) {
      return { play: false, volume: 0 };
    }

    // Record this note
    this.noteTimestamps.push(now);
    this.lastUpdateTime = now;

    return { play: true, volume: this.currentVolume };
  }

  private updateVolume(now: number): void {
    const timeDelta = (now - this.lastUpdateTime) / 1000;
    const currentRate = this.noteTimestamps.filter(t => now - t < 1000).length;

    if (currentRate >= this.options.fadeStartRate) {
      // Exponential decay when rate is high
      const decayFactor = Math.pow(0.8, timeDelta * 10);
      this.currentVolume = Math.max(
        this.options.minVolume,
        this.currentVolume * decayFactor
      );
    } else {
      // Recovery when rate is low
      const recoveryFactor = Math.pow(1.2, timeDelta * this.options.recoveryRate);
      this.currentVolume = Math.min(1.0, this.currentVolume * recoveryFactor);
    }
  }

  getCurrentRate(): number {
    const now = Date.now();
    return this.noteTimestamps.filter(t => now - t < 1000).length;
  }

  reset(): void {
    this.noteTimestamps = [];
    this.currentVolume = 1.0;
    this.lastUpdateTime = Date.now();
  }
}
