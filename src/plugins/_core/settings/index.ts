/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { setLang, t, type Text } from "@kernel/i18n";
import {
    activeDependents,
    allPlugins,
    type Category,
    definePlugin,
    getPlugin,
    isActive,
    isEnabled,
    isNew,
    isRecent,
    onPluginStateChange,
    pendingRestart,
    type Plugin,
    pluginError,
    restartPlugin,
    setEnabled,
} from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { clear, h } from "@lib/dom";
import { icon } from "@lib/icons";
import { createHost, type Host } from "@lib/ui";
import { SEL, watch } from "@api/dom";
import { bindKey, comboLabel } from "@api/hotkeys";
import { addMenuCommand } from "@api/menu";
import { addSlotItem, slotButton } from "@api/slots";

import { renderOption } from "./options";
import { DIALOG_CSS } from "./styles";

declare const VERSION: string;
export const version = typeof VERSION === "string" ? VERSION : "dev";

/* ---------- extra tabs (other core plugins contribute them) ---------- */

export interface SettingsTab {
    id: string;
    title: Text;
    icon: string;
    order: number;
    render(container: HTMLElement): void;
}

const tabs = new Map<string, SettingsTab>();

export function registerTab(scope: Scope, tab: SettingsTab) {
    tabs.set(tab.id, tab);
    scope.defer(() => {
        tabs.delete(tab.id);
        if (state.tab === tab.id) state.tab = "plugins";
        render();
    });
    render();
}

/* ---------- labels ---------- */

const CATEGORY_LABELS: Record<Category | "favorites" | "recent" | "all", Text> = {
    favorites: { zh: "收藏", en: "Favorites" },
    recent: { zh: "最近", en: "Recent" },
    all: { zh: "全部", en: "All" },
    composer: { zh: "输入框", en: "Composer" },
    messages: { zh: "消息", en: "Messages" },
    chats: { zh: "对话", en: "Chats" },
    usage: { zh: "用量", en: "Usage" },
    notifications: { zh: "通知", en: "Notifications" },
    appearance: { zh: "外观", en: "Appearance" },
    declutter: { zh: "精简", en: "Declutter" },
    privacy: { zh: "隐私", en: "Privacy" },
    developer: { zh: "开发者", en: "Developer" },
    core: { zh: "核心", en: "Core" },
    api: { zh: "API", en: "API" },
};
const CATEGORY_ORDER: (keyof typeof CATEGORY_LABELS)[] = ["favorites", "recent", "all", "composer", "messages", "chats", "usage", "notifications", "appearance", "declutter", "privacy", "developer", "core", "api"];

const L = {
    plugins: { zh: "插件", en: "Plugins" },
    search: { zh: "搜索插件…", en: "Search plugins…" },
    reload: { zh: "以下插件需要刷新页面才能完全生效：", en: "Reload to fully apply:" },
    reloadNow: { zh: "立即刷新", en: "Reload" },
    empty: { zh: "没有匹配的插件", en: "No matching plugins" },
    favorite: { zh: "收藏", en: "Favorite" },
    pin: { zh: "置顶", en: "Pin to top" },
    options: { zh: "选项", en: "Options" },
    reset: { zh: "恢复默认", en: "Reset to defaults" },
    resetConfirm: { zh: "把这个插件的选项恢复默认？", en: "Reset this plugin's options?" },
    newBadge: { zh: "新", en: "New" },
    updated: { zh: "近期更新", en: "Updated" },
    needsReload: { zh: "需刷新", en: "Reload" },
    required: { zh: "必需", en: "Required" },
    error: { zh: "出错", en: "Error" },
    dependsOn: { zh: "依赖：", en: "Needs: " },
    keptBy: { zh: "被以下插件需要，保持开启：", en: "Kept on by: " },
    close: { zh: "关闭", en: "Close" },
    openSettings: { zh: "CC++ 设置", en: "CC++ settings" },
};

/* ---------- UI state ---------- */

interface UiPrefs {
    favorites: string[];
    pinned: string[];
}
const isPrefs = (v: unknown): v is UiPrefs => !!v && Array.isArray((v as UiPrefs).favorites) && Array.isArray((v as UiPrefs).pinned);
const prefs = persisted<UiPrefs>("settings-ui", { favorites: [], pinned: [] }, isPrefs);

const state = { open: false, tab: "plugins", category: "" as string, query: "", expanded: new Set<string>() };
let host: Host | null = null;
let scrollTop = 0;

