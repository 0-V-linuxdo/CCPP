/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { agoText, snippet } from "@lib/format";
import { icon } from "@lib/icons";
import { createPopover } from "@lib/popover";
import { chatTitle } from "@api/chatState";
import { SEL, watch } from "@api/dom";
import { currentRoute, onRoute } from "@api/router";
import { addSlotItem, refreshSlotItem, slotButton } from "@api/slots";
import { addStyle } from "@api/styles";
import { jumpTo, setMarks } from "@api/transcript";

import { book, type Star, starsFor, toggleStar } from "./store";

const settings = definePluginSettings({
    headerButton: { type: "boolean", label: { zh: "在对话标题栏显示收藏列表按钮", en: "Starred list button in the chat header" }, default: true },
    otherChats: { type: "boolean", label: { zh: "列表里同时显示其它对话的收藏", en: "Also list stars from other chats" }, default: true },
});

const L = {
    star: { zh: "收藏这条消息", en: "Star this message" },
    unstar: { zh: "取消收藏", en: "Unstar" },
    list: { zh: "收藏的消息", en: "Starred messages" },
    here: { zh: "本对话", en: "This chat" },
    others: { zh: "其它对话", en: "Other chats" },
    none: { zh: "还没有收藏。悬停消息，点操作栏里的 ☆。", en: "Nothing starred yet. Hover a message and click ☆ in its action bar." },
    you: { zh: "你", en: "You" },
};

const CSS = `
.ccpp-star-btn { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: inherit; cursor: pointer; opacity: .7; }
.ccpp-star-btn:hover { opacity: 1; background: rgba(127,127,127,.14); }
.ccpp-star-btn.on { color: #e8a33d; opacity: 1; }
.ccpp-star-btn.on svg { fill: currentColor; }
.ccpp-star-float { position: absolute; top: 4px; inset-inline-start: -34px; opacity: 0; transition: opacity .12s; z-index: 1; }
[data-testid="transcript-row"]:hover .ccpp-star-float, .ccpp-star-float.on { opacity: .8; }
.ccpp-starred-row [data-testid="user-message"], .ccpp-starred-row [data-testid="assistant-message"] { box-shadow: inset 3px 0 0 #e8a33d; border-radius: 4px; }
`;

const LIST_CSS = `.sec { font-size: 12px; color: var(--fg3); padding: 2px 8px; } .star { color: #e8a33d; flex: none; }`;

function rowInfo(row: HTMLElement) {
    const index = Number(row.dataset.index);
    const message = row.querySelector<HTMLElement>(`${SEL.userMessage}, ${SEL.assistantMessage}`);
    if (!Number.isFinite(index) || !message) return null;
    const role: Star["role"] = message.matches(SEL.userMessage) ? "user" : "assistant";
    const keyed = row.querySelector<HTMLElement>("[data-turn-key]");
    const key = keyed?.dataset.turnKey ? `${keyed.dataset.turnKey}:${role}` : `i${index}`;
    const body = role === "user" ? message.querySelector<HTMLElement>(SEL.userMessageBody) ?? message : message.querySelector<HTMLElement>(SEL.prose) ?? message;
    return { index, role, key, text: snippet(body.innerText, 200) };
}

