/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { isEditable } from "@lib/dom";

export interface Combo {
    key: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** "mod+shift+k", "ctrl+`", "alt+arrowup" — "mod" is Cmd on macOS and Ctrl elsewhere. */
export function parseCombo(spec: string): Combo {
    const parts = spec.toLowerCase().split("+").map(s => s.trim()).filter(Boolean);
    const combo: Combo = { key: "", ctrl: false, alt: false, shift: false, meta: false };
    for (const part of parts) {
        if (part === "mod") combo[isMac() ? "meta" : "ctrl"] = true;
        else if (part === "ctrl" || part === "control") combo.ctrl = true;
        else if (part === "alt" || part === "option") combo.alt = true;
        else if (part === "shift") combo.shift = true;
        else if (part === "meta" || part === "cmd") combo.meta = true;
        else combo.key = part;
    }
    return combo;
}

const CODE_KEYS: Record<string, string> = { Backquote: "`", Comma: ",", Period: ".", Slash: "/", Semicolon: ";", BracketLeft: "[", BracketRight: "]" };

export function matches(event: KeyboardEvent, combo: Combo) {
    const key = CODE_KEYS[event.code] ?? (event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : event.code.startsWith("Digit") ? event.code.slice(5) : event.key.toLowerCase());
    return key === combo.key && event.ctrlKey === combo.ctrl && event.altKey === combo.alt && event.shiftKey === combo.shift && event.metaKey === combo.meta;
}

export function comboLabel(spec: string) {
    const combo = parseCombo(spec);
    const mac = isMac();
    const parts = [combo.ctrl && (mac ? "⌃" : "Ctrl"), combo.alt && (mac ? "⌥" : "Alt"), combo.shift && (mac ? "⇧" : "Shift"), combo.meta && (mac ? "⌘" : "Win"), combo.key.length === 1 ? combo.key.toUpperCase() : combo.key];
    return parts.filter(Boolean).join(mac ? "" : "+");
}

/** Binds a shortcut for the scope's lifetime. Ignored while typing unless `inInputs`. */
export function bindKey(scope: Scope, spec: string, fn: (event: KeyboardEvent) => void, options: { inInputs?: boolean } = {}) {
    const combo = parseCombo(spec);
    scope.listen(
        window,
        "keydown",
        (event: KeyboardEvent) => {
            if (event.isComposing || !matches(event, combo)) return;
            if (!options.inInputs && isEditable(event.target)) return;
            event.preventDefault();
            event.stopPropagation();
            fn(event);
        },
        { capture: true },
    );
}

export default definePlugin({
    name: "HotkeysApi",
    title: { zh: "快捷键", en: "Hotkeys API" },
    description: { zh: "统一注册快捷键（mod 在 macOS 上是 ⌘，其它系统是 Ctrl）。", en: "Shortcut registration for plugins (mod = ⌘ on macOS, Ctrl elsewhere)." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {},
});
