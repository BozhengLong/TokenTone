export declare class Scheduler {
    private bpm;
    private beatDuration;
    private subdivisions;
    private lastBeatTime;
    constructor(bpm?: number, subdivisions?: number);
    setBPM(bpm: number): void;
    getNextBeatDelay(): number;
    getCurrentBeat(): number;
    reset(): void;
}
//# sourceMappingURL=scheduler.d.ts.map