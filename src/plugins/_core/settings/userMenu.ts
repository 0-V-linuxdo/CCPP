/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { isActive, type Plugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { h } from "@lib/dom";
import { glyph, icon } from "@lib/icons";
import { tipAttrs } from "@lib/tooltip";
import { SEL, watch } from "@api/dom";

import { sectionGlyph } from "./nativeIcons";
import { type SettingsTab, version } from "./state";

/** The "Settings" row of claude.ai's account menu, which tells that menu apart from others. */
const SETTINGS_ITEM = '[data-testid="user-menu-settings"]';

/** claude.ai's own settings pages and the hash that opens each. */
export const NATIVE_SECTIONS: { hash: string; icon: string; label: { zh: string; en: string } }[] = [
    { hash: "settings/general", icon: "sliders", label: { zh: "通用", en: "General" } },
    { hash: "settings/account", icon: "user", label: { zh: "账户", en: "Account" } },
    { hash: "settings/data-privacy-controls", icon: "shield", label: { zh: "隐私", en: "Privacy" } },
    { hash: "settings/billing", icon: "creditCard", label: { zh: "账单", en: "Billing" } },
    { hash: "settings/usage", icon: "gauge", label: { zh: "用量", en: "Usage" } },
    { hash: "settings/capabilities", icon: "grid", label: { zh: "功能", en: "Capabilities" } },
    { hash: "settings/memory", icon: "brain", label: { zh: "记忆", en: "Memory" } },
    { hash: "settings/design-systems", icon: "palette", label: { zh: "设计系统", en: "Design systems" } },
    { hash: "settings/claude-code", icon: "terminal", label: { zh: "Claude Code", en: "Claude Code" } },
    { hash: "settings/browser-extension", icon: "globe", label: { zh: "Claude in Chrome", en: "Claude in Chrome" } },
    { hash: "customize/skills/yours", icon: "sparkles", label: { zh: "技能", en: "Skills" } },
    { hash: "customize/connectors/yours", icon: "link", label: { zh: "连接器", en: "Connectors" } },
    { hash: "customize/plugins/yours", icon: "puzzle", label: { zh: "插件（claude.ai）", en: "Plugins (claude.ai)" } },
];

const L = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "打开 CC++ 设置", en: "Open CC++ settings" },
    openNative: { zh: "打开设置", en: "Open settings" },
    claude: { zh: "claude.ai", en: "claude.ai" },
};

export interface UserMenuOptions {
    tabs(): SettingsTab[];
    plugins(): Plugin[];
    openTab(id: string): void;
    openPlugin(plugin: Plugin): void;
    /** Show the CC++ › row. */
    entry: boolean;
    /** Turn claude.ai's Settings row into a submenu too (void++'s SettingsFlyout). */
    settingsFlyout: boolean;
    /** Keys of the shortcut that opens CC++ settings, shown like claude.ai's own hint on its Settings row. */
    shortcut: string[];
    /** Whether a row of the Settings submenu shows: "open", "ccpp", or a native section's hash. */
    flyoutShows(row: string): boolean;
    /** The claude.ai settings page "Open settings" goes to. */
    nativeHash(): string;
}

/**
 * Native-looking submenus in the account menu, like void++'s avatar flyouts. Our panels live inside
 * claude.ai's menu popup, so clicking them doesn't dismiss it.
 */
export function installUserMenu(scope: Scope, options: UserMenuOptions) {
    watch(scope, SEL.menu, menu => {
        if (menu.hasAttribute("data-ccpp-panel-level")) return;
        let cleanup: (() => void) | null = null;
        // The menu's rows can render after the popup itself (on first open the menu code is still
        // loading), so wait for the Settings row for as long as the menu is open.
        const tryInsert = () => {
            if (cleanup) return true;
            const settingsItem = menu.querySelector<HTMLElement>(SETTINGS_ITEM);
            if (!settingsItem) return false;
            cleanup = enhance(menu, settingsItem, options);
            return true;
        };
        const observer = new MutationObserver(() => tryInsert() && observer.disconnect());
        if (!tryInsert()) observer.observe(menu, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
            cleanup?.();
        };
    });
}

/**
 * A shortcut hint built like the one on claude.ai's Settings row (⇧⌘,): the same container and per-key elements,
 * copied from that row, with our keys. Plain muted text when the row has no hint to copy.
 */
