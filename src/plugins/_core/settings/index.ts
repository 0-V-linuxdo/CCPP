/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { setLang, t } from "@kernel/i18n";
import { definePlugin, getPlugin, isActive, onPluginStateChange, type Plugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { definePluginSettings, onSettingsChange, type OptionsDef } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { icon } from "@lib/icons";
import { bindKey, comboKeys, comboLabel } from "@api/hotkeys";
import { addMenuCommand } from "@api/menu";
import { addSlotItem, slotButton } from "@api/slots";

import { closeAllModals, initLayer } from "./layer";
import { closeStandalone, installNative, nativeOpen, openNative, openStandalone, sortedTabs, standaloneOpen } from "./native";
import { listedPlugins, openPluginDialog, renderPluginsTab } from "./pluginsTab";
import { isFavorite, prefs, redraw, type SettingsTab, tabs, version, view } from "./state";
import { installUserMenu, NATIVE_SECTIONS } from "./userMenu";

export { version };
export type { SettingsTab };
export { confirmDialog, dialogFrame, openModal } from "./layer";

const L = {
    plugins: { zh: "插件", en: "Plugins" },
    openSettings: { zh: "CC++ 设置", en: "CC++ settings" },
};

/** Adds a CC++ page (Themes, Quick CSS…) to the settings nav for as long as `scope` lives. */
export function registerTab(scope: Scope, tab: SettingsTab) {
    tabs.set(tab.id, tab);
    scope.defer(() => {
        if (tabs.get(tab.id) === tab) tabs.delete(tab.id);
        redraw();
    });
    redraw();
}

const inFlyout = (v: Record<string, unknown>) => v.settingsFlyout === true;
/** One switch per claude.ai page in the Settings submenu, like void++'s SettingsFlyout. */
const flyoutSections: OptionsDef = Object.fromEntries(
    NATIVE_SECTIONS.map(section => [
        `flyout:${section.hash}`,
        { type: "boolean", label: { zh: `子菜单里显示「${section.label.zh}」`, en: `Show “${section.label.en}” in the submenu` }, default: true, visible: inFlyout },
    ]),
);

const settings = definePluginSettings({
    language: {
        type: "select",
        label: { zh: "界面语言", en: "Language" },
        default: "auto",
        options: [
            { value: "auto", label: { zh: "跟随 claude.ai", en: "Follow claude.ai" } },
            { value: "zh", label: "中文" },
            { value: "en", label: "English" },
        ],
    },
    nativeDialog: {
        type: "boolean",
        label: { zh: "放进 claude.ai 的设置弹窗", en: "Live inside claude.ai's settings dialog" },
        description: { zh: "关闭后用独立弹窗。", en: "Off uses a separate dialog." },
        default: true,
    },
    navPosition: {
        type: "select",
        label: { zh: "CC++ 分组位置", en: "CC++ group position" },
        default: "below",
        options: [
            { value: "below", label: { zh: "下方", en: "Below" } },
            { value: "above", label: { zh: "上方", en: "Above" } },
        ],
    },
    userMenuEntry: { type: "boolean", label: { zh: "头像菜单里的 CC++ 子菜单", en: "CC++ submenu in the account menu" }, default: true },
    settingsFlyout: { type: "boolean", label: { zh: "头像菜单的「设置」展开成子菜单", en: "Account-menu Settings opens a submenu" }, description: { zh: "悬停展开，点击仍打开设置。", en: "Hover to expand; click still opens settings." }, default: true },
    flyoutOpen: { type: "boolean", label: { zh: "子菜单里显示「打开设置」", en: "Show “Open settings” in the submenu" }, default: true, visible: inFlyout },
    flyoutLast: {
        type: "boolean",
        label: { zh: "「打开设置」回到上次看的设置页", en: "“Open settings” returns to the last settings page" },
        description: { zh: "关闭后总是打开「通用」。", en: "Off always opens General." },
        default: true,
        visible: v => inFlyout(v) && v.flyoutOpen === true,
    },
    flyoutCcpp: { type: "boolean", label: { zh: "子菜单里显示 CC++ 的页面", en: "Show CC++ pages in the submenu" }, default: true, visible: inFlyout },
    ...flyoutSections,
    menuPlugins: {
        type: "select",
        label: { zh: "「插件」子菜单列出哪些插件", en: "Plugins listed in the Plugins submenu" },
        default: "all",
        options: [
            { value: "all", label: { zh: "全部", en: "All" } },
            { value: "enabled", label: { zh: "已开启的", en: "Enabled ones" } },
            { value: "favorites", label: { zh: "收藏的", en: "Favorites" } },
            { value: "configurable", label: { zh: "有设置项的", en: "Ones with settings" } },
        ],
        visible: v => v.userMenuEntry === true || inFlyout(v),
    },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "如 mod+shift+.，留空关闭。", en: "e.g. mod+shift+.; empty disables." }, default: "mod+shift+." },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示 CC++ 按钮", en: "CC++ button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, default: false },
});

export const isSettingsOpen = () => nativeOpen() || standaloneOpen();

