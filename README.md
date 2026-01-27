# TokenTone

Add real-time music effects to AI CLI tool token output. TokenTone wraps CLI commands and plays audio samples synchronized with text output, creating an ambient soundtrack while you work with AI tools.

## Features

- Wrap any CLI command with audio effects
- Multiple audio themes (lofi, ambient, synthwave)
- Token-aware audio triggering based on output patterns
- Adjustable volume control
- Special `ask` command for Claude CLI integration

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tokentone.git
cd tokentone

# Install dependencies
npm install

# Build the project
npm run build

# Link globally (optional)
npm link
```

### Requirements

- Node.js >= 18.0.0
- A command-line audio player (afplay on macOS, aplay on Linux, or similar)
- Claude CLI (for the `ask` command)

## Usage

### Wrap any command

```bash
tokentone <command> [args...]
```

Example:
```bash
tokentone claude "What is the meaning of life?"
```

### Options

- `-v, --volume <level>` - Volume level from 0.0 to 1.0 (default: 0.7)
- `-t, --theme <name>` - Audio theme: lofi, ambient, or synthwave (default: lofi)
- `--no-audio` - Disable audio (passthrough mode)

### List available themes

```bash
tokentone themes
```

### Preview a theme

```bash
tokentone themes --preview lofi
```

### Ask Claude directly

The `ask` command provides a streamlined way to query Claude with audio effects:

```bash
tokentone ask "Explain quantum computing in simple terms"
tokentone ask -t synthwave "Write a haiku about coding"
```

## Themes

| Theme | Description | BPM |
|-------|-------------|-----|
| lofi | Chill lo-fi hip hop beats | 85 |
| ambient | Atmospheric soundscapes | 60 |
| synthwave | Retro 80s electronic vibes | 110 |

## Architecture

```
tokentone/
├── src/
│   ├── index.ts        # CLI entry point
│   ├── audio/
│   │   └── engine.ts   # Audio playback engine
│   ├── pty/
│   │   ├── wrapper.ts  # PTY wrapper for command execution
│   │   └── tokenizer.ts # Token detection
│   └── themes/         # Theme definitions
└── assets/
    └── samples/        # Audio sample files
```

## Known Limitations

- **Claude CLI streaming**: The Claude CLI does not support true streaming output. The `ask` command simulates streaming by processing the complete response and outputting it character by character with audio effects.
- **PTY-based wrapping**: When wrapping commands with `tokentone <command>`, audio is triggered based on PTY output chunks, which may not align perfectly with actual token boundaries.

## License

MIT
