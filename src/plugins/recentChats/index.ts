/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { clear, h } from "@lib/dom";
import { agoText } from "@lib/format";
import { createHost } from "@lib/ui";
import { chatTitle } from "@api/chatState";
import { bindKey } from "@api/hotkeys";
import { onRoute } from "@api/router";

const settings = definePluginSettings({
    hotkey: { type: "string", label: { zh: "快捷键", en: "Shortcut" }, default: "ctrl+`" },
    count: { type: "number", label: { zh: "显示几个最近对话", en: "Chats to show" }, default: 9, min: 3, max: 24 },
});

const L = {
    title: { zh: "最近打开的对话", en: "Recently opened chats" },
    empty: { zh: "还没有记录。打开过的对话会出现在这里。", en: "Nothing yet. Chats you open show up here." },
    hint: { zh: "↑↓←→ 选择 · Enter 打开 · 1–9 直达 · Esc 关闭", en: "Arrows to pick · Enter to open · 1–9 to jump · Esc to close" },
};

export interface Visit {
    id: string;
    title: string;
    at: number;
    /** Where to open it. Older entries (chats only) have none: they live at /chat/:id. */
    url?: string;
    /** The project a Claude Code thread belongs to. */
    project?: string;
}

const visits = persisted<Visit[]>(
    "recent-chats",
    [],
    (v): v is Visit[] => Array.isArray(v) && v.every(x => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.at === "number" && (x.url === undefined || typeof x.url === "string") && (x.project === undefined || typeof x.project === "string")),
);

export const visitUrl = (visit: Visit) => visit.url ?? `/chat/${visit.id}`;

/**
 * The conversation a page shows, or null when it shows none. Covers chats (/chat/:uuid) and Claude Code:
 * a project page (/code/project/chan_…, with ?thread=cmsg_… when a thread is open) and a session (/code/session_…).
 */
export function pageVisit(path: string, search: string): { id: string; url: string } | null {
    const chat = /^\/chat\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(path);
    if (chat) {
        const id = chat[1].toLowerCase();
        return { id, url: `/chat/${id}` };
    }
    const project = /^\/code\/project\/([\w-]+)/.exec(path);
    if (project) {
        const thread = new URLSearchParams(search).get("thread");
        if (thread) return { id: `${project[1]}:${thread}`, url: `/code/project/${project[1]}?thread=${encodeURIComponent(thread)}` };
        return { id: project[1], url: `/code/project/${project[1]}` };
    }
    const code = /^\/code\/([\w-]+)\/?$/.exec(path);
    if (code && !["project", "projects", "new", "settings"].includes(code[1])) return { id: code[1], url: `/code/${code[1]}` };
    return null;
}

const currentVisit = () => pageVisit(location.pathname, location.search);

/** Each Claude Code project's sidebar icon, as standalone markup (claude.ai's classes don't reach the popup). */
const icons = persisted<Record<string, string>>("recent-chats-icons-v2", {}, (v): v is Record<string, string> => !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v).every(x => typeof x === "string"));

/** The project (chan_…) a visit belongs to, for Claude Code projects and their threads. */
export const projectOf = (visit: { id: string }) => (/^chan_[A-Za-z0-9]+/.exec(visit.id)?.[0] ?? null);

const ICON_TAGS = new Set(["span", "div", "img", "svg", "g", "path", "circle", "rect", "ellipse", "line", "polyline", "polygon", "defs", "lineargradient", "radialgradient", "stop", "clippath", "mask", "use", "symbol", "text", "tspan"]);
const ICON_STYLE = ["color", "background-color", "background-image", "background-size", "background-position", "width", "height", "min-width", "border-radius", "display", "align-items", "justify-content", "font-family", "font-size", "font-weight", "font-style", "font-feature-settings", "font-variation-settings", "letter-spacing", "-webkit-font-smoothing", "text-align", "line-height", "fill", "stroke", "stroke-width", "opacity", "object-fit", "padding", "box-sizing"];

/** Keeps only drawing tags and harmless attributes, so stored markup can't run anything. */
export function cleanIcon(root: Element) {
    for (const el of [root, ...root.querySelectorAll("*")]) {
        if (!ICON_TAGS.has(el.tagName.toLowerCase())) {
            el.remove();
            continue;
        }
        for (const attr of [...el.attributes]) {
            const name = attr.name.toLowerCase();
            const unsafe = name.startsWith("on") || /^\s*(javascript|data:text)/i.test(attr.value) || ((name === "href" || name === "xlink:href") && !attr.value.startsWith("#"));
            if (unsafe || name === "class" || name === "id" || name.startsWith("data-") || name.startsWith("aria-") || name === "tabindex" || name === "role") el.removeAttribute(attr.name);
        }
        if (el.tagName.toLowerCase() === "img" && !/^(https:|data:image\/)/.test(el.getAttribute("src") ?? "")) el.removeAttribute("src");
    }
    return root;
}

