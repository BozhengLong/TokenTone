import { Theme, ThemeName, AVAILABLE_THEMES } from './types';
import { lofiTheme } from './lofi';
import { ambientTheme } from './ambient';
import { synthwaveTheme } from './synthwave';
export declare function getTheme(name: ThemeName): Theme;
export declare function getAllThemes(): Theme[];
export declare function isValidTheme(name: string): name is ThemeName;
export { Theme, ThemeName, AVAILABLE_THEMES };
export { lofiTheme, ambientTheme, synthwaveTheme };
//# sourceMappingURL=index.d.ts.map