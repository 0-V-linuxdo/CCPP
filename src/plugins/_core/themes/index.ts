/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t, type Text } from "@kernel/i18n";
import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import { persisted } from "@kernel/storage";
import { clear, h } from "@lib/dom";
import { icon } from "@lib/icons";
import { tipAttrs } from "@lib/tooltip";
import { addStyle } from "@api/styles";
import { toast } from "@api/notices";
import { confirmDialog, dialogFrame, openModal, registerTab } from "@core/settings";

const logger = new Logger("Themes");

declare const GM_xmlhttpRequest:
    | ((details: { method: string; url: string; timeout?: number; onload(r: { status: number; responseText: string }): void; onerror(e: unknown): void; ontimeout?(): void }) => void)
    | undefined;

export interface OnlineTheme {
    url: string;
    enabled: boolean;
    css?: string;
    fetchedAt?: number;
    error?: string;
}
export interface LocalTheme {
    id: string;
    name: string;
    author: string;
    css: string;
    enabled: boolean;
}
export interface ThemeStore {
    online: OnlineTheme[];
    local: LocalTheme[];
}

const isStore = (v: unknown): v is ThemeStore => !!v && Array.isArray((v as ThemeStore).online) && Array.isArray((v as ThemeStore).local);
const store = persisted<ThemeStore>("themes", { online: [], local: [] }, isStore);

export interface ThemeMeta {
    name?: string;
    author?: string;
    description?: string;
}

/** Reads `@name`, `@author` and `@description` from the first comment block, BetterDiscord style. */
export function parseMeta(css: string): ThemeMeta {
    const block = /\/\*([\s\S]*?)\*\//.exec(css)?.[1] ?? "";
    const meta: ThemeMeta = {};
    for (const match of block.matchAll(/@(name|author|description)\s+([^\n*]+)/g)) meta[match[1] as keyof ThemeMeta] = match[2].trim();
    return meta;
}

export function validThemeUrl(raw: string) {
    try {
        const url = new URL(raw.trim());
        return url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}

/** The CSS every enabled theme contributes, in list order (online first, then local). */
export function combinedCss(themes: ThemeStore) {
    return [...themes.online.filter(x => x.enabled && x.css).map(x => `/* ${x.url} */\n${x.css}`), ...themes.local.filter(x => x.enabled).map(x => `/* ${x.name} */\n${x.css}`)].join("\n\n");
}

function fetchText(url: string): Promise<string> {
    if (typeof GM_xmlhttpRequest === "function") {
        return new Promise((resolve, reject) =>
            GM_xmlhttpRequest!({
                method: "GET",
                url,
                timeout: 15000,
                onload: r => (r.status >= 200 && r.status < 300 ? resolve(r.responseText) : reject(new Error(`HTTP ${r.status}`))),
                onerror: () => reject(new Error("network")),
                ontimeout: () => reject(new Error("timeout")),
            }),
        );
    }
    return fetch(url, { credentials: "omit" }).then(r => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))));
}

const REFRESH_MS = 60 * 60 * 1000;

async function refreshOnline(url: string, force = false) {
    const theme = store.get().online.find(x => x.url === url);
    if (!theme || (!force && theme.css && Date.now() - (theme.fetchedAt ?? 0) < REFRESH_MS)) return;
    let patch: Partial<OnlineTheme>;
    try {
        patch = { css: await fetchText(url), fetchedAt: Date.now(), error: undefined };
    } catch (error) {
        logger.warn("Theme download failed:", url, error);
        patch = { error: error instanceof Error ? error.message : String(error) };
    }
    const current = store.get();
    store.set({ ...current, online: current.online.map(x => (x.url === url ? { ...x, ...patch } : x)) });
}

