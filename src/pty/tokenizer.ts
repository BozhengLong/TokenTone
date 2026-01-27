export interface TokenStats {
  tokenCount: number;
  tokensPerSecond: number;
  lastTokenTime: number;
}

export class Tokenizer {
  private tokenCount = 0;
  private windowStart = Date.now();
  private windowTokens = 0;
  private lastTokenTime = Date.now();
  private lastDataTime = 0;
  private pendingBuffer = '';

  // Characters that typically indicate word/token boundaries
  private static readonly DELIMITERS = /[\s\n\r\t.,;:!?()[\]{}'\"<>\/\\|`~@#$%^&*+=\-_]/;

  // ANSI escape sequence pattern
  private static readonly ANSI_ESCAPE = /\x1b\[[0-9;]*[a-zA-Z]/g;

  // Spinner/loading animation characters to filter out
  // Common spinners: ⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ (braille), ◐◓◑◒, ⣾⣽⣻⢿⡿⣟⣯⣷, |/-\, ◴◷◶◵
  private static readonly SPINNER_CHARS = /[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏◐◓◑◒⣾⣽⣻⢿⡿⣟⣯⣷◴◷◶◵⠁⠂⠄⡀⢀⠠⠐⠈▁▂▃▄▅▆▇█▉▊▋▌▍▎▏⎺⎻⎼⎽─━│┃┄┅┆┇┈┉┊┋⋮⋯⋰⋱]/g;

  // Minimum burst size to consider as AI output (not user typing)
  private static readonly MIN_BURST_SIZE = 3;

  // Time threshold to detect typing vs AI output (ms)
  private static readonly BURST_THRESHOLD_MS = 100;

  tokenize(data: string): string[] {
    const now = Date.now();
    const timeSinceLastData = now - this.lastDataTime;
    this.lastDataTime = now;

    // Strip ANSI escape sequences
    let cleanData = data.replace(Tokenizer.ANSI_ESCAPE, '');

    // Strip spinner/loading animation characters
    cleanData = cleanData.replace(Tokenizer.SPINNER_CHARS, '');

    // Also filter out common spinner patterns like |/-\ and dots
    cleanData = cleanData.replace(/^[\s]*[|/\-\\•·.…]+[\s]*$/g, '');

    if (!cleanData.trim()) {
      return [];
    }

    // Detect if this is likely user input or spinner animation
    // User typing / spinner characteristics:
    // 1. Small chunks (1-2 characters at a time)
    // 2. Slow arrival (> 100ms between chunks) OR very fast (spinner updates)
    const isLikelyUserInputOrSpinner =
      cleanData.length <= 2 &&
      timeSinceLastData > Tokenizer.BURST_THRESHOLD_MS;

    if (isLikelyUserInputOrSpinner) {
      this.pendingBuffer += cleanData;
      return [];
    }

    // If we get a burst of data, process it (likely AI output)
    const dataToProcess = this.pendingBuffer + cleanData;
    this.pendingBuffer = '';

    // Only process if we have enough content (likely AI output)
    if (dataToProcess.length < Tokenizer.MIN_BURST_SIZE) {
      return [];
    }

    // Split by delimiters but keep meaningful chunks
    const tokens = dataToProcess
      .split(Tokenizer.DELIMITERS)
      .filter(t => t.length > 0);

    // Update stats
    this.tokenCount += tokens.length;
    this.windowTokens += tokens.length;
    this.lastTokenTime = now;

    // Reset window every second
    if (now - this.windowStart >= 1000) {
      this.windowStart = now;
      this.windowTokens = tokens.length;
    }

    return tokens;
  }

  getStats(): TokenStats {
    const now = Date.now();
    const windowDuration = Math.max(1, (now - this.windowStart) / 1000);

    return {
      tokenCount: this.tokenCount,
      tokensPerSecond: this.windowTokens / windowDuration,
      lastTokenTime: this.lastTokenTime,
    };
  }

  reset(): void {
    this.tokenCount = 0;
    this.windowStart = Date.now();
    this.windowTokens = 0;
    this.lastTokenTime = Date.now();
    this.lastDataTime = 0;
    this.pendingBuffer = '';
  }
}
