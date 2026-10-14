/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { setLang, t } from "@kernel/i18n";
import { definePlugin, getPlugin, onPluginStateChange, type Plugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { definePluginSettings, onSettingsChange } from "@kernel/settings";
import { icon } from "@lib/icons";
import { bindKey, comboLabel } from "@api/hotkeys";
import { addMenuCommand } from "@api/menu";
import { addSlotItem, slotButton } from "@api/slots";

import { closeAllModals, initLayer } from "./layer";
import { closeStandalone, installNative, nativeOpen, openNative, openStandalone, sortedTabs, standaloneOpen } from "./native";
import { listedPlugins, openPluginDialog, renderPluginsTab } from "./pluginsTab";
import { prefs, redraw, type SettingsTab, tabs, version, view } from "./state";
import { installUserMenu } from "./userMenu";

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
        description: { zh: "CC++ 的页面作为一组标签出现在 claude.ai 设置的侧栏里。关掉后用独立弹窗。", en: "CC++ pages appear as a group in claude.ai's settings sidebar. Off uses a standalone dialog." },
        default: true,
    },
    navPosition: {
        type: "select",
        label: { zh: "CC++ 分组位置", en: "CC++ group position" },
        description: { zh: "在 claude.ai 设置侧栏里放在原生分区的上方还是下方。", en: "Above or below claude.ai's own sections in the settings sidebar." },
        default: "below",
        options: [
            { value: "below", label: { zh: "下方", en: "Below" } },
            { value: "above", label: { zh: "上方", en: "Above" } },
        ],
    },
    userMenuEntry: { type: "boolean", label: { zh: "头像菜单里的 CC++ 子菜单", en: "CC++ submenu in the account menu" }, description: { zh: "CC++ › 插件 › 列出全部插件，点开即该插件的设置。", en: "CC++ › Plugins › lists every plugin; click one for its settings." }, default: true },
    settingsFlyout: { type: "boolean", label: { zh: "头像菜单的「设置」展开成子菜单", en: "Account-menu Settings opens a submenu" }, description: { zh: "悬停展开：CC++ 页面和 claude.ai 各设置页；直接点击仍打开设置。", en: "Hover for CC++ pages and claude.ai's settings pages; a click still opens settings." }, default: true },
    hotkey: { type: "string", label: { zh: "打开设置的快捷键", en: "Shortcut to open settings" }, description: { zh: "例如 mod+shift+. （mod = ⌘ / Ctrl），留空关闭。", en: "e.g. mod+shift+. (mod = ⌘ / Ctrl). Empty disables it." }, default: "mod+shift+." },
    composerEntry: { type: "boolean", label: { zh: "在输入框旁显示 CC++ 按钮", en: "CC++ button next to the model picker" }, default: false },
    showApiPlugins: { type: "boolean", label: { zh: "显示 API / 核心插件", en: "Show API and core plugins" }, description: { zh: "它们由其它插件按需自动开启。", en: "They are switched on automatically when another plugin needs them." }, default: false },
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

/** Hotkey, account menu, script-manager menu and composer button; rebuilt when their options change. */
let entries: Scope | null = null;
function installEntries(parent: Scope) {
    entries?.dispose();
    const scope = (entries = parent.child());
    if (settings.store.userMenuEntry || settings.store.settingsFlyout) {
        installUserMenu(scope, {
            entry: settings.store.userMenuEntry,
            settingsFlyout: settings.store.settingsFlyout,
            tabs: sortedTabs,
            plugins: () => listedPlugins().sort((a: Plugin, b: Plugin) => t(a.title).localeCompare(t(b.title))),
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
    },
    onSettingsChange(key, scope) {
        if (key === "language") setLang(settings.store.language as "auto" | "zh" | "en");
        if (key === "showApiPlugins") view.showApi = settings.store.showApiPlugins;
        if (key === "hotkey" || key === "composerEntry" || key === "userMenuEntry" || key === "settingsFlyout") installEntries(scope);
        redraw();
    },
});