const L = {
    title: { zh: "主题", en: "Themes" },
    search: { zh: "搜索主题…", en: "Search themes…" },
    all: { zh: "全部", en: "All" },
    enabled: { zh: "已启用", en: "Enabled" },
    disabled: { zh: "已停用", en: "Disabled" },
    online: { zh: "在线主题", en: "Online themes" },
    local: { zh: "本地主题", en: "Local themes" },
    onlineShort: { zh: "在线", en: "Online" },
    localShort: { zh: "本地", en: "Local" },
    add: { zh: "添加", en: "Add" },
    create: { zh: "新建", en: "New" },
    addOnline: { zh: "添加在线主题", en: "Add online theme" },
    urlLabel: { zh: "CSS 地址（https）", en: "CSS URL (https)" },
    urlHint: { zh: "CC++ 会下载这个 CSS 并应用到 claude.ai，每小时更新一次。", en: "CC++ downloads this CSS, applies it to claude.ai and refreshes it hourly." },
    badUrl: { zh: "请填写 https 开头的地址", en: "Enter an https URL" },
    dupUrl: { zh: "这个主题已经添加过了", en: "That theme is already added" },
    editLocal: { zh: "编辑本地主题", en: "Edit local theme" },
    newLocal: { zh: "新建本地主题", en: "New local theme" },
    name: { zh: "名称", en: "Name" },
    author: { zh: "作者", en: "Author" },
    css: { zh: "CSS", en: "CSS" },
    save: { zh: "保存", en: "Save" },
    cancel: { zh: "取消", en: "Cancel" },
    edit: { zh: "编辑", en: "Edit" },
    copyUrl: { zh: "复制地址", en: "Copy URL" },
    copied: { zh: "已复制", en: "Copied" },
    refresh: { zh: "重新下载", en: "Download again" },
    remove: { zh: "删除", en: "Delete" },
    removeTitle: { zh: "删除主题？", en: "Delete theme?" },
    removeBody: { zh: "「{name}」会被删除。", en: "“{name}” will be deleted." },
    emptyOnline: { zh: "还没有在线主题。点「添加」填一个 CSS 地址。", en: "No online themes yet. Use Add to enter a CSS URL." },
    emptyLocal: { zh: "还没有本地主题。点「新建」自己写一个。", en: "No local themes yet. Use New to write one." },
    noMatch: { zh: "没有匹配的主题", en: "No matching themes" },
    failed: { zh: "下载失败", en: "Download failed" },
    lines: { zh: "{n} 行 CSS", en: "{n} lines of CSS" },
    untitled: { zh: "未命名主题", en: "Untitled theme" },
};

const ui = { query: "", filter: "all" as "all" | "enabled" | "disabled" | "online" | "local" };

const nameOfOnline = (theme: OnlineTheme) => parseMeta(theme.css ?? "").name || new URL(theme.url).pathname.split("/").pop() || theme.url;

function setOnline(url: string, patch: Partial<OnlineTheme>) {
    const current = store.get();
    store.set({ ...current, online: current.online.map(x => (x.url === url ? { ...x, ...patch } : x)) });
}
function setLocal(id: string, patch: Partial<LocalTheme> | null) {
    const current = store.get();
    store.set({ ...current, local: patch ? current.local.map(x => (x.id === id ? { ...x, ...patch } : x)) : current.local.filter(x => x.id !== id) });
}

function themeCard(o: { name: string; desc: string; author: string; online: boolean; enabled: boolean; error?: string; actions: HTMLElement[]; toggle(on: boolean): void }) {
    const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(o.enabled), "aria-label": o.name });
    sw.addEventListener("click", () => o.toggle(!o.enabled));
    return h(
        "div",
        { class: `card${o.enabled ? " on" : " off"}${o.error ? " crashed" : ""}` },
        h(
            "div",
            { class: "card-body" },
            h("div", { class: "card-top" }, h("span", { class: "chip-icon" }, icon("palette", 14)), h("span", { class: "card-title", text: o.name, ...tipAttrs(o.name), style: { cursor: "default" } }), h("div", { class: "card-actions" }, ...o.actions, sw)),
            h("div", { class: "card-desc", text: o.desc }),
            h("div", { class: "card-gap" }),
            h(
                "div",
                { class: "card-foot" },
                icon(o.online ? "globe" : "folder", 12),
                h("span", { text: t(o.online ? L.onlineShort : L.localShort) }),
                o.error ? h("span", { class: "badge bad", text: t(L.failed), ...tipAttrs(t(L.failed), o.error) }) : null,
                h("span", { class: "author", text: o.author }),
            ),
        ),
    );
}