const settings = definePluginSettings({
    language: {
        type: "select",
        label: { zh: "界面语言", en: "Language" },
        default: "auto",
        options: [
            { value: "auto", label: { zh: "跟随浏览器", en: "Follow browser" } },
            { value: "zh", label: "中文" },
            { value: "en", label: "English" },
        ],
    },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "例如 mod+shift+, （mod = ⌘ / Ctrl），留空关闭。", en: "e.g. mod+shift+, (mod = ⌘ / Ctrl). Empty disables it." }, default: "mod+shift+," },
    userMenuEntry: { type: "boolean", label: { zh: "在头像菜单里显示入口", en: "Entry in the account menu" }, default: true },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示齿轮按钮", en: "Gear button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, description: { zh: "它们由其它插件按需自动开启。", en: "They are switched on automatically when another plugin needs them." }, default: false },
});

const isFavorite = (name: string) => prefs.get().favorites.includes(name);
const isPinned = (name: string) => prefs.get().pinned.includes(name);
const toggleIn = (key: keyof UiPrefs, name: string) => {
    const current = prefs.get();
    const list = current[key].includes(name) ? current[key].filter(n => n !== name) : [...current[key], name];
    prefs.set({ ...current, [key]: list });
};

const visiblePlugins = () => allPlugins().filter(p => settings.store.showApiPlugins || !(p.hidden || p.category === "api"));

function matchesQuery(plugin: Plugin, query: string) {
    if (!query) return true;
    const hay = [plugin.name, t(plugin.title), t(plugin.description), ...Object.values(plugin.settings?.def ?? {}).map(o => t(o.label))].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).every(word => hay.includes(word));
}

function inCategory(plugin: Plugin, category: string) {
    if (category === "all") return true;
    if (category === "favorites") return isFavorite(plugin.name);
    if (category === "recent") return isRecent(plugin);
    return plugin.category === category;
}

function defaultCategory() {
    return prefs.get().favorites.some(name => getPlugin(name)) ? "favorites" : "all";
}

/* ---------- rendering ---------- */

function pluginCard(plugin: Plugin): HTMLElement {
    const enabled = isEnabled(plugin);
    const active = isActive(plugin);
    const keptBy = !enabled ? activeDependents(plugin.name) : [];
    const error = pluginError(plugin.name);
    const open = state.expanded.has(plugin.name);
    const hasOptions = !!plugin.settings && Object.keys(plugin.settings.def).length > 0;

    const sw = h("button", {
        type: "button",
        class: "switch",
        role: "switch",
        "aria-checked": String(active),
        "aria-label": t(plugin.title),
        disabled: !!plugin.required || keptBy.length > 0,
        title: keptBy.length ? t(L.keptBy) + keptBy.map(p => t(p.title)).join(", ") : "",
    });
    sw.addEventListener("click", () => setEnabled(plugin, !enabled));

    const actions = h(
        "div",
        { class: "card-actions" },
        h("button", { type: "button", class: `icon-btn${isFavorite(plugin.name) ? " on" : ""}`, title: t(L.favorite), "aria-label": t(L.favorite), onclick: () => (toggleIn("favorites", plugin.name), render()) }, icon("star", 14)),
        h("button", { type: "button", class: `icon-btn${isPinned(plugin.name) ? " on" : ""}`, title: t(L.pin), "aria-label": t(L.pin), onclick: () => (toggleIn("pinned", plugin.name), render()) }, icon("pin", 14)),
        hasOptions
            ? h("button", { type: "button", class: `icon-btn${open ? " on" : ""}`, title: t(L.options), "aria-label": t(L.options), "aria-expanded": String(open), onclick: () => (open ? state.expanded.delete(plugin.name) : state.expanded.add(plugin.name), render()) }, icon("settings", 14))
            : null,
    );

    const badges: HTMLElement[] = [];
    if (isNew(plugin.name)) badges.push(h("span", { class: "badge accent", text: t(L.newBadge) }));
    else if (isRecent(plugin)) badges.push(h("span", { class: "badge", text: t(L.updated) }));
    if (plugin.required) badges.push(h("span", { class: "badge", text: t(L.required) }));
    if (pendingRestart().includes(plugin)) badges.push(h("span", { class: "badge accent", text: t(L.needsReload) }));
    if (error) badges.push(h("span", { class: "badge bad", text: t(L.error) }));
    if (plugin.dependencies?.length && settings.store.showApiPlugins) badges.push(h("span", { class: "badge", text: t(L.dependsOn) + plugin.dependencies.join(", ") }));

    const card = h(
        "div",
        { class: `card${active ? " on" : " off"}${open ? " open" : ""}`, "data-plugin": plugin.name },
        h("div", { class: "card-top" }, h("span", { class: "card-icon" }, icon(plugin.icon ?? "puzzle", 16)), h("span", { class: "card-title", text: t(plugin.title), title: plugin.name }), actions, sw),
        h("div", { class: "card-desc", text: t(plugin.description) }),
        badges.length ? h("div", { class: "card-meta" }, ...badges) : null,
        error ? h("div", { class: "err", text: `${error.stage}: ${error.message}` }) : null,
    );

    if (open && plugin.settings) {
        const rows = Object.entries(plugin.settings.def)
            .map(([key, option]) => renderOption(plugin.settings!, key, option, render))
            .filter(Boolean) as HTMLElement[];
        const reset = h("button", { type: "button", class: "btn", text: t(L.reset) });
        reset.addEventListener("click", () => {
            if (!confirm(t(L.resetConfirm))) return;
            plugin.settings!.reset();
            render();
        });
        card.appendChild(h("div", { class: "options" }, ...rows, h("div", { class: "opt-foot" }, reset)));
    }
    return card;
}

