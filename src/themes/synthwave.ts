import { Theme } from './types';

// Ping: sharp electric attack — submit is crisp, confident, machine-like
// Funk: natural bass thud — the weight of work beginning, mechanical feel
// Ping again at full presence: intense work sounds like a system under load
// Basso: the deepest, weightiest macOS sound — not melodic, just mass;
//   when the work ends, something heavy settles
export const synthwaveTheme: Theme = {
  name: 'synthwave',
  displayName: 'Synthwave',
  description: 'Punchy and electric — mechanical weight on every event',
  bpm: 115,
  bpmRange: [105, 125],
  subdivision: 4,
  swing: 0,
  sounds: {
    submit:    { sound: 'Ping',  volume: 0.55 },
    active:    { sound: 'Funk',  volume: 0.52 },
    intense:   { sound: 'Ping',  volume: 0.65 },
    resolving: { sound: 'Basso', volume: 0.62 },
  },
  characteristics: [
    'Ping on submit — electric, immediate',
    'Funk on active — bass thud, mechanical weight',
    'Ping on intense — louder, system under load',
    'Basso on resolve — deepest thud, something settles',
  ],
};
