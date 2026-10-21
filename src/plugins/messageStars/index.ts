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
import { getRows, getScrollers, jumpTo, setMarks } from "@api/transcript";

import { book, chatKeyFor, reindex, type Star, starsFor, toggleStar } from "./store";

const settings = definePluginSettings({
    headerButton: { type: "boolean", label: { zh: "在对话标题栏显示收藏列表按钮", en: "Starred list button in the chat header" }, default: true },
});

const L = {
    star: { zh: "收藏这条消息", en: "Star this message" },
    unstar: { zh: "取消收藏", en: "Unstar" },
    list: { zh: "收藏的消息", en: "Starred messages" },
    none: { zh: "还没有收藏。悬停消息，点操作栏里的 ☆。", en: "Nothing starred yet. Hover a message and click ☆ in its action bar." },
    you: { zh: "你", en: "You" },
};

const CSS = `
.ccpp-star-btn:not(.ccpp-native) { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); cursor: pointer; }
.ccpp-star-btn:not(.ccpp-native):hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
/* Like void++: a starred message is marked only by its star, orange on a faint orange tint; the message itself is left alone. */
.ccpp-star-btn.on { color: #ff7a17; background: rgb(255 122 23 / 14%); opacity: 1; }
.ccpp-star-btn.on:hover, .ccpp-star-btn.on:focus-visible { color: #ff7a17; background: rgb(255 122 23 / 22%); }
`;

const LIST_CSS = `.sec { font-size: 12px; color: var(--fg3); padding: 2px 8px; } .star { color: #ff7a17; flex: none; }`;

function rowInfo(row: HTMLElement) {
    const index = Number(row.dataset.index);
    const message = row.querySelector<HTMLElement>(`${SEL.userMessage}, ${SEL.assistantMessage}`);
    if (!Number.isFinite(index) || !message) return null;
    const role: Star["role"] = message.matches(SEL.userMessage) ? "user" : "assistant";
    const keyed = row.querySelector<HTMLElement>("[data-turn-key]");
    // Claude Code project chats give your messages no turn key, but every row carries its message id.
    const entry = row.querySelector<HTMLElement>("[data-epitaxy-entry]")?.dataset.epitaxyEntry;
    const key = keyed?.dataset.turnKey ? `${keyed.dataset.turnKey}:${role}` : entry ? `${entry}:${role}` : `i${index}`;
    const body = role === "user" ? message.querySelector<HTMLElement>(SEL.userMessageBody) ?? message : message.querySelector<HTMLElement>(SEL.prose) ?? message;
    // Leave out controls inside the message, e.g. Claude Code's "Sent to 2 threads" chip.
    let text = body.innerText ?? "";
    for (const el of body.querySelectorAll<HTMLElement>('button, [role="button"], [role="status"]')) {
        const extra = el.innerText?.trim();
        if (extra) text = text.replace(extra, "");
    }
    return { index, role, key, text: snippet(text, 200) };
}

const SIDE_PANE = '[data-perf-region="side_pane"]';

/** The conversation `el` belongs to: the page's chat, or on Claude Code pages the project chat or the thread beside it. */
const keyOf = (el: Element | null) => chatKeyFor(location.pathname, location.search, !!el?.closest(SIDE_PANE));
/** Conversations shown on this page: the main one, plus a thread in the side pane. */
const pageKeys = () => [keyOf(null), document.querySelector(SIDE_PANE) ? chatKeyFor(location.pathname, location.search, true) : null].filter(k => k !== null);

/** A claude.ai placeholder for a toolbar it has not rendered yet (older replies' action bars mount on hover). */
const isPlaceholder = (button: HTMLElement) => /^Show message actions/i.test(button.getAttribute("aria-label") ?? "") || button.getBoundingClientRect().width < 4;

const SEL_COMPOSER = 'textarea, [contenteditable="true"], [role="textbox"], form';
const nativeButtons = (el: Element) => [...el.querySelectorAll<HTMLElement>("button:not(.ccpp-star-btn)")].filter(b => !isPlaceholder(b));

