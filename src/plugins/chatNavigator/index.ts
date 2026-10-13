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
import { type ChannelMessage, getChannelMessages } from "@api/claude";
import { currentRoute, onRoute } from "@api/router";
import { currentIndex, getMarks, getRows, getScroller, getScrollers, jumpTo, loadConversation, onMarksChange, rowText, totalMessages } from "@api/transcript";

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
    empty: { zh: "（空消息）", en: "(empty)" },
    goTo: { zh: "跳到第 {n} 条，共 {total} 条", en: "Go to message {n} of {total}" },
};

interface Item {
    index: number;
    role: "user" | "assistant";
    text: string;
    /** A project-chat card row (thread started, error…), left out of the outline. */
    notice?: boolean;
    /** The project-chat message id the row shows. */
    entry?: string | null;
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
.tick { display: flex; align-items: center; justify-content: flex-end; flex: none; width: 32px; height: 12px; padding: 0 2px 0 0; border: 0; background: transparent; }
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

interface Nav {
    key: string;
    scroller: HTMLElement;
    rail: HTMLElement;
    load(force?: boolean): Promise<void>;
    draw(): void;
    place(): void;
    tick(): void;
    onScroll(): void;
    visible(): boolean;
    step(event: KeyboardEvent): void;
    close(): boolean;
    dispose(): void;
}

const flat = (text: string) => text.replace(/\s+/g, " ").trim();

/**
 * Labels project-page rows the virtual list hasn't rendered, from the project's own messages.
 * Rendered rows anchor the two lists to each other; rows between anchors take the message at the
 * same offset. Without any anchor the newest message lines up with the last row.
 */
export function alignWithApi(items: Item[], api: Pick<ChannelMessage, "role" | "text" | "notice">[]): Item[] {
    if (!api.length || !items.length) return items;
    const keys = api.map(m => flat(m.text).slice(0, 24));
    const anchors: [number, number][] = [];
    let from = 0;
    for (const item of items) {
        if (!item.text) continue;
        const text = flat(item.text);
        for (let j = from; j < api.length; j++) {
            if (keys[j].length >= 4 && text.includes(keys[j])) {
                anchors.push([item.index, j]);
                from = j + 1;
                break;
            }
        }
    }
    const offsetFor = (index: number) => {
        if (!anchors.length) return api.length - items.length;
        let best = anchors[0];
        for (const anchor of anchors) if (Math.abs(anchor[0] - index) < Math.abs(best[0] - index)) best = anchor;
        return best[1] - best[0];
    };
    const last = anchors.length ? anchors[anchors.length - 1][0] : -1;
    return items.flatMap(item => {
        const message = api[item.index + offsetFor(item.index)];
        if (message?.notice) return [];
        // A blank row past every message is the list's trailing spacer.
        if (!message) return item.text || item.index <= last ? [item] : [];
        return [{ index: item.index, role: message.role, text: item.text || message.text }];
    });
}

/**
 * The outline of a project chat or thread, built from its messages. Rendered rows carry their message
 * id, which pins each message to its row; messages whose row isn't rendered take the row at the same
 * distance from the nearest pinned one (card rows keep their place in `api`, so distances hold).
 * Rows newer than the messages (just sent) are added from the page. Null when no row is pinned.
 */
export function outlineFromApi(api: Pick<ChannelMessage, "id" | "role" | "text" | "notice">[], rows: Item[]): Item[] | null {
    const pos = new Map(api.map((m, i) => [m.id, i]));
    const anchors = rows.filter(r => r.entry && pos.has(r.entry)).map(r => [pos.get(r.entry!)!, r.index] as const);
    if (!anchors.length) return null;
    const rowFor = (i: number) => {
        let best = anchors[0];
        for (const anchor of anchors) if (Math.abs(anchor[0] - i) < Math.abs(best[0] - i)) best = anchor;
        return i + best[1] - best[0];
    };
    const out: Item[] = api.flatMap((m, i) => (m.notice ? [] : [{ index: rowFor(i), role: m.role, text: m.text, entry: m.id }]));
    const lastRow = Math.max(...anchors.map(a => a[1]));
    for (const row of rows) if (row.entry && !pos.has(row.entry) && row.text && row.index > lastRow) out.push(row);
    return out.sort((a, b) => a.index - b.index);
}

const paneOf = (scroller: HTMLElement) => (scroller.closest('[data-perf-region="side_pane"]') ? "side" : "main");

/** Which conversation a transcript shows: the chat, the project chat, or the open thread. */
function keyFor(scroller: HTMLElement) {
    if (paneOf(scroller) === "main") return currentRoute().chatId ?? `${location.pathname}|main`;
    return `${location.pathname}?thread=${new URLSearchParams(location.search).get("thread") ?? ""}|side`;
}

/** Only the outermost match of each transcript; a feed inside a scroller is the same transcript. */
function transcripts() {
    const all = getScrollers();
    return all.filter(el => !all.some(other => other !== el && other.contains(el)));
}

export default definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
        zh: "把对话右侧做成 Notion 式目录：细刻度标出每条提问和回复，悬停展开全部消息（包括长对话里还没渲染的），点击跳转；正在输出的回复显示为虚线。普通对话和 Claude Code 项目页都能用，项目页的主对话和线程侧栏各有一套，贴着各自的右边缘。",
        en: "A Notion-style outline on the right of the chat: thin ticks for every prompt and reply, hover to list them all (also ones not rendered yet), click to jump; a reply still streaming shows as a dashed tick. On Claude Code project pages the project chat and the thread pane each get their own, flush with their right edge.",
    },
    category: "messages",
    icon: "list",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["TranscriptApi", "RouterApi", "ChatStateApi"],
    settings,
    start(scope: Scope) {
        const { box } = createHost(scope, "navigator", CSS, { layer: "page" });
        const navs = new Map<HTMLElement, Nav>();

        const createNav = (scroller: HTMLElement): Nav => {
            const ticks = h("div", { class: "ticks", role: "navigation", "aria-label": t(L.title) });
            const meta = h("div", { class: "meta" });
            const list = h("ul", { class: "list", role: "menu", "aria-label": t(L.title) });
            const menu = h("div", { class: "menu" }, meta, list);
            const rail = h("div", { class: "rail" }, menu, ticks);
            box.append(rail);

            // The chat API only describes the main transcript of a /chat page.
            const chatId = paneOf(scroller) === "main" ? currentRoute().chatId : null;
            // Claude Code project pages: the main pane is the project chat, the side pane the open thread.
            const channelId = /^\/code\/project\/(chan_[A-Za-z0-9]+)/.exec(location.pathname)?.[1] ?? null;
            const threadId = paneOf(scroller) === "side" ? new URLSearchParams(location.search).get("thread") : null;
            let api: ChannelMessage[] = [];
            let apiLoading = false;
            const loadApi = (force = false) => {
                if (!channelId || apiLoading) return;
                apiLoading = true;
                getChannelMessages(channelId, threadId, force)
                    .then(messages => {
                        api = messages;
                        items = fromDom();
                        draw();
                    })
                    .catch(error => logger.debug("Project messages unavailable:", error))
                    .finally(() => (apiLoading = false));
            };
            let items: Item[] = [];
            let current: number | null = null;
            let aim = -1;
            let loadToken = 0;
            let hideTimer: ReturnType<typeof setTimeout> | undefined;

            // Without the conversation API (project pages), a row whose text is still unknown is left
            // out rather than shown as a placeholder; it appears once its message is known.
            const known = (i: Item) => !!chatId || !!i.text.trim() || isLive(i);
            const shown = () => items.filter(i => known(i) && (settings.store.showAssistant || i.role === "user"));
            const key = keyFor(scroller);
            const feedKey = () => key;

            /** Rows on screen, remembered by index for when they scroll out of the virtual list. */
            const harvest = (): Map<number, Item> => {
                const key = feedKey();
                let memo = seen.get(key);
                if (!memo) seen.set(key, (memo = new Map()));
                for (const row of getRows(scroller)) {
                    const text = rowText(row.el);
                    if (text || !memo.has(row.index)) memo.set(row.index, { index: row.index, role: row.role, text, entry: row.entry });
                }
                return memo;
            };

            const fromDom = (): Item[] => {
                const memo = harvest();
                const total = Math.max(totalMessages(scroller) ?? 0, memo.size ? Math.max(...memo.keys()) + 1 : 0);
                const rows = Array.from({ length: total }, (_, index) => memo.get(index) ?? { index, role: (index % 2 === 0 ? "user" : "assistant") as Item["role"], text: "" });
                if (!channelId) return rows;
                return outlineFromApi(api, [...memo.values()]) ?? alignWithApi(rows, api);
            };

            const load = async (force = false) => {
                const token = ++loadToken;
                if (!chatId) {
                    items = fromDom();
                    draw();
                    loadApi(force);
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

            const visible = () => scroller.isConnected && scroller.clientHeight > 0 && shown().length >= settings.store.minMessages;

            const place = () => {
                if (!visible()) {
                    rail.style.display = "none";
                    setOpen(false);
                    return;
                }
                rail.style.display = "";
                const rect = scroller.getBoundingClientRect();
                const height = Math.max(120, rect.height - 48);
                // Flush with the transcript's right edge, just inside its scrollbar.
                const scrollbar = Math.max(0, scroller.offsetWidth - scroller.clientWidth);
                rail.style.right = `${Math.max(0, window.innerWidth - rect.right + scrollbar)}px`;
                rail.style.top = `${rect.top + rect.height / 2 - height / 2}px`;
                rail.style.height = `${height}px`;
                rail.style.setProperty("--menu-h", `${Math.min(window.innerHeight * 0.7, height)}px`);
                rail.classList.toggle("dense", shown().length * 12 > height);
            };

            const isLive = (item: Item) => chatPhase() === "streaming" && item.role === "assistant" && item.index === items.length - 1;

            const label = (item: Item) => {
                if (item.text.trim()) return { text: snippet(item.text, 120), dim: false };
                if (isLive(item)) return { text: t(L.streaming), dim: true };
                return { text: t(L.empty), dim: true };
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

            const syncCurrent = () => {
                const next = currentIndex(scroller);
                if (next === current) return;
                current = next;
                const active = activePos();
                [...ticks.children].forEach((tick, i) => tick.classList.toggle("current", i === active));
                ticks.children[active]?.scrollIntoView({ block: "nearest" });
                if (rail.classList.contains("open")) drawMenu();
            };

            const onScroll = () => {
                syncCurrent();
                if (chatId) return;
                // Project pages: learn rows as they mount.
                const before = items.filter(i => i.text).length;
                const next = fromDom();
                if (next.length !== items.length || next.filter(i => i.text).length !== before) {
                    items = next;
                    draw();
                }
            };

            const tick = () => {
                place();
                const total = totalMessages(scroller);
                if (total && total !== items.length) void load(total > items.length);
                syncCurrent();
            };

            const step = (event: KeyboardEvent) => {
                const entries = shown();
                let target: number | null = null;
                const at = activePos();
                if (event.key === "Home" || ((event.metaKey || event.ctrlKey) && event.key === "ArrowUp")) target = 0;
                else if (event.key === "End" || ((event.metaKey || event.ctrlKey) && event.key === "ArrowDown")) target = entries.length - 1;
                else if (event.key === "ArrowUp" && !event.shiftKey) target = Math.max(0, at - 1);
                else if (event.key === "ArrowDown" && !event.shiftKey) target = Math.min(entries.length - 1, at + 1);
                if (target === null || target === at) return;
                event.preventDefault();
                go(target);
            };

            const close = () => {
                if (!rail.classList.contains("open")) return false;
                setOpen(false);
                return true;
            };

            const dispose = () => {
                clearTimeout(hideTimer);
                loadToken++;
                rail.remove();
            };

            void load();
            return { key: feedKey(), scroller, rail, load, draw, place, tick, onScroll, visible, step, close, dispose };
        };

        /** One navigator per transcript on the page: a chat, or a project's main chat and its thread pane. */
        const sync = () => {
            const live = transcripts();
            for (const [el, nav] of navs) {
                // Same element but a different thread or chat (the pane was reused): start over.
                if (live.includes(el) && keyFor(el) === nav.key) continue;
                nav.dispose();
                navs.delete(el);
            }
            for (const el of live) if (!navs.has(el)) navs.set(el, createNav(el));
        };
        const reset = () => {
            for (const nav of navs.values()) nav.dispose();
            navs.clear();
            sync();
        };
        scope.defer(() => {
            for (const nav of navs.values()) nav.dispose();
            navs.clear();
        });

        let scrollQueued = false;
        const dirty = new Set<HTMLElement>();
        scope.listen(document, "scroll", (event: Event) => {
            const target = event.target;
            if (target instanceof HTMLElement) dirty.add(target);
            if (scrollQueued) return;
            scrollQueued = true;
            requestAnimationFrame(() => {
                scrollQueued = false;
                sync();
                for (const [el, nav] of navs) if ([...dirty].some(d => d === el || el.contains(d) || d.contains(el))) nav.onScroll();
                dirty.clear();
            });
        }, { capture: true, passive: true });
        scope.listen(window, "resize", () => navs.forEach(nav => nav.place()));

        onRoute(scope, () => {
            reset();
            // The new transcript renders a moment after navigation.
            scope.timeout(reset, 300);
        });
        scope.on("reply:end", () => scope.timeout(() => navs.forEach(nav => nav.load(true)), 800));
        onMarksChange(scope, () => navs.forEach(nav => nav.draw()));

        // New messages, a pane opening or closing, or layout shifts show up here.
        scope.interval(() => {
            sync();
            navs.forEach(nav => nav.tick());
        }, 1200);

        if (settings.store.keys) {
            scope.listen(document, "keydown", (event: KeyboardEvent) => {
                if (event.altKey || event.isComposing) return;
                if (isEditable(event.target) || isEditable(document.activeElement)) return;
                // Keys drive the transcript the user last scrolled or clicked in.
                const focus = getScroller();
                const nav = (focus && [...navs.values()].find(n => n.scroller === focus || n.scroller.contains(focus) || focus.contains(n.scroller))) ?? [...navs.values()][0];
                if (!nav?.visible()) return;
                if (event.key === "Escape") {
                    if (nav.close()) event.preventDefault();
                    return;
                }
                nav.step(event);
            });
        }
    },
});
