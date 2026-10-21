/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Scope } from "@kernel/scope";

import { clear, h } from "./dom";
import { anchorPosition, createHost } from "./ui";

const POPOVER_CSS = `
.panel { position: fixed; width: var(--w, 300px); max-height: min(70vh, 560px); overflow: auto; padding: 12px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: flex; flex-direction: column; gap: 10px; animation: pop .12s ease-out; }
@keyframes pop { from { opacity: 0; transform: translateY(4px); } }
.top { display: flex; align-items: center; gap: 6px; } .top b { flex: 1; font-size: 14px; }
/* A popover's header (and anything marked .sticky after it) stays put while its list scrolls. */
.panel > .top { position: sticky; top: -12px; z-index: 2; margin: -12px -12px 0; padding: 12px 12px 4px; background: var(--bg); }
.msg { color: var(--fg2); } .msg.bad { color: var(--bad); }
.item { display: flex; align-items: flex-start; gap: 8px; width: 100%; padding: 7px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; }
.item:hover, .item.active { background: var(--bg2); }
.item .grow { flex: 1; min-width: 0; } .item .sub { color: var(--fg3); font-size: 12px; }
.clip { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.clip2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
`;

export interface Popover {
    open(anchor: HTMLElement, render: (panel: HTMLElement, close: () => void) => void): void;
    close(): void;
    /** Re-runs the last render (e.g. after data changed). */
    update(): void;
    isOpen(): boolean;
}

/** A panel anchored to a button; closes on outside click, Escape, resize, or a second click on the anchor. */
export function createPopover(scope: Scope, id: string, css = "", width = 300): Popover {
    let sub: Scope | null = null;
    let panel: HTMLElement | null = null;
    let anchor: HTMLElement | null = null;
    let renderFn: ((panel: HTMLElement, close: () => void) => void) | null = null;

    const close = () => {
        sub?.dispose();
        sub = null;
        panel = null;
        anchor = null;
    };
    const draw = () => {
        if (!panel || !anchor || !renderFn) return;
        if (!anchor.isConnected) return close();
        clear(panel);
        renderFn(panel, close);
        anchorPosition(anchor, panel);
    };
    const open = (from: HTMLElement, render: (panel: HTMLElement, close: () => void) => void) => {
        if (panel && anchor === from) return close();
        close();
        sub = scope.child();
        const host = createHost(sub, id, POPOVER_CSS + css);
        panel = h("div", { class: "panel", role: "dialog", style: { "--w": `${width}px` } as unknown as Partial<CSSStyleDeclaration> });
        panel.style.setProperty("--w", `${width}px`);
        host.box.appendChild(panel);
        anchor = from;
        renderFn = render;
        draw();
        sub.listen(document, "pointerdown", (event: PointerEvent) => {
            const path = event.composedPath();
            if (!path.includes(host.host) && !(anchor && path.includes(anchor))) close();
        }, { capture: true });
        sub.listen(window, "keydown", (event: KeyboardEvent) => event.key === "Escape" && close());
        sub.listen(window, "resize", close);
    };
    scope.defer(close);
    return { open, close, update: draw, isOpen: () => !!panel };
}
