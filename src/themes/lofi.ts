import { Theme } from './types';

export const lofiTheme: Theme = {
  name: 'lofi',
  displayName: 'Lo-fi',
  description: 'Warm, nostalgic lo-fi hip hop vibes with Rhodes piano and vinyl crackle',
  bpm: 75,
  bpmRange: [70, 85],
  subdivision: 4,
  swing: 0.15,
  samples: [
    'rhodes-c4.wav',
    'rhodes-e4.wav',
    'rhodes-g4.wav',
    'rhodes-a4.wav',
    'rhodes-c5.wav',
  ],
  characteristics: [
    'Rhodes electric piano',
    'Vinyl noise texture',
    'Warm, mellow tones',
    'Relaxed tempo',
  ],
};
