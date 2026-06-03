import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Theme } from '../themes/types';

const SYSTEM_SOUNDS_DIR = '/System/Library/Sounds';

const THEME_FALLBACKS: Record<string, string[]> = {
  lofi:      ['Tink', 'Pop', 'Purr'],
  ambient:   ['Glass', 'Submarine', 'Purr'],
  synthwave: ['Funk', 'Hero', 'Ping'],
};

export class Sampler {
  private samplePaths: string[] = [];
  private assetsDir: string;

  constructor() {
    this.assetsDir = path.join(__dirname, '..', '..', 'assets', 'samples');
  }

  async loadTheme(theme: Theme): Promise<void> {
    const themeDir = path.join(this.assetsDir, theme.name);
    if (fs.existsSync(themeDir)) {
      const files = fs.readdirSync(themeDir);
      this.samplePaths = files
        .filter(f => /\.(wav|mp3|ogg|aiff)$/i.test(f))
        .map(f => path.join(themeDir, f));
    }
    if (this.samplePaths.length === 0) {
      const names = THEME_FALLBACKS[theme.name] ?? THEME_FALLBACKS['lofi'];
      this.samplePaths = names
        .map(n => path.join(SYSTEM_SOUNDS_DIR, `${n}.aiff`))
        .filter(p => fs.existsSync(p));
    }
  }

  // Legacy: used by AudioEngine (index.ts CLI flow)
  play(index: number, volume: number): void {
    if (this.samplePaths.length === 0) return;
    const filePath = this.samplePaths[index % this.samplePaths.length];
    this.afplay(filePath, volume);
  }

  getSampleCount(): number {
    return this.samplePaths.length;
  }

  // Plugin hook flow: play a named macOS system sound at natural pitch.
  // volume = config.volume × theme.sounds.<event>.volume (caller computes this).
  // The 0.3 factor calibrates afplay's 0–1 scale against system output level.
  playSystemSound(soundName: string, volume: number): void {
    if (process.platform !== 'darwin') return;
    const filePath = path.join(SYSTEM_SOUNDS_DIR, `${soundName}.aiff`);
    if (!fs.existsSync(filePath)) return;
    this.afplay(filePath, volume);
  }

  private afplay(filePath: string, volume: number): void {
    if (process.platform === 'darwin') {
      const child = spawn('afplay', ['-v', String(volume * 0.3), filePath], {
        stdio: 'ignore',
        detached: true,
      });
      child.unref();
    } else if (process.platform === 'linux') {
      const child = spawn('aplay', ['-q', filePath], {
        stdio: 'ignore',
        detached: true,
      });
      child.unref();
    }
  }
}
