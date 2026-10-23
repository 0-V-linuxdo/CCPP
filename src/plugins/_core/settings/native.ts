/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import type { Scope } from "@kernel/scope";
import { clear, h } from "@lib/dom";
import { glyph, icon } from "@lib/icons";
import { shadowBox } from "@lib/ui";
import { tipAttrs } from "@lib/tooltip";
import { watch } from "@api/dom";
import { addStyle } from "@api/styles";

import { NATIVE_DIALOG, openModal } from "./layer";
import { onRedraw, type SettingsTab, tabs, version } from "./state";
import { learnNativeIcons } from "./nativeIcons";
import { PANEL_CSS } from "./styles";
import { NATIVE_SECTIONS } from "./userMenu";

const NAV = '[data-perf-region="settings_nav"]';
/** CC++ pages get their own hash, #settings/ccpp-<tab>, so reload and Back work like native pages. */
const HASH = "#settings/ccpp-";
/** claude.ai drops a settings hash it doesn't know, so read ours before it gets the chance. */
const bootHash = typeof location === "object" ? location.hash : "";
const hashTab = (hash: string) => (hash.startsWith(HASH) ? hash.slice(HASH.length) : null);
const PANEL = '[data-perf-region="settings_panel"]';

const L = {
    group: "CC++",
    close: { zh: "关闭", en: "Close" },
};

/** While a CC++ page is shown, claude.ai's own page and its nav highlight step aside. */
const DOC_CSS = `
[data-ccpp-panel] > :not(:first-child):not([data-ccpp-host]) { display: none !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current] { background: transparent !important; font-weight: inherit !important; color: var(--cds-text-secondary, inherit) !important; }
[data-ccpp-active] li:not([data-ccpp-nav]) > button[aria-current]:hover { background: var(--cds-fill-ghost-hover, transparent) !important; color: var(--cds-text-primary, inherit) !important; }
[data-ccpp-host] { display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0; min-width: 0; height: 100%; max-height: 100%; }
[data-ccpp-nav-head] { display: flex !important; align-items: baseline; gap: 6px; }
[data-ccpp-nav-version] { opacity: .7; font-size: .92em; font-variant-numeric: tabular-nums; }
`;

