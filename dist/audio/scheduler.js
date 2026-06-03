"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
class Scheduler {
    bpm;
    beatDuration; // Duration of one beat in ms
    subdivisions; // Number of subdivisions per beat
    lastBeatTime;
    constructor(bpm = 80, subdivisions = 4) {
        this.bpm = bpm;
        this.subdivisions = subdivisions;
        this.beatDuration = (60 / bpm) * 1000;
        this.lastBeatTime = Date.now();
    }
    setBPM(bpm) {
        this.bpm = bpm;
        this.beatDuration = (60 / bpm) * 1000;
    }
    getNextBeatDelay() {
        const now = Date.now();
        const subdivisionDuration = this.beatDuration / this.subdivisions;
        // Calculate time since last beat
        const timeSinceLastBeat = (now - this.lastBeatTime) % this.beatDuration;
        // Find the next subdivision
        const currentSubdivision = Math.floor(timeSinceLastBeat / subdivisionDuration);
        const nextSubdivisionTime = (currentSubdivision + 1) * subdivisionDuration;
        // Calculate delay to next subdivision
        let delay = nextSubdivisionTime - timeSinceLastBeat;
        // Apply soft quantization (allow some natural feel)
        // If we're very close to a subdivision, snap to it
        if (delay < subdivisionDuration * 0.1) {
            delay = 0;
        }
        else if (delay > subdivisionDuration * 0.9) {
            // If we're close to the next one, wait for it
            delay = subdivisionDuration - (subdivisionDuration - delay);
        }
        else {
            // Add some swing/humanization
            delay = delay * (0.9 + Math.random() * 0.2);
        }
        return Math.max(0, Math.min(delay, subdivisionDuration));
    }
    getCurrentBeat() {
        const now = Date.now();
        return Math.floor((now - this.lastBeatTime) / this.beatDuration);
    }
    reset() {
        this.lastBeatTime = Date.now();
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map