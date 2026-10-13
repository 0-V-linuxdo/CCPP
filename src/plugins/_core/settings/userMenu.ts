/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t, type Text } from "@kernel/i18n";
import { isActive, type Plugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { h } from "@lib/dom";
import { icon } from "@lib/icons";
import { SEL, watch } from "@api/dom";

import type { SettingsTab } from "./state";

/** The "Settings" row of claude.ai's account menu, which tells that menu apart from others. */
const SETTINGS_ITEM = '[data-testid="user-menu-settings"]';

const L = {
    plugins: { zh: "插件", en: "Plugins" },
    all: { zh: "打开 CC++ 设置", en: "Open CC++ settings" },
};

export interface UserMenuOptions {
    tabs(): SettingsTab[];
    plugins(): Plugin[];
    openTab(id: string): void;
    openPlugin(plugin: Plugin): void;
}

/**
 * A native-looking "CC++ ›" row in the account menu that expands into a submenu, like void++'s
 * avatar flyout. Our panels live inside claude.ai's menu popup, so clicking them doesn't dismiss it.
 */
export function installUserMenu(scope: Scope, options: UserMenuOptions) {
    watch(scope, SEL.menu, menu => {
        let tries = 0;
        let item: HTMLElement | null = null;
        let frame = 0;
        const tryInsert = () => {
            const settingsItem = menu.querySelector<HTMLElement>(SETTINGS_ITEM);
            if (!settingsItem) {
                if (++tries < 20) frame = requestAnimationFrame(tryInsert);
                return;
            }
            item = build(menu, settingsItem, options);
            settingsItem.after(item);
        };
        tryInsert();
        return () => {
            cancelAnimationFrame(frame);
            item?.remove();
            menu.querySelector("[data-ccpp-submenu]")?.remove();
        };
    });
}

function closeMenu(menu: HTMLElement) {
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

function build(menu: HTMLElement, settingsItem: HTMLElement, options: UserMenuOptions) {
    const sampleSub = menu.querySelector<HTMLElement>('[role="menuitem"][aria-haspopup="menu"]');
    const itemClass = (sampleSub ?? settingsItem).className;
    const subItemClass = sampleSub ? itemClass : `${itemClass} justify-between data-[popup-open]:bg-fill-ghost-hover`;
    const iconClass = settingsItem.querySelector(":scope > span")?.className ?? "flex size-icon shrink-0 items-center justify-center";
    const separatorClass = menu.querySelector('[role="separator"]')?.className ?? "my-1 h-px bg-border";
    const panelClass = menu.className.replace(/\bw-\[[^\]]+\]/g, "");
    const scrollClass = (menu.firstElementChild as HTMLElement | null)?.className ?? "";

    const row = (iconNode: Node, label: string, opts: { sub?: boolean; trailing?: Node | null; run?: () => void } = {}) => {
        const el = h(
            "div",
            { role: "menuitem", tabindex: "-1", "data-cds-icon-row": "", "data-ccpp-item": "", class: opts.sub ? subItemClass : itemClass, style: { cursor: "pointer" } },
            h("span", { class: iconClass }, iconNode),
            h("span", { class: "min-w-0 flex-1 truncate", text: label }),
            opts.sub ? h("span", { class: "-mr-1 shrink-0 text-muted", style: { display: "inline-flex" } }, icon("chevronRight", 16)) : (opts.trailing ?? null),
        );
        if (opts.sub) el.setAttribute("aria-haspopup", "menu");
        el.addEventListener("pointerenter", () => {
            for (const other of el.parentElement?.querySelectorAll("[data-highlighted]") ?? []) other.removeAttribute("data-highlighted");
            el.setAttribute("data-highlighted", "");
        });
        el.addEventListener("pointerleave", () => el.removeAttribute("data-highlighted"));
        if (opts.run) {
            const run = opts.run;
            const activate = (event: Event) => {
                event.preventDefault();
                event.stopPropagation();
                closeMenu(menu);
                setTimeout(run, 0);
            };
            el.addEventListener("click", activate);
            el.addEventListener("keydown", (event: KeyboardEvent) => (event.key === "Enter" || event.key === " ") && activate(event));
        }
        return el;
    };

    const panel = (anchor: HTMLElement, container: HTMLElement, width: string) => {
        const scroll = h("div", { class: scrollClass, style: { maxHeight: "min(70vh, 32rem)", overflowY: "auto" } });
        const el = h("div", { role: "menu", "data-ccpp-panel-level": "", class: panelClass, style: { position: "absolute", width, zIndex: "1" } }, scroll);
        container.appendChild(el);
        const a = anchor.getBoundingClientRect();
        const c = container.getBoundingClientRect();
        const gap = 4;
        // Prefer the right side like native submenus; flip left when there is no room.
        const room = window.innerWidth - c.right;
        if (room > el.offsetWidth + gap + 8) el.style.left = `calc(100% + ${gap}px)`;
        else el.style.right = `calc(100% + ${gap}px)`;
        const top = a.top - c.top - 4;
        const maxTop = window.innerHeight - c.top - el.offsetHeight - 8;
        el.style.top = `${Math.max(-c.top + 8, Math.min(top, maxTop))}px`;
        return { el, scroll };
    };

    let sub: HTMLElement | null = null;
    let pluginPanel: HTMLElement | null = null;

    const closePlugins = () => {
        pluginPanel?.remove();
        pluginPanel = null;
        pluginsRow?.removeAttribute("data-popup-open");
    };
    const closeSub = () => {
        closePlugins();
        sub?.remove();
        sub = null;
        entry.removeAttribute("data-popup-open");
        entry.setAttribute("aria-expanded", "false");
    };

    let pluginsRow: HTMLElement | null = null;
    const openPlugins = () => {
        if (pluginPanel || !sub || !pluginsRow) return;
        pluginsRow.setAttribute("data-popup-open", "");
        const { el, scroll } = panel(pluginsRow, sub, "16rem");
        pluginPanel = el;
        for (const plugin of options.plugins()) {
            const dot = h("span", {
                class: "shrink-0",
                title: isActive(plugin) ? "ON" : "OFF",
                style: { width: "6px", height: "6px", borderRadius: "50%", marginInlineStart: "8px", background: isActive(plugin) ? "var(--cds-fill-accent, #2a78d6)" : "var(--cds-alpha-2, rgba(127,127,127,.4))" },
            });
            scroll.appendChild(row(icon(plugin.icon ?? "puzzle", 16), t(plugin.title), { trailing: dot, run: () => options.openPlugin(plugin) }));
        }
        el.addEventListener("pointerover", event => event.stopPropagation());
    };

    const openSub = () => {
        if (sub) return;
        entry.setAttribute("data-popup-open", "");
        entry.setAttribute("aria-expanded", "true");
        const { el, scroll } = panel(entry, menu, "14rem");
        sub = el;
        sub.dataset.ccppSubmenu = "";
        for (const tab of options.tabs()) {
            if (tab.id === "plugins") {
                pluginsRow = row(icon(tab.icon, 16), t(L.plugins), { sub: true });
                pluginsRow.addEventListener("pointerenter", openPlugins);
                pluginsRow.addEventListener("click", event => {
                    event.stopPropagation();
                    openPlugins();
                });
                scroll.appendChild(pluginsRow);
            } else {
                scroll.appendChild(row(icon(tab.icon, 16), t(tab.title as Text), { run: () => options.openTab(tab.id) }));
            }
        }
        scroll.appendChild(h("div", { role: "separator", class: separatorClass }));
        scroll.appendChild(row(icon("settings", 16), t(L.all), { run: () => options.openTab("plugins") }));
        // Hovering a non-plugin row of our submenu folds the plugin list away.
        scroll.addEventListener("pointerover", event => {
            const target = (event.target as Element).closest('[role="menuitem"]');
            if (target && target !== pluginsRow) closePlugins();
        });
        sub.addEventListener("pointerover", event => event.stopPropagation());
    };

    const entry = row(icon("plug", 16), "CC++", { sub: true });
    entry.setAttribute("aria-expanded", "false");
    entry.addEventListener("pointerenter", openSub);
    entry.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        if (sub) closeSub();
        else openSub();
    });
    entry.addEventListener("keydown", (event: KeyboardEvent) => {
        if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            openSub();
            sub?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
        }
    });
    // Moving onto another native row closes our submenu, like claude.ai's own submenus.
    menu.addEventListener("pointerover", event => {
        const target = (event.target as Element).closest('[role="menuitem"]');
        if (target && target !== entry && !target.closest("[data-ccpp-submenu]")) closeSub();
    });
    return entry;
}
