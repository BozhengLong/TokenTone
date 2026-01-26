import { Theme } from './types';

export const ambientTheme: Theme = {
  name: 'ambient',
  displayName: 'Ambient',
  description: 'Ethereal, meditative soundscapes with pad synths and atmospheric textures',
  bpm: 70,
  bpmRange: [60, 80],
  subdivision: 2,
  swing: 0,
  samples: [
    'pad-c3.wav',
    'pad-e3.wav',
    'pad-g3.wav',
    'chime-high.wav',
    'chime-low.wav',
  ],
  characteristics: [
    'Pad synthesizers',
    'Wind chimes',
    'Ethereal atmosphere',
    'Slow, meditative pace',
  ],
};
