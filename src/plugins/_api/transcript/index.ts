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
    /** The message id of a Claude Code project-chat row ([data-epitaxy-entry]). */
    entry: string | null;
}

/**
 * Chat pages have one transcript. Claude Code project pages can show two (the project chat
 * and a thread in the side pane); the active one is the last the user scrolled or pointed
 * at, else the side pane, else the main one.
 */
const FEEDS = `${SEL.scroller}, [data-testid="epitaxy-virtual-transcript"], [role="feed"][data-autoscroll-container]`;
let lastFeed: HTMLElement | null = null;

export function getScrollers(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>(FEEDS)].filter(el => el.isConnected && el.clientHeight > 0);
}

export function getScroller(): HTMLElement | null {
    const all = getScrollers();
    if (!all.length) return null;
    if (lastFeed && all.includes(lastFeed)) return lastFeed;
    return all.find(el => el.closest('[data-perf-region="side_pane"]')) ?? all[0];
}

/** Remembers which transcript the user is reading (call from scroll / pointer events). */
export function noteFeedActivity(target: EventTarget | null) {
    if (!(target instanceof Element)) return;
    const feed = target.closest<HTMLElement>(FEEDS);
    if (feed) lastFeed = feed;
}

/** Strips the screen-reader prefixes claude.ai puts in project transcripts. */
const SR_PREFIX = /^(?:You said|Claude responded|你说|Claude 回复)[:：]\s*/;

export function rowText(el: HTMLElement) {
    const body = el.querySelector<HTMLElement>(`${SEL.userMessageBody}, ${SEL.userMessage}, ${SEL.prose}`) ?? el;
    return (body.innerText || "").replace(SR_PREFIX, "").trim();
}

export function getRows(root: ParentNode | null = getScroller()): RowInfo[] {
    if (!root) return [];
    return [...root.querySelectorAll<HTMLElement>(SEL.transcriptRow)]
        .map(el => {
            const index = Number(el.dataset.index);
            const message = el.querySelector<HTMLElement>(`${SEL.userMessage}, ${SEL.assistantMessage}`);
            const role: RowInfo["role"] = message?.matches(SEL.userMessage) || el.dataset.perfRow === "human" ? "user" : "assistant";
            const keyed = el.querySelector<HTMLElement>("[data-turn-key]");
            const entry = el.querySelector<HTMLElement>("[data-epitaxy-entry]")?.dataset.epitaxyEntry ?? null;
            return { index, el, role, turnKey: keyed?.dataset.turnKey ?? null, entry };
        })
        .filter(row => Number.isFinite(row.index))
        .sort((a, b) => a.index - b.index);
}

/** Total messages according to claude.ai's own aria-setsize. */
export function totalMessages(root: ParentNode | null = getScroller()): number | null {
    const article = root?.querySelector<HTMLElement>("[aria-setsize]");
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
export async function jumpTo(index: number, options: { behavior?: ScrollBehavior; flash?: boolean; scroller?: HTMLElement | null; entry?: string | null } = {}): Promise<HTMLElement | null> {
    const scroller = options.scroller ?? getScroller();
    if (!scroller) return null;
    // A newer jump, or the reader scrolling by hand, ends this one: never fight the reader.
    const token = (jumpTokens.get(scroller) ?? 0) + 1;
    jumpTokens.set(scroller, token);
    let cancelled = false;
    const cancel = () => (cancelled = true);
    const events = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    for (const type of events) scroller.addEventListener(type, cancel, { passive: true, capture: true });
    try {
        return await stepTo(scroller, index, options, () => cancelled || jumpTokens.get(scroller) !== token);
    } finally {
        for (const type of events) scroller.removeEventListener(type, cancel, { capture: true });
    }
}

const jumpTokens = new WeakMap<HTMLElement, number>();

async function stepTo(scroller: HTMLElement, index: number, options: { behavior?: ScrollBehavior; flash?: boolean; entry?: string | null }, stopped: () => boolean): Promise<HTMLElement | null> {
    let nearby = false;
    let waited = 0;
    for (let attempt = 0; attempt < 24; attempt++) {
        if (stopped()) return null;
        const rows = getRows(scroller);
        // A message id is exact; the index may only be an estimate (project pages), so it just gets us close.
        const byEntry = options.entry ? rows.find(r => r.entry === options.entry || r.turnKey === options.entry) : undefined;
        const row = byEntry ?? rows.find(r => r.index === index);
        // Near the estimated index but the exact message isn't rendered yet: look again once the rows around it are.
        if (row && !byEntry && options.entry && !nearby) {
            nearby = true;
            scrollRowIntoView(scroller, row.el, "auto");
            await sleep(120);
            continue;
        }
        if (row) {
            scrollRowIntoView(scroller, row.el, options.behavior ?? "smooth");
            if (options.flash !== false) flash(row.el);
            return row.el;
        }
        if (!rows.length) {
            // A pane that is still loading its messages (Claude Code threads can take several seconds): wait for them.
            if (waited++ < 120) attempt--;
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
    const target = el.querySelector<HTMLElement>(`${SEL.userMessage}, ${SEL.assistantMessage}, [role="article"]`) ?? el;
    target.classList.remove("ccpp-flash");
    void target.offsetWidth;
    target.classList.add("ccpp-flash");
    setTimeout(() => target.classList.remove("ccpp-flash"), 1600);
}

/** Index of the message nearest the top of the viewport. */
export function currentIndex(scroller: HTMLElement | null = getScroller()): number | null {
    if (!scroller) return null;
    const top = scroller.getBoundingClientRect().top + JUMP_OFFSET + 8;
    let best: RowInfo | null = null;
    for (const row of getRows(scroller)) {
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
@keyframes ccpp-flash { 0%, 70% { outline-color: var(--cds-text-primary, currentColor); } 100% { outline-color: transparent; } }
.ccpp-flash { outline: 2px solid transparent; outline-offset: 4px; border-radius: 12px; animation: ccpp-flash 1.6s ease-out; }
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
        const note = (event: Event) => noteFeedActivity(event.target);
        scope.listen(document, "pointerdown", note, { capture: true, passive: true });
        scope.listen(document, "wheel", note, { capture: true, passive: true });
        scope.defer(() => cache.clear());
    },
});
