/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Scope } from "@kernel/scope";

import { h } from "./dom";
import { isDark } from "./page";

/** Colours and controls shared by every CC++ surface. Lives inside each shadow root. */
export const BASE_CSS = `
:host { all: initial; }
.ccpp { --bg: #ffffff; --bg2: #f5f4ef; --bg3: #ebe9e1; --fg: #1f1e1d; --fg2: #5e5d59; --fg3: #8f8d86; --line: rgba(31,30,29,.12);
  --accent: #d97757; --accent-fg: #fff; --ok: #3f9a5b; --warn: #c98a12; --bad: #d1453b; --shadow: 0 8px 32px rgba(0,0,0,.18);
  font: 13px/1.45 ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: var(--fg); }
.ccpp.dark { --bg: #262624; --bg2: #30302e; --bg3: #3a3a37; --fg: #f5f4ef; --fg2: #c2c0b6; --fg3: #8f8d86; --line: rgba(255,255,255,.1); --shadow: 0 8px 32px rgba(0,0,0,.5); }
.ccpp * { box-sizing: border-box; }
.ccpp button { font: inherit; color: inherit; cursor: pointer; }
.btn { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg2); }
.btn:hover { background: var(--bg3); }
.btn.primary { background: var(--accent); color: var(--accent-fg); border-color: transparent; }
.btn.danger { color: var(--bad); }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--fg2); }
.icon-btn:hover { background: var(--bg3); color: var(--fg); }
.icon-btn.on { color: var(--accent); }
.input { height: 30px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--fg); font: inherit; outline: none; width: 100%; }
.input:focus, textarea.input:focus { border-color: var(--accent); }
textarea.input { height: auto; padding: 8px 10px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; }
.switch { position: relative; width: 34px; height: 20px; flex: none; border-radius: 10px; border: 0; background: var(--bg3); padding: 0; transition: background .15s; }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.3); transition: transform .15s; }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"]::after { transform: translateX(14px); }
.switch:disabled { opacity: .5; cursor: not-allowed; }
.muted { color: var(--fg3); }
.badge { display: inline-block; padding: 0 6px; border-radius: 6px; font-size: 11px; line-height: 18px; background: var(--bg3); color: var(--fg2); }
.badge.accent { background: var(--accent); color: var(--accent-fg); }
.badge.bad { background: var(--bad); color: #fff; }
@media (prefers-reduced-motion: reduce) { .ccpp * { transition: none !important; animation: none !important; } }
`;

export interface Host {
    host: HTMLElement;
    root: ShadowRoot;
    /** Wrapper inside the shadow root that carries the theme class. */
    box: HTMLElement;
}

/**
 * A fixed, isolated layer: our CSS never leaks into claude.ai and claude.ai's never into us.
 * It follows claude.ai's light/dark mode and is removed when the scope ends.
 */
export function createHost(scope: Scope, id: string, css: string, options: { fixed?: boolean } = {}): Host {
    const host = h("div", { id: `ccpp-${id}`, "data-ccpp": id });
    if (options.fixed !== false) Object.assign(host.style, { position: "fixed", inset: "0", zIndex: "2147483600", pointerEvents: "none" });
    const root = host.attachShadow({ mode: "open" });
    root.appendChild(h("style", { text: BASE_CSS + css }));
    const box = h("div", { class: "ccpp" });
    root.appendChild(box);
    const sync = () => box.classList.toggle("dark", isDark());
    sync();
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, sync);
    const attach = () => {
        if (document.body && host.parentNode !== document.body) document.body.appendChild(host);
    };
    attach();
    if (!document.body) scope.listen(document, "DOMContentLoaded", attach, { once: true });
    // claude.ai sometimes replaces body children; put the layer back if it goes missing.
    scope.interval(attach, 2000);
    scope.defer(() => host.remove());
    return { host, root, box };
}

/** Simple popover anchored to an element; closes on outside click and Escape. */
export function anchorPosition(anchor: Element, panel: HTMLElement, gap = 8) {
    const rect = anchor.getBoundingClientRect();
    const { innerWidth: vw, innerHeight: vh } = window;
    const width = panel.offsetWidth || 280;
    const height = panel.offsetHeight || 200;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(vw - width - 8, left));
    const above = rect.top - gap - height;
    const top = above >= 8 || rect.bottom + gap + height > vh ? Math.max(8, above) : rect.bottom + gap;
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
}
