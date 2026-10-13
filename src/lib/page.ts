/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

declare const unsafeWindow: Window | undefined;

/** The page's own window (the userscript sandbox's window under Tampermonkey's isolation). */
export const pageWindow: Window & typeof globalThis = (typeof unsafeWindow !== "undefined" && unsafeWindow ? unsafeWindow : window) as Window & typeof globalThis;

export const isClaudeHost = (host = location.hostname) => host === "claude.ai";

/** Run only in the top claude.ai document, never inside an embedded frame. */
export function isTopDocument() {
    if (!isClaudeHost()) return false;
    try {
        return window.top === window.self;
    } catch {
        return false;
    }
}

export const isDark = () => document.documentElement.dataset.mode === "dark" || (!document.documentElement.dataset.mode && matchMedia?.("(prefers-color-scheme: dark)").matches);
