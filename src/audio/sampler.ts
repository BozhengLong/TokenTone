import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const SYSTEM_SOUNDS_DIR = '/System/Library/Sounds';

// Plays named macOS system sounds for the plugin hooks.
export class Sampler {
  // Play a named macOS system sound at natural pitch.
  // volume = config.volume × theme.sounds.<event>.volume (caller computes this).
  // The 0.3 factor calibrates afplay's 0–1 scale against system output level.
  playSystemSound(soundName: string, volume: number): void {
    if (process.platform !== 'darwin') return;
    const filePath = path.join(SYSTEM_SOUNDS_DIR, `${soundName}.aiff`);
    if (!fs.existsSync(filePath)) return;
    const child = spawn('afplay', ['-v', String(volume * 0.3), filePath], {
      stdio: 'ignore',
      detached: true,
    });
    child.unref();
  }
}
