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
import { clear, h } from "@lib/dom";
import { snippet } from "@lib/format";
import { createHost } from "@lib/ui";
import { onRoute } from "@api/router";
import { bindKey } from "@api/hotkeys";
import { currentIndex, getMarks, getRows, getScroller, jumpTo, loadConversation, onMarksChange, totalMessages } from "@api/transcript";

const logger = new Logger("ChatNavigator");

const settings = definePluginSettings({
    showAssistant: { type: "boolean", label: { zh: "列出 Claude 的回复", en: "List Claude's replies" }, description: { zh: "关闭后只列出你的提问。", en: "Off lists only your prompts." }, default: true },
    minMessages: { type: "number", label: { zh: "至少几条消息才显示", en: "Show from this many messages" }, default: 3, min: 1, max: 20 },
    flash: { type: "boolean", label: { zh: "跳转后高亮目标消息", en: "Highlight the message after jumping" }, default: true },
    keys: { type: "boolean", label: { zh: "Alt + ↑ / ↓ 在消息间跳转", en: "Alt + ↑ / ↓ steps between messages" }, default: true },
});

const L = {
    you: { zh: "你", en: "You" },
    claude: "Claude",
    streaming: { zh: "（正在回复…）", en: "(replying…)" },
    empty: { zh: "（空消息）", en: "(empty)" },
    title: { zh: "对话目录", en: "Outline" },
};

interface Item {
    index: number;
    role: "user" | "assistant";
    text: string;
}

const CSS = `
.rail { position: fixed; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: flex-end; gap: var(--gap, 6px); padding: 10px 6px; pointer-events: auto; border-radius: 10px; max-height: 70vh; }
.tick { display: block; height: 2px; border-radius: 1px; background: var(--fg3); opacity: .45; border: 0; padding: 0; cursor: pointer; transition: width .12s, opacity .12s, background .12s; }
.tick.user { width: 16px; } .tick.assistant { width: 9px; }
.tick.current { opacity: 1; background: var(--fg); width: 20px; }
.tick.marked { background: #e8a33d; opacity: 1; }
.rail:hover .tick { opacity: .8; }
.list { position: fixed; top: 50%; transform: translateY(-50%); width: 300px; max-height: 70vh; overflow: auto; padding: 6px; border-radius: 14px; background: var(--bg); border: 1px solid var(--line); box-shadow: var(--shadow); pointer-events: auto; display: none; }
.list.show { display: block; animation: in .12s ease-out; }
@keyframes in { from { opacity: 0; transform: translate(6px, -50%); } }
.head { padding: 4px 8px 6px; font-weight: 600; color: var(--fg2); font-size: 12px; }
.row { display: flex; gap: 8px; width: 100%; padding: 6px 8px; border: 0; border-radius: 8px; background: transparent; text-align: left; align-items: baseline; }
.row:hover { background: var(--bg2); } .row.current { background: var(--bg3); }
.row .who { flex: none; width: 44px; font-size: 11px; color: var(--fg3); } .row.user .who { color: var(--accent); }
.row .txt { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row.assistant .txt { color: var(--fg2); }
.row .star { color: #e8a33d; flex: none; }
`;

