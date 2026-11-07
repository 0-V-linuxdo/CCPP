/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
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

const LABEL = { zh: "CC++ 设置", en: "CC++ settings" };
/** The button's own aria-label / title, put back when the option goes off. */
const LABEL_ATTRS = ["aria-label", "title"] as const;
const TOOLTIP = '[data-cds="Tooltip"], [role="tooltip"]:not([data-ccpp-tooltip])';

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

    // The gear's icon becomes CC++'s sliders, the same svg as on the plugin cards' settings button.
    // (claude.ai's glyph font has no vertical-sliders icon: its "sliders" glyph is a filter icon.)
    const swapped = new Set<HTMLElement>();
    const restore = () => {
        for (const button of swapped) {
            for (const mark of button.querySelectorAll("[data-ccpp-gear-icon]")) mark.remove();
            for (const native of button.querySelectorAll<HTMLElement | SVGElement>("[data-ccpp-gear-hidden]")) {
                native.style.removeProperty("display");
                native.removeAttribute("data-ccpp-gear-hidden");
            }
            for (const attr of LABEL_ATTRS) {
                const key = `data-ccpp-gear-${attr}`;
                if (!button.hasAttribute(key)) continue;
                const old = button.getAttribute(key)!;
                button.removeAttribute(key);
                if (old) button.setAttribute(attr, old);
                else button.removeAttribute(attr);
            }
        }
        swapped.clear();
    };
    /** aria-label and title say CC++, keeping claude.ai's own text to put back (and to spot in its tooltip). */
    const relabel = (button: HTMLElement) => {
        const label = t(LABEL);
        for (const attr of LABEL_ATTRS) {
            const now = button.getAttribute(attr);
            if (now === null || now === label) continue;
            button.setAttribute(`data-ccpp-gear-${attr}`, now);
            button.setAttribute(attr, label);
        }
    };
    /** claude.ai's own hover tooltip ("Code settings") on a swapped gear says CC++ too. */
    const retitle = () => {
        if (!enabled() || !onCodePage()) return;
        const gear = [...swapped].find(button => button.matches(":hover, :focus-visible"));
        if (!gear) return;
        const label = t(LABEL);
        const originals = LABEL_ATTRS.map(attr => gear.getAttribute(`data-ccpp-gear-${attr}`)).filter((v): v is string => !!v);
        for (const tip of document.querySelectorAll<HTMLElement>(TOOLTIP)) {
            // The innermost element holding claude.ai's label, else the first element with text of its own.
            const leaves = [...tip.querySelectorAll<HTMLElement>("*"), tip].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent!.trim()));
            const target = leaves.find(el => originals.includes(el.textContent!.trim())) ?? leaves.find(el => SETTINGS_WORD.test(el.textContent ?? ""));
            if (target && target.textContent !== label) target.textContent = label;
        }
    };
    const swap = (button: HTMLElement) => {
        swapped.add(button);
        relabel(button);
        if (button.querySelector("[data-ccpp-gear-icon]")) {
            // React may have put its icon back; keep it hidden.
            for (const native of button.querySelectorAll<HTMLElement | SVGElement>('[data-cds="Icon"]:not([data-ccpp-gear-hidden]), svg:not([data-ccpp-gear-icon]):not([data-ccpp-gear-hidden])')) {
                native.setAttribute("data-ccpp-gear-hidden", "");
                native.style.display = "none";
            }
            return;
        }
        const native = button.querySelector<HTMLElement | SVGElement>('[data-cds="Icon"], svg');
        const box = native?.getBoundingClientRect();
        const size = Math.round(box?.width || box?.height || Number(native?.getAttribute("width")) || 18);
        const mark = icon("sliders", size);
        mark.setAttribute("data-ccpp-gear-icon", "");
        mark.style.flexShrink = "0";
        if (native) {
            native.setAttribute("data-ccpp-gear-hidden", "");
            native.style.display = "none";
            native.after(mark);
        } else button.prepend(mark);
    };
    const paint = () => {
        if (!enabled() || !onCodePage()) return restore();
        for (const button of swapped) if (!button.isConnected) swapped.delete(button);
        for (const button of document.querySelectorAll<HTMLElement>("button, a, [role='button']")) {
            if (!button.closest(SKIP) && isGear(button)) swap(button);
        }
        retitle();
    };
    // Tooltips come up a moment after the pointer arrives; catch them as they appear.
    watch(scope, TOOLTIP, () => {
        retitle();
        const timer = setTimeout(retitle, 50);
        return () => clearTimeout(timer);
    });
    onDomChange(scope, paint);
    scope.defer(restore);
    return { repaint: paint };
}
