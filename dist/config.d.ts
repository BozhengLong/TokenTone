export interface TokenToneConfig {
    theme: 'lofi' | 'ambient' | 'synthwave';
    volume: number;
    enabled: boolean;
    triggers: {
        userPromptSubmit: boolean;
        postToolUse: boolean;
        stop: boolean;
    };
}
export declare function getConfigPath(): string;
export declare function loadConfig(): TokenToneConfig;
export declare function saveConfig(updates: Partial<TokenToneConfig>): void;
//# sourceMappingURL=config.d.ts.map