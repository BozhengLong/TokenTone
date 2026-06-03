"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sampler = void 0;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const SYSTEM_SOUNDS_DIR = '/System/Library/Sounds';
// Plays named macOS system sounds for the plugin hooks.
class Sampler {
    // Play a named macOS system sound at natural pitch.
    // volume = config.volume × theme.sounds.<event>.volume (caller computes this).
    // The 0.3 factor calibrates afplay's 0–1 scale against system output level.
    playSystemSound(soundName, volume) {
        if (process.platform !== 'darwin')
            return;
        const filePath = path.join(SYSTEM_SOUNDS_DIR, `${soundName}.aiff`);
        if (!fs.existsSync(filePath))
            return;
        const child = (0, child_process_1.spawn)('afplay', ['-v', String(volume * 0.3), filePath], {
            stdio: 'ignore',
            detached: true,
        });
        child.unref();
    }
}
exports.Sampler = Sampler;
//# sourceMappingURL=sampler.js.map