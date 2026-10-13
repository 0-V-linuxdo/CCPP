/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { type Conversation, getConversation } from "@api/claude";
import { currentRoute } from "@api/router";
import { SEL } from "@api/dom";
import { addStyle } from "@api/styles";

/**
 * The conversation on screen. claude.ai virtualises long chats (only rows near the
 * viewport are in the DOM), so the full list comes from the conversation API and the DOM
 * is used for positions. Row `data-index` n is the n-th message of the visible branch.
 */

export interface RowInfo {
    index: number;
    el: HTMLElement;
    role: "user" | "assistant";
    /** claude.ai's per-turn key; stable across reloads. */
    turnKey: string | null;
}

export const getScroller = () => document.querySelector<HTMLElement>(SEL.scroller);

export function getRows(): RowInfo[] {
    return [...document.querySelectorAll<HTMLElement>(SEL.transcriptRow)]
        .map(el => {
            const index = Number(el.dataset.index);
            const message = el.querySelector<HTMLElement>(`${SEL.userMessage}, ${SEL.assistantMessage}`);
            const role: RowInfo["role"] = message?.matches(SEL.userMessage) || el.dataset.perfRow === "human" ? "user" : "assistant";
            const keyed = el.querySelector<HTMLElement>("[data-turn-key]");
            return { index, el, role, turnKey: keyed?.dataset.turnKey ?? null };
        })
        .filter(row => Number.isFinite(row.index))
        .sort((a, b) => a.index - b.index);
}

/** Total messages on the branch according to claude.ai's own aria-setsize. */
export function totalMessages(): number | null {
    const article = document.querySelector<HTMLElement>(`${SEL.transcriptRow} [role="article"][aria-setsize]`);
    const size = Number(article?.getAttribute("aria-setsize"));
    return Number.isFinite(size) && size > 0 ? size : null;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Offset from the scroller top where a jumped-to message lands (clears the sticky header). */
export const JUMP_OFFSET = 72;

function scrollRowIntoView(scroller: HTMLElement, row: HTMLElement, behavior: ScrollBehavior) {
    const delta = row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - JUMP_OFFSET;
    scroller.scrollBy({ top: delta, behavior });
}

/**
 * Scrolls message `index` into view, stepping through the virtual list when that row is
 * not mounted yet. Resolves with the row element, or null if it never appeared.
 */
export async function jumpTo(index: number, options: { behavior?: ScrollBehavior; flash?: boolean } = {}): Promise<HTMLElement | null> {
    const scroller = getScroller();
    if (!scroller) return null;
    for (let attempt = 0; attempt < 16; attempt++) {
        const rows = getRows();
        const row = rows.find(r => r.index === index);
        if (row) {
            scrollRowIntoView(scroller, row.el, options.behavior ?? "smooth");
            if (options.flash !== false) flash(row.el);
            return row.el;
        }
        if (!rows.length) {
            await sleep(120);
            continue;
        }
        const first = rows[0];
        const last = rows[rows.length - 1];
        const span = last.el.getBoundingClientRect().bottom - first.el.getBoundingClientRect().top;
        const average = Math.max(80, span / rows.length);
        const anchor = index < first.index ? first : last;
        const distance = (index - anchor.index) * average;
        scroller.scrollBy({ top: Math.max(-scroller.clientHeight * 3, Math.min(scroller.clientHeight * 3, distance)), behavior: "auto" });
        await sleep(90);
    }
    return null;
}

export function flash(el: HTMLElement) {
    el.classList.remove("ccpp-flash");
    void el.offsetWidth;
    el.classList.add("ccpp-flash");
    setTimeout(() => el.classList.remove("ccpp-flash"), 1600);
}

/** Index of the message nearest the top of the viewport. */
export function currentIndex(): number | null {
    const scroller = getScroller();
    if (!scroller) return null;
    const top = scroller.getBoundingClientRect().top + JUMP_OFFSET + 8;
    let best: RowInfo | null = null;
    for (const row of getRows()) {
        const rect = row.el.getBoundingClientRect();
        if (rect.height === 0) continue;
        if (rect.top <= top) best = row;
        else {
            best ??= row;
            break;
        }
    }
    return best?.index ?? null;
}

/* ---------- conversation cache ---------- */

const cache = new Map<string, { at: number; promise: Promise<Conversation> }>();
const CACHE_MS = 60_000;

/** The conversation from the API, cached for a minute and dropped after every reply. */
export function loadConversation(chatId = currentRoute().chatId, force = false): Promise<Conversation> | null {
    if (!chatId) return null;
    const hit = cache.get(chatId);
    if (hit && !force && Date.now() - hit.at < CACHE_MS) return hit.promise;
    const promise = getConversation(chatId);
    cache.set(chatId, { at: Date.now(), promise });
    promise.catch(() => cache.delete(chatId));
    return promise;
}

export const invalidateConversation = (chatId: string | null) => chatId && cache.delete(chatId);

/* ---------- marks ---------- */

/**
 * Other plugins can mark messages (MessageStars marks starred ones) and anything that
 * draws the conversation (ChatNavigator) shows them. Keyed by mark source, then message index.
 */
const marks = new Map<string, Set<number>>();
const markListeners = new Set<() => void>();

export function setMarks(source: string, indices: Iterable<number>) {
    marks.set(source, new Set(indices));
    for (const fn of [...markListeners]) fn();
}

export const getMarks = (source: string) => marks.get(source) ?? new Set<number>();

export function onMarksChange(scope: { defer(fn: () => void): unknown }, fn: () => void) {
    markListeners.add(fn);
    scope.defer(() => markListeners.delete(fn));
}

const CSS = `
@keyframes ccpp-flash { 0% { box-shadow: 0 0 0 2px rgba(217,119,87,.9); } 100% { box-shadow: 0 0 0 2px rgba(217,119,87,0); } }
.ccpp-flash { border-radius: 12px; animation: ccpp-flash 1.6s ease-out; }
`;

export default definePlugin({
    name: "TranscriptApi",
    title: { zh: "对话内容", en: "Transcript API" },
    description: { zh: "定位对话里的消息、跳转到第 N 条（含未渲染的虚拟行），并缓存对话内容。", en: "Finds messages in the chat, jumps to message N (also virtualised rows) and caches the conversation." },
    category: "api",
    icon: "list",
    hidden: true,
    dependencies: ["ClaudeApi", "RouterApi", "ChatStateApi", "StylesApi"],
    start(scope) {
        addStyle(scope, CSS, "transcript");
        scope.on("reply:end", ({ chatId }) => invalidateConversation(chatId));
        scope.defer(() => cache.clear());
    },
});
