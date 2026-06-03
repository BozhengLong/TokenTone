// Smoke tests for the TokenTone plugin entry points.
// No framework — plain Node. execFileSync throws on a non-zero exit,
// which is the assertion for "the script ran and exited cleanly".
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// Isolate runtime state in a throwaway dir so tests never touch the real
// ~/.claude/plugins/tokentone/state.json.
const env = { ...process.env, CLAUDE_CONFIG_DIR: mkdtempSync(join(tmpdir(), 'tokentone-test-')) };

function run(script, input) {
  return execFileSync('node', [script], { input, env, encoding: 'utf8', timeout: 5000 });
}

// 1. statusline renders a single line containing the note glyph.
const status = run('dist/statusline.js', '');
assert.match(status, /♪/, 'statusline should print the ♪ glyph');
assert.match(status, /vol:\d+%/, 'statusline should print a volume percentage');

// 2. hook advances the state machine for a real event and exits cleanly.
run('dist/hook.js', JSON.stringify({ hook_event_name: 'UserPromptSubmit' }));
run('dist/hook.js', JSON.stringify({ hook_event_name: 'PostToolUse' }));
run('dist/hook.js', JSON.stringify({ hook_event_name: 'Stop' }));

// 3. hook ignores unknown / empty events without erroring.
run('dist/hook.js', '{}');
run('dist/hook.js', JSON.stringify({ hook_event_name: 'SomethingElse' }));

console.log('smoke: ok');
