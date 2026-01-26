export interface Theme {
  name: string;
  displayName: string;
  description: string;
  bpm: number;
  bpmRange: [number, number];
  subdivision: number;
  swing: number;
  samples: string[];
  characteristics: string[];
}

export interface ThemeConfig {
  themes: Record<string, Theme>;
  defaultTheme: string;
}

export const AVAILABLE_THEMES = ['lofi', 'ambient', 'synthwave'] as const;
export type ThemeName = typeof AVAILABLE_THEMES[number];
