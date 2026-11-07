/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Scope } from "@kernel/scope";
import { glyph, icon } from "@lib/icons";
import { onDomChange, watch } from "@api/dom";

import { NATIVE_DIALOG } from "./layer";

/**
 * The gear at the bottom of the Code page's sidebar opens claude.ai's settings on its Code page.
 * This makes it land on CC++'s Plugins page in that same dialog instead, so claude.ai's own pages
 * stay one click away in the nav. Alt / Shift / Ctrl / Cmd + click keeps the original behaviour.
 * Its gear icon is swapped for CC++'s sliders icon, so the button reads as the CC++ entry.
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

const LEARNED = "data-ccpp-code-gear";
const GEAR_GLYPH = glyph("settings");

/** The button shows claude.ai's gear glyph (or our sliders glyph, once swapped). */
function hasGearIcon(el: Element) {
    if (el.querySelector("[data-ccpp-gear-icon]")) return true;
    const glyphs = el.querySelectorAll('[data-cds="Icon"]');
    return glyphs.length === 1 && !!GEAR_GLYPH && glyphs[0]!.textContent === GEAR_GLYPH && !el.textContent!.replace(GEAR_GLYPH, "").trim();
}

/** Labelled like a settings button, linking to #settings, showing the gear glyph, or seen opening settings before. */
function isGear(el: Element) {
    if (el.hasAttribute(LEARNED)) return true;
    const label = [el.getAttribute("aria-label"), el.getAttribute("title"), el.getAttribute("data-testid"), el.getAttribute("data-ccpp-tip")].filter(Boolean).join(" ");
    const looksLike = SETTINGS_WORD.test(label) || (el.getAttribute("href") ?? "").includes("#settings") || hasGearIcon(el);
    // Where it sits is checked last: it can measure layout.
    return looksLike && inSidebar(el);
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
    let armedEl: Element | null = null;
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
            armedEl = el;
        },
        { capture: true },
    );
    // Fallback for when the gear carries no settings label: hop to CC++ once the dialog shows up.
    watch(scope, NATIVE_DIALOG, dialog => {
        if (!enabled() || !onCodePage() || Date.now() - armed > 1500) return;
        armed = 0;
        const el = armedEl;
        const timer = setTimeout(() => {
            if (!dialog.isConnected || !openedOnCode(dialog)) return;
            // Remembered, so the next click is caught up front and the icon gets swapped.
            el?.setAttribute(LEARNED, "");
            open();
            paint();
        }, 150);
        return () => clearTimeout(timer);
    });

    // The gear's icon becomes CC++'s sliders: claude.ai's own glyph font when it can, else our svg.
    const swapped = new Set<HTMLElement>();
    const restore = () => {
        for (const button of swapped) {
            for (const mark of button.querySelectorAll<HTMLElement>("[data-ccpp-gear-icon]")) {
                if (mark.dataset.ccppGearIcon === "svg") mark.remove();
                else if (mark.dataset.ccppGearGlyph) {
                    mark.textContent = mark.dataset.ccppGearGlyph;
                    delete mark.dataset.ccppGearGlyph;
                    mark.removeAttribute("data-ccpp-gear-icon");
                }
            }
            for (const svg of button.querySelectorAll<SVGElement>("svg[data-ccpp-gear-hidden]")) {
                svg.style.removeProperty("display");
                svg.removeAttribute("data-ccpp-gear-hidden");
            }
        }
        swapped.clear();
    };
    const swap = (button: HTMLElement) => {
        const font = button.querySelector<HTMLElement>('[data-cds="Icon"]');
        const sliders = glyph("sliders");
        if (font && sliders) {
            if (font.textContent !== sliders) {
                font.dataset.ccppGearGlyph = font.textContent ?? "";
                font.setAttribute("data-ccpp-gear-icon", "glyph");
                font.textContent = sliders;
            }
        } else if (!button.querySelector("[data-ccpp-gear-icon]")) {
            const native = button.querySelector<SVGElement>("svg");
            const size = Math.round(native?.getBoundingClientRect().width || Number(native?.getAttribute("width")) || 16);
            const mark = icon("sliders", size);
            mark.setAttribute("data-ccpp-gear-icon", "svg");
            if (native) {
                native.setAttribute("data-ccpp-gear-hidden", "");
                native.style.display = "none";
                native.after(mark);
            } else button.prepend(mark);
        }
        swapped.add(button);
    };
    const paint = () => {
        if (!enabled() || !onCodePage()) return restore();
        for (const button of swapped) if (!button.isConnected) swapped.delete(button);
        for (const button of document.querySelectorAll<HTMLElement>("button, a, [role='button']")) {
            if (!button.closest(SKIP) && isGear(button)) swap(button);
        }
    };
    onDomChange(scope, paint);
    scope.defer(restore);
    return { repaint: paint };
}
