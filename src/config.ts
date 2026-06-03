import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

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

const DEFAULT_CONFIG: TokenToneConfig = {
  theme: 'lofi',
  volume: 0.7,
  enabled: true,
  triggers: {
    userPromptSubmit: true,
    postToolUse: true,
    stop: true,
  },
};

export function getConfigPath(): string {
  const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');
  return path.join(claudeDir, 'plugins', 'tokentone', 'config.json');
}

export function loadConfig(): TokenToneConfig {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed, triggers: { ...DEFAULT_CONFIG.triggers, ...parsed.triggers } };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(updates: Partial<TokenToneConfig>): void {
  const configPath = getConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const current = loadConfig();
  const next = { ...current, ...updates };
  if (updates.triggers) {
    next.triggers = { ...current.triggers, ...updates.triggers };
  }
  fs.writeFileSync(configPath, JSON.stringify(next, null, 2), 'utf8');
}