function renderPlugins(container: HTMLElement) {
    if (!state.category) state.category = defaultCategory();
    const plugins = visiblePlugins();

    const searchInput = h("input", { class: "input", type: "search", placeholder: t(L.search), value: state.query, "aria-label": t(L.search) });
    searchInput.addEventListener("input", () => {
        state.query = searchInput.value;
        renderList();
    });
    container.appendChild(h("div", { class: "toolbar" }, h("label", { class: "search" }, icon("search", 14), searchInput)));

    const categories = CATEGORY_ORDER.filter(cat => ["favorites", "recent", "all"].includes(cat) || plugins.some(p => p.category === cat));
    const chips = h("div", { class: "chips", role: "tablist" });
    for (const cat of categories) {
        const count = plugins.filter(p => inCategory(p, cat)).length;
        const chip = h("button", { type: "button", role: "tab", class: `chip${state.category === cat ? " active" : ""}`, "aria-selected": String(state.category === cat) }, t(CATEGORY_LABELS[cat]), h("span", { class: "n", text: count }));
        chip.addEventListener("click", () => {
            state.category = cat;
            render();
        });
        chips.appendChild(chip);
    }
    container.appendChild(chips);

    const pending = pendingRestart();
    if (pending.length) {
        container.appendChild(
            h("div", { class: "banner" }, h("span", { text: t(L.reload) + " " + pending.map(p => t(p.title)).join("、") }), h("button", { type: "button", class: "btn primary", text: t(L.reloadNow), onclick: () => location.reload() })),
        );
    }

    const list = h("div");
    container.appendChild(list);
    const renderList = () => {
        clear(list);
        // A search looks through every plugin, not only the selected category.
        const shown = plugins
            .filter(p => (state.query ? true : inCategory(p, state.category)) && matchesQuery(p, state.query))
            .sort((a, b) => Number(isPinned(b.name)) - Number(isPinned(a.name)) || t(a.title).localeCompare(t(b.title)));
        if (!shown.length) {
            list.appendChild(h("div", { class: "empty", text: t(L.empty) }));
            return;
        }
        list.appendChild(h("div", { class: "grid" }, ...shown.map(pluginCard)));
    };
    renderList();
    if (state.query) queueMicrotask(() => {
        searchInput.focus();
        searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
    });
}

function render() {
    if (!host) return;
    const previous = host.box.querySelector(".content");
    if (previous) scrollTop = previous.scrollTop;
    clear(host.box);
    if (!state.open) return;

    const allTabs: SettingsTab[] = [{ id: "plugins", title: L.plugins, icon: "plug", order: 0, render: renderPlugins }, ...[...tabs.values()]].sort((a, b) => a.order - b.order);
    const current = allTabs.find(tab => tab.id === state.tab) ?? allTabs[0];

    const nav = h("nav", { class: "nav" }, h("div", { class: "brand" }, h("b", { text: "CC++" }), h("span", { text: version })));
    for (const tab of allTabs) {
        const button = h("button", { type: "button", class: `tab${tab === current ? " active" : ""}` }, icon(tab.icon, 15), t(tab.title));
        button.addEventListener("click", () => {
            state.tab = tab.id;
            scrollTop = 0;
            render();
        });
        nav.appendChild(button);
    }
    const content = h("div", { class: "content" });
    const main = h(
        "div",
        { class: "main" },
        h("div", { class: "head" }, h("h2", { text: t(current.title) }), h("button", { type: "button", class: "icon-btn", "aria-label": t(L.close), title: `${t(L.close)} (Esc)`, onclick: closeSettings }, icon("x", 16))),
        content,
    );
    const dialog = h("div", { class: "dialog", role: "dialog", "aria-modal": "true", "aria-label": t(L.openSettings) }, nav, main);
    const backdrop = h("div", { class: "backdrop" }, dialog);
    backdrop.addEventListener("mousedown", event => {
        if (event.target === backdrop) closeSettings();
    });
    host.box.appendChild(backdrop);
    try {
        current.render(content);
    } catch (error) {
        content.appendChild(h("div", { class: "err", text: String(error) }));
    }
    content.scrollTop = scrollTop;
}

