"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synthwaveTheme = exports.ambientTheme = exports.lofiTheme = exports.AVAILABLE_THEMES = void 0;
exports.getTheme = getTheme;
exports.getAllThemes = getAllThemes;
exports.isValidTheme = isValidTheme;
const types_1 = require("./types");
Object.defineProperty(exports, "AVAILABLE_THEMES", { enumerable: true, get: function () { return types_1.AVAILABLE_THEMES; } });
const lofi_1 = require("./lofi");
Object.defineProperty(exports, "lofiTheme", { enumerable: true, get: function () { return lofi_1.lofiTheme; } });
const ambient_1 = require("./ambient");
Object.defineProperty(exports, "ambientTheme", { enumerable: true, get: function () { return ambient_1.ambientTheme; } });
const synthwave_1 = require("./synthwave");
Object.defineProperty(exports, "synthwaveTheme", { enumerable: true, get: function () { return synthwave_1.synthwaveTheme; } });
const themes = {
    lofi: lofi_1.lofiTheme,
    ambient: ambient_1.ambientTheme,
    synthwave: synthwave_1.synthwaveTheme,
};
function getTheme(name) {
    return themes[name];
}
function getAllThemes() {
    return Object.values(themes);
}
function isValidTheme(name) {
    return types_1.AVAILABLE_THEMES.includes(name);
}
//# sourceMappingURL=index.js.map