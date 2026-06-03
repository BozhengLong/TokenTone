export type Phase = 'idle' | 'start' | 'active' | 'intense' | 'resolving';
export interface SessionState {
    phase: Phase;
    callCount: number;
    lastEventAt: number;
    sessionStartedAt: number;
    lastNoteAt: number;
}
export declare function getStatePath(): string;
export declare function getSignalPath(): string;
export declare function getWatcherPidPath(): string;
export declare function loadState(): SessionState;
export declare function saveState(state: SessionState): void;
//# sourceMappingURL=state.d.ts.map