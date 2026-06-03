import { Theme } from './types';

// Tink: clean high bell — "message confirmed, I heard you"
// Bottle: hollow woody mid — warm machinery starting, unobtrusive
// Ping: brighter than Tink, rounder than Bottle — things are moving now
// Glass: crystalline with long resonant decay — the work is done, breathe out
export const lofiTheme: Theme = {
  name: 'lofi',
  displayName: 'Lo-fi',
  description: 'Warm and unhurried — each event says exactly one thing',
  bpm: 80,
  sounds: {
    submit:    { sound: 'Tink',   volume: 0.50 },
    active:    { sound: 'Bottle', volume: 0.45 },
    intense:   { sound: 'Ping',   volume: 0.55 },
    resolving: { sound: 'Glass',  volume: 0.62 },
  },
  characteristics: [
    'Tink on submit — clean bell, immediate',
    'Bottle on active — warm hollow, undemanding',
    'Ping on intense — brighter, more present',
    'Glass on resolve — long resonance, conclusive',
  ],
};
