#!/usr/bin/env node

import * as fs from 'fs';
import { loadConfig } from './config';
import { loadState, saveState, SessionState, Phase, getSignalPath, getWatcherPidPath } from './state';
import { Sampler } from './audio/sampler';
import { Scheduler } from './audio/scheduler';
import { getTheme, isValidTheme } from './themes';

const SESSION_TIMEOUT_MS = 60_000;
const DEBOUNCE_MS = 150;

async function readStdin(): Promise<Record<string, unknown>> {
  if (process.stdin.isTTY) return {};
  return new Promise((resolve) => {
    let raw = '';
    const timer = setTimeout(() => resolve({}), 200);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { raw += chunk; });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

// Kill any watcher process left over from a previous version of this plugin.
function killOldWatcher(): void {
  const pidPath = getWatcherPidPath();
  if (!fs.existsSync(pidPath)) return;
  try {
    const pid = parseInt(fs.readFileSync(pidPath, 'utf8').trim(), 10);
    if (!isNaN(pid)) process.kill(pid, 'SIGTERM');
  } catch {}
  try { fs.unlinkSync(pidPath); } catch {}
  try { fs.writeFileSync(getSignalPath(), 'stop', 'utf8'); } catch {}
}

async function main(): Promise<void> {
  const now = Date.now();
  const [event, config] = await Promise.all([readStdin(), Promise.resolve(loadConfig())]);

  if (!config.enabled) return;

  const hookEvent = (event.hook_event_name as string) ?? '';
  if (!['UserPromptSubmit', 'PostToolUse', 'Stop'].includes(hookEvent)) return;

  if (hookEvent === 'UserPromptSubmit' && !config.triggers.userPromptSubmit) return;
  if (hookEvent === 'PostToolUse'    && !config.triggers.postToolUse) return;
  if (hookEvent === 'Stop'           && !config.triggers.stop) return;

  const state = loadState();

  if (now - state.lastNoteAt < DEBOUNCE_MS) {
    saveState({ ...state, lastEventAt: now });
    return;
  }

  const timedOut = state.lastEventAt > 0 && (now - state.lastEventAt) > SESSION_TIMEOUT_MS;
  const callCount = timedOut ? 0 : state.callCount;
  const sessionStartedAt = timedOut || state.sessionStartedAt === 0 ? now : state.sessionStartedAt;

  const themeName = isValidTheme(config.theme) ? config.theme : 'lofi';
  const theme = getTheme(themeName as Parameters<typeof getTheme>[0]);
  const sampler = new Sampler();
  const scheduler = new Scheduler(theme.bpm);

  let soundSpec: { sound: string; volume: number };
  let newPhase: Phase;
  let newCallCount = callCount;

  if (hookEvent === 'UserPromptSubmit') {
    killOldWatcher();
    newPhase = 'start';
    newCallCount = 0;
    soundSpec = theme.sounds.submit;

  } else if (hookEvent === 'PostToolUse') {
    newCallCount = callCount + 1;
    if (newCallCount <= 2) {
      newPhase = 'active';
      soundSpec = theme.sounds.active;
    } else {
      newPhase = 'intense';
      soundSpec = theme.sounds.intense;
    }

  } else {
    newPhase = 'resolving';
    newCallCount = 0;
    soundSpec = theme.sounds.resolving;
  }

  const delay = scheduler.getNextBeatDelay();

  saveState({
    phase: newPhase,
    callCount: newCallCount,
    lastEventAt: now,
    sessionStartedAt,
    lastNoteAt: now + delay,
  } as SessionState);

  setTimeout(() => {
    sampler.playSystemSound(soundSpec.sound, config.volume * soundSpec.volume);
  }, delay);

  await new Promise((r) => setTimeout(r, delay + 10));
}

main().catch(() => {});
