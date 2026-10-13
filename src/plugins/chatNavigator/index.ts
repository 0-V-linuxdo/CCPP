/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { definePluginSettings } from "@kernel/settings";
import { clear, h, isEditable } from "@lib/dom";
import { snippet } from "@lib/format";
import { createHost } from "@lib/ui";
import { chatPhase } from "@api/chatState";
import { onRoute } from "@api/router";
import { currentIndex, getMarks, getRows, getScroller, jumpTo, loadConversation, onMarksChange, rowText, totalMessages } from "@api/transcript";

const logger = new Logger("ChatNavigator");

const settings = definePluginSettings({
    showAssistant: { type: "boolean", label: { zh: "列出 Claude 的回复", en: "List Claude's replies" }, description: { zh: "关闭后目录里只有你的提问。", en: "Off lists only your prompts." }, default: true },
    minMessages: { type: "number", label: { zh: "至少几条消息才显示", en: "Show from this many messages" }, description: { zh: "默认一问一答就显示。", en: "By default one prompt and reply is enough." }, default: 2, min: 1, max: 20 },
    jumpEffect: {
        type: "select",
        label: { zh: "跳转效果", en: "Jump effect" },
        description: { zh: "跳到一条消息后怎样提示它的位置。", en: "How the message is marked after jumping to it." },
        default: "border",
        options: [
            { value: "border", label: { zh: "高亮边框", en: "Highlight border" } },
            { value: "none", label: { zh: "无", en: "None" } },
        ],
    },
    keys: { type: "boolean", label: { zh: "键盘跳转", en: "Keyboard" }, description: { zh: "不在输入框里时：↑ / ↓ 逐条跳转，Home / End 到首尾，Esc 收起目录。", en: "Outside the input: ↑ / ↓ step through messages, Home / End go to the ends, Esc closes the outline." }, default: true },
});

const L = {
    title: { zh: "对话目录", en: "Outline" },
    streaming: { zh: "正在回复…", en: "Replying…" },
    unloaded: { zh: "（滚动到这里后显示）", en: "(shown once scrolled into view)" },
    empty: { zh: "（空消息）", en: "(empty)" },
    goTo: { zh: "跳到第 {n} 条，共 {total} 条", en: "Go to message {n} of {total}" },
};

interface Item {
    index: number;
    role: "user" | "assistant";
    text: string;
}

/*
 * Layout follows a thin rail at the right edge of the transcript: short ticks for your
 * prompts, longer ones for replies, the current one longest and full-contrast. Hovering the
 * rail opens an outline card to its left.
 */
