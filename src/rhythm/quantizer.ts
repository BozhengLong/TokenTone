export type QuantizeMode = 'hard' | 'soft' | 'none';

export interface QuantizerOptions {
  bpm: number;
  subdivision: number;  // 1 = quarter, 2 = eighth, 4 = sixteenth
  mode: QuantizeMode;
  swing: number;        // 0-1, amount of swing (0 = straight, 0.5 = triplet feel)
}

export class Quantizer {
  private options: QuantizerOptions;
  private beatDuration: number;
  private subdivisionDuration: number;

  constructor(options: Partial<QuantizerOptions> = {}) {
    this.options = {
      bpm: options.bpm ?? 80,
      subdivision: options.subdivision ?? 4,
      mode: options.mode ?? 'soft',
      swing: options.swing ?? 0.1,
    };

    this.beatDuration = (60 / this.options.bpm) * 1000;
    this.subdivisionDuration = this.beatDuration / this.options.subdivision;
  }

  quantize(timestamp: number, referenceTime: number): number {
    if (this.options.mode === 'none') {
      return timestamp;
    }

    const elapsed = timestamp - referenceTime;
    const subdivisionIndex = Math.round(elapsed / this.subdivisionDuration);
    let quantizedTime = referenceTime + (subdivisionIndex * this.subdivisionDuration);

    // Apply swing to off-beats
    if (this.options.swing > 0 && subdivisionIndex % 2 === 1) {
      quantizedTime += this.subdivisionDuration * this.options.swing * 0.5;
    }

    if (this.options.mode === 'soft') {
      // Soft quantization: blend between original and quantized
      const blend = 0.7; // 70% quantized, 30% original
      return timestamp * (1 - blend) + quantizedTime * blend;
    }

    return quantizedTime;
  }

  getDelayToNextSubdivision(currentTime: number, referenceTime: number): number {
    const elapsed = currentTime - referenceTime;
    const currentSubdivision = Math.floor(elapsed / this.subdivisionDuration);
    const nextSubdivisionTime = referenceTime + ((currentSubdivision + 1) * this.subdivisionDuration);

    return Math.max(0, nextSubdivisionTime - currentTime);
  }

  setBPM(bpm: number): void {
    this.options.bpm = bpm;
    this.beatDuration = (60 / bpm) * 1000;
    this.subdivisionDuration = this.beatDuration / this.options.subdivision;
  }

  setSubdivision(subdivision: number): void {
    this.options.subdivision = subdivision;
    this.subdivisionDuration = this.beatDuration / subdivision;
  }

  setMode(mode: QuantizeMode): void {
    this.options.mode = mode;
  }

  setSwing(swing: number): void {
    this.options.swing = Math.max(0, Math.min(1, swing));
  }
}
