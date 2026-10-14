/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t, type Text } from "@kernel/i18n";
import {
    activeDependents,
    allPlugins,
    type Category,
    getPlugin,
    isActive,
    isEnabled,
    isNew,
    isRecent,
    pendingRestart,
    type Plugin,
    pluginError,
    setEnabled,
} from "@kernel/plugins";
import { onSettingsChange } from "@kernel/settings";
import { clear, h } from "@lib/dom";
import { icon } from "@lib/icons";

import { confirmDialog, dialogFrame, openModal } from "./layer";
import { renderOption } from "./options";
import { isFavorite, isPinned, onRedraw, prefs, toggleIn, view } from "./state";

/** void++'s PLUGIN_CATEGORY_TABS: same tabs, same order. */
const CATEGORY_LABELS: Record<Exclude<Category, "core" | "api"> | "favorites" | "recent" | "all", Text> = {
    favorites: { zh: "收藏", en: "Favorites" },
    recent: { zh: "最近", en: "Recent" },
    all: { zh: "全部", en: "All" },
    composer: { zh: "输入框", en: "Composer" },
    messages: { zh: "消息", en: "Messages" },
    chats: { zh: "对话", en: "Chats" },
    media: { zh: "媒体", en: "Media" },
    navigation: { zh: "导航", en: "Navigation" },
    notifications: { zh: "通知", en: "Notifications" },
    appearance: { zh: "外观", en: "Appearance" },
    declutter: { zh: "精简", en: "Declutter" },
    privacy: { zh: "隐私", en: "Privacy" },
    developer: { zh: "开发者", en: "Developer" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[];

const L = {
    search: { zh: "搜索 {n} 个插件…", en: "Search {n} plugins…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    reloadBanner: { zh: "有插件需要刷新页面才能完全生效：", en: "Reload the page to fully apply: " },
    reload: { zh: "刷新", en: "Reload" },
    later: { zh: "稍后", en: "Later" },
    reloadTitle: { zh: "需要刷新", en: "Reload required" },
    reloadBody: { zh: "「{name}」要刷新页面后才能完全生效。现在刷新吗？", en: "“{name}” fully applies after a reload. Reload now?" },
    empty: { zh: "没有匹配的插件", en: "No matching plugins" },
    noFavorites: { zh: "还没有收藏的插件", en: "No favorites yet" },
    noFavoritesHint: { zh: "点插件卡片上的 ☆ 收藏，常用的插件会出现在这里。", en: "Star a plugin card and it shows up here." },
    noRecent: { zh: "最近 7 天没有新增或更新的插件", en: "Nothing new or updated in the last 7 days" },
    required: { zh: "必需插件", en: "Required" },
    favorite: { zh: "收藏", en: "Favorite" },
    pin: { zh: "置顶", en: "Pin" },
    configure: { zh: "设置", en: "Settings" },
    newBadge: { zh: "NEW", en: "NEW" },
    updated: { zh: "最近更新", en: "Updated" },
    needsReload: { zh: "需刷新", en: "Reload" },
    crashed: { zh: "出错", en: "Crashed" },
    keptBy: { zh: "被这些插件需要，保持开启：", en: "Kept on by: " },
    settings: { zh: "设置", en: "Settings" },
    noOptions: { zh: "这个插件没有可调的选项。", en: "This plugin has no options." },
    reset: { zh: "重置设置", en: "Reset settings" },
    resetTitle: { zh: "重置设置？", en: "Reset settings?" },
    resetBody: { zh: "「{name}」的所有选项会恢复默认值。", en: "Every option of “{name}” goes back to its default." },
    resetOk: { zh: "重置", en: "Reset" },
    author: { zh: "作者", en: "By" },
    dependsOn: { zh: "依赖", en: "Needs" },
};

const fill = (text: Text, name: string) => t(text).replace("{name}", name);
const authorOf = (plugin: Plugin) => plugin.authors?.join(", ") || "CC++";

export const listedPlugins = () => allPlugins().filter(p => view.showApi || !(p.hidden || p.category === "api"));

function matchesQuery(plugin: Plugin, query: string) {
    if (!query) return true;
    const hay = [plugin.name, t(plugin.title), t(plugin.description), ...Object.values(plugin.settings?.def ?? {}).map(o => t(o.label))].join(" ").toLowerCase();
    return query.toLowerCase().split(/\s+/).every(word => hay.includes(word));
}

function inCategory(plugin: Plugin, category: string) {
    if (category === "all") return true;
    if (category === "favorites") return isFavorite(plugin.name);
    if (category === "recent") return isRecent(plugin);
    return plugin.category === category || !!plugin.tags?.includes(category as Category);
}

function passesFilter(plugin: Plugin) {
    if (view.filter === "enabled") return isActive(plugin);
    if (view.filter === "disabled") return !isActive(plugin);
    return true;
}

const hasOptions = (plugin: Plugin) => !!plugin.settings && Object.values(plugin.settings.def).length > 0;

/** Turns a plugin on or off, asking about a reload when the plugin needs one (void++'s ConfirmDialog). */
export async function togglePlugin(plugin: Plugin, on: boolean) {
    setEnabled(plugin, on);
    if (!plugin.restartNeeded) return;
    const reload = await confirmDialog({ title: t(L.reloadTitle), body: fill(L.reloadBody, t(plugin.title)), ok: L.reload, cancel: L.later });
    if (reload) location.reload();
}

function pluginSwitch(plugin: Plugin) {
    const enabled = isEnabled(plugin);
    const keptBy = !enabled ? activeDependents(plugin.name) : [];
    const sw = h("button", {
        type: "button",
        class: "switch",
        role: "switch",
        "aria-checked": String(isActive(plugin)),
        "aria-label": t(plugin.title),
        disabled: !!plugin.required || keptBy.length > 0,
        title: keptBy.length ? t(L.keptBy) + keptBy.map(p => t(p.title)).join(", ") : "",
    });
    sw.addEventListener("click", () => togglePlugin(plugin, !enabled));
    return sw;
}

function badges(plugin: Plugin) {
    const out: HTMLElement[] = [];
    if (isNew(plugin.name)) out.push(h("span", { class: "badge accent", text: t(L.newBadge) }));
    else if (isRecent(plugin)) out.push(h("span", { class: "badge", text: t(L.updated) }));
    if (pendingRestart().includes(plugin)) out.push(h("span", { class: "badge accent", text: t(L.needsReload) }));
    if (pluginError(plugin.name)) out.push(h("span", { class: "badge bad", text: t(L.crashed) }));
    return out;
}

function pluginCard(plugin: Plugin): HTMLElement {
    const error = pluginError(plugin.name);
    const iconBtn = (cls: string, label: Text, name: string, on: boolean, run: () => void) => {
        const button = h("button", { type: "button", class: `icon-btn ${cls}${on ? " on" : ""}`, title: t(label), "aria-label": t(label), "aria-pressed": String(on) }, icon(name, 14));
        button.addEventListener("click", run);
        return button;
    };
    const title = h("span", { class: "card-title", text: t(plugin.title), title: plugin.name });
    title.addEventListener("click", () => openPluginDialog(plugin));
    return h(
        "div",
        { class: `card${isActive(plugin) ? " on" : " off"}${error ? " crashed" : ""}`, "data-plugin": plugin.name, title: error ? `${error.stage}: ${error.message}` : null },
        h(
            "div",
            { class: "card-body" },
            h(
                "div",
                { class: "card-top" },
                h("span", { class: "chip-icon" }, icon(plugin.icon ?? "puzzle", 14)),
                title,
                h(
                    "div",
                    { class: "card-actions" },
                    iconBtn("star", L.favorite, "star", isFavorite(plugin.name), () => toggleIn("favorites", plugin.name)),
                    iconBtn("pin", L.pin, "pin", isPinned(plugin.name), () => toggleIn("pinned", plugin.name)),
                    hasOptions(plugin) ? iconBtn("cfg", L.configure, "sliders", false, () => openPluginDialog(plugin)) : null,
                    pluginSwitch(plugin),
                ),
            ),
            h("div", { class: "card-desc", text: t(plugin.description) }),
            h("div", { class: "card-gap" }),
            h("div", { class: "card-foot" }, ...badges(plugin), h("span", { class: "author", text: authorOf(plugin) })),
        ),
    );
}

const sortPlugins = (list: Plugin[]) =>
    list.sort((a, b) => Number(isPinned(b.name)) - Number(isPinned(a.name)) || Number(isFavorite(b.name)) - Number(isFavorite(a.name)) || t(a.title).localeCompare(t(b.title)));

export function defaultCategory() {
    return prefs.get().favorites.some(name => getPlugin(name)) ? "favorites" : "all";
}

export function renderPluginsTab(container: HTMLElement) {
    if (!view.category) view.category = defaultCategory();
    const plugins = listedPlugins();

    // void++'s layout: category tabs first (no counts), then the search box, whose placeholder counts the
    // plugins in the selected tab, and the enabled / disabled filter.
    const categories = CATEGORY_ORDER.filter(cat => ["favorites", "recent", "all"].includes(cat) || plugins.some(p => inCategory(p, cat)));
    const tabBar = h("div", { class: "tabs", role: "tablist" });
    const searchLabel = () => t(L.search).replace("{n}", String(plugins.filter(p => inCategory(p, view.category)).length));
    const search = h("input", { class: "input", type: "search", placeholder: searchLabel(), value: view.query, "aria-label": searchLabel() });
    for (const cat of categories) {
        const button = h("button", { type: "button", role: "tab", class: view.category === cat ? "active" : "", "aria-selected": String(view.category === cat) }, t(CATEGORY_LABELS[cat]));
        button.addEventListener("click", () => {
            view.category = cat;
            for (const other of tabBar.children) other.classList.toggle("active", other === button), other.setAttribute("aria-selected", String(other === button));
            search.placeholder = searchLabel();
            search.setAttribute("aria-label", searchLabel());
            renderList();
        });
        tabBar.appendChild(button);
    }
    container.appendChild(tabBar);

    search.addEventListener("input", () => {
        view.query = search.value;
        renderList();
    });
    const filter = h(
        "select",
        { class: "input", "aria-label": t(L.all) },
        ...(["all", "enabled", "disabled"] as const).map(value => h("option", { value, text: t(L[value]), selected: view.filter === value })),
    );
    filter.addEventListener("change", () => {
        view.filter = filter.value as typeof view.filter;
        renderList();
    });
    container.appendChild(h("div", { class: "bar" }, h("label", { class: "search" }, icon("search", 14), search), filter));

    const pending = pendingRestart();
    if (pending.length) {
        const reload = h("button", { type: "button", class: "btn primary", text: t(L.reload) });
        reload.addEventListener("click", () => location.reload());
        container.appendChild(h("div", { class: "banner" }, icon("alert", 16), h("span", { text: t(L.reloadBanner) + pending.map(p => t(p.title)).join("、") }), reload));
    }

    const list = h("div");
    container.appendChild(list);
    function renderList() {
        clear(list);
        // A search looks through every plugin, not only the selected category.
        const shown = plugins.filter(p => (view.query ? true : inCategory(p, view.category)) && matchesQuery(p, view.query) && passesFilter(p));
        if (!shown.length) {
            const [title, hint] =
                view.category === "favorites" && !view.query ? [L.noFavorites, L.noFavoritesHint] : view.category === "recent" && !view.query ? [L.noRecent, null] : [L.empty, null];
            list.appendChild(h("div", { class: "empty" }, h("b", { text: t(title) }), hint ? t(hint) : null));
            return;
        }
        // In "All", required plugins go below a separator like void++.
        const splitRequired = view.category === "all" && !view.query;
        const main = sortPlugins(shown.filter(p => !splitRequired || !p.required));
        const required = splitRequired ? sortPlugins(shown.filter(p => p.required)) : [];
        if (main.length) list.appendChild(h("div", { class: "grid" }, ...main.map(pluginCard)));
        if (required.length) list.append(h("div", { class: "sep", text: t(L.required) }), h("div", { class: "grid" }, ...required.map(pluginCard)));
    }
    renderList();
}

/** void++'s PluginDialog: title, description, the plugin's settings and a reset button. */
export function openPluginDialog(plugin: Plugin) {
    const body = h("div");
    const draw = () => {
        clear(body);
        const meta = h("div", { class: "d-meta" }, ...badges(plugin), h("span", { text: `${t(L.author)} ${authorOf(plugin)}` }));
        if (plugin.dependencies?.length && view.showApi) meta.appendChild(h("span", { text: `· ${t(L.dependsOn)} ${plugin.dependencies.join(", ")}` }));
        const top = h("div", { class: "row" }, h("div", { class: "row-text" }, h("p", { class: "d-desc", text: t(plugin.description) }), meta), h("div", { class: "row-control" }, pluginSwitch(plugin)));
        const error = pluginError(plugin.name);
        body.append(top);
        if (error) body.appendChild(h("div", { class: "banner" }, icon("alert", 16), h("span", { text: `${error.stage}: ${error.message}` })));
        body.appendChild(h("div", { class: "d-sep" }));
        body.appendChild(h("div", { class: "d-title", text: t(L.settings) }));
        if (!hasOptions(plugin)) {
            body.appendChild(h("p", { class: "muted", text: t(L.noOptions) }));
            return;
        }
        const rows = Object.entries(plugin.settings!.def)
            .map(([key, option]) => renderOption(plugin.settings!, key, option, draw))
            .filter(Boolean) as HTMLElement[];
        body.appendChild(h("div", { class: "rows" }, ...rows));
    };
    draw();
    const reset = h("button", { type: "button", class: "btn danger", text: t(L.reset), disabled: !hasOptions(plugin) });
    reset.addEventListener("click", async () => {
        if (!(await confirmDialog({ title: t(L.resetTitle), body: fill(L.resetBody, t(plugin.title)), ok: L.resetOk, danger: true }))) return;
        plugin.settings!.reset();
        draw();
    });
    let close = () => {};
    const frame = dialogFrame({ title: t(plugin.title), icon: plugin.icon ?? "puzzle", body: [body], foot: [reset, h("span", { class: "grow" })], onClose: () => close() });
    // Keep the switch and badges current while the dialog is open; option rows keep their own state.
    const offSettings = onSettingsChange(name => name === plugin.name && refreshHead());
    const offRedraw = onRedraw(refreshHead);
    function refreshHead() {
        const top = body.querySelector(":scope > .row");
        const fresh = h("div", { class: "row-control" }, pluginSwitch(plugin));
        top?.querySelector(".row-control")?.replaceWith(fresh);
    }
    close = openModal(frame, {
        onClose: () => {
            offSettings();
            offRedraw();
        },
    });
}
