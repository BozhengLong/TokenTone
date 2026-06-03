import { AVAILABLE_THEMES } from './types';
import type { Theme, ThemeName } from './types';
import { lofiTheme } from './lofi';
import { ambientTheme } from './ambient';
import { synthwaveTheme } from './synthwave';
export declare function getTheme(name: ThemeName): Theme;
export declare function getAllThemes(): Theme[];
export declare function isValidTheme(name: string): name is ThemeName;
export type { Theme, ThemeName };
export { AVAILABLE_THEMES };
export { lofiTheme, ambientTheme, synthwaveTheme };
//# sourceMappingURL=index.d.ts.map