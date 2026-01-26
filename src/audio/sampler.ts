import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { Theme } from '../themes/types';

// macOS system sounds for fallback
const SYSTEM_SOUNDS = [
  '/System/Library/Sounds/Tink.aiff',
  '/System/Library/Sounds/Pop.aiff',
  '/System/Library/Sounds/Bottle.aiff',
  '/System/Library/Sounds/Frog.aiff',
  '/System/Library/Sounds/Funk.aiff',
  '/System/Library/Sounds/Glass.aiff',
  '/System/Library/Sounds/Ping.aiff',
  '/System/Library/Sounds/Purr.aiff',
];

// Lo-fi style sounds (softer)
const LOFI_SOUNDS = [
  '/System/Library/Sounds/Tink.aiff',
  '/System/Library/Sounds/Pop.aiff',
  '/System/Library/Sounds/Purr.aiff',
];

// Ambient style sounds
const AMBIENT_SOUNDS = [
  '/System/Library/Sounds/Glass.aiff',
  '/System/Library/Sounds/Submarine.aiff',
  '/System/Library/Sounds/Purr.aiff',
];

// Synthwave style sounds (more punchy)
const SYNTHWAVE_SOUNDS = [
  '/System/Library/Sounds/Funk.aiff',
  '/System/Library/Sounds/Hero.aiff',
  '/System/Library/Sounds/Ping.aiff',
];

export class Sampler {
  private samplePaths: string[] = [];
  private assetsDir: string;
  private themeName: string = 'lofi';

  constructor() {
    this.assetsDir = path.join(__dirname, '..', '..', 'assets', 'samples');
  }

  async loadTheme(theme: Theme): Promise<void> {
    this.themeName = theme.name;
    const themeDir = path.join(this.assetsDir, theme.name);

    // Check if theme directory exists and has audio files
    if (fs.existsSync(themeDir)) {
      const files = fs.readdirSync(themeDir);
      this.samplePaths = files
        .filter(f => /\.(wav|mp3|ogg|aiff)$/i.test(f))
        .map(f => path.join(themeDir, f));
    }

    // If no custom samples, use system sounds based on theme
    if (this.samplePaths.length === 0) {
      this.samplePaths = this.getSystemSoundsForTheme(theme.name);
    }
  }

  private getSystemSoundsForTheme(themeName: string): string[] {
    switch (themeName) {
      case 'lofi':
        return LOFI_SOUNDS.filter(f => fs.existsSync(f));
      case 'ambient':
        return AMBIENT_SOUNDS.filter(f => fs.existsSync(f));
      case 'synthwave':
        return SYNTHWAVE_SOUNDS.filter(f => fs.existsSync(f));
      default:
        return SYSTEM_SOUNDS.filter(f => fs.existsSync(f));
    }
  }

  play(index: number, volume: number): void {
    if (this.samplePaths.length === 0) {
      return;
    }

    const samplePath = this.samplePaths[index % this.samplePaths.length];
    this.playFile(samplePath, volume);
  }

  private playFile(filePath: string, volume: number): void {
    const platform = process.platform;

    if (platform === 'darwin') {
      // macOS: use afplay with volume control
      const child = spawn('afplay', ['-v', String(volume * 0.3), filePath], {
        stdio: 'ignore',
        detached: true,
      });
      child.unref();
    } else if (platform === 'linux') {
      const child = spawn('aplay', ['-q', filePath], {
        stdio: 'ignore',
        detached: true,
      });
      child.unref();
    }
  }

  getSampleCount(): number {
    return this.samplePaths.length;
  }
}