const CSS = `
.rail { position: fixed; display: flex; align-items: center; pointer-events: none; }
.ticks { display: flex; flex-direction: column; align-items: flex-end; max-height: 100%; overflow: hidden; pointer-events: auto; scrollbar-width: none; }
.ticks::-webkit-scrollbar { display: none; }
.tick { display: flex; align-items: center; justify-content: flex-end; flex: none; width: 40px; height: 12px; padding: 0 4px; border: 0; background: transparent; }
.dense .tick { height: 7px; }
.tick::after { content: ""; display: block; height: 1px; width: 6px; border-radius: 999px; background: color-mix(in srgb, var(--fg3) 60%, transparent); transition: width .15s ease, background-color .15s ease; }
.tick.assistant::after { width: 12px; }
.tick.current::after { width: 16px; background: var(--fg); }
.tick.marked::after { background: var(--clay); }
.tick.live::after { height: 0; background: none; border-top: 1px dashed color-mix(in srgb, var(--fg3) 70%, transparent); }
.tick.live.current::after { border-top-color: var(--fg); }
.rail:hover .tick::after { background: color-mix(in srgb, var(--fg3) 85%, transparent); }
.rail:hover .tick.current::after { background: var(--fg); }
.rail:hover .tick.marked::after { background: var(--clay); }
.menu { position: absolute; top: 50%; right: calc(100% + 4px); width: min(288px, 70vw); max-height: var(--menu-h, 70vh); overflow: auto; padding: 6px; border-radius: 20px; background: var(--bg); box-shadow: var(--shadow); color: var(--fg); pointer-events: auto;
  opacity: 0; visibility: hidden; transform: translate(8px, -50%); transition: opacity .2s ease, visibility .2s ease, transform .2s ease; scrollbar-width: thin; overscroll-behavior: contain; }
.rail.open .menu { opacity: 1; visibility: visible; transform: translate(0, -50%); }
.meta { padding: 4px 10px 6px; color: var(--fg2); font-size: var(--fs-xs); letter-spacing: -.2px; font-variant-numeric: tabular-nums; }
.list { display: flex; flex-direction: column; gap: 2px; margin: 0; padding: 0; list-style: none; }
.item { display: flex; align-items: center; gap: 6px; width: 100%; padding: 6px 8px; border: 1px solid transparent; border-radius: 12px; background: transparent; color: var(--fg2); font-size: var(--fs); line-height: 1.4; letter-spacing: -.2px; text-align: start; }
.item:hover, .item:focus-visible, .item.aim { background: var(--bg2); color: var(--fg); box-shadow: none; }
.item.active { color: var(--fg); border-color: var(--line); }
.emoji { flex: none; font-size: 15px; line-height: 1; }
.label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.label.dim { color: var(--fg3); font-style: italic; }
.star { flex: none; color: var(--clay); font-size: 12px; }
@media (prefers-reduced-motion: reduce) { .menu, .tick::after { transition: none; } }
`;

/** Per transcript (chat id, or project page + pane), what each mounted row said, so unmounted rows keep a label. */
const seen = new Map<string, Map<number, Item>>();