const iconAction = (name: string, label: Text, run: () => void) => {
    const button = h("button", { type: "button", class: "icon-btn", ...tipAttrs(t(label)), "aria-label": t(label) }, icon(name, 14));
    button.addEventListener("click", run);
    return button;
};

async function askRemove(name: string) {
    return confirmDialog({ title: t(L.removeTitle), body: t(L.removeBody).replace("{name}", name), ok: L.remove, danger: true });
}

function openAddOnline() {
    const input = h("input", { class: "input", type: "url", placeholder: "https://…/theme.css", autofocus: true, "aria-label": t(L.urlLabel) });
    const error = h("div", { class: "row-desc", style: { color: "var(--bad)" } });
    const add = h("button", { type: "button", class: "btn primary", text: t(L.add) });
    const cancel = h("button", { type: "button", class: "btn", text: t(L.cancel) });
    const submit = () => {
        const url = validThemeUrl(input.value);
        if (!url) return void (error.textContent = t(L.badUrl));
        if (store.get().online.some(x => x.url === url)) return void (error.textContent = t(L.dupUrl));
        const current = store.get();
        store.set({ ...current, online: [...current.online, { url, enabled: true }] });
        void refreshOnline(url, true);
        close();
    };
    add.addEventListener("click", submit);
    input.addEventListener("keydown", event => event.key === "Enter" && submit());
    let close = () => {};
    cancel.addEventListener("click", () => close());
    close = openModal(dialogFrame({ title: t(L.addOnline), icon: "globe", size: "small", body: [h("div", { class: "field" }, h("label", { text: t(L.urlLabel) }), input, error), h("p", { class: "hint", text: t(L.urlHint) })], foot: [cancel, add], onClose: () => close() }));
}

function openLocalEditor(theme?: LocalTheme) {
    const name = h("input", { class: "input", value: theme?.name ?? "", placeholder: t(L.untitled), autofocus: true });
    const author = h("input", { class: "input", value: theme?.author ?? "" });
    const css = h("textarea", { class: "input editor", rows: 16, spellcheck: false, placeholder: "/* @name My theme */\n:root { }" });
    css.value = theme?.css ?? "";
    css.addEventListener("keydown", event => {
        if (event.key !== "Tab") return;
        event.preventDefault();
        css.setRangeText("  ", css.selectionStart, css.selectionEnd, "end");
    });
    const save = h("button", { type: "button", class: "btn primary", text: t(L.save) });
    const cancel = h("button", { type: "button", class: "btn", text: t(L.cancel) });
    save.addEventListener("click", () => {
        const meta = parseMeta(css.value);
        const next = { name: name.value.trim() || meta.name || t(L.untitled), author: author.value.trim() || meta.author || "", css: css.value };
        if (theme) setLocal(theme.id, next);
        else {
            const current = store.get();
            store.set({ ...current, local: [...current.local, { id: `t${Date.now().toString(36)}`, enabled: true, ...next }] });
        }
        close();
    });
    let close = () => {};
    cancel.addEventListener("click", () => close());
    close = openModal(
        dialogFrame({
            title: t(theme ? L.editLocal : L.newLocal),
            icon: "palette",
            size: "wide",
            body: [h("div", { class: "field" }, h("label", { text: t(L.name) }), name), h("div", { class: "field" }, h("label", { text: t(L.author) }), author), h("div", { class: "field" }, h("label", { text: t(L.css) }), css)],
            foot: [cancel, save],
            onClose: () => close(),
        }),
    );
}

