/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { h } from "@lib/dom";
import { icon } from "@lib/icons";
import { createHost, type Host } from "@lib/ui";

export interface ToastOptions {
    title?: string;
    kind?: "info" | "ok" | "warn" | "error";
    /** 0 keeps it until dismissed. */
    timeoutMs?: number;
    onClick?(): void;
    /** A toast with the same key replaces the earlier one. */
    key?: string;
}

const CSS = `
.stack { position: fixed; top: 64px; right: 16px; display: flex; flex-direction: column; gap: 8px; width: min(340px, calc(100vw - 32px)); pointer-events: none; }
.toast { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 10px 10px 12px; border-radius: 12px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); animation: in .18s ease-out; }
.toast.click { cursor: pointer; }
.toast .dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; flex: none; background: var(--accent); }
.toast.ok .dot { background: var(--ok); } .toast.warn .dot { background: var(--warn); } .toast.error .dot { background: var(--bad); }
.toast .body { flex: 1; min-width: 0; } .toast .title { font-weight: 600; } .toast .text { color: var(--fg2); word-break: break-word; white-space: pre-line; }
@keyframes in { from { opacity: 0; transform: translateY(-6px); } }
`;

let host: Host | null = null;
let stack: HTMLElement | null = null;
const byKey = new Map<string, HTMLElement>();

/** Shows a small CC++ toast at the top right. Returns a function that closes it. */
export function toast(text: string, options: ToastOptions = {}) {
    if (!stack) return () => {};
    if (options.key) byKey.get(options.key)?.remove();
    const close = () => {
        el.remove();
        if (options.key && byKey.get(options.key) === el) byKey.delete(options.key);
    };
    const el = h(
        "div",
        { class: `toast ${options.kind ?? "info"}${options.onClick ? " click" : ""}`, role: "status" },
        h("span", { class: "dot" }),
        h("div", { class: "body" }, options.title ? h("div", { class: "title", text: options.title }) : null, h("div", { class: "text", text })),
        h("button", { class: "icon-btn", "aria-label": "Close", onclick: (e: Event) => (e.stopPropagation(), close()) }, icon("x", 14)),
    );
    if (options.onClick) el.addEventListener("click", () => (options.onClick!(), close()));
    if (options.key) byKey.set(options.key, el);
    stack.appendChild(el);
    const timeout = options.timeoutMs ?? 5000;
    if (timeout > 0) setTimeout(close, timeout);
    return close;
}

export default definePlugin({
    name: "NoticesApi",
    title: { zh: "提示条", en: "Notices API" },
    description: { zh: "右上角的 CC++ 提示条，供其它插件显示消息。", en: "CC++ toasts at the top right for other plugins." },
    category: "api",
    icon: "bell",
    hidden: true,
    start(scope) {
        host = createHost(scope, "notices", CSS);
        stack = h("div", { class: "stack" });
        host.box.appendChild(stack);
        scope.defer(() => {
            host = null;
            stack = null;
            byKey.clear();
        });
    },
});
