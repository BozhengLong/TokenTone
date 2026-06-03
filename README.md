# TokenTone

Real-time ambient music for [Claude Code](https://claude.com/claude-code). TokenTone is a plugin that listens to the emotional rhythm of your coding session through Claude Code's hook system and plays sounds at the right moments — when you submit a prompt, while tools run, and when a response completes.

It's not token-by-token sound effects. Like a film score, it responds to the *arc* of a session rather than every character.

## How it works

TokenTone hooks into three Claude Code events and advances a small state machine:

| Event | Phase | What you hear |
|-------|-------|---------------|
| `UserPromptSubmit` | `start` | A soft single note — anticipation |
| `PostToolUse` (#1–2) | `active` | A clean working note |
| `PostToolUse` (#3+) | `intense` | A brighter, more present note |
| `Stop` | `resolving` | A conclusive note with long decay |

After 60 seconds of silence the session resets. Everything runs locally:

- **Zero LLM calls, zero token cost** — pure algorithmic state machine, no network requests
- **No daemon** — each hook is a short-lived process (< 20ms)
- **Lightweight** — state passes through a tiny JSON file

The statusline shows the current theme, volume, and on/off state:

```
♪ lofi │ vol:70% │ ●
```

## Installation

In Claude Code:

```
/plugin marketplace add BozhengLong/TokenTone
/plugin install tokentone
/tokentone:setup
```

`/tokentone:setup` detects your runtime, wires up the statusline and hooks in your settings, and tests them. After it finishes, **restart Claude Code** for the statusline to take effect.

### Requirements

- **Claude Code**
- **macOS** for audio — sounds use the built-in macOS system sounds (`afplay`). The statusline works on any platform; audio playback is currently macOS-only.
- **Node.js ≥ 18** or **Bun** — Bun runs the TypeScript sources directly; Node runs the prebuilt files in `dist/`.

## Themes

| Theme | Character | BPM |
|-------|-----------|-----|
| **lofi** | Warm and unhurried — each event says exactly one thing | 80 |
| **ambient** | Atmospheric and minimal — sounds that recede rather than demand | 65 |
| **synthwave** | Punchy and electric — mechanical weight on every event | 115 |

Each theme maps the four phases to distinct macOS system sounds with per-event volume, so the session's intensity is expressed through both sound choice and loudness.

## Configuration

Run `/tokentone:configure` to change the theme, volume, enabled state, or which events trigger sound. Settings are stored in `~/.claude/plugins/tokentone/config.json`:

```json
{
  "theme": "lofi",
  "volume": 0.7,
  "enabled": true,
  "triggers": {
    "userPromptSubmit": true,
    "postToolUse": true,
    "stop": true
  }
}
```

## Project layout

```
tokentone/
├── .claude-plugin/        # Plugin + marketplace metadata
├── commands/              # /tokentone:setup and :configure
├── src/
│   ├── hook.ts            # Hook entry: state machine + sound selection
│   ├── statusline.ts      # Statusline display (no audio)
│   ├── config.ts          # User config read/write
│   ├── state.ts           # Session state read/write
│   ├── audio/
│   │   ├── sampler.ts     # Plays named macOS system sounds
│   │   └── scheduler.ts   # BPM beat quantization
│   └── themes/            # lofi · ambient · synthwave
└── dist/                  # Compiled output (committed — run by Node installs)
```

`dist/` is committed on purpose: the plugin is installed by cloning the repo, and Node-based installs run `dist/hook.js` / `dist/statusline.js` directly. Rebuild with `npm run build` after changing anything in `src/`.

## License

MIT