export function shortcutHint(settingsItem: HTMLElement, keys: string[]): HTMLElement | null {
    if (!keys.length) return null;
    const native = settingsItem.querySelector<HTMLElement>('[data-cds="Shortcut"]');
    const sample = native?.querySelector<HTMLElement>("kbd");
    if (native && sample) {
        const hint = native.cloneNode(false) as HTMLElement;
        for (const key of keys) {
            const part = sample.cloneNode(true) as HTMLElement;
            // Each key holds the glyph and a screen-reader name ("Shift", "Command").
            const glyph = [...part.querySelectorAll<HTMLElement>("span")].find(el => !el.matches(".sr-only")) ?? null;
            const name = part.querySelector<HTMLElement>(".sr-only");
            if (glyph) glyph.textContent = key;
            else part.textContent = key;
            if (name) name.textContent = KEY_NAMES[key] ?? key;
            hint.appendChild(part);
        }
        hint.setAttribute("data-ccpp-shortcut", "");
        return hint;
    }
    return h("span", { class: "shrink-0 text-muted text-footnote", "data-ccpp-shortcut": "", "aria-hidden": "true", text: keys.join(" "), style: { letterSpacing: ".08em" } });
}

const KEY_NAMES: Record<string, string> = { "⇧": "Shift", "⌘": "Command", "⌥": "Option", "⌃": "Control", ".": "Period", ",": "Comma" };

type Fill = (scroll: HTMLElement, child: Level) => void;
interface Level {
    attach(trigger: HTMLElement, width: string, fill: Fill): void;
    close(): void;
    isOpen(trigger: HTMLElement): boolean;
}

function closeMenu(menu: HTMLElement) {
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
}