function renderThemes(container: HTMLElement) {
    const search = h("input", { class: "input", type: "search", placeholder: t(L.search), value: ui.query, "aria-label": t(L.search) });
    const filter = h(
        "select",
        { class: "input", "aria-label": t(L.all) },
        ...(["all", "enabled", "disabled", "online", "local"] as const).map(value => h("option", { value, text: t(value === "online" ? L.onlineShort : value === "local" ? L.localShort : L[value]), selected: ui.filter === value })),
    );
    container.appendChild(h("div", { class: "sticky-top" }, h("div", { class: "bar" }, h("label", { class: "search" }, icon("search", 14), search), filter)));
    const body = h("div");
    container.appendChild(body);

    const matches = (name: string, extra: string, enabled: boolean) =>
        (!ui.query || `${name} ${extra}`.toLowerCase().includes(ui.query.toLowerCase())) && (ui.filter === "enabled" ? enabled : ui.filter === "disabled" ? !enabled : true);

    const draw = () => {
        clear(body);
        const themes = store.get();
        const section = (title: Text, buttonText: Text, buttonIcon: string, onAdd: () => void, cards: HTMLElement[], empty: Text) => {
            const add = h("button", { type: "button", class: "btn" }, icon(buttonIcon, 14), t(buttonText));
            add.addEventListener("click", onAdd);
            const filtered = ui.query || ui.filter !== "all";
            body.appendChild(
                h(
                    "div",
                    { class: "section" },
                    h("div", { class: "section-head" }, h("h3", { text: t(title) }), add),
                    cards.length ? h("div", { class: "grid" }, ...cards) : h("div", { class: "empty", text: t(filtered ? L.noMatch : empty) }),
                ),
            );
        };
        if (ui.filter !== "local") {
            const cards = themes.online
                .filter(x => matches(nameOfOnline(x), x.url, x.enabled))
                .map(theme => {
                    const meta = parseMeta(theme.css ?? "");
                    return themeCard({
                        name: nameOfOnline(theme),
                        desc: meta.description || theme.url,
                        author: meta.author || new URL(theme.url).host,
                        online: true,
                        enabled: theme.enabled,
                        error: theme.error,
                        toggle: on => {
                            setOnline(theme.url, { enabled: on });
                            if (on) void refreshOnline(theme.url);
                        },
                        actions: [
                            iconAction("copy", L.copyUrl, () => navigator.clipboard?.writeText(theme.url).then(() => toast(t(L.copied), { kind: "ok" }))),
                            iconAction("refresh", L.refresh, () => void refreshOnline(theme.url, true)),
                            iconAction("trash", L.remove, async () => {
                                if (!(await askRemove(nameOfOnline(theme)))) return;
                                const current = store.get();
                                store.set({ ...current, online: current.online.filter(x => x.url !== theme.url) });
                            }),
                        ],
                    });
                });
            section(L.online, L.add, "plus", openAddOnline, cards, L.emptyOnline);
        }
        if (ui.filter !== "online") {
            const cards = themes.local
                .filter(x => matches(x.name, x.author, x.enabled))
                .map(theme =>
                    themeCard({
                        name: theme.name,
                        desc: parseMeta(theme.css).description || t(L.lines).replace("{n}", String(theme.css.split("\n").length)),
                        author: theme.author || "—",
                        online: false,
                        enabled: theme.enabled,
                        toggle: on => setLocal(theme.id, { enabled: on }),
                        actions: [
                            iconAction("pencil", L.edit, () => openLocalEditor(theme)),
                            iconAction("trash", L.remove, async () => (await askRemove(theme.name)) && setLocal(theme.id, null)),
                        ],
                    }),
                );
            section(L.local, L.create, "plus", () => openLocalEditor(), cards, L.emptyLocal);
        }
    };
    search.addEventListener("input", () => {
        ui.query = search.value;
        draw();
    });
    filter.addEventListener("change", () => {
        ui.filter = filter.value as typeof ui.filter;
        draw();
    });
    draw();
}

export default definePlugin({
    name: "Themes",
    title: L.title,
    description: { zh: "在线主题（填 CSS 地址）和本地主题（自己写 CSS），可分别启用、编辑、删除。", en: "Online themes (from a CSS URL) and local themes (your own CSS), each switchable, editable and removable." },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings", "NoticesApi"],
    start(scope) {
        const setCss = addStyle(scope, combinedCss(store.get()), "themes");
        let redrawTab = () => {};
        scope.defer(
            store.subscribe(value => {
                setCss(combinedCss(value));
                redrawTab();
            }),
        );
        for (const theme of store.get().online) if (theme.enabled) void refreshOnline(theme.url);
        registerTab(scope, {
            id: "themes",
            title: L.title,
            icon: "palette",
            order: 10,
            render(container) {
                renderThemes(container);
                // Redraw this page in place when the store changes (a download finished, a theme was added).
                redrawTab = () => {
                    if (!container.isConnected) return;
                    const top = container.scrollTop;
                    clear(container);
                    renderThemes(container);
                    container.scrollTop = top;
                };
            },
        });
    },
});
