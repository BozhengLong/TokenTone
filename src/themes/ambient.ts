import { Theme } from './types';

// Glass: gentle crystalline bell — submit feels like a calm intention, not a click
// Submarine: deep resonant ping — processing, something moving underwater
// Glass again at higher volume: intensity stays atmospheric, never urgent
// Submarine at its deepest: the longest natural decay of any system sound,
//   perfect for "done" — just lets the sound exist and fade completely on its own
export const ambientTheme: Theme = {
  name: 'ambient',
  displayName: 'Ambient',
  description: 'Atmospheric and minimal — sounds that recede rather than demand',
  bpm: 65,
  sounds: {
    submit:    { sound: 'Glass',     volume: 0.42 },
    active:    { sound: 'Submarine', volume: 0.35 },
    intense:   { sound: 'Glass',     volume: 0.50 },
    resolving: { sound: 'Submarine', volume: 0.58 },
  },
  characteristics: [
    'Glass on submit — quiet resonance, not a notification',
    'Submarine on active — deep, barely-there processing sound',
    'Glass on intense — same character, slightly louder',
    'Submarine on resolve — deepest natural decay, room to breathe',
  ],
};
