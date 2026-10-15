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
import { tipAttrs } from "@lib/tooltip";
import { chatTitle } from "@api/chatState";
import { SEL, watch } from "@api/dom";
import { onRoute } from "@api/router";
import { addSlotItem, refreshSlotItem, slotButton } from "@api/slots";
import { addStyle } from "@api/styles";
import { getScrollers, jumpTo, setMarks } from "@api/transcript";

import { book, chatKeyFor, type Star, starsFor, toggleStar } from "./store";

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
.ccpp-star-btn:not(.ccpp-native) { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); cursor: pointer; }
.ccpp-star-btn:not(.ccpp-native):hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
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

const SIDE_PANE = '[data-perf-region="side_pane"]';

/** The conversation `el` belongs to: the page's chat, or on Claude Code pages the project chat or the thread beside it. */
const keyOf = (el: Element | null) => chatKeyFor(location.pathname, location.search, !!el?.closest(SIDE_PANE));
/** Conversations shown on this page: the main one, plus a thread in the side pane. */
const pageKeys = () => [keyOf(null), document.querySelector(SIDE_PANE) ? chatKeyFor(location.pathname, location.search, true) : null].filter(k => k !== null);

/** A claude.ai placeholder for a toolbar it has not rendered yet (older replies' action bars mount on hover). */
const isPlaceholder = (button: HTMLElement) => /^Show message actions/i.test(button.getAttribute("aria-label") ?? "") || button.getBoundingClientRect().width < 4;

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
        const isStarred = (row: HTMLElement, key: string) => starsFor(keyOf(row)?.key ?? null).some(s => s.key === key);

        const toggle = (row: HTMLElement) => {
            const chat = keyOf(row);
            const info = rowInfo(row);
            if (!chat || !info) return;
            const { next } = toggleStar(chat.key, chatTitle(), { ...info, at: Date.now() }, book.get(), chat.url);
            book.set(next);
        };

        const paint = () => {
            const starred = new Map<string, Set<string>>();
            for (const row of document.querySelectorAll<HTMLElement>(SEL.transcriptRow)) {
                const info = rowInfo(row);
                const chat = keyOf(row)?.key ?? "";
                if (!starred.has(chat)) starred.set(chat, new Set(starsFor(chat || null).map(s => s.key)));
                const on = !!info && starred.get(chat)!.has(info.key);
                row.classList.toggle("ccpp-starred-row", on);
                for (const btn of row.querySelectorAll<HTMLElement>(".ccpp-star-btn")) {
                    btn.classList.toggle("on", on);
                    btn.setAttribute("data-ccpp-tip", t(on ? L.unstar : L.star));
                    btn.setAttribute("aria-pressed", String(on));
                    btn.setAttribute("aria-label", t(on ? L.unstar : L.star));
                }
            }
            setMarks("stars", starsFor(keyOf(null)?.key ?? null).map(s => s.index));
        };

        /** In a native toolbar the button borrows a neighbour's classes and icon size, so it reads as one of them. */
        const makeButton = (row: HTMLElement, extra = "", native?: HTMLElement | null) => {
            const info = rowInfo(row);
            const on = !!info && isStarred(row, info.key);
            const glyph = native?.querySelector("svg, [data-cds=\"Icon\"]")?.getBoundingClientRect();
            const size = glyph && glyph.width >= 12 && glyph.width <= 24 ? Math.round(glyph.width) : 15;
            const svg = icon("star", size);
            if (native) svg.setAttribute("stroke-width", "1.5");
            const btn = h("button", { type: "button", class: `ccpp-star-btn${extra}${on ? " on" : ""}`, ...tipAttrs(t(on ? L.unstar : L.star)), "aria-label": t(on ? L.unstar : L.star), "aria-pressed": String(on) }, svg);
            if (native) {
                btn.className = `${native.className} ccpp-star-btn ccpp-native${extra}${on ? " on" : ""}`;
                for (const attr of [...native.attributes]) if (attr.name.startsWith("data-cds") || attr.name === "data-size") btn.setAttribute(attr.name, attr.value);
            }
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
                const toolbar = row.querySelector<HTMLElement>(SEL.messageActions) ?? row.querySelector<HTMLElement>('[role="toolbar"]');
                if (btn?.isConnected && (btn.classList.contains("ccpp-star-float") || !toolbar || toolbar.contains(btn))) return;
                btn?.remove();
                btn = null;
                if (toolbar) {
                    // A deferred toolbar is a hidden placeholder; wait for the real buttons (they mount on hover) and style after them.
                    const native = [...toolbar.querySelectorAll<HTMLElement>("button:not(.ccpp-star-btn)")].filter(b => !isPlaceholder(b)).pop();
                    if (!native && (toolbar.hasAttribute("data-deferred") || toolbar.querySelector("button"))) return;
                    btn = makeButton(row, "", native);
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
                return !!info && isStarred(row, info.key);
            })());
            return () => {
                observer.disconnect();
                btn?.remove();
                row.classList.remove("ccpp-starred-row");
            };
        });

        /* ---------- list ---------- */

        const list = createPopover(scope, "stars-list", LIST_CSS, 340);
        const renderList = (panel: HTMLElement, close: () => void) => {
            const keys = pageKeys();
            const here = keys.flatMap(k => starsFor(k.key).map(star => ({ star, side: k.key.includes(":") })));
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
                for (const { star, side } of here) {
                    const scroller = getScrollers().find(el => !!el.closest(SIDE_PANE) === side) ?? null;
                    panel.appendChild(item(star, () => (close(), void jumpTo(star.index, { scroller })), `${star.role === "user" ? t(L.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}`));
                }
            }
            const others = settings.store.otherChats ? Object.entries(book.get()).filter(([id]) => !keys.some(k => k.key === id)) : [];
            if (others.length) {
                panel.appendChild(h("div", { class: "sec", text: t(L.others) }));
                for (const [id, chat] of others.slice(0, 30)) {
                    for (const star of chat.stars.slice(0, 5)) {
                        panel.appendChild(item(star, () => {
                            close();
                            location.assign(chat.url ?? `/chat/${id}`);
                        }, `${chat.title || id.slice(0, 8)} · #${star.index + 1}`));
                    }
                }
            }
            if (!here.length && !others.length) panel.appendChild(h("div", { class: "msg", text: t(L.none) }));
        };

        const headerItems: ReturnType<typeof addSlotItem>[] = [];
        if (settings.store.headerButton) {
            const render = () => {
                const count = pageKeys().reduce((n, k) => n + starsFor(k.key).length, 0);
                const btn = slotButton(t(L.list), event => list.open(event.currentTarget as HTMLElement, renderList), icon("star", 16), count ? String(count) : "");
                if (count) btn.classList.add("on");
                return btn;
            };
            // Chats have a header action row; Claude Code pages get the button in each pane's header instead.
            headerItems.push(addSlotItem(scope, "header", "stars", render, 10), addSlotItem(scope, "codeHeader", "stars", render, 10));
        }

        scope.defer(book.subscribe(() => {
            paint();
            for (const item of headerItems) refreshSlotItem(item);
            list.update();
        }));
        scope.defer(() => setMarks("stars", []));
        // Opening or closing a thread only changes ?thread=; the header count covers that thread.
        scope.on("route:search", () => {
            paint();
            for (const item of headerItems) refreshSlotItem(item);
            list.close();
        });
                onRoute(scope, () => {
            paint();
            for (const item of headerItems) refreshSlotItem(item);
            list.close();
        });
        paint();
    },
});
