export type SystemSound =
  | 'Tink' | 'Pop' | 'Bottle' | 'Basso' | 'Glass' | 'Submarine'
  | 'Ping' | 'Funk' | 'Purr' | 'Blow' | 'Frog' | 'Morse' | 'Hero' | 'Sosumi';

// Each sound carries a volume multiplier (applied on top of user's master volume).
// This lets themes express relative loudness: resolving sounds are typically
// the most prominent since they signal "look at the result now."
export interface ThemeSounds {
  submit: { sound: SystemSound; volume: number };    // UserPromptSubmit
  active: { sound: SystemSound; volume: number };    // PostToolUse #1–2
  intense: { sound: SystemSound; volume: number };   // PostToolUse #3+
  resolving: { sound: SystemSound; volume: number }; // Stop
}

export interface Theme {
  name: string;
  displayName: string;
  description: string;
  bpm: number;
  bpmRange: [number, number];
  subdivision: number;
  swing: number;
  sounds: ThemeSounds;
  characteristics: string[];
}

export interface ThemeConfig {
  themes: Record<string, Theme>;
  defaultTheme: string;
}

export const AVAILABLE_THEMES = ['lofi', 'ambient', 'synthwave'] as const;
export type ThemeName = typeof AVAILABLE_THEMES[number];
