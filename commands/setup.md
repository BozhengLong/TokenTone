---
description: Set up TokenTone audio effects for Claude Code (statusline + hooks)
allowed-tools: Bash, Read, Edit, Write, AskUserQuestion
---

Set up TokenTone as a Claude Code plugin. This configures the statusline to show audio status and hooks to play sounds when tools run and responses complete.

## Step 0: Detect Ghost Installation

Check for inconsistent plugin state:

**macOS/Linux**:
```bash
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
CACHE_EXISTS=$(ls -d "$CLAUDE_DIR/plugins/cache"/*/tokentone 2>/dev/null && echo "YES" || echo "NO")
REGISTRY_EXISTS=$(grep -q "tokentone" "$CLAUDE_DIR/plugins/installed_plugins.json" 2>/dev/null && echo "YES" || echo "NO")
echo "Cache: $CACHE_EXISTS | Registry: $REGISTRY_EXISTS"
```

| Cache | Registry | Action |
|-------|----------|--------|
| YES | YES | Continue to Step 1 |
| YES | NO | Ghost install — clean cache, reinstall |
| NO | YES | Ghost install — clean registry, reinstall |
| NO | NO | Not installed — ask user to run `/plugin install tokentone` first |

If not installed, tell the user:
> TokenTone is not installed. Please run `/plugin install tokentone` first, then re-run `/tokentone:setup`.

---

## Step 1: Detect Platform, Shell, and Runtime

Use the environment context `Platform:` and `Shell:` values (not `uname`).

| Platform | Shell | Runtime |
|----------|-------|---------|
| `darwin` | any | prefer bun, fall back to node |
| `linux` | any | prefer bun, fall back to node |
| `win32` | `bash` | node only |
| `win32` | `powershell`/`pwsh`/`cmd` | node (PowerShell path) |

**macOS/Linux** — detect runtime:
```bash
command -v bun 2>/dev/null || command -v node 2>/dev/null
```

If no runtime found, stop and tell the user to install Node.js (https://nodejs.org/) or Bun (https://bun.sh/), then restart their shell and re-run `/tokentone:setup`.

**Find plugin path** (sorted by semver, picks latest version):
```bash
ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/*/ 2>/dev/null \
  | awk -F/ '{ print $(NF-1) "\t" $0 }' \
  | grep -E '^[0-9]+\.[0-9]+\.[0-9]+\t' \
  | sort -t. -k1,1n -k2,2n -k3,3n \
  | tail -1 | cut -f2-
```

If empty, plugin is not installed — tell user to install first.

Determine source file:
- bun runtime → `src/statusline.ts` (runs TypeScript directly)
- node runtime → `dist/statusline.js`

Same for hook:
- bun → `src/hook.ts`
- node → `dist/hook.js`

---

## Step 2: Generate Commands

**Statusline command** (exports COLUMNS for correct width):

When runtime is **bun** (add `--env-file /dev/null`):
```
bash -c 'cols=$(stty size </dev/tty 2>/dev/null | awk '"'"'{print $2}'"'"'); export COLUMNS=$(( ${cols:-120} > 4 ? ${cols:-120} - 4 : 1 )); plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $0 }'"'"' | grep -E '"'"'^[0-9]+\.[0-9]+\.[0-9]+\t'"'"' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | cut -f2-); exec "{RUNTIME_PATH}" --env-file /dev/null "${plugin_dir}src/statusline.ts"'
```

When runtime is **node**:
```
bash -c 'cols=$(stty size </dev/tty 2>/dev/null | awk '"'"'{print $2}'"'"'); export COLUMNS=$(( ${cols:-120} > 4 ? ${cols:-120} - 4 : 1 )); plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $0 }'"'"' | grep -E '"'"'^[0-9]+\.[0-9]+\.[0-9]+\t'"'"' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | cut -f2-); exec "{RUNTIME_PATH}" "${plugin_dir}dist/statusline.js"'
```

**Hook command** (simpler — no COLUMNS needed):

When runtime is **bun**:
```
bash -c 'plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $0 }'"'"' | grep -E '"'"'^[0-9]+\.[0-9]+\.[0-9]+\t'"'"' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | cut -f2-); exec "{RUNTIME_PATH}" --env-file /dev/null "${plugin_dir}src/hook.ts"'
```

When runtime is **node**:
```
bash -c 'plugin_dir=$(ls -d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/*/ 2>/dev/null | awk -F/ '"'"'{ print $(NF-1) "\t" $0 }'"'"' | grep -E '"'"'^[0-9]+\.[0-9]+\.[0-9]+\t'"'"' | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 | cut -f2-); exec "{RUNTIME_PATH}" "${plugin_dir}dist/hook.js"'
```

---

## Step 3: Test Commands

Run the statusline command manually:
```bash
{GENERATED_STATUSLINE_COMMAND} 2>&1
```

It should output one line like `♪ lofi │ vol:70% │ ●` within 1-2 seconds.

- If it errors or hangs, do NOT proceed to Step 4. Debug first (check paths, runtime version).
- If it outputs nothing but exits cleanly, that's fine — it may need the config file, which setup will create.

---

## Step 4: Write Configuration

Read the existing settings file first, then merge in the new keys. Never overwrite unrelated settings.

**Settings file path:**
- macOS/Linux: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json`
- Windows PowerShell: `$env:CLAUDE_CONFIG_DIR` or `Join-Path $HOME ".claude"`

If the file doesn't exist, create it. If it contains invalid JSON, report the error and stop.

Merge the following structure (preserving all other keys):

```json
{
  "statusLine": {
    "type": "command",
    "command": "{GENERATED_STATUSLINE_COMMAND}"
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "{GENERATED_HOOK_COMMAND}"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "{GENERATED_HOOK_COMMAND}"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "{GENERATED_HOOK_COMMAND}"
          }
        ]
      }
    ]
  }
}
```

**Important when merging hooks**: If `hooks.PostToolUse` or `hooks.Stop` already exist in settings.json, append the new hook entry rather than replacing existing ones. Other hooks (e.g., from claude-hud or other plugins) must be preserved.

After writing, tell the user:

> ✅ TokenTone configured. **Please restart Claude Code** — quit and run `claude` again.
> After restarting, the statusline will show `♪ lofi │ vol:70% │ ●` and you'll hear audio when tools run.
> Run `/tokentone:configure` to change theme or volume.

---

## Step 5: Verify

After the user confirms they've restarted, ask:

Use AskUserQuestion:
- header: "Working?"
- question: "Is the TokenTone statusline showing below your input?"
- options: "Yes, I can see ♪ in the statusline" / "No, something's wrong"

**If yes**: Setup complete. Optionally ask if they'd like to star the repo on GitHub.

**If no**, debug:

1. Verify settings were written:
   ```bash
   cat "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json" | grep -A3 statusLine
   ```
2. Run statusline command manually and capture output + errors
3. Common issues:
   - **Runtime not found**: re-detect with `command -v node`
   - **Plugin not found**: check `ls "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/tokentone/`
   - **Didn't restart**: the statusLine config requires a full restart
