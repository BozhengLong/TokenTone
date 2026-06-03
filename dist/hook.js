#!/usr/bin/env node
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
const fs = __importStar(require("fs"));
const config_1 = require("./config");
const state_1 = require("./state");
const sampler_1 = require("./audio/sampler");
const scheduler_1 = require("./audio/scheduler");
const themes_1 = require("./themes");
const SESSION_TIMEOUT_MS = 60_000;
const DEBOUNCE_MS = 150;
async function readStdin() {
    if (process.stdin.isTTY)
        return {};
    return new Promise((resolve) => {
        let raw = '';
        const timer = setTimeout(() => resolve({}), 200);
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => { raw += chunk; });
        process.stdin.on('end', () => {
            clearTimeout(timer);
            try {
                resolve(JSON.parse(raw));
            }
            catch {
                resolve({});
            }
        });
    });
}
// Kill any watcher process left over from a previous version of this plugin.
function killOldWatcher() {
    const pidPath = (0, state_1.getWatcherPidPath)();
    if (!fs.existsSync(pidPath))
        return;
    try {
        const pid = parseInt(fs.readFileSync(pidPath, 'utf8').trim(), 10);
        if (!isNaN(pid))
            process.kill(pid, 'SIGTERM');
    }
    catch { }
    try {
        fs.unlinkSync(pidPath);
    }
    catch { }
    try {
        fs.writeFileSync((0, state_1.getSignalPath)(), 'stop', 'utf8');
    }
    catch { }
}
async function main() {
    const now = Date.now();
    const [event, config] = await Promise.all([readStdin(), Promise.resolve((0, config_1.loadConfig)())]);
    if (!config.enabled)
        return;
    const hookEvent = event.hook_event_name ?? '';
    if (!['UserPromptSubmit', 'PostToolUse', 'Stop'].includes(hookEvent))
        return;
    if (hookEvent === 'UserPromptSubmit' && !config.triggers.userPromptSubmit)
        return;
    if (hookEvent === 'PostToolUse' && !config.triggers.postToolUse)
        return;
    if (hookEvent === 'Stop' && !config.triggers.stop)
        return;
    const state = (0, state_1.loadState)();
    if (now - state.lastNoteAt < DEBOUNCE_MS) {
        (0, state_1.saveState)({ ...state, lastEventAt: now });
        return;
    }
    const timedOut = state.lastEventAt > 0 && (now - state.lastEventAt) > SESSION_TIMEOUT_MS;
    const callCount = timedOut ? 0 : state.callCount;
    const sessionStartedAt = timedOut || state.sessionStartedAt === 0 ? now : state.sessionStartedAt;
    const themeName = (0, themes_1.isValidTheme)(config.theme) ? config.theme : 'lofi';
    const theme = (0, themes_1.getTheme)(themeName);
    const sampler = new sampler_1.Sampler();
    const scheduler = new scheduler_1.Scheduler(theme.bpm);
    let soundSpec;
    let newPhase;
    let newCallCount = callCount;
    if (hookEvent === 'UserPromptSubmit') {
        killOldWatcher();
        newPhase = 'start';
        newCallCount = 0;
        soundSpec = theme.sounds.submit;
    }
    else if (hookEvent === 'PostToolUse') {
        newCallCount = callCount + 1;
        if (newCallCount <= 2) {
            newPhase = 'active';
            soundSpec = theme.sounds.active;
        }
        else {
            newPhase = 'intense';
            soundSpec = theme.sounds.intense;
        }
    }
    else {
        newPhase = 'resolving';
        newCallCount = 0;
        soundSpec = theme.sounds.resolving;
    }
    const delay = scheduler.getNextBeatDelay();
    (0, state_1.saveState)({
        phase: newPhase,
        callCount: newCallCount,
        lastEventAt: now,
        sessionStartedAt,
        lastNoteAt: now + delay,
    });
    setTimeout(() => {
        sampler.playSystemSound(soundSpec.sound, config.volume * soundSpec.volume);
    }, delay);
    await new Promise((r) => setTimeout(r, delay + 10));
}
main().catch(() => { });
//# sourceMappingURL=hook.js.map