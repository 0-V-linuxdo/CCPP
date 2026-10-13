/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

const STYLE = "background:#d97757;color:#fff;border-radius:3px;padding:0 4px";

/** Console output tagged with CC++ and the plugin name, so ConsoleJanitor can tell it apart. */
export class Logger {
    static readonly TAG = "CC++";
    constructor(readonly name: string) {}
    private out(level: "debug" | "info" | "warn" | "error", args: unknown[]) {
        console[level](`%c${Logger.TAG}%c ${this.name}`, STYLE, "", ...args);
    }
    debug = (...args: unknown[]) => this.out("debug", args);
    info = (...args: unknown[]) => this.out("info", args);
    warn = (...args: unknown[]) => this.out("warn", args);
    error = (...args: unknown[]) => this.out("error", args);
}