/** An icon like the native nav's: claude.ai's Anthropicons glyph when the font has one, else our svg. */
function nativeGlyph(name: string, cls: string) {
    const char = glyph(name);
    if (char) return h("span", { class: cls, "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } });
    return h("span", { class: cls, "aria-hidden": "true", style: { display: "inline-flex", width: "1.25rem", justifyContent: "center" } }, icon(name, 18));
}

export const sortedTabs = () => [...tabs.values()].sort((a, b) => a.order - b.order);

function renderPage(tab: SettingsTab, box: HTMLElement) {
    const previous = box.querySelector(".page-body");
    const scrollTop = previous?.scrollTop ?? 0;
    const sameTab = box.dataset.tab === tab.id;
    clear(box);
    box.dataset.tab = tab.id;
    const body = h("div", { class: "page-body" });
    box.appendChild(h("div", { class: "page" }, h("div", { class: "page-head" }, h("h2", { text: t(tab.title) })), body));
    try {
        tab.render(body);
    } catch (error) {
        body.appendChild(h("div", { class: "banner", text: String(error) }));
    }
    if (sameTab) body.scrollTop = scrollTop;
}

/* ---------- inside claude.ai's settings dialog ---------- */

interface Mounted {
    activate(id: string): void;
}
let mounted: Mounted | null = null;
let pendingTab: string | null = null;

export const nativeOpen = () => !!mounted && !!document.querySelector(NATIVE_DIALOG);

let navPosition: () => "above" | "below" = () => "below";

export function installNative(scope: Scope, position: () => "above" | "below") {
    navPosition = position;
    addStyle(scope, DOC_CSS, "settings-native");
    watch(scope, NATIVE_DIALOG, dialog => {
        let active: string | null = null;
        const shadow = shadowBox(PANEL_CSS);
        shadow.host.dataset.ccppHost = "";
        shadow.box.style.height = "100%";
        let classes: { header: string; list: string; on: string; off: string; icon: string; label: string } | null = null;

        const nav = () => dialog.querySelector<HTMLElement>(NAV);
        const panel = () => dialog.querySelector<HTMLElement>(PANEL);

        const learnClasses = (root: HTMLElement) => {
            if (classes) return classes;
            const on = root.querySelector<HTMLElement>("li:not([data-ccpp-nav]) > button[aria-current]");
            const off = root.querySelector<HTMLElement>("li:not([data-ccpp-nav]) > button:not([aria-current])");
            const header = root.querySelector<HTMLElement>("ul[aria-labelledby]")?.previousElementSibling as HTMLElement | null;
            const list = root.querySelector<HTMLElement>("ul");
            if (!off || !list) return null;
            const fallbackOn = `${off.className.replace(/\btext-secondary\S*/g, "").replace(/\bhover:\S+/g, "")} bg-fill-ghost-selected font-medium text-primary`;
            classes = {
                header: header?.className || "px-sm pt-md text-caption text-muted",
                list: list.className,
                on: on?.className || fallbackOn,
                off: off.className,
                icon: off.querySelector("span[data-cds]")?.className || "shrink-0",
                label: off.querySelector("span:last-child")?.className || "min-w-0 flex-1 truncate",
            };
            return classes;
        };

        const paintNav = () => {
            const root = nav();
            if (!root) return;
            learnNativeIcons(root, NATIVE_SECTIONS);
            const c = learnClasses(root);
            if (!c) return;
            const scroller = root.querySelector<HTMLElement>("ul")?.parentElement;
            if (!scroller) return;
            let group = [...scroller.children].find(el => el.hasAttribute("data-ccpp-nav-group")) as HTMLElement | undefined;
            const list = sortedTabs();
            if (!group || group.dataset.tabs !== list.map(tab => tab.id).join(",") || group.dataset.lang !== t({ zh: "zh", en: "en" })) {
                group?.remove();
                const ul = h("ul", { class: c.list, "aria-label": L.group });
                for (const tab of list) {
                    const button = h(
                        "button",
                        { type: "button", class: c.off, "data-tab": tab.id },
                        nativeGlyph(tab.icon, c.icon),
                        h("span", { class: c.label, text: t(tab.title) }),
                    );
                    button.addEventListener("click", event => {
                        event.preventDefault();
                        activate(tab.id);
                    });
                    ul.appendChild(h("li", { "data-ccpp-nav": tab.id }, button));
                }
                group = h(
                    "div",
                    { "data-ccpp-nav-group": "", "data-tabs": list.map(tab => tab.id).join(","), "data-lang": t({ zh: "zh", en: "en" }), style: { display: "contents" } },
                    // The version sits right of the group name, on the same line.
                    h("div", { class: c.header, "data-ccpp-nav-head": "" }, h("span", { text: L.group }), h("span", { "data-ccpp-nav-version": "", text: `v${version}` })),
                    ul,
                );
                scroller.appendChild(group);
            }
            // Above or below claude.ai's own sections, as chosen in Settings.
            const wantFirst = navPosition() === "above";
            if (wantFirst ? scroller.firstElementChild !== group : scroller.lastElementChild !== group) {
                if (wantFirst) scroller.prepend(group);
                else scroller.appendChild(group);
            }
            for (const button of group.querySelectorAll<HTMLElement>("button[data-tab]")) {
                const on = button.dataset.tab === active;
                const want = on ? c.on : c.off;
                if (button.className !== want) button.className = want;
                if (on) button.setAttribute("aria-current", "page");
                else button.removeAttribute("aria-current");
            }
            root.toggleAttribute("data-ccpp-active", !!active);
        };

        const paintPanel = () => {
            const target = panel();
            if (!target) return;
            target.toggleAttribute("data-ccpp-panel", !!active);
            if (!active) {
                shadow.host.remove();
                return;
            }
            if (shadow.host.parentNode !== target) target.appendChild(shadow.host);
        };

        const draw = () => {
            const tab = active ? tabs.get(active) : null;
            if (active && !tab) active = null;
            paintNav();
            paintPanel();
            if (tab) renderPage(tab, shadow.box);
        };

        function activate(id: string) {
            if (!tabs.has(id)) return;
            active = id;
            if (location.hash !== HASH + id) {
                try {
                    history.pushState(history.state, "", HASH + id);
                } catch {}
            }
            shadow.sync();
            draw();
            shadow.box.querySelector(".page-body")?.scrollTo(0, 0);
        }
        const deactivate = () => {
            if (!active) return;
            active = null;
            draw();
        };

        // React re-renders the nav and panel; keep our group and page in place.
        let frame = 0;
        const observer = new MutationObserver(() => {
            if (frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                paintNav();
                paintPanel();
            });
        });
        observer.observe(dialog, { childList: true, subtree: true });
        // Any native page switch hands the panel back to claude.ai.
        const onClick = (event: Event) => {
            const target = event.target as Element | null;
            if (target?.closest?.(`${NAV} li:not([data-ccpp-nav]), ${NAV} [role="option"]`)) deactivate();
        };
        dialog.addEventListener("click", onClick, true);
        const onHash = () => {
            const id = hashTab(location.hash);
            if (id && tabs.has(id)) activate(id);
            else deactivate();
        };
        window.addEventListener("hashchange", onHash);
        const offRedraw = onRedraw(() => active && draw());

        const self: Mounted = { activate };
        mounted = self;
        paintNav();
        if (pendingTab) {
            const id = pendingTab;
            pendingTab = null;
            // Let claude.ai finish its first render of the dialog.
            requestAnimationFrame(() => activate(id));
        }
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            dialog.removeEventListener("click", onClick, true);
            window.removeEventListener("hashchange", onHash);
            offRedraw();
            shadow.host.remove();
            nav()?.removeAttribute("data-ccpp-active");
            panel()?.removeAttribute("data-ccpp-panel");
            dialog.querySelector("[data-ccpp-nav-group]")?.remove();
            if (mounted === self) mounted = null;
            // The dialog closed on one of our pages; don't leave its hash behind.
            if (hashTab(location.hash)) {
                try {
                    history.replaceState(history.state, "", location.pathname + location.search);
                } catch {}
            }
        };
    });
    scope.defer(() => {
        mounted = null;
        pendingTab = null;
    });
    // Reopen a CC++ page after a reload, or when Back/Forward lands on one while the dialog is closed.
    const fromHash = (hash: string) => {
        const id = hashTab(hash);
        if (id && tabs.has(id) && !nativeOpen()) void openNative(id);
    };
    scope.listen(window, "hashchange", () => fromHash(location.hash));
    if (hashTab(bootHash)) setTimeout(() => fromHash(bootHash), 500);
}

