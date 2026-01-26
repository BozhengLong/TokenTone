import { Theme, ThemeName, AVAILABLE_THEMES } from './types';
import { lofiTheme } from './lofi';
import { ambientTheme } from './ambient';
import { synthwaveTheme } from './synthwave';

const themes: Record<ThemeName, Theme> = {
  lofi: lofiTheme,
  ambient: ambientTheme,
  synthwave: synthwaveTheme,
};

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export function getAllThemes(): Theme[] {
  return Object.values(themes);
}

export function isValidTheme(name: string): name is ThemeName {
  return AVAILABLE_THEMES.includes(name as ThemeName);
}

export { Theme, ThemeName, AVAILABLE_THEMES };
export { lofiTheme, ambientTheme, synthwaveTheme };
