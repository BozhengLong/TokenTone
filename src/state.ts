import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export type Phase = 'idle' | 'start' | 'active' | 'intense' | 'resolving';

export interface SessionState {
  phase: Phase;
  callCount: number;
  lastEventAt: number;
  sessionStartedAt: number;
  lastNoteAt: number;
}

const DEFAULT_STATE: SessionState = {
  phase: 'idle',
  callCount: 0,
  lastEventAt: 0,
  sessionStartedAt: 0,
  lastNoteAt: 0,
};

export function getStatePath(): string {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(claudeDir, 'plugins', 'tokentone', 'state.json');
}

export function getSignalPath(): string {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(claudeDir, 'plugins', 'tokentone', 'watcher.signal');
}

export function getWatcherPidPath(): string {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(claudeDir, 'plugins', 'tokentone', 'watcher.pid');
}

export function loadState(): SessionState {
  try {
    const raw = fs.readFileSync(getStatePath(), 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: SessionState): void {
  const statePath = getStatePath();
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}
