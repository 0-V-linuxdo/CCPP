/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { h } from "./dom";

/**
 * Hover tooltips in claude.ai's own style (its data-cds="Tooltip"): a dark card 4px above the element, a 13px
 * title line and an optional 11px secondary line. CC++ elements opt in with `data-ccpp-tip` (and
 * `data-ccpp-tip-detail`) instead of `title`, which would show the browser's default tooltip. Works inside shadow
 * roots too; the card itself lives in the page so claude.ai's --cds-tooltip-* tokens apply.
 */
export const TIP = "data-ccpp-tip";
export const TIP_DETAIL = "data-ccpp-tip-detail";

/** Attributes for `h()`: `h("button", { ...tipAttrs("Copy"), … })`. */
export const tipAttrs = (title: string, detail?: string): Record<string, string> => (detail ? { [TIP]: title, [TIP_DETAIL]: detail } : { [TIP]: title });

let card: HTMLElement | null = null;
let current: Element | null = null;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let lastHidden = 0;

function ensureCard() {
    if (card?.isConnected) return card;
    card = h("div", {
        role: "tooltip",
        "data-ccpp-tooltip": "",
        style: {
            position: "fixed", zIndex: "2147483601", pointerEvents: "none", display: "none", flexDirection: "column", gap: "2px", maxWidth: "240px",
            padding: "6px 8px", borderRadius: "calc(0.375rem * var(--cds-rem-scale, 1))", background: "var(--cds-tooltip-bg, rgb(32,32,31))", color: "var(--cds-tooltip-fg, rgb(240,239,236))",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.1), 0 1px 2px rgba(11,11,11,.06), 0 2px 8px rgba(0,0,0,.24)",
            font: "400 calc(0.8125rem * var(--cds-rem-scale, 1))/calc(1.125rem * var(--cds-rem-scale, 1)) var(--cds-font-sans, ui-sans-serif, system-ui, sans-serif)",
            textWrap: "balance", whiteSpace: "normal", overflowWrap: "anywhere", textAlign: "start",
        },
    });
    document.body.appendChild(card);
    return card;
}

/** Shows the card for `anchor` now. Used by the delegated handler and by widgets that drive it themselves. */
export function showTip(anchor: Element, title: string, detail = "") {
    if (!title) return hideTip();
    const el = ensureCard();
    el.replaceChildren(
        h("span", { text: title }),
        ...(detail
            ? [h("span", { text: detail, style: { fontSize: "calc(0.6875rem * var(--cds-rem-scale, 1))", lineHeight: "calc(0.875rem * var(--cds-rem-scale, 1))", color: "rgb(195,194,183)" } })]
            : []),
    );
    el.style.display = "flex";
    const a = anchor.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    el.style.left = `${Math.min(Math.max(8, a.left + a.width / 2 - r.width / 2), window.innerWidth - r.width - 8)}px`;
    el.style.top = `${a.top - r.height - 4 >= 8 ? a.top - r.height - 4 : a.bottom + 4}px`;
    current = anchor;
}

export function hideTip() {
    clearTimeout(showTimer);
    if (card && card.style.display !== "none") lastHidden = Date.now();
    if (card) card.style.display = "none";
    current = null;
}

const tipTarget = (event: Event) => (event.composedPath().find(n => n instanceof Element && n.hasAttribute(TIP)) as Element | undefined) ?? null;

let installed = false;

/** Installs the page-wide handler once. Tooltips open after a short delay, or at once when moving between them. */
export function installTooltips() {
    if (installed) return;
    installed = true;
    document.addEventListener(
        "pointerover",
        event => {
            const target = tipTarget(event);
            if (target === current) return;
            clearTimeout(showTimer);
            if (!target) return hideTip();
            const open = () => target.isConnected && showTip(target, target.getAttribute(TIP) ?? "", target.getAttribute(TIP_DETAIL) ?? "");
            if (current || Date.now() - lastHidden < 400) open();
            else showTimer = setTimeout(open, 500);
        },
        true,
    );
    document.addEventListener("pointerout", event => !(event as PointerEvent).relatedTarget && hideTip(), true);
    for (const type of ["pointerdown", "keydown", "scroll", "blur"]) window.addEventListener(type, hideTip, true);
    // An element removed or re-rendered under the pointer never sees pointerout.
    setInterval(() => current && !current.isConnected && hideTip(), 500);
}
