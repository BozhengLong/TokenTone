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

  // Characters that typically indicate word/token boundaries
  private static readonly DELIMITERS = /[\s\n\r\t.,;:!?()[\]{}'"<>\/\\|`~@#$%^&*+=\-_]/;

  // ANSI escape sequence pattern
  private static readonly ANSI_ESCAPE = /\x1b\[[0-9;]*[a-zA-Z]/g;

  tokenize(data: string): string[] {
    // Strip ANSI escape sequences
    const cleanData = data.replace(Tokenizer.ANSI_ESCAPE, '');

    if (!cleanData.trim()) {
      return [];
    }

    // Split by delimiters but keep meaningful chunks
    const tokens = cleanData
      .split(Tokenizer.DELIMITERS)
      .filter(t => t.length > 0);

    // Update stats
    const now = Date.now();
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
  }
}