export default definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
        zh: "把对话右侧做成 Notion 式目录：细刻度标出每条提问和回复，悬停展开全部消息（包括长对话里还没渲染的），点击跳转；正在输出的回复显示为虚线。普通对话和 Claude Code 项目页（项目聊天、线程侧栏）都能用。",
        en: "A Notion-style outline on the right of the chat: thin ticks for every prompt and reply, hover to list them all (also ones not rendered yet), click to jump; a reply still streaming shows as a dashed tick. Works in chats and on Claude Code project pages (project chat and thread pane).",
    },
    category: "messages",
    icon: "list",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["TranscriptApi", "RouterApi", "ChatStateApi"],
    settings,
    start(scope: Scope) {
        const { box } = createHost(scope, "navigator", CSS);
        const ticks = h("div", { class: "ticks", role: "navigation", "aria-label": t(L.title) });
        const meta = h("div", { class: "meta" });
        const list = h("ul", { class: "list", role: "menu", "aria-label": t(L.title) });
        const menu = h("div", { class: "menu" }, meta, list);
        const rail = h("div", { class: "rail" }, menu, ticks);
        box.append(rail);

        let items: Item[] = [];
        let chatId: string | null = null;
        let scroller: HTMLElement | null = null;
        let current: number | null = null;
        let aim = -1;
        let loadToken = 0;
        let hideTimer: ReturnType<typeof setTimeout> | undefined;

        const shown = () => (settings.store.showAssistant ? items : items.filter(i => i.role === "user"));
        const feedKey = () => chatId ?? `${location.pathname}${location.search}|${scroller?.closest('[data-perf-region="side_pane"]') ? "side" : "main"}`;

        /** Rows on screen, remembered by index for when they scroll out of the virtual list. */
        const harvest = (): Map<number, Item> => {
            const key = feedKey();
            let memo = seen.get(key);
            if (!memo) seen.set(key, (memo = new Map()));
            for (const row of getRows(scroller)) {
                const text = rowText(row.el);
                if (text || !memo.has(row.index)) memo.set(row.index, { index: row.index, role: row.role, text });
            }
            return memo;
        };

        const fromDom = (): Item[] => {
            const memo = harvest();
            const total = Math.max(totalMessages(scroller) ?? 0, memo.size ? Math.max(...memo.keys()) + 1 : 0);
            return Array.from({ length: total }, (_, index) => memo.get(index) ?? { index, role: index % 2 === 0 ? "user" : "assistant", text: "" });
        };

        const load = async (force = false) => {
            const token = ++loadToken;
            if (!chatId) {
                items = fromDom();
                draw();
                return;
            }
            try {
                const conversation = await loadConversation(chatId, force);
                if (token !== loadToken || !conversation) return;
                items = conversation.messages.map((m, index) => ({ index, role: m.role, text: m.text }));
            } catch (error) {
                logger.warn("Falling back to the page for the outline:", error);
                if (token !== loadToken) return;
                items = fromDom();
            }
            // The API lags behind a message that was just sent; pad with what the page shows.
            const total = totalMessages(scroller);
            if (total && total > items.length) items = [...items, ...fromDom().slice(items.length)];
            draw();
        };

        const visible = () => !!scroller?.isConnected && shown().length >= settings.store.minMessages;

        const place = () => {
            if (!visible()) {
                rail.style.display = "none";
                setOpen(false);
                return;
            }
            rail.style.display = "";
            const rect = scroller!.getBoundingClientRect();
            const height = Math.max(120, rect.height - 48);
            rail.style.right = `${Math.max(4, window.innerWidth - rect.right + 10)}px`;
            rail.style.top = `${rect.top + rect.height / 2 - height / 2}px`;
            rail.style.height = `${height}px`;
            rail.style.setProperty("--menu-h", `${Math.min(window.innerHeight * 0.7, height)}px`);
            rail.classList.toggle("dense", shown().length * 12 > height);
        };

        const isLive = (item: Item) => chatPhase() === "streaming" && item.role === "assistant" && item.index === items.length - 1;

        const label = (item: Item) => {
            if (item.text.trim()) return { text: snippet(item.text, 120), dim: false };
            if (isLive(item)) return { text: t(L.streaming), dim: true };
            return { text: chatId ? t(L.empty) : t(L.unloaded), dim: true };
        };

        /** The shown item the reader is at: the last one at or above the current row. */
        const activePos = () => {
            const entries = shown();
            if (current === null) return -1;
            let pos = -1;
            entries.forEach((item, i) => item.index <= current! && (pos = i));
            return pos;
        };

        const draw = () => {
            clear(ticks);
            const entries = shown();
            const stars = getMarks("stars");
            const active = activePos();
            entries.forEach((item, i) => {
                const tick = h("button", {
                    type: "button",
                    class: `tick ${item.role}${i === active ? " current" : ""}${stars.has(item.index) ? " marked" : ""}${isLive(item) ? " live" : ""}`,
                    "aria-label": t(L.goTo).replace("{n}", String(i + 1)).replace("{total}", String(entries.length)),
                });
                tick.addEventListener("click", () => go(i));
                ticks.appendChild(tick);
            });
            ticks.children[active]?.scrollIntoView({ block: "nearest" });
            if (rail.classList.contains("open")) drawMenu();
            place();
        };

        const drawMenu = () => {
            const entries = shown();
            const stars = getMarks("stars");
            const active = activePos();
            meta.textContent = `${Math.max(active, 0) + 1} / ${entries.length}`;
            clear(list);
            entries.forEach((item, i) => {
                const { text, dim } = label(item);
                const row = h(
                    "button",
                    { type: "button", role: "menuitem", class: `item${i === active ? " active" : ""}${i === aim ? " aim" : ""}` },
                    h("span", { class: "emoji", text: item.role === "user" ? "❓" : "🤖" }),
                    h("span", { class: `label${dim ? " dim" : ""}`, text }),
                    stars.has(item.index) ? h("span", { class: "star", text: "★" }) : null,
                );
                row.addEventListener("click", () => go(i));
                list.appendChild(h("li", {}, row));
            });
            (list.children[aim >= 0 ? aim : active] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest" });
        };

        const go = (pos: number) => {
            const item = shown()[pos];
            if (!item) return;
            current = item.index;
            aim = pos;
            draw();
            void jumpTo(item.index, { flash: settings.store.jumpEffect === "border", scroller });
        };

        const setOpen = (open: boolean) => {
            clearTimeout(hideTimer);
            if (open === rail.classList.contains("open")) return;
            rail.classList.toggle("open", open);
            if (open) drawMenu();
            else aim = -1;
        };
        for (const el of [ticks, menu]) {
            el.addEventListener("mouseenter", () => setOpen(true));
            el.addEventListener("mouseleave", () => {
                clearTimeout(hideTimer);
                hideTimer = setTimeout(() => setOpen(false), 200);
            });
        }
        scope.defer(() => clearTimeout(hideTimer));

        const syncCurrent = () => {
            const next = currentIndex(scroller);
            if (next === current) return;
            current = next;
            const active = activePos();
            [...ticks.children].forEach((tick, i) => tick.classList.toggle("current", i === active));
            ticks.children[active]?.scrollIntoView({ block: "nearest" });
            if (rail.classList.contains("open")) drawMenu();
        };

        /** Follows the transcript the user is reading; on project pages that can change without a route change. */
        const syncScroller = () => {
            const next = getScroller();
            if (next === scroller) return false;
            scroller = next;
            current = null;
            items = [];
            void load();
            return true;
        };

        let scrollQueued = false;
        scope.listen(document, "scroll", () => {
            if (scrollQueued) return;
            scrollQueued = true;
            requestAnimationFrame(() => {
                scrollQueued = false;
                if (!syncScroller()) syncCurrent();
                if (!chatId) {
                    // Project pages: learn rows as they mount.
                    const before = items.filter(i => i.text).length;
                    const next = fromDom();
                    if (next.length !== items.length || next.filter(i => i.text).length !== before) {
                        items = next;
                        draw();
                    }
                }
            });
        }, { capture: true, passive: true });
        scope.listen(window, "resize", place);

        onRoute(scope, route => {
            chatId = route.chatId;
            scroller = getScroller();
            current = null;
            items = [];
            draw();
            scope.timeout(() => {
                scroller = getScroller();
                void load();
            }, 300);
        });
        scope.on("reply:end", () => scope.timeout(() => load(true), 800));
        onMarksChange(scope, draw);

        // New messages, a pane opening, or layout shifts show up here.
        scope.interval(() => {
            if (syncScroller()) return;
            place();
            const total = totalMessages(scroller);
            if (total && total !== items.length) void load(total > items.length);
            syncCurrent();
        }, 1200);

        if (settings.store.keys) {
            scope.listen(document, "keydown", (event: KeyboardEvent) => {
                if (!visible() || event.altKey || event.isComposing) return;
                if (isEditable(event.target) || isEditable(document.activeElement)) return;
                const entries = shown();
                if (event.key === "Escape") {
                    if (rail.classList.contains("open")) {
                        event.preventDefault();
                        setOpen(false);
                    }
                    return;
                }
                let target: number | null = null;
                const at = activePos();
                if (event.key === "Home" || ((event.metaKey || event.ctrlKey) && event.key === "ArrowUp")) target = 0;
                else if (event.key === "End" || ((event.metaKey || event.ctrlKey) && event.key === "ArrowDown")) target = entries.length - 1;
                else if (event.key === "ArrowUp" && !event.shiftKey) target = Math.max(0, at - 1);
                else if (event.key === "ArrowDown" && !event.shiftKey) target = Math.min(entries.length - 1, at + 1);
                if (target === null || target === at) return;
                event.preventDefault();
                go(target);
            });
        }
    },
});