/**
 * Opens a CC++ page inside claude.ai's settings dialog (opening the dialog first when needed).
 * Resolves false when the dialog didn't come up, so the caller can fall back.
 */
export function openNative(tab: string): Promise<boolean> {
    if (nativeOpen()) {
        mounted!.activate(tab);
        return Promise.resolve(true);
    }
    pendingTab = tab;
    // claude.ai opens its settings dialog for #settings/<page> on any page.
    location.hash = "settings/general";
    return new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            if (pendingTab !== tab) return resolve(true);
            if (Date.now() - started > 2000) {
                pendingTab = null;
                return resolve(false);
            }
            setTimeout(check, 100);
        };
        setTimeout(check, 100);
    });
}

/* ---------- standalone fallback ---------- */

let standaloneClose: (() => void) | null = null;

export function openStandalone(tabId: string) {
    standaloneClose?.();
    let current = tabs.has(tabId) ? tabId : sortedTabs()[0]?.id;
    const nav = h("nav", { class: "shell-nav" }, h("div", { class: "group" }, L.group, h("span", { class: "ver", text: ` v${version}` })));
    const main = h("div", { class: "shell-main" });
    const pageBox = h("div", { style: { flex: "1", minHeight: "0", display: "flex", flexDirection: "column" } });
    const closeBtn = h("button", { type: "button", class: "icon-btn", "aria-label": t(L.close), ...tipAttrs(t(L.close)) }, icon("x", 16));
    main.append(h("div", { class: "shell-top" }, closeBtn), pageBox);
    const draw = () => {
        for (const old of nav.querySelectorAll("button")) old.remove();
        for (const tab of sortedTabs()) {
            const button = h("button", { type: "button", class: tab.id === current ? "active" : "" }, icon(tab.icon, 16), t(tab.title));
            button.addEventListener("click", () => {
                current = tab.id;
                draw();
            });
            nav.appendChild(button);
        }
        const tab = current ? tabs.get(current) : null;
        if (tab) renderPage(tab, pageBox);
    };
    const shell = h("div", { class: "shell", role: "dialog", "aria-modal": "true", "aria-label": "CC++" }, nav, main);
    draw();
    const offRedraw = onRedraw(draw);
    const close = openModal(shell, {
        onClose: () => {
            offRedraw();
            standaloneClose = null;
        },
    });
    closeBtn.addEventListener("click", close);
    standaloneClose = close;
}

export const standaloneOpen = () => !!standaloneClose;
export const closeStandalone = () => standaloneClose?.();