/** The project's icon from a sidebar row, with its computed look inlined. */
function snapshotIcon(channel: string) {
    const rows = [...document.querySelectorAll<HTMLElement>(`[data-group-list="${channel}"]`)];
    const row = rows.find(r => r.offsetParent) ?? rows[0];
    const slot = row?.querySelector<HTMLElement>("[data-row] .df-leading-slot, [data-row] [data-leading-slot]");
    const source = [...(slot?.children ?? [])].find(el => !el.matches("[data-ccpp-corner]")) as HTMLElement | undefined;
    if (!source || !source.getBoundingClientRect().width) return null;
    const copy = source.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("[data-ccpp-corner], .status-dot, [role=status]").forEach(el => el.remove());
    const originals = [source, ...source.querySelectorAll("*")];
    const copies = [copy, ...copy.querySelectorAll("*")];
    // Copies line up with originals until the first removed node; status dots sit last, so the icon itself is covered.
    copies.forEach((el, i) => {
        const original = originals[i];
        if (!original || original.tagName !== el.tagName) return;
        const style = getComputedStyle(original);
        const inline = ICON_STYLE.map(name => `${name}:${style.getPropertyValue(name)}`).join(";");
        el.setAttribute("style", `${inline};position:static;margin:0;flex:none`);
    });
    const html = cleanIcon(copy).outerHTML;
    return html.length < 8000 ? html : null;
}

function iconNode(html: string) {
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    const root = doc.body.firstElementChild?.firstElementChild;
    if (!root) return null;
    return document.importNode(cleanIcon(root), true);
}

/** A thread open in the side pane: its title in the pane header. */
const THREAD_TITLE = '[data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]';
const textOf = (selector: string) => document.querySelector(selector)?.textContent?.replace(/\s+/g, " ").trim() ?? "";

/** The open page's name. The tab title of a Claude Code project shows the project, so a thread is read from its pane or its link. */
function pageTitle(id: string) {
    const thread = id.split(":")[1];
    if (!thread) return chatTitle();
    const link = [...document.querySelectorAll<HTMLAnchorElement>('a[href*="thread="]')].find(a => new URLSearchParams(a.search).get("thread") === thread);
    return textOf(THREAD_TITLE) || link?.textContent?.replace(/\s+/g, " ").trim() || "";
}

/** Bottom-left of a card: the project for a thread, "Claude Code" for other Code pages, nothing for a chat. */
export function cardLabel(visit: Visit) {
    if (visit.project && visit.id.includes(":")) return visit.project;
    return visitUrl(visit).startsWith("/code/") ? "Claude Code" : "";
}

export function recordVisit(list: Visit[], visit: Visit, max = 50) {
    const previous = list.find(v => v.id === visit.id);
    // Keep a known name when the tab still shows the placeholder.
    const title = visit.title || previous?.title || "";
    return [{ ...visit, title }, ...list.filter(v => v.id !== visit.id)].slice(0, max);
}

/** Picks up the name claude.ai generates for a new chat after the visit was recorded. */
export function renameVisit(list: Visit[], id: string, title: string) {
    if (!title) return list;
    const index = list.findIndex(v => v.id === id);
    if (index < 0 || list[index].title === title) return list;
    const next = [...list];
    next[index] = { ...next[index], title };
    return next;
}

const CSS = `
.overlay { position: fixed; inset: 0; display: grid; place-items: center; background: var(--cds-backdrop, rgba(0,0,0,.5)); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: auto; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; } }
.box { width: min(860px, calc(100vw - 32px)); padding: 16px; border-radius: 18px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--line); box-shadow: var(--shadow); }
.box h3 { margin: 0 0 12px; font-size: 14px; display: flex; justify-content: space-between; } .box h3 span { font-weight: 400; color: var(--fg3); font-size: 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.card { position: relative; display: flex; flex-direction: column; gap: 6px; min-height: 76px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); text-align: left; }
.card:hover, .card.sel { border-color: var(--accent); background: var(--bg); }
.card .n { position: absolute; top: 8px; right: 10px; font-size: 11px; color: var(--fg3); }
.card .s .l { display: flex; align-items: center; gap: 6px; min-width: 0; }
.card .s .l > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card .ic { flex: none; display: grid; place-items: center; width: 16px; height: 16px; overflow: hidden; }
.card .ic > * { zoom: .67; }
.card .t { font-weight: 600; padding-right: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card .s { display: flex; justify-content: space-between; gap: 8px; color: var(--fg3); font-size: 12px; margin-top: auto; }
.card .s .a { flex: none; margin-left: auto; }
.card.cur .s .a::before { content: "● "; color: var(--accent); }
.empty { padding: 24px; text-align: center; color: var(--fg3); }
`;