/** Where the star goes: after the last native action button, which can sit in the toolbar or in a sibling after it. */
export function starSpot(toolbar: HTMLElement): { native: HTMLElement; after: Element } | null {
    // Only a real message action bar: it has native buttons of its own, and isn't part of the composer.
    if (!nativeButtons(toolbar).length || toolbar.closest(SEL_COMPOSER) || toolbar.querySelector(SEL_COMPOSER)) return null;
    const hosts: Element[] = [toolbar];
    for (let el = toolbar.nextElementSibling; el; el = el.nextElementSibling) {
        if (el.classList.contains("ccpp-star-btn")) continue;
        if (el.matches(SEL_COMPOSER) || el.querySelector(SEL_COMPOSER)) break;
        hosts.push(el);
    }
    for (const host of hosts.reverse()) {
        const native = nativeButtons(host).pop() ?? (host.matches("button:not(.ccpp-star-btn)") && !isPlaceholder(host as HTMLElement) ? host as HTMLElement : undefined);
        if (!native) continue;
        if (host !== toolbar) return { native, after: host };
        let after: Element = native;
        while (after.parentElement && after.parentElement !== toolbar) after = after.parentElement;
        return { native, after };
    }
    return null;
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
            const seen = new Map<string, Map<string, number>>();
            for (const row of document.querySelectorAll<HTMLElement>(SEL.transcriptRow)) {
                const info = rowInfo(row);
                const chat = keyOf(row)?.key ?? "";
                if (!starred.has(chat)) starred.set(chat, new Set(starsFor(chat || null).map(s => s.key)));
                const on = !!info && starred.get(chat)!.has(info.key);
                row.classList.toggle("ccpp-starred-row", on);
                if (on && chat) {
                    if (!seen.has(chat)) seen.set(chat, new Map());
                    seen.get(chat)!.set(info!.key, info!.index);
                }
                for (const btn of row.querySelectorAll<HTMLElement>(".ccpp-star-btn")) {
                    btn.classList.toggle("on", on);
                    btn.setAttribute("data-ccpp-tip", t(on ? L.unstar : L.star));
                    btn.setAttribute("aria-pressed", String(on));
                    btn.setAttribute("aria-label", t(on ? L.unstar : L.star));
                }
            }
            setMarks("stars", starsFor(keyOf(null)?.key ?? null).map(s => s.index));
            // Rows added above a starred message shift its index; store where it is now (this repaints once more).
            let next = book.get();
            for (const [chat, keys] of seen) next = reindex(next, chat, keys) ?? next;
            if (next !== book.get()) book.set(next);
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
            return btn;
        };

        /*
         * Toggling happens on pointerdown, delegated from the document. claude.ai re-renders a message's action bar
         * while the pointer is over it (hover state, focus moving into the bar), and the star is rebuilt with it; a
         * click whose pointerdown and pointerup land on two different star nodes never fires, which is why clicks
         * were lost now and then. pointerdown also stops claude.ai treating the press as one on its own bar.
         */
        const starAt = (event: Event) => event.composedPath().find((n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains("ccpp-star-btn"));
        const press = (star: HTMLElement) => {
            const row = star.closest<HTMLElement>(SEL.transcriptRow);
            if (row) toggle(row);
        };
        scope.listen(document, "pointerdown", (event: PointerEvent) => {
            const star = event.button === 0 ? starAt(event) : undefined;
            if (!star) return;
            event.preventDefault();
            event.stopPropagation();
            press(star);
        }, { capture: true });
        for (const type of ["mousedown", "pointerup", "mouseup"]) {
            scope.listen(document, type, (event: Event) => starAt(event) && (event.preventDefault(), event.stopPropagation()), { capture: true });
        }
        scope.listen(document, "click", (event: MouseEvent) => {
            const star = starAt(event);
            if (!star) return;
            event.preventDefault();
            event.stopPropagation();
            // Enter / Space on a focused star (a click with no pointer behind it).
            if (event.detail === 0) press(star);
        }, { capture: true });

        // Rows mount and move as you scroll; repaint shortly after so stored positions follow them.
        let paintTimer = 0;
        const schedulePaint = () => {
            clearTimeout(paintTimer);
            paintTimer = window.setTimeout(paint, 300);
        };
        scope.defer(() => clearTimeout(paintTimer));

        watch(scope, SEL.transcriptRow, row => {
            schedulePaint();
            let btn: HTMLElement | null = null;
            const attach = () => {
                // No star where it couldn't be saved (a row whose message isn't recognised yet).
                if (!rowInfo(row)) return;
                const toolbar = row.querySelector<HTMLElement>(SEL.messageActions) ?? row.querySelector<HTMLElement>('[role="toolbar"]');
                // The star lives only in claude.ai's own action bar, like void++, right after its last button. Your
                // messages' bars mount on hover (until then there is at most a hidden placeholder), so the star appears
                // with them. Buttons that mount later ("More options") land after the star, so it is moved back to the end.
                const spot = toolbar ? starSpot(toolbar) : null;
                if (!spot) {
                    btn?.remove();
                    btn = null;
                    return;
                }
                if (btn?.isConnected && btn.previousElementSibling === spot.after) return;
                btn ??= makeButton(row, "", spot.native);
                spot.after.after(btn);
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
        // Each header's list holds only the conversation shown under it: the main chat, or the thread in the side pane.
        let listFrom: Element | null = null;
        const keysFor = (el: Element | null) => {
            const key = el?.isConnected ? keyOf(el) : null;
            return key ? [key] : el?.isConnected ? [] : pageKeys().slice(0, 1);
        };
        /**
         * A pane that is still loading has no rows yet (or not even its scroller), and claude.ai scrolls it to the
         * bottom once they arrive. Wait for its rows to settle, then jump.
         */
        let pending = 0;
        const jumpWhenLoaded = async (side: boolean, star: Star) => {
            const mine = ++pending;
            const pane = () => getScrollers().find(el => !!el.closest(SIDE_PANE) === side) ?? null;
            const go = (scroller: HTMLElement | null) => void jumpTo(star.index, { scroller, entry: star.key.replace(/:(user|assistant)$/, "") });
            const ready = pane();
            if (ready && getRows(ready).length) return go(ready);
            // Threads can take 20s or more to load. Wait that long, unless the reader scrolls, clicks or types first.
            let count = 0;
            let steady = 0;
            let gaveUp = false;
            const giveUp = (e: Event) => {
                if (!(e.target instanceof Element && e.target.closest("#ccpp-stars-list"))) gaveUp = true;
            };
            const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
            for (const type of events) document.addEventListener(type, giveUp, { passive: true, capture: true });
            try {
                for (let waited = 0; waited < 45_000 && mine === pending && !gaveUp; waited += 150) {
                    await new Promise(r => setTimeout(r, 150));
                    const scroller = pane();
                    const rows = scroller ? getRows(scroller).length : 0;
                    steady = rows && rows === count ? steady + 150 : 0;
                    count = rows;
                    if (steady >= 450 && mine === pending && !gaveUp) return go(scroller);
                }
            } finally {
                for (const type of events) document.removeEventListener(type, giveUp, { capture: true });
            }
        };
        scope.defer(() => void pending++);

        const renderList = (panel: HTMLElement, close: () => void) => {
            const stars = keysFor(listFrom).flatMap(k => starsFor(k.key).map(star => ({ star, side: k.key.includes(":") })));
            panel.appendChild(h("div", { class: "top" }, icon("star", 16), h("b", { text: t(L.list) })));
            for (const { star, side } of stars) {
                const row = h(
                    "button",
                    { type: "button", class: "item" },
                    h("span", { class: "star", text: "★" }),
                    h("span", { class: "grow" }, h("div", { class: "clip2", text: star.text || "…" }), h("div", { class: "sub", text: `${star.role === "user" ? t(L.you) : "Claude"} · #${star.index + 1} · ${agoText(star.at)}` })),
                );
                row.addEventListener("click", () => (close(), void jumpWhenLoaded(side, star)));
                panel.appendChild(row);
            }
            if (!stars.length) panel.appendChild(h("div", { class: "msg", text: t(L.none) }));
        };

        const headerItems: ReturnType<typeof addSlotItem>[] = [];
        if (settings.store.headerButton) {
            const render = () => {
                const label = h("span");
                const btn = slotButton(t(L.list), event => {
                    listFrom = event.currentTarget as HTMLElement;
                    paint();
                    list.open(listFrom as HTMLElement, renderList);
                }, icon("star", 16), label);
                // The count is this header's own conversation, known once the button is in place.
                const sync = () => {
                    const keys = keysFor(btn.isConnected ? btn : null);
                    const count = keys.reduce((n, k) => n + starsFor(k.key).length, 0);
                    label.textContent = count ? String(count) : "";
                    btn.classList.toggle("on", count > 0);
                    // Not where there is no conversation (the /code landing page).
                    btn.hidden = location.pathname.startsWith("/code") && !keys.length;
                };
                sync();
                queueMicrotask(sync);
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
