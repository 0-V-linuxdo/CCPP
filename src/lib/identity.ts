/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Scope } from "@kernel/scope";
import { SEL } from "@api/dom/selectors";

/** Where an avatar's own aria-label is kept while CustomIdentity shows another name. */
export const ORIG_LABEL = "data-ccpp-orig-label";

let known = "";

/** Your real display name, as claude.ai labels the avatar on the account button (kept across our own edits). */
export function realName() {
    const avatar = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`);
    const label = (avatar?.getAttribute(ORIG_LABEL) ?? avatar?.getAttribute("aria-label") ?? "").trim();
    if (label) known = label;
    return known;
}

/** The account button(s) and any open account menu: everywhere claude.ai shows who you are. */
export const identityRoots = (): Element[] => [...document.querySelectorAll(SEL.userMenuButton), ...document.querySelectorAll(SEL.accountMenu)];

export function textNodes(root: Node): Text[] {
    const out: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) out.push(node as Text);
    return out;
}

/**
 * Text we rewrote in claude.ai's DOM, so it can be put back. A node is only restored while it
 * still shows our text; if React has written something new since, that stays.
 */
export class TextSwaps {
    private swaps = new Map<Text, { original: string; ours: string }>();

    set(node: Text, ours: string) {
        if (node.data === ours) return;
        const prev = this.swaps.get(node);
        const original = prev && node.data === prev.ours ? prev.original : node.data;
        this.swaps.set(node, { original, ours });
        node.data = ours;
    }

    /** The text claude.ai put there, before any swap. */
    original(node: Text) {
        const swap = this.swaps.get(node);
        return swap && node.data === swap.ours ? swap.original : node.data;
    }

    restore(node?: Text) {
        for (const [n, swap] of node ? ([[node, this.swaps.get(node)]] as const) : [...this.swaps]) {
            if (!swap) continue;
            if (n.isConnected && n.data === swap.ours) n.data = swap.original;
            this.swaps.delete(n);
        }
    }

    /** Forgets nodes that left the page. */
    prune() {
        for (const n of this.swaps.keys()) if (!n.isConnected) this.swaps.delete(n);
    }
}

/**
 * Runs `paint` now and (batched) after DOM, text or aria-label changes while the scope lives.
 * Our own writes trigger one more pass, which finds nothing left to change.
 */
export function repaintOnChange(scope: Scope, paint: () => void) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
        timer = null;
        if (scope.alive) paint();
    };
    const observer = new MutationObserver(() => (timer ??= setTimeout(run, 60)));
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
    scope.defer(() => {
        observer.disconnect();
        if (timer) clearTimeout(timer);
    });
    paint();
}