export default definePlugin({
    name: "RecentChats",
    title: { zh: "最近对话切换", en: "Recent chats switcher" },
    description: {
        zh: "按 Ctrl+` 弹出最近打开过的对话卡片（包括 Claude Code 项目、线程和会话），方向键 / 数字键快速切换。",
        en: "Press Ctrl+` for cards of recently opened chats (Claude Code projects, threads and sessions included); switch with arrows or number keys.",
    },
    category: "navigation",
    icon: "grid",
    enabledByDefault: true,
    updatedAt: "2026-11-08",
    dependencies: ["RouterApi", "HotkeysApi", "ChatStateApi"],
    settings,
    start(scope) {
        const record = () => {
            const page = currentVisit();
            if (!page) return;
            // The title updates a moment after navigation.
            scope.timeout(() => {
                if (currentVisit()?.id !== page.id) return;
                const thread = page.id.includes(":");
                const channel = projectOf(page);
                const icon = channel && snapshotIcon(channel);
                if (channel && icon && icons.get()[channel] !== icon) icons.set({ ...icons.get(), [channel]: icon });
                visits.set(recordVisit(visits.get(), { ...page, title: pageTitle(page.id), at: Date.now(), ...(thread ? { project: chatTitle() } : {}) }));
            }, 1500);
        };
        onRoute(scope, record);
        // Opening or switching a Claude Code thread only changes ?thread=…
        scope.on("route:search", record);
        // New chats get their name after the first reply; refresh the stored one when it changes.
        scope.interval(() => {
            const id = currentVisit()?.id;
            if (!id) return;
            const list = visits.get();
            const next = renameVisit(list, id, pageTitle(id));
            if (next !== list) visits.set(next);
        }, 3000);

        const { box } = createHost(scope, "recent-chats", CSS, { layer: "page" });
        let selected = 0;
        let open = false;

        const close = () => {
            open = false;
            clear(box);
        };
        const go = (visit: Visit | undefined) => {
            close();
            if (!visit || visit.id === currentVisit()?.id) return;
            const url = visitUrl(visit);
            // A real link click lets claude.ai's router navigate without a reload.
            const link = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].find(a => a.getAttribute("href") === url);
            if (link) link.click();
            else location.assign(url);
        };
        const cardIcon = (visit: Visit) => {
            const channel = projectOf(visit);
            const html = channel && icons.get()[channel];
            const node = html ? iconNode(html) : null;
            return node ? h("span", { class: "ic" }, node) : null;
        };
        const render = () => {
            clear(box);
            const list = visits.get().slice(0, settings.store.count);
            const here = currentVisit()?.id;
            const cards = h("div", { class: "cards" });
            list.forEach((visit, i) => {
                const card = h(
                    "button",
                    { type: "button", class: `card${i === selected ? " sel" : ""}${visit.id === here ? " cur" : ""}` },
                    i < 9 ? h("span", { class: "n", text: String(i + 1) }) : null,
                    h("span", { class: "t", text: visit.title || visit.id.slice(0, 8) }),
                    h("span", { class: "s" }, h("span", { class: "l" }, cardIcon(visit), h("span", { text: cardLabel(visit) })), h("span", { class: "a", text: agoText(visit.at) })),
                );
                card.addEventListener("click", () => go(visit));
                cards.appendChild(card);
            });
            const overlay = h(
                "div",
                { class: "overlay", role: "dialog", "aria-label": t(L.title) },
                h("div", { class: "box" }, h("h3", {}, t(L.title), h("span", { text: t(L.hint) })), list.length ? cards : h("div", { class: "empty", text: t(L.empty) })),
            );
            overlay.addEventListener("mousedown", event => event.target === overlay && close());
            box.appendChild(overlay);
        };
        const toggle = () => {
            if (open) return close();
            open = true;
            // Pick up icons changed or first seen since the visit (the sidebar may have been closed then).
            const known = icons.get();
            const fresh = { ...known };
            for (const channel of new Set(visits.get().slice(0, settings.store.count).map(projectOf))) {
                const icon = channel && snapshotIcon(channel);
                if (channel && icon) fresh[channel] = icon;
            }
            if (Object.keys(fresh).some(k => fresh[k] !== known[k])) icons.set(fresh);
            // Start on the previous chat, like Alt+Tab.
            selected = visits.get()[0]?.id === currentVisit()?.id ? 1 : 0;
            render();
        };
        if (settings.store.hotkey.trim()) bindKey(scope, settings.store.hotkey, toggle, { inInputs: true });
        scope.listen(window, "keydown", (event: KeyboardEvent) => {
            if (!open) return;
            const list = visits.get().slice(0, settings.store.count);
            const cols = Math.max(1, Math.floor((box.querySelector(".cards")?.clientWidth ?? 720) / 250));
            const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Tab: event.shiftKey ? -1 : 1 };
            if (event.key in moves) selected = (selected + moves[event.key] + list.length) % Math.max(1, list.length);
            else if (event.key === "Enter") go(list[selected]);
            else if (event.key === "Escape") close();
            else if (/^[1-9]$/.test(event.key)) go(list[Number(event.key) - 1]);
            else return;
            event.preventDefault();
            event.stopPropagation();
            if (open) render();
        }, { capture: true });
    },
});
