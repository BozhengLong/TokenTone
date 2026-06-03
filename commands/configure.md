---
description: Configure TokenTone audio theme, volume, and trigger settings
allowed-tools: Read, Write, AskUserQuestion
---

Configure TokenTone audio settings. Changes take effect immediately — the statusline refreshes every ~300ms and the hook picks up the new config on next trigger.

## Step 1: Load Current Config

Read `~/.claude/plugins/tokentone/config.json` if it exists.

**macOS/Linux config path**: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/plugins/tokentone/config.json`

Default values (used when config doesn't exist):
```json
{
  "theme": "lofi",
  "volume": 0.7,
  "enabled": true,
  "triggers": {
    "postToolUse": true,
    "stop": true
  }
}
```

---

## Step 2: Ask User for Settings

Use AskUserQuestion for each setting. Show current value in the question.

### Q1: Theme
- header: "Theme"
- question: "Choose audio theme (current: {current theme})"
- multiSelect: false
- options:
  - "lofi" — Chill lo-fi hip hop, 85 BPM
  - "ambient" — Atmospheric soundscapes, 60 BPM
  - "synthwave" — Retro 80s electronic, 110 BPM
  - "Keep current" — No change

### Q2: Volume
- header: "Volume"
- question: "Set volume level (current: {current volume * 100}%)"
- multiSelect: false
- options:
  - "25% — Subtle" — Background ambience
  - "50% — Moderate" — Noticeable but not distracting
  - "70% — Default" — Recommended level
  - "100% — Full" — Maximum volume

### Q3: Enabled
- header: "Audio"
- question: "Enable or disable audio effects? (current: {enabled/disabled})"
- multiSelect: false
- options:
  - "Enabled — Play audio effects" — Audio plays on tool use and responses
  - "Disabled — Silent mode" — Hooks run but no audio plays
  - "Keep current" — No change

### Q4: Triggers
- header: "Triggers"
- question: "Which events should play audio? (can select multiple)"
- multiSelect: true
- options:
  - "Tool calls — Play when Claude reads/edits/runs tools"
  - "Response complete — Play when Claude finishes responding"

---

## Step 3: Write Config

Build the new config object from user answers (only update fields the user changed).

Write to `~/.claude/plugins/tokentone/config.json`. Create parent directories if needed.

**Volume mapping**:
- "25% — Subtle" → `0.25`
- "50% — Moderate" → `0.5`
- "70% — Default" → `0.7`
- "100% — Full" → `1.0`

**Triggers mapping**:
- "Tool calls" selected → `triggers.postToolUse: true`, else `false`
- "Response complete" selected → `triggers.stop: true`, else `false`
- If user skipped Q4, keep existing trigger values

Final config example:
```json
{
  "theme": "synthwave",
  "volume": 0.5,
  "enabled": true,
  "triggers": {
    "postToolUse": true,
    "stop": true
  }
}
```

---

## Step 4: Confirm

Tell the user:

> ✅ Config saved. The statusline will reflect your new settings within a few seconds.
> Theme: {theme} │ Volume: {volume*100}% │ {Enabled/Disabled}