export default definePlugin({
    name: "MessageStars",
    title: { zh: "消息收藏", en: "Message stars" },
    description: {
        zh: "在消息操作栏加一个 ☆，收藏任意提问或回复；标题栏按钮列出本对话（及其它对话）的收藏，点击跳回原处。对话目录里收藏的刻度显示为橙色。",
        en: "Adds ☆ to message actions to star any prompt or reply; a header button lists this chat's (and other chats') stars and jumps back. Starred ticks are orange in the navigator.",
    },
    category: "messages",
    icon: "star",
    enabledByDefault: true,
    dependencies: ["DomApi", "StylesApi", "SlotsApi", "TranscriptApi", "RouterApi", "ChatStateApi"],
    settings,
    start(scope: Scope) {
        addStyle(scope, CSS, "stars");
        const isStarred = (key: string) => starsFor(currentRoute().chatId).some(s => s.key === key);

        const toggle = (row: HTMLElement) => {
            const chatId = currentRoute().chatId;
            const info = rowInfo(row);
            if (!chatId || !info) return;
            const { next } = toggleStar(chatId, chatTitle(), { ...info, at: Date.now() });
            book.set(next);
        };

        const paint = () => {
            const chatId = currentRoute().chatId;
            const keys = new Set(starsFor(chatId).map(s => s.key));
            for (const row of document.querySelectorAll<HTMLElement>(SEL.transcriptRow)) {
                const info = rowInfo(row);
                const on = !!info && keys.has(info.key);
                row.classList.toggle("ccpp-starred-row", on);
                for (const btn of row.querySelectorAll<HTMLElement>(".ccpp-star-btn")) {
                    btn.classList.toggle("on", on);
                    btn.title = t(on ? L.unstar : L.star);
                    btn.setAttribute("aria-pressed", String(on));
                }
            }
            setMarks("stars", starsFor(chatId).map(s => s.index));
        };

        const makeButton = (row: HTMLElement, extra = "") => {
            const info = rowInfo(row);
            const on = !!info && isStarred(info.key);
            const btn = h("button", { type: "button", class: `ccpp-star-btn${extra}${on ? " on" : ""}`, title: t(on ? L.unstar : L.star), "aria-label": t(L.star), "aria-pressed": String(on) }, icon("star", 15));
            btn.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                toggle(row);
            });
            return btn;
        };

        watch(scope, SEL.transcriptRow, row => {
            let btn: HTMLElement | null = null;
            const attach = () => {
                if (btn?.isConnected) return;
                const toolbar = row.querySelector<HTMLElement>(SEL.messageActions) ?? row.querySelector<HTMLElement>('[role="toolbar"]');
                if (toolbar) {
                    btn = makeButton(row);
                    toolbar.appendChild(btn);
                    return;
                }
                const message = row.querySelector<HTMLElement>(SEL.userMessage);
                if (!message) return;
                const holder = message.parentElement ?? message;
                if (getComputedStyle(holder).position === "static") holder.style.position = "relative";
                btn = makeButton(row, " ccpp-star-float");
                holder.appendChild(btn);
            };
            attach();
            // Toolbars mount late (after streaming) and re-render; check again on changes inside the row.
            const observer = new MutationObserver(() => attach());
            observer.observe(row, { childList: true, subtree: true });
            row.classList.toggle("ccpp-starred-row", (() => {
                const info = rowInfo(row);
                return !!info && isStarred(info.key);
            })());
            return () => {
                observer.disconnect();
                btn?.remove();
                row.classList.remove("ccpp-starred-row");
            };
        });

        scope.defer(book.subscribe(() => {
            paint();
            if (headerItem) refreshSlotItem(headerItem);
            list.update();
        }));
        scope.defer(() => setMarks("stars", []));
        onRoute(scope, () => {
            paint();
            if (headerItem) refreshSlotItem(headerItem);
            list.close();
        });

        /* ---------- list ---------- */

        const list = createPopover(scope, "stars-list", LIST_CSS, 340);
        const renderList = (panel: HTMLElement, close: () => void) => {
            const chatId = currentRoute().chatId;
            const here = starsFor(chatId);
            panel.appendChild(h("div", { class: "top" }, icon("star", 16), h("b", { text: t(L.list) })));
            const item = (star: Star, onClick: () => void, sub: string) => {
                const row = h(
                    "button",
                    { type: "button", class: "item" },
                    h("span", { class: "star", text: "★" }),
                    h("span", { class: "grow" }, h("div", { class: "clip2", text: star.text || "…" }), h("div", { class: "sub", text: sub })),
                );
                row.addEventListener("click", onClick);
                return row;
            };
            if (here.length) {
                panel.appendChild(h("div", { class: "sec", text: t(L.here) }));
                for (const star of here) panel.appendChild(item(star, () => (close(), void jumpTo(star.index)), `${star.role === "user" ? t(L.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}`));
            }
            const others = settings.store.otherChats ? Object.entries(book.get()).filter(([id]) => id !== chatId) : [];
            if (others.length) {
                panel.appendChild(h("div", { class: "sec", text: t(L.others) }));
                for (const [id, chat] of others.slice(0, 30)) {
                    for (const star of chat.stars.slice(0, 5)) {
                        panel.appendChild(item(star, () => {
                            close();
                            location.assign(`/chat/${id}`);
                        }, `${chat.title || id.slice(0, 8)} · #${star.index + 1}`));
                    }
                }
            }
            if (!here.length && !others.length) panel.appendChild(h("div", { class: "msg", text: t(L.none) }));
        };

        let headerItem: ReturnType<typeof addSlotItem> | null = null;
        if (settings.store.headerButton) {
            headerItem = addSlotItem(scope, "header", "stars", () => {
                const count = starsFor(currentRoute().chatId).length;
                const btn = slotButton(t(L.list), event => list.open(event.currentTarget as HTMLElement, renderList), icon("star", 16), count ? String(count) : "");
                if (count) btn.classList.add("on");
                return btn;
            }, 10);
        }
        paint();
    },
});
