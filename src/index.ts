#!/usr/bin/env node

import { Command } from 'commander';
import { PTYWrapper } from './pty/wrapper';
import { AudioEngine } from './audio/engine';
import { getTheme, getAllThemes, isValidTheme, ThemeName } from './themes';

const program = new Command();

program
  .name('tokentone')
  .description('Add real-time music effects to AI CLI tool token output')
  .version('0.1.0')
  .enablePositionalOptions()
  .passThroughOptions();

// Main command: wrap a command with audio
program
  .argument('[command...]', 'Command to run with audio effects')
  .option('-v, --volume <level>', 'Volume level (0.0-1.0)', '0.7')
  .option('-t, --theme <name>', 'Audio theme (lofi, ambient, synthwave)', 'lofi')
  .option('--no-audio', 'Disable audio (passthrough mode)')
  .action(async (commandArgs: string[], options) => {
    if (commandArgs.length === 0) {
      program.help();
      return;
    }

    const command = commandArgs[0];
    const args = commandArgs.slice(1);

    // Validate theme
    if (!isValidTheme(options.theme)) {
      console.error(`Invalid theme: ${options.theme}`);
      console.error(`Available themes: lofi, ambient, synthwave`);
      process.exit(1);
    }

    const volume = parseFloat(options.volume);
    if (isNaN(volume) || volume < 0 || volume > 1) {
      console.error('Volume must be a number between 0.0 and 1.0');
      process.exit(1);
    }

    const theme = getTheme(options.theme as ThemeName);

    // Initialize audio engine
    const audioEngine = new AudioEngine({
      volume,
      theme,
      enabled: options.audio !== false,
    });

    await audioEngine.initialize();

    // Create PTY wrapper
    const wrapper = new PTYWrapper();

    // Handle graceful shutdown
    const cleanup = () => {
      wrapper.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Spawn the command
    wrapper.spawn({
      command,
      args,
      onToken: (token) => {
        audioEngine.onToken(token);
      },
      onExit: (code) => {
        process.exit(code);
      },
    });
  });

// Themes subcommand
program
  .command('themes')
  .description('List or preview available themes')
  .option('--preview <name>', 'Preview a theme')
  .action((options) => {
    if (options.preview) {
      if (!isValidTheme(options.preview)) {
        console.error(`Invalid theme: ${options.preview}`);
        process.exit(1);
      }
      const theme = getTheme(options.preview as ThemeName);
      console.log(`\nPreviewing theme: ${theme.displayName}`);
      console.log(`Description: ${theme.description}`);
      console.log(`BPM: ${theme.bpm} (range: ${theme.bpmRange[0]}-${theme.bpmRange[1]})`);
      console.log(`Characteristics:`);
      theme.characteristics.forEach(c => console.log(`  - ${c}`));
      console.log('\n(Audio preview not yet implemented)\n');
      return;
    }

    // List all themes
    console.log('\nAvailable themes:\n');
    const themes = getAllThemes();
    themes.forEach(theme => {
      console.log(`  ${theme.name.padEnd(12)} ${theme.displayName}`);
      console.log(`  ${''.padEnd(12)} ${theme.description}`);
      console.log(`  ${''.padEnd(12)} BPM: ${theme.bpm}\n`);
    });
  });

program.parse();
