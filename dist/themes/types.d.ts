export type SystemSound = 'Tink' | 'Pop' | 'Bottle' | 'Basso' | 'Glass' | 'Submarine' | 'Ping' | 'Funk' | 'Purr' | 'Blow' | 'Frog' | 'Morse' | 'Hero' | 'Sosumi';
export interface ThemeSounds {
    submit: {
        sound: SystemSound;
        volume: number;
    };
    active: {
        sound: SystemSound;
        volume: number;
    };
    intense: {
        sound: SystemSound;
        volume: number;
    };
    resolving: {
        sound: SystemSound;
        volume: number;
    };
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
export declare const AVAILABLE_THEMES: readonly ["lofi", "ambient", "synthwave"];
export type ThemeName = typeof AVAILABLE_THEMES[number];
//# sourceMappingURL=types.d.ts.map