function enhance(menu: HTMLElement, settingsItem: HTMLElement, options: UserMenuOptions) {
    const sampleSub = menu.querySelector<HTMLElement>('[role="menuitem"][aria-haspopup="menu"]');
    const itemClass = settingsItem.className;
    const subItemClass = sampleSub?.className ?? `${itemClass} justify-between data-[popup-open]:bg-fill-ghost-hover`;
    const iconSlot = settingsItem.firstElementChild as HTMLElement | null;
    const separatorClass = menu.querySelector('[role="separator"]')?.className ?? "my-1 h-px bg-border";
    const panelClass = menu.className.replace(/\bw-\[[^\]]+\]/g, "");
    const scrollClass = (menu.firstElementChild as HTMLElement | null)?.className ?? "";
    const added: Element[] = [];

    // A native submenu row's trailing chevron (an Anthropicons glyph), so ours is claude.ai's own.
    const subLast = sampleSub?.lastElementChild as HTMLElement | null | undefined;
    const nativeChevron = subLast && subLast !== sampleSub!.firstElementChild && (subLast.matches('[data-cds="Icon"]') || subLast.querySelector('[data-cds="Icon"], svg')) ? subLast : null;
    const chevron = () => {
        const mark = (nativeChevron?.cloneNode(true) as HTMLElement | undefined) ?? h("span", { class: "-mr-1 shrink-0 text-muted", style: { display: "inline-flex" } }, icon("chevronRight", 16));
        mark.setAttribute("data-ccpp-chevron", "");
        return mark;
    };

    /**
     * An icon in the same box as the Settings row's: its slot copied whole, holding `char` in claude.ai's
     * Anthropicons font like every native row. Icons the font lacks fall back to our svg at the glyph's size.
     */
    const iconBox = (char: string | null, name: string): HTMLElement => {
        const box = (iconSlot?.cloneNode(true) as HTMLElement | undefined) ?? h("span", { class: "flex size-icon shrink-0 items-center justify-center" });
        const native = box.querySelector<HTMLElement>('[data-cds="Icon"]');
        if (char && native) {
            native.textContent = char;
            native.removeAttribute("data-cds-mirror");
            return box;
        }
        box.textContent = "";
        if (char) box.appendChild(h("span", { "data-cds": "Icon", "aria-hidden": "true", text: char, style: { fontSize: "calc(1.25rem * var(--cds-rem-scale, 1))", fontWeight: "433.3" } }));
        else box.appendChild(icon(name, 20, 1.75));
        return box;
    };
    const ownIcon = (name: string) => iconBox(glyph(name), name);
    const sectionIcon = (section: { hash: string; icon: string }) => iconBox(sectionGlyph(section.hash) ?? glyph(section.icon), section.icon);

    const row = (iconNode: Node | null, label: string | Node, opts: { sub?: boolean; trailing?: Node | null; run?: () => void } = {}) => {
        const el = h(
            "div",
            { role: "menuitem", tabindex: "-1", "data-cds-icon-row": "", "data-ccpp-item": "", class: opts.sub ? subItemClass : itemClass, style: { cursor: "pointer" } },
            iconNode,
            typeof label === "string" ? h("span", { class: "min-w-0 flex-1 truncate", text: label }) : label,
            opts.trailing ?? null,
            opts.sub ? chevron() : null,
        );
        if (opts.sub) el.setAttribute("aria-haspopup", "menu");
        el.addEventListener("pointerenter", () => highlight(el));
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
    const caption = (text: string) => h("div", { class: "px-2.5 pt-2 pb-1 text-caption text-muted", style: { fontSize: "var(--cds-font-size-caption, 12px)", opacity: ".8" }, text });
    const separator = () => h("div", { role: "separator", class: separatorClass });
    const highlight = (el: HTMLElement) => {
        for (const other of el.parentElement?.querySelectorAll("[data-highlighted]") ?? []) other.removeAttribute("data-highlighted");
        el.setAttribute("data-highlighted", "");
    };

    /** A floating panel beside `anchor`, inside `container` (the menu popup or a parent panel). */
    const panel = (anchor: HTMLElement, container: HTMLElement, width: string) => {
        const scroll = h("div", { class: scrollClass, style: { maxHeight: "min(calc(100vh - 16px), 32rem)", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "var(--cds-alpha-2, rgba(127,127,127,.35)) transparent" } });
        const el = h("div", { role: "menu", "data-ccpp-panel-level": "", class: panelClass, style: { position: "absolute", width, zIndex: "1" } }, scroll);
        container.appendChild(el);
        // Placed once filled: the panel's height decides how far up it must move to stay on screen.
        const place = () => {
            const a = anchor.getBoundingClientRect();
            const c = container.getBoundingClientRect();
            const gap = 4;
            // Prefer the right side like native submenus; flip left when there is no room.
            if (window.innerWidth - c.right > el.offsetWidth + gap + 8) el.style.left = `calc(100% + ${gap}px)`;
            else el.style.right = `calc(100% + ${gap}px)`;
            const top = a.top - c.top - 4;
            const maxTop = window.innerHeight - c.top - el.offsetHeight - 8;
            el.style.top = `${Math.max(-c.top + 8, Math.min(top, maxTop))}px`;
        };
        el.addEventListener("pointerover", event => event.stopPropagation());
        return { el, scroll, place };
    };

    /** One open submenu per level; hovering another row of the same level closes it. */
    const level = (container: HTMLElement): Level => {
        let open: { trigger: HTMLElement; el: HTMLElement; close: () => void } | null = null;
        const close = () => {
            if (!open) return;
            open.close();
            open.el.remove();
            open.trigger.removeAttribute("data-popup-open");
            open.trigger.setAttribute("aria-expanded", "false");
            open = null;
        };
        const attach = (trigger: HTMLElement, width: string, fill: Fill) => {
            trigger.setAttribute("aria-haspopup", "menu");
            trigger.setAttribute("aria-expanded", "false");
            const show = () => {
                if (open?.trigger === trigger) return;
                close();
                const { el, scroll, place } = panel(trigger, container, width);
                const child = level(el);
                fill(scroll, child);
                place();
                // Hovering a row without its own submenu folds deeper panels away.
                scroll.addEventListener("pointerover", event => {
                    const target = (event.target as Element).closest('[role="menuitem"]');
                    if (target && !target.hasAttribute("aria-haspopup")) child.close();
                });
                trigger.setAttribute("data-popup-open", "");
                trigger.setAttribute("aria-expanded", "true");
                open = { trigger, el, close: child.close };
            };
            trigger.addEventListener("pointerenter", show);
            // Our rows open their submenu on click; claude.ai's Settings row keeps its own click.
            if (trigger.hasAttribute("data-ccpp-item")) {
                trigger.addEventListener("click", event => {
                    event.stopPropagation();
                    show();
                });
            }
            trigger.addEventListener("keydown", (event: KeyboardEvent) => {
                if (event.key !== "ArrowRight") return;
                event.preventDefault();
                event.stopPropagation();
                show();
                open?.el.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
            });
        };
        return { attach, close, isOpen: (trigger: HTMLElement) => open?.trigger === trigger };
    };

    const top = level(menu);

    const fillPlugins = (scroll: HTMLElement) => {
        for (const plugin of options.plugins()) {
            const dot = h("span", {
                class: "shrink-0",
                ...tipAttrs(isActive(plugin) ? "ON" : "OFF"),
                style: { width: "6px", height: "6px", borderRadius: "50%", marginInlineStart: "8px", background: isActive(plugin) ? "var(--cds-fill-accent, #257de0)" : "var(--cds-alpha-2, rgba(127,127,127,.4))" },
            });
            scroll.appendChild(row(ownIcon(plugin.icon ?? "puzzle"), t(plugin.title), { trailing: dot, run: () => options.openPlugin(plugin) }));
        }
    };
    const fillCcpp = (scroll: HTMLElement, child: Level) => {
        for (const tab of options.tabs()) {
            if (tab.id === "plugins") {
                const plugins = row(ownIcon(tab.icon), t(L.plugins), { sub: true });
                child.attach(plugins, "16rem", fillPlugins);
                scroll.appendChild(plugins);
            } else scroll.appendChild(row(ownIcon(tab.icon), t(tab.title), { run: () => options.openTab(tab.id) }));
        }
    };

    // void++'s SettingsFlyout: Settings opens a submenu, while a click still opens settings as before.
    if (options.settingsFlyout) {
        settingsItem.classList.add("justify-between");
        const mark = chevron();
        settingsItem.appendChild(mark);
        added.push(mark);
        top.attach(settingsItem, "15rem", (scroll, child) => {
            // Each group is separated from the one before it, whichever of them are shown.
            const group = (title: string | null) => {
                if (scroll.childElementCount) scroll.appendChild(separator());
                if (title) scroll.appendChild(caption(title));
            };
            if (options.flyoutShows("open")) scroll.appendChild(row(ownIcon("settings"), t(L.openNative), { run: () => (location.hash = options.nativeHash()) }));
            if (options.flyoutShows("ccpp")) {
                group("CC++");
                fillCcpp(scroll, child);
            }
            const sections = NATIVE_SECTIONS.filter(section => options.flyoutShows(section.hash));
            if (sections.length) group(t(L.claude));
            for (const section of sections) scroll.appendChild(row(sectionIcon(section), t(section.label), { run: () => (location.hash = section.hash) }));
            if (!scroll.childElementCount) scroll.appendChild(row(ownIcon("settings"), t(L.openNative), { run: () => (location.hash = options.nativeHash()) }));
        });
    }

    if (options.entry) {
        const name = h("span", { class: "min-w-0 flex-1 truncate" }, "CC++", h("span", { class: "text-muted", "data-ccpp-version": "", text: ` v${version}`, style: { fontSize: "var(--cds-font-size-caption, 12px)", lineHeight: "1", verticalAlign: "middle", marginInlineStart: "4px" } }));
        const entry = row(ownIcon("plug"), name, { sub: true, trailing: shortcutHint(settingsItem, options.shortcut) });
        top.attach(entry, "14rem", (scroll, child) => {
            fillCcpp(scroll, child);
            scroll.appendChild(separator());
            scroll.appendChild(row(ownIcon("settings"), t(L.openSettings), { run: () => options.openTab("plugins") }));
        });
        settingsItem.after(entry);
        added.push(entry);
    }

    // Moving onto a native row without our submenu closes ours, like claude.ai's own submenus.
    const onOver = (event: Event) => {
        const target = (event.target as Element).closest('[role="menuitem"]');
        if (target && target !== settingsItem && !target.hasAttribute("data-ccpp-item")) top.close();
    };
    menu.addEventListener("pointerover", onOver);
    return () => {
        top.close();
        menu.removeEventListener("pointerover", onOver);
        for (const el of added) el.remove();
    };
}
