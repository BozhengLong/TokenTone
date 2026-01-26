import { Theme } from './types';

export const synthwaveTheme: Theme = {
  name: 'synthwave',
  displayName: 'Synthwave',
  description: '80s retro-futuristic vibes with analog synths and arpeggios',
  bpm: 110,
  bpmRange: [100, 120],
  subdivision: 4,
  swing: 0,
  samples: [
    'synth-stab-c4.wav',
    'synth-stab-e4.wav',
    'synth-stab-g4.wav',
    'bass-hit.wav',
    'arp-high.wav',
  ],
  characteristics: [
    'Analog synthesizers',
    'Punchy bass hits',
    'Arpeggiated sequences',
    'Energetic 80s feel',
  ],
};