export default definePlugin({
    name: "ChatNavigator",
    title: { zh: "对话目录", en: "Chat navigator" },
    description: {
        zh: "对话右侧的刻度目录：悬停展开全部提问与回复（包括长对话里尚未渲染的部分），点击跳转；Alt+↑/↓ 逐条跳转；收藏的消息标成橙色。",
        en: "A tick outline on the right of the chat: hover to list every prompt and reply (also ones not rendered yet in long chats), click to jump, Alt+↑/↓ to step; starred messages show in orange.",
    },
    category: "messages",
    icon: "list",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "RouterApi", "HotkeysApi"],
    settings,
    start(scope: Scope) {
        const { box } = createHost(scope, "navigator", CSS);
        const rail = h("nav", { class: "rail", "aria-label": t(L.title) });
        const list = h("div", { class: "list", role: "menu", "aria-label": t(L.title) });
        box.append(rail, list);

        let items: Item[] = [];
        let chatId: string | null = null;
        let current: number | null = null;
        let loadToken = 0;
        let hideTimer: ReturnType<typeof setTimeout> | undefined;

        const shown = () => (settings.store.showAssistant ? items : items.filter(i => i.role === "user"));

        const fromDom = (): Item[] => {
            const total = totalMessages() ?? 0;
            const rows = new Map(getRows().map(r => [r.index, r]));
            return Array.from({ length: total }, (_, index) => {
                const row = rows.get(index);
                const role = row?.role ?? (index % 2 === 0 ? "user" : "assistant");
                return { index, role, text: row?.el.innerText ?? "" };
            });
        };

        const load = async (force = false) => {
            const token = ++loadToken;
            if (!chatId) {
                items = [];
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
            const total = totalMessages();
            if (total && total > items.length) items = [...items, ...fromDom().slice(items.length)];
            draw();
        };

        const place = () => {
            const scroller = getScroller();
            const visible = !!scroller && !!chatId && shown().length >= settings.store.minMessages;
            rail.style.display = visible ? "" : "none";
            if (!visible) {
                list.classList.remove("show");
                return;
            }
            const rect = scroller!.getBoundingClientRect();
            const right = Math.max(4, window.innerWidth - rect.right + 14);
            rail.style.right = `${right}px`;
            list.style.right = `${right + 30}px`;
        };

        const draw = () => {
            clear(rail);
            const entries = shown();
            const stars = getMarks("stars");
            const gap = entries.length > 60 ? 2 : entries.length > 30 ? 4 : 7;
            rail.style.setProperty("--gap", `${gap}px`);
            for (const item of entries) {
                const tick = h("button", { type: "button", class: `tick ${item.role}${item.index === current ? " current" : ""}${stars.has(item.index) ? " marked" : ""}`, "aria-label": `${item.role === "user" ? t(L.you) : L.claude}: ${snippet(item.text, 60)}` });
                tick.addEventListener("click", () => go(item.index));
                rail.appendChild(tick);
            }
            if (list.classList.contains("show")) drawList();
            place();
        };

        const drawList = () => {
            clear(list);
            const stars = getMarks("stars");
            list.appendChild(h("div", { class: "head", text: `${t(L.title)} · ${shown().length}` }));
            for (const item of shown()) {
                const text = item.text.trim() ? snippet(item.text, 90) : item.role === "assistant" && item.index === items.length - 1 ? t(L.streaming) : t(L.empty);
                const row = h(
                    "button",
                    { type: "button", role: "menuitem", class: `row ${item.role}${item.index === current ? " current" : ""}` },
                    h("span", { class: "who", text: item.role === "user" ? t(L.you) : L.claude }),
                    h("span", { class: "txt", text }),
                    stars.has(item.index) ? h("span", { class: "star", text: "★" }) : null,
                );
                row.addEventListener("click", () => go(item.index));
                list.appendChild(row);
            }
            list.querySelector(".row.current")?.scrollIntoView({ block: "nearest" });
        };

        const go = (index: number) => {
            current = index;
            draw();
            void jumpTo(index, { flash: settings.store.flash });
        };

        const showList = () => {
            clearTimeout(hideTimer);
            if (!list.classList.contains("show")) {
                list.classList.add("show");
                drawList();
            }
        };
        const hideList = () => {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => list.classList.remove("show"), 250);
        };
        for (const el of [rail, list]) {
            el.addEventListener("mouseenter", showList);
            el.addEventListener("mouseleave", hideList);
        }
        scope.defer(() => clearTimeout(hideTimer));

        const syncCurrent = () => {
            const next = currentIndex();
            if (next === current) return;
            current = next;
            for (const tick of rail.children) tick.classList.remove("current");
            const index = shown().findIndex(item => item.index === current);
            rail.children[index]?.classList.add("current");
            if (list.classList.contains("show")) drawList();
        };

        let scrollQueued = false;
        scope.listen(document, "scroll", () => {
            if (scrollQueued) return;
            scrollQueued = true;
            requestAnimationFrame(() => {
                scrollQueued = false;
                syncCurrent();
            });
        }, { capture: true, passive: true });
        scope.listen(window, "resize", place);

        onRoute(scope, route => {
            chatId = route.chatId;
            current = null;
            items = [];
            draw();
            if (chatId) scope.timeout(() => load(), 300);
        });
        scope.on("reply:end", () => scope.timeout(() => load(true), 800));
        onMarksChange(scope, draw);

        // Messages added on screen (a new prompt, a retry) or layout shifts (side panel) show up here.
        scope.interval(() => {
            place();
            const total = totalMessages();
            if (chatId && total && total !== items.length) load(total > items.length);
            syncCurrent();
        }, 1200);

        if (settings.store.keys) {
            const step = (dir: 1 | -1) => {
                const entries = shown();
                if (!entries.length) return;
                const at = current ?? currentIndex() ?? 0;
                const target = dir > 0 ? entries.find(i => i.index > at) : [...entries].reverse().find(i => i.index < at);
                if (target) go(target.index);
            };
            bindKey(scope, "alt+arrowdown", () => step(1), { inInputs: false });
            bindKey(scope, "alt+arrowup", () => step(-1), { inInputs: false });
        }
    },
});
