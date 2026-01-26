import { EventEmitter } from 'events';

export interface ClockOptions {
  bpm: number;
  subdivisions: number;  // Beats per measure
}

export class Clock extends EventEmitter {
  private bpm: number;
  private subdivisions: number;
  private intervalId: NodeJS.Timeout | null = null;
  private beatCount = 0;
  private startTime = 0;

  constructor(options: Partial<ClockOptions> = {}) {
    super();
    this.bpm = options.bpm ?? 80;
    this.subdivisions = options.subdivisions ?? 4;
  }

  start(): void {
    if (this.intervalId) {
      return;
    }

    this.startTime = Date.now();
    this.beatCount = 0;

    const beatInterval = (60 / this.bpm) * 1000;

    this.intervalId = setInterval(() => {
      this.beatCount++;
      this.emit('beat', {
        beat: this.beatCount,
        measure: Math.floor(this.beatCount / this.subdivisions),
        beatInMeasure: this.beatCount % this.subdivisions,
        time: Date.now() - this.startTime,
      });
    }, beatInterval);

    // Emit first beat immediately
    this.emit('beat', {
      beat: 0,
      measure: 0,
      beatInMeasure: 0,
      time: 0,
    });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setBPM(bpm: number): void {
    const wasRunning = this.intervalId !== null;
    if (wasRunning) {
      this.stop();
    }
    this.bpm = bpm;
    if (wasRunning) {
      this.start();
    }
  }

  getBPM(): number {
    return this.bpm;
  }

  getBeatDuration(): number {
    return (60 / this.bpm) * 1000;
  }

  getCurrentBeat(): number {
    return this.beatCount;
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
