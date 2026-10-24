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
/* claude.ai's own design tokens (--cds-*) cascade into shadow roots, so CC++ looks and themes
   like the page. The literals are fallbacks for when claude.ai renames a token. */
.ccpp { --bg: var(--cds-surface-2, #ffffff); --bg-nav: var(--cds-surface-1, #f5f4ef); --bg2: var(--cds-fill-ghost-hover, #f0eee6); --bg3: var(--cds-fill-ghost-selected, #e8e6dc);
  --fg: var(--cds-text-primary, #1f1e1d); --fg2: var(--cds-text-secondary, #5e5d59); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(31,30,29,.12)); --line-soft: var(--cds-alpha-1, rgba(31,30,29,.06));
  --accent: var(--cds-fill-accent, #2a78d6); --accent-fg: #fff; --clay: #d97757; --ok: #3f9a5b; --warn: var(--cds-fill-warning, #c98a12); --bad: #d03b3b;
  --field: var(--cds-fill-field, transparent); --field-ring: var(--cds-fill-field-ring, rgba(31,30,29,.15));
  --radius: var(--cds-radius, 8px); --radius-card: calc(var(--cds-radius, 8px) + 4px); --h: var(--cds-h-control, 32px);
  --shadow: inset 0 0 0 var(--cds-ring-inner, 0) var(--cds-ring-color, transparent), 0 0 0 var(--cds-ring-outer, 1px) var(--cds-ring-color, rgba(31,30,29,.1)), var(--cds-shadow-lg, 0 8px 24px rgba(0,0,0,.14));
  --focus: var(--cds-focus-shadow, 0 0 0 2px #2a78d6);
  --fs: var(--cds-font-size-body, 14px); --fs-sm: var(--cds-font-size-footnote, 13px); --fs-xs: var(--cds-font-size-caption, 12px);
  font-size: var(--fs); line-height: 1.45; color: var(--fg); -webkit-font-smoothing: antialiased; }
.ccpp:not(.dark) { color-scheme: light; } .ccpp.dark { color-scheme: dark;
  --bg: var(--cds-surface-2, #262624); --bg-nav: var(--cds-surface-1, #1f1e1d); --bg2: var(--cds-fill-ghost-hover, rgba(255,255,255,.06)); --bg3: var(--cds-fill-ghost-selected, rgba(255,255,255,.1));
  --fg: var(--cds-text-primary, #f5f4ef); --fg2: var(--cds-text-secondary, #c2c0b6); --fg3: var(--cds-text-muted, #8f8d86);
  --line: var(--cds-alpha-2, rgba(255,255,255,.1)); --line-soft: var(--cds-alpha-1, rgba(255,255,255,.05)); --field-ring: var(--cds-fill-field-ring, rgba(255,255,255,.15)); }
.ccpp * { box-sizing: border-box; }
/* Scrollbars like claude.ai's (html: thin, a translucent text-colored thumb, no track); :host { all: initial }
   cuts the inherited value off, so it is set again here. */
.ccpp, .ccpp * { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--fg) 35%, transparent) transparent; }
.ccpp button { font: inherit; color: inherit; cursor: pointer; }
.ccpp :focus-visible { outline: none; box-shadow: var(--focus); }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: var(--h); padding: 0 12px; border-radius: var(--radius); border: 0; background: var(--bg2); color: var(--fg); white-space: nowrap; }
.btn:hover { background: var(--bg3); }
.btn.ghost { background: transparent; } .btn.ghost:hover { background: var(--bg2); }
.btn.primary { background: var(--fg); color: var(--bg); } .btn.primary:hover { opacity: .9; }
.btn.danger { color: var(--bad); }
.btn:disabled { opacity: .45; cursor: default; }
.icon-btn { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: var(--radius); border: 0; background: transparent; color: var(--fg3); }
.icon-btn:hover { background: var(--bg2); color: var(--fg); }
.icon-btn.on { color: var(--fg); }
.icon-btn:disabled { opacity: .35; pointer-events: none; }
.input { height: var(--h); padding: 0 10px; border-radius: var(--radius); border: 0; box-shadow: inset 0 0 0 1px var(--field-ring); background: var(--field); color: var(--fg); font: inherit; outline: none; width: 100%; }
.input::placeholder { color: var(--fg3); }
.input:focus, textarea.input:focus { outline: none; box-shadow: var(--focus); }
textarea.input { height: auto; padding: 8px 10px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; line-height: 1.5; }
select.input { padding-right: 6px; }
/* Same proportions as claude.ai's Switch: height h, width 1.8h, 2px inset knob. */
.switch { --sh: var(--cds-switch-h, 20px); position: relative; width: calc(var(--sh) * 1.8); height: var(--sh); flex: none; border-radius: 999px; border: 0; padding: 0; background: var(--cds-switch-track, rgba(127,127,127,.35)); transition: background .15s; }
.switch:hover { background: var(--cds-switch-track-hover, rgba(127,127,127,.45)); }
.switch::after { content: ""; position: absolute; top: 2px; left: 2px; width: calc(var(--sh) - 4px); height: calc(var(--sh) - 4px); border-radius: 50%; background: var(--cds-switch-knob, #fff); box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: transform .18s cubic-bezier(.3,1.4,.6,1); }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"]::after { transform: translateX(calc(var(--sh) * .8)); }
.switch:disabled { opacity: .45; cursor: default; }
.muted { color: var(--fg3); }
.badge { display: inline-flex; align-items: center; height: 18px; padding: 0 6px; border-radius: 6px; font-size: 11px; font-weight: 500; background: var(--bg3); color: var(--fg2); }
.badge.accent { background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); }
.badge.bad { background: color-mix(in srgb, var(--bad) 16%, transparent); color: var(--bad); }
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
/**
 * claude.ai sends stray typing to its composer: a key pressed while focus is in our shadow DOM looks to it like
 * typing on a bare element (the event is retargeted to our host), so it grabs focus and the text lands in the
 * composer instead of our search box. Registered before claude.ai's own scripts (the userscript runs at
 * document-start), this stops those keys from reaching any page listener. Nothing is prevented: the character
 * still goes into our field, and Enter, Escape, Tab and arrows pass through as usual.
 */
function isOurField(event: KeyboardEvent) {
    const target = event.composedPath()[0];
    if (!(target instanceof HTMLElement)) return false;
    const root = target.getRootNode();
    if (!(root instanceof ShadowRoot) || !(root.host as HTMLElement).hasAttribute?.("data-ccpp-shadow")) return false;
    return target.matches("input, textarea, select") || target.isContentEditable;
}
try {
    window.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const typing = event.key.length === 1 || ["Backspace", "Delete", "Process"].includes(event.key) || event.isComposing;
        if (typing && isOurField(event)) event.stopImmediatePropagation();
    }, true);
} catch {}

/** A shadow root carrying BASE_CSS whose wrapper follows claude.ai's theme and font. Not attached anywhere. */
export function shadowBox(css: string, tag: keyof HTMLElementTagNameMap = "div") {
    const host = document.createElement(tag);
    host.setAttribute("data-ccpp-shadow", "");
    const root = host.attachShadow({ mode: "open" });
    root.appendChild(h("style", { text: BASE_CSS + css }));
    const box = h("div", { class: "ccpp" });
    root.appendChild(box);
    const sync = () => {
        box.classList.toggle("dark", isDark());
        // Use claude.ai's own UI font.
        if (document.body) box.style.fontFamily = getComputedStyle(document.body).fontFamily;
    };
    sync();
    return { host, root, box, sync };
}

/**
 * A fixed, isolated layer: our CSS never leaks into claude.ai and claude.ai's never into us.
 * It follows claude.ai's light/dark mode and is removed when the scope ends.
 */
/**
 * Stacking: "page" layers (outlines, side widgets) sit with the page, under claude.ai's dialogs, menus
 * and tooltips (z-50 portals) and hide while a modal is open; "top" layers (toasts, our popovers) stay above all.
 */
const LAYER_Z = { page: "40", top: "2147483600" } as const;

export function createHost(scope: Scope, id: string, css: string, options: { fixed?: boolean; layer?: keyof typeof LAYER_Z } = {}): Host {
    const { host, root, box, sync } = shadowBox(css);
    host.id = `ccpp-${id}`;
    host.dataset.ccpp = id;
    const layer = options.layer ?? "top";
    host.dataset.ccppLayer = layer;
    if (options.fixed !== false) Object.assign(host.style, { position: "fixed", inset: "0", zIndex: LAYER_Z[layer], pointerEvents: "none" });
    if (layer === "page") ensurePageLayerCss();
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

let pageLayerCss: HTMLStyleElement | null = null;
/** Page layers step aside while claude.ai shows a modal dialog (settings, search, confirms). */
function ensurePageLayerCss() {
    if (pageLayerCss?.isConnected) return;
    pageLayerCss = document.createElement("style");
    pageLayerCss.id = "ccpp-page-layer";
    pageLayerCss.textContent = `body:has([role="dialog"][aria-modal="true"], [role="alertdialog"], [role="dialog"][data-perf-overlay]) > [data-ccpp-layer="page"] { visibility: hidden !important; }`;
    (document.head ?? document.documentElement).appendChild(pageLayerCss);
}
