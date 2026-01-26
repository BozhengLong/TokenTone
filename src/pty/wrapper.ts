import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Tokenizer } from './tokenizer';

// Try to import node-pty
let pty: typeof import('node-pty') | null = null;
try {
  pty = require('node-pty');
} catch {
  // node-pty not available
}

export interface WrapperOptions {
  command: string;
  args: string[];
  onToken?: (token: string) => void;
  onData?: (data: string) => void;
  onExit?: (code: number) => void;
}

export class PTYWrapper extends EventEmitter {
  private process: ChildProcess | null = null;
  private tokenizer: Tokenizer;
  private outputFile: string | null = null;
  private watcher: fs.FSWatcher | null = null;
  private lastSize = 0;

  constructor() {
    super();
    this.tokenizer = new Tokenizer();
  }

  spawn(options: WrapperOptions): void {
    const shell = process.env.SHELL || '/bin/zsh';
    const fullCommand = [options.command, ...options.args].join(' ');

    // Try node-pty first
    if (pty) {
      try {
        this.spawnWithPty(shell, fullCommand, options);
        return;
      } catch {
        // Fall through
      }
    }

    // Use script command to capture output while maintaining TTY
    this.spawnWithScript(fullCommand, options);
  }

  private spawnWithPty(shell: string, command: string, options: WrapperOptions): void {
    const ptyProcess = pty!.spawn(shell, ['-c', command], {
      name: 'xterm-256color',
      cols: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
      cwd: process.cwd(),
      env: process.env as { [key: string]: string },
    });

    ptyProcess.onData((data: string) => {
      process.stdout.write(data);
      this.handleData(data, options);
    });

    ptyProcess.onExit(({ exitCode }) => {
      if (options.onExit) options.onExit(exitCode);
      this.emit('exit', exitCode);
    });

    process.stdout.on('resize', () => {
      ptyProcess.resize(
        process.stdout.columns || 80,
        process.stdout.rows || 24
      );
    });

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', (data) => {
      ptyProcess.write(data.toString());
    });
  }

  private spawnWithScript(command: string, options: WrapperOptions): void {
    // Create temp file for output capture
    this.outputFile = path.join(os.tmpdir(), `tokentone-${Date.now()}.log`);

    // Use 'script' command to capture output while maintaining TTY
    // -q: quiet mode, -F: flush after each write
    const scriptArgs = process.platform === 'darwin'
      ? ['-q', '-F', this.outputFile, '/bin/zsh', '-c', command]
      : ['-q', '-f', this.outputFile, '-c', command];

    const child = spawn('script', scriptArgs, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: process.env,
    });

    this.process = child;

    // Watch the output file for changes
    this.startWatching(options);

    child.on('exit', (code) => {
      this.stopWatching();
      if (options.onExit) options.onExit(code ?? 0);
      this.emit('exit', code ?? 0);
    });
  }

  private startWatching(options: WrapperOptions): void {
    if (!this.outputFile) return;

    // Ensure file exists
    fs.writeFileSync(this.outputFile, '');

    // Poll the file for changes (more reliable than fs.watch)
    const pollInterval = setInterval(() => {
      if (!this.outputFile || !fs.existsSync(this.outputFile)) return;

      const stats = fs.statSync(this.outputFile);
      if (stats.size > this.lastSize) {
        const fd = fs.openSync(this.outputFile, 'r');
        const buffer = Buffer.alloc(stats.size - this.lastSize);
        fs.readSync(fd, buffer, 0, buffer.length, this.lastSize);
        fs.closeSync(fd);

        const newData = buffer.toString();
        this.lastSize = stats.size;
        this.handleData(newData, options);
      }
    }, 50); // Poll every 50ms

    // Store interval ID for cleanup
    (this as any)._pollInterval = pollInterval;
  }

  private stopWatching(): void {
    if ((this as any)._pollInterval) {
      clearInterval((this as any)._pollInterval);
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    // Clean up temp file
    if (this.outputFile && fs.existsSync(this.outputFile)) {
      try {
        fs.unlinkSync(this.outputFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  private handleData(data: string, options: WrapperOptions): void {
    if (options.onData) options.onData(data);
    this.emit('data', data);

    const tokens = this.tokenizer.tokenize(data);
    for (const token of tokens) {
      if (options.onToken) options.onToken(token);
      this.emit('token', token);
    }
  }

  kill(): void {
    this.stopWatching();
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  write(data: string): void {
    if (this.process?.stdin) {
      this.process.stdin.write(data);
    }
  }
}