/** Opens CC++ settings on a page, or straight into one plugin's settings dialog. */
export async function openSettings(options: { tab?: string; plugin?: string } = {}) {
    const plugin = options.plugin ? getPlugin(options.plugin) : undefined;
    if (plugin) {
        view.category = "all";
        view.query = "";
    }
    const tab = plugin ? "plugins" : options.tab && tabs.has(options.tab) ? options.tab : "plugins";
    let shown = false;
    if (settings.store.nativeDialog) shown = await openNative(tab);
    if (!shown) openStandalone(tab);
    if (plugin) openPluginDialog(plugin);
}

export function closeSettings() {
    closeAllModals();
    closeStandalone();
    if (nativeOpen()) document.querySelector<HTMLElement>('[data-perf-region="settings_panel"] button[aria-label]')?.click();
}

/** The claude.ai settings page last opened, for the submenu's "Open settings". */
const lastNative = persisted<string>("settings-last-native", "settings/general", (v): v is string => typeof v === "string" && NATIVE_SECTIONS.some(s => s.hash === v));
const nativeHash = () => (settings.store.flyoutLast ? lastNative.get() : "settings/general");

/** Plugins the account menu's Plugins submenu lists. */
function menuPlugins() {
    const all = listedPlugins().sort((a: Plugin, b: Plugin) => t(a.title).localeCompare(t(b.title)));
    switch (settings.store.menuPlugins) {
        case "enabled":
            return all.filter(p => isActive(p));
        case "favorites":
            return all.filter(p => isFavorite(p.name));
        case "configurable":
            return all.filter(p => Object.values(p.settings?.def ?? {}).some(o => o.type !== "action"));
        default:
            return all;
    }
}

/** Hotkey, account menu, script-manager menu and composer button; rebuilt when their options change. */
let entries: Scope | null = null;
function installEntries(parent: Scope) {
    entries?.dispose();
    const scope = (entries = parent.child());
    if (settings.store.userMenuEntry || settings.store.settingsFlyout) {
        installUserMenu(scope, {
            entry: settings.store.userMenuEntry,
            settingsFlyout: settings.store.settingsFlyout,
            shortcut: settings.store.hotkey.trim() ? comboKeys(settings.store.hotkey) : [],
            tabs: sortedTabs,
            plugins: menuPlugins,
            flyoutShows: row => (settings.store as Record<string, unknown>)[row === "open" ? "flyoutOpen" : row === "ccpp" ? "flyoutCcpp" : `flyout:${row}`] !== false,
            nativeHash,
            openTab: tab => openSettings({ tab }),
            openPlugin: plugin => openPluginDialog(plugin),
        });
    }
    const toggle = () => (isSettingsOpen() ? closeSettings() : openSettings());
    if (settings.store.hotkey.trim()) bindKey(scope, settings.store.hotkey, toggle, { inInputs: true });
    addMenuCommand(scope, `⚙️ ${t(L.openSettings)}${settings.store.hotkey ? ` (${comboLabel(settings.store.hotkey)})` : ""}`, () => openSettings());
    if (settings.store.composerEntry) addSlotItem(scope, "composer", "settings", () => slotButton(t(L.openSettings), () => openSettings(), icon("plug", 16)), 100);
}

export default definePlugin({
    name: "Settings",
    title: { zh: "设置面板", en: "Settings" },
    description: {
        zh: "CC++ 的设置界面本身也是插件：claude.ai 设置侧栏里的 CC++ 分组、头像菜单子菜单、插件卡片（收藏、置顶、单插件设置弹窗）。",
        en: "The CC++ settings UI, itself a plugin: the CC++ group in claude.ai's settings sidebar, the account-menu submenu, and plugin cards with favorites, pins and per-plugin dialogs.",
    },
    category: "core",
    icon: "settings",
    updatedAt: "2026-10-30",
    required: true,
    dependencies: ["DomApi", "HotkeysApi", "MenuApi", "SlotsApi", "StylesApi"],
    settings,
    start(scope) {
        setLang(settings.store.language as "auto" | "zh" | "en");
        view.showApi = settings.store.showApiPlugins;
        registerTab(scope, { id: "plugins", title: L.plugins, icon: "puzzle", order: 0, render: renderPluginsTab });
        initLayer(scope);
        installNative(scope, () => (settings.store.navPosition === "above" ? "above" : "below"));
        scope.defer(onPluginStateChange(redraw));
        scope.defer(onSettingsChange((_, key) => key === "enabled" && redraw()));
        scope.defer(prefs.subscribe(redraw));
        installEntries(scope);
        const remember = () => {
            const hash = location.hash.slice(1);
            if (NATIVE_SECTIONS.some(s => s.hash === hash)) lastNative.set(hash);
        };
        remember();
        scope.listen(window, "hashchange", remember);
    },
    onSettingsChange(key, scope) {
        if (key === "language") setLang(settings.store.language as "auto" | "zh" | "en");
        if (key === "showApiPlugins") view.showApi = settings.store.showApiPlugins;
        if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry" || key === "settingsFlyout") installEntries(scope);
        redraw();
    },
});
