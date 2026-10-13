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
import { currentRoute, onRoute } from "@api/router";

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
}

const visits = persisted<Visit[]>("recent-chats", [], (v): v is Visit[] => Array.isArray(v) && v.every(x => x && typeof x.id === "string" && typeof x.title === "string" && typeof x.at === "number"));

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
.overlay { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); pointer-events: auto; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; } }
.box { width: min(860px, calc(100vw - 32px)); padding: 16px; border-radius: 18px; background: color-mix(in srgb, var(--bg) 88%, transparent); border: 1px solid var(--line); box-shadow: var(--shadow); }
.box h3 { margin: 0 0 12px; font-size: 14px; display: flex; justify-content: space-between; } .box h3 span { font-weight: 400; color: var(--fg3); font-size: 12px; }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.card { position: relative; display: flex; flex-direction: column; gap: 6px; min-height: 76px; padding: 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg2); text-align: left; }
.card:hover, .card.sel { border-color: var(--accent); background: var(--bg); }
.card .n { position: absolute; top: 8px; right: 10px; font-size: 11px; color: var(--fg3); }
.card .t { font-weight: 600; padding-right: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card .s { color: var(--fg3); font-size: 12px; margin-top: auto; }
.card.cur .s::after { content: " · ●"; color: var(--accent); }
.empty { padding: 24px; text-align: center; color: var(--fg3); }
`;

export default definePlugin({
    name: "RecentChats",
    title: { zh: "最近对话切换", en: "Recent chats switcher" },
    description: { zh: "按 Ctrl+` 弹出最近打开过的对话卡片，方向键 / 数字键快速切换。", en: "Press Ctrl+` for cards of recently opened chats; switch with arrows or number keys." },
    category: "chats",
    icon: "grid",
    enabledByDefault: true,
    dependencies: ["RouterApi", "HotkeysApi", "ChatStateApi"],
    settings,
    start(scope) {
        onRoute(scope, route => {
            if (!route.chatId) return;
            const id = route.chatId;
            // The title updates a moment after navigation.
            scope.timeout(() => {
                if (currentRoute().chatId !== id) return;
                visits.set(recordVisit(visits.get(), { id, title: chatTitle(), at: Date.now() }));
            }, 1500);
        });
        // New chats get their name after the first reply; refresh the stored one when it changes.
        scope.interval(() => {
            const id = currentRoute().chatId;
            if (!id) return;
            const list = visits.get();
            const next = renameVisit(list, id, chatTitle());
            if (next !== list) visits.set(next);
        }, 3000);

        const { box } = createHost(scope, "recent-chats", CSS);
        let selected = 0;
        let open = false;

        const close = () => {
            open = false;
            clear(box);
        };
        const go = (visit: Visit | undefined) => {
            close();
            if (!visit || visit.id === currentRoute().chatId) return;
            // A real link click lets claude.ai's router navigate without a reload.
            const link = document.querySelector<HTMLAnchorElement>(`a[href="/chat/${visit.id}"]`);
            if (link) link.click();
            else location.assign(`/chat/${visit.id}`);
        };
        const render = () => {
            clear(box);
            const list = visits.get().slice(0, settings.store.count);
            const cards = h("div", { class: "cards" });
            list.forEach((visit, i) => {
                const card = h(
                    "button",
                    { type: "button", class: `card${i === selected ? " sel" : ""}${visit.id === currentRoute().chatId ? " cur" : ""}` },
                    i < 9 ? h("span", { class: "n", text: String(i + 1) }) : null,
                    h("span", { class: "t", text: visit.title || visit.id.slice(0, 8) }),
                    h("span", { class: "s", text: agoText(visit.at) }),
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
            // Start on the previous chat, like Alt+Tab.
            selected = visits.get()[0]?.id === currentRoute().chatId ? 1 : 0;
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
