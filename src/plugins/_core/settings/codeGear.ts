/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Scope } from "@kernel/scope";
import { watch } from "@api/dom";

import { NATIVE_DIALOG } from "./layer";

/**
 * The gear at the bottom of the Code page's sidebar opens claude.ai's settings on its Code page.
 * This makes it land on CC++'s Plugins page in that same dialog instead, so claude.ai's own pages
 * stay one click away in the nav. Alt / Shift / Ctrl / Cmd + click keeps the original behaviour.
 */

const onCodePage = () => location.pathname === "/code" || location.pathname.startsWith("/code/");
/** Places a click must not come from: menus, dialogs, the account menu button, our own UI. */
const SKIP = '[role="dialog"], [role="menu"], [role="listbox"], [data-testid^="user-menu"], [data-ccpp-host], [data-ccpp-item], [aria-haspopup="menu"]';
const SETTINGS_WORD = /setting|设置|設定/i;

const SIDEBAR = '[aria-label="Sidebar"], [data-testid="sidebar"], nav, aside';
/** In the sidebar, or failing a landmark, down in the bottom-left corner where the gear sits. */
function inSidebar(el: Element) {
    if (el.closest(SIDEBAR)) return true;
    const rect = el.getBoundingClientRect();
    return rect.right < Math.min(420, innerWidth * 0.4) && rect.top > innerHeight * 0.6;
}

/** Labelled like a settings button, or linking to #settings. */
function isGear(el: Element) {
    if (!inSidebar(el)) return false;
    const label = [el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("data-testid"), el.getAttribute("data-ccpp-tip")].filter(Boolean).join(" ");
    if (SETTINGS_WORD.test(label)) return true;
    const href = el.getAttribute("href") ?? "";
    return href.includes("#settings");
}

/** The dialog came up on claude.ai's Code page, the one the gear opens. */
function openedOnCode(dialog: HTMLElement) {
    if (location.hash === "#settings/claude-code") return true;
    const current = dialog.querySelector<HTMLElement>('[data-perf-region="settings_nav"] li:not([data-ccpp-nav]) > button[aria-current]');
    const text = current?.textContent?.trim() ?? "";
    return /^(claude )?code$|^代码$/i.test(text);
}

export function installCodeGear(scope: Scope, enabled: () => boolean, open: () => void) {
    /** A click on some other button just now; if the settings dialog follows on its Code page, that was the gear. */
    let armed = 0;
    // In case the gear acts on press rather than click, swallow the press too.
    const press = (event: MouseEvent) => {
        if (!enabled() || !onCodePage() || event.button !== 0 || event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
        const el = (event.target as Element | null)?.closest?.("button, a, [role='button']");
        if (el && !el.closest(SKIP) && isGear(el)) event.stopImmediatePropagation();
    };
    scope.listen(document, "pointerdown", press, { capture: true });
    scope.listen(document, "mousedown", press, { capture: true });
    scope.listen(
        document,
        "click",
        (event: MouseEvent) => {
            if (!enabled() || !onCodePage() || event.button !== 0) return;
            if (event.altKey || event.shiftKey || event.ctrlKey || event.metaKey) return;
            const el = (event.target as Element | null)?.closest?.("button, a, [role='button']");
            if (!el || el.closest(SKIP) || !inSidebar(el)) return;
            if (isGear(el)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                open();
                return;
            }
            armed = Date.now();
        },
        { capture: true },
    );
    // Fallback for when the gear carries no settings label: hop to CC++ once the dialog shows up.
    watch(scope, NATIVE_DIALOG, dialog => {
        if (!enabled() || !onCodePage() || Date.now() - armed > 1500) return;
        armed = 0;
        const timer = setTimeout(() => {
            if (dialog.isConnected && openedOnCode(dialog)) open();
        }, 150);
        return () => clearTimeout(timer);
    });
}
