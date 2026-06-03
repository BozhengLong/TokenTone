#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const DIM = '\x1b[2m';
const YELLOW = '\x1b[33m';
function main() {
    const config = (0, config_1.loadConfig)();
    const themeLabel = `${CYAN}${config.theme}${RESET}`;
    const volPct = Math.round(config.volume * 100);
    const volLabel = `${DIM}vol:${volPct}%${RESET}`;
    let statusDot;
    if (config.enabled) {
        statusDot = `${GREEN}●${RESET}`;
    }
    else {
        statusDot = `${DIM}○${RESET}`;
    }
    const note = config.enabled ? `${YELLOW}♪${RESET}` : `${DIM}♪${RESET}`;
    process.stdout.write(`${note} ${themeLabel} │ ${volLabel} │ ${statusDot}\n`);
}
main();
//# sourceMappingURL=statusline.js.map