export function openSettings(options: { tab?: string; plugin?: string } = {}) {
    state.open = true;
    state.tab = options.tab ?? state.tab;
    if (options.plugin) {
        state.tab = "plugins";
        state.category = "all";
        state.query = "";
        state.expanded.add(options.plugin);
    }
    render();
    if (options.plugin) queueMicrotask(() => host?.box.querySelector(`[data-plugin="${options.plugin}"]`)?.scrollIntoView({ block: "center" }));
}

export function closeSettings() {
    state.open = false;
    scrollTop = 0;
    render();
}

export const isSettingsOpen = () => state.open;

/* ---------- entry points ---------- */

function injectUserMenuEntry(scope: Scope) {
    let armedUntil = 0;
    scope.listen(document, "pointerdown", (event: PointerEvent) => {
        if ((event.target as Element | null)?.closest?.(SEL.userMenuButton)) armedUntil = Date.now() + 3000;
    }, { capture: true });
    scope.listen(document, "keydown", (event: KeyboardEvent) => {
        if ((event.key === "Enter" || event.key === " ") && (event.target as Element | null)?.closest?.(SEL.userMenuButton)) armedUntil = Date.now() + 3000;
    }, { capture: true });
    watch(scope, SEL.menu, menu => {
        if (Date.now() > armedUntil || !settings.store.userMenuEntry) return;
        const sample = menu.querySelector<HTMLElement>(SEL.menuItem);
        const item = h("div", { role: "menuitem", tabindex: "-1", class: sample?.className ?? "", "data-ccpp-entry": "", style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" } }, icon("plug", 16), h("span", { text: t(L.openSettings) }));
        const activate = (event: Event) => {
            event.preventDefault();
            event.stopPropagation();
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
            openSettings();
        };
        item.addEventListener("click", activate);
        item.addEventListener("keydown", (event: KeyboardEvent) => (event.key === "Enter" || event.key === " ") && activate(event));
        // After the first group (account/settings) when there are separators, else at the top.
        const separator = menu.querySelector('[role="separator"]');
        if (separator) separator.after(item);
        else menu.prepend(item);
        return () => item.remove();
    });
}

export default definePlugin({
    name: "Settings",
    title: { zh: "设置面板", en: "Settings" },
    description: { zh: "CC++ 的设置面板本身也是插件：插件开关、分类、搜索、收藏、置顶与选项。", en: "The CC++ settings panel, itself a plugin: switches, categories, search, favorites, pins and options." },
    category: "core",
    icon: "settings",
    required: true,
    dependencies: ["DomApi", "HotkeysApi", "MenuApi", "SlotsApi"],
    settings,
    start(scope) {
        setLang(settings.store.language as "auto" | "zh" | "en");
        host = createHost(scope, "settings", DIALOG_CSS);
        scope.defer(() => (host = null));
        scope.listen(window, "keydown", (event: KeyboardEvent) => {
            if (event.key === "Escape" && state.open) {
                event.stopPropagation();
                closeSettings();
            }
        }, { capture: true });
        scope.defer(onPluginStateChange(() => state.open && render()));
        scope.defer(prefs.subscribe(() => state.open && render()));
        if (settings.store.hotkey.trim()) bindKey(scope, settings.store.hotkey, () => (state.open ? closeSettings() : openSettings()), { inInputs: true });
        addMenuCommand(scope, `⚙️ ${t(L.openSettings)}${settings.store.hotkey ? ` (${comboLabel(settings.store.hotkey)})` : ""}`, () => openSettings());
        injectUserMenuEntry(scope);
        if (settings.store.composerEntry) addSlotItem(scope, "composer", "settings", () => slotButton(t(L.openSettings), () => openSettings(), icon("plug", 16)), 100);
        if (state.open) render();
    },
    onSettingsChange(key) {
        if (key === "language") setLang(settings.store.language as "auto" | "zh" | "en");
        if (key === "showApiPlugins" || key === "language") render();
        // Rebinding is simplest as a restart; the dialog state survives it.
        if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry") queueMicrotask(() => restartPlugin(getPlugin("Settings")!));
    },
});
