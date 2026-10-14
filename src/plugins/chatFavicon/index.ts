/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { chatPhase } from "@api/chatState";
import { getText, onSubmit } from "@api/composer";
import { SEL } from "@api/dom";
import { onResponse, sameOrigin } from "@api/network";
import { currentRoute } from "@api/router";

export type FaviconState = "idle" | "streaming" | "done" | "ready" | "error";
export type FaviconStyle = "emoji" | "badge" | "dot" | "hole" | "bg";

const settings = definePluginSettings({
    style: {
        type: "select",
        label: { zh: "图标样式", en: "Icon style" },
        description: { zh: "回复中蓝色、完成绿色、输入框有内容待发送黄色、出错红色。", en: "Blue while replying, green when done, amber when a draft is ready to send, red on error." },
        default: "hole",
        options: [
            { value: "emoji", label: { zh: "只用表情", en: "Emoji only" } },
            { value: "badge", label: { zh: "角标 + 符号", en: "Badge + glyph" } },
            { value: "dot", label: { zh: "彩色圆点", en: "Colour dot" } },
            { value: "hole", label: { zh: "图标变色", en: "Mark tint" } },
            { value: "bg", label: { zh: "背景变色", en: "Background tint" } },
        ],
    },
});

const COLOR: Record<Exclude<FaviconState, "idle">, string> = {
    streaming: "#3B82F6",
    done: "#22C55E",
    ready: "#F59E0B",
    error: "#EF4444",
};
const CLAY = "#D97757";
const EMOJI: Record<Exclude<FaviconState, "idle">, string> = { streaming: "🔄", done: "✅", ready: "✍️", error: "❌" };

/** claude.ai's own mark (from its SVG favicon): viewBox and inner markup. */
export interface Mark {
    viewBox: string;
    inner: string;
}

/** A twelve-spoke spark, only used until claude.ai's own icon has been read. */
function fallbackMark(): Mark {
    const spokes: string[] = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const length = i % 2 ? 20 : 26;
        const x = (r: number) => (32 + Math.cos(angle) * r).toFixed(1);
        const y = (r: number) => (32 + Math.sin(angle) * r).toFixed(1);
        spokes.push(`<line x1="${x(5)}" y1="${y(5)}" x2="${x(length)}" y2="${y(length)}" stroke="${CLAY}" stroke-width="6.5" stroke-linecap="round"/>`);
    }
    return { viewBox: "0 0 64 64", inner: spokes.join("") };
}

/** Pulls the drawing out of an SVG file; null when it isn't one. */
export function parseMark(svgText: string): Mark | null {
    const open = /<svg\b[^>]*>/i.exec(svgText);
    const close = svgText.lastIndexOf("</svg>");
    if (!open || close < 0) return null;
    const viewBox = /viewBox="([^"]+)"/i.exec(open[0])?.[1] ?? (() => {
        const w = /width="([\d.]+)"/.exec(open[0])?.[1];
        const hgt = /height="([\d.]+)"/.exec(open[0])?.[1];
        return w && hgt ? `0 0 ${w} ${hgt}` : null;
    })();
    const inner = svgText.slice(open.index + open[0].length, close).replace(/<script[\s\S]*?<\/script>/gi, "");
    return viewBox && inner.trim() ? { viewBox, inner } : null;
}

/** Recolours the whole mark: every colour it names, in attributes, inline styles or a style block. */
const recolor = (inner: string, color: string) =>
    inner.replace(/\b(fill|stroke)="(?!none)[^"]*"/g, `$1="${color}"`).replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi, color);
const place = (mark: Mark, inner: string, x = 0, y = 0, size = 64) => `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${mark.viewBox}">${inner}</svg>`;
const svgUrl = (inner: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`)}`;

function glyph(state: Exclude<FaviconState, "idle">) {
    const s = `fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if (state === "streaming") return `<path d="M51.5 45.5a6 6 0 1 1-5.2 3" ${s}/>`;
    if (state === "done") return `<path d="M46.8 51.8l3.4 3.4 6.4-7.4" ${s}/>`;
    if (state === "ready") return `<path d="M51.5 56.5v-9.6M46.8 51.2l4.7-4.8 4.7 4.8" ${s}/>`;
    return `<path d="M47.3 47.3l8.4 8.4M55.7 47.3l-8.4 8.4" ${s}/>`;
}

/**
 * The favicon for a state in a style, drawn over claude.ai's own mark. `official` is claude.ai's icon URL,
 * which idle shows as-is.
 */
export function faviconFor(style: FaviconStyle, state: FaviconState, official: string, mark: Mark | null = null) {
    if (state === "idle") return official;
    const color = COLOR[state];
    if (style === "emoji") return svgUrl(`<text x="32" y="54" font-size="54" text-anchor="middle">${EMOJI[state]}</text>`);
    const m = mark ?? fallbackMark();
    if (style === "hole") return svgUrl(place(m, recolor(m.inner, color)));
    if (style === "bg") return svgUrl(`<rect width="64" height="64" rx="14" fill="${color}"/>${place(m, recolor(m.inner, "#fff"), 9, 9, 46)}`);
    const badge =
        style === "dot"
            ? `<circle cx="52" cy="52" r="11" fill="#fff"/><circle cx="52" cy="52" r="8" fill="${color}"/>`
            : `<circle cx="51.5" cy="51.5" r="12.5" fill="#fff"/><circle cx="51.5" cy="51.5" r="10" fill="${color}"/>${glyph(state)}`;
    return svgUrl(place(m, m.inner) + badge);
}

/** Facts the tab icon is drawn from. */
export interface ChatFacts {
    streaming: boolean;
    /** The last reply failed; sticks until the next send. */
    errored: boolean;
    /** The last reply finished in this chat; cleared by the next send or a chat switch. */
    finished: boolean;
    /** The composer holds new text (not what was just sent). */
    draft: boolean;
}

/** An error wins, then a reply in progress, then a draft waiting to be sent, then a finished reply. */
export function computeState(facts: ChatFacts): FaviconState {
    if (facts.errored) return "error";
    if (facts.streaming) return "streaming";
    if (facts.draft) return "ready";
    if (facts.finished) return "done";
    return "idle";
}

const ICON_ID = "ccpp-favicon";
const isIconLink = (node: Node): node is HTMLLinkElement => node instanceof HTMLLinkElement && /\bicon\b/i.test(node.rel) && node.id !== ICON_ID;
/** claude.ai's chat requests whose failure means the reply errored. */
const isCompletion = (path: string) => /\/chat_conversations\/[^/]+\/(?:completion|retry_completion)$/.test(path);

export default definePlugin({
    name: "ChatFavicon",
    title: { zh: "标签页图标状态", en: "Chat state favicon" },
    description: {
        zh: "标签页图标随对话状态变化：回复中、已完成、草稿待发送、出错，5 种样式可选。",
        en: "The tab icon follows the chat: replying, done, draft ready, error. Five styles.",
    },
    category: "notifications",
    icon: "tab",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["ChatStateApi", "ComposerApi", "NetworkApi", "RouterApi"],
    settings,
    start(scope) {
        const removed: HTMLLinkElement[] = [];
        let official = `${location.origin}/favicon.ico`;
        let mark: Mark | null = null;
        let markFrom = "";
        const loadMark = (href: string) => {
            if (!/\.svg(?:$|\?)/i.test(href) || href === markFrom) return;
            markFrom = href;
            fetch(href, { credentials: "omit" })
                .then(r => (r.ok ? r.text() : ""))
                .then(text => {
                    const parsed = parseMark(text);
                    if (!parsed || !scope.alive) return;
                    mark = parsed;
                    paint();
                })
                .catch(() => {});
        };
        // Only chat pages get a state icon; elsewhere claude.ai's own icon comes back.
        const onChatSurface = () => ["chat", "new", "project"].includes(currentRoute().kind);
        // The icon is recomputed from facts on every event and on a short timer, so a missed event
        // (claude.ai changes its streams and routes often) can't leave it stuck in a stale state.
        let errored = false;
        let finished = false;
        let streaming = chatPhase() === "streaming";
        // What was just sent: claude.ai clears and briefly restores the composer after a send.
        let sent = "";
        let sentAt = 0;
        const norm = (text: string) => text.replace(/\s+/g, " ").trim();
        const draft = () => {
            const text = norm(getText());
            return !!text && text !== sent && Date.now() - sentAt > 1500;
        };
        let state: FaviconState = "idle";
        const link = document.createElement("link");
        link.id = ICON_ID;
        link.rel = "icon";
        link.setAttribute("sizes", "any");

        // Keep only our icon link; claude.ai's go back when the plugin stops.
        const claim = () => {
            const head = document.head;
            if (!head) return;
            for (const node of [...head.querySelectorAll("link")]) {
                if (!isIconLink(node)) continue;
                // Prefer the SVG icon: it is what tab strips show and what we draw over.
                if (node.href && !node.href.startsWith("data:") && (/svg/i.test(node.type) || !/\.svg/i.test(official))) official = node.href;
                removed.push(node);
                node.remove();
            }
            if (head.firstChild !== link) head.prepend(link);
        };
        const release = () => {
            link.remove();
            for (const node of removed.splice(0)) if (!node.isConnected) document.head?.appendChild(node);
        };
        const paint = () => {
            if (!onChatSurface()) return release();
            claim();
            loadMark(official);
            const href = faviconFor(settings.store.style as FaviconStyle, state, official, mark);
            if (link.getAttribute("href") !== href) link.setAttribute("href", href);
        };
        // Replying = a completion request in flight, a send not yet answered, or claude.ai's own streaming
        // mark. Short replies can finish between two DOM checks, so the request itself is the main signal.
        let inflight = 0;
        let pendingUntil = 0;
        const live = () => inflight > 0 || Date.now() < pendingUntil || chatPhase() === "streaming";
        const update = () => {
            const now = live();
            if (now && !streaming) {
                errored = false;
                finished = false;
            } else if (!now && streaming) finished = true;
            streaming = now;
            const next = computeState({ streaming, errored, finished, draft: draft() });
            if (next === state) return;
            state = next;
            paint();
        };

        onSubmit(scope, text => {
            sent = norm(text);
            sentAt = Date.now();
            errored = false;
            // Blue right away; the completion request (or claude.ai's streaming mark) takes over from here.
            pendingUntil = Date.now() + 8000;
            update();
        });
        scope.on("reply:start", update);
        scope.on("reply:end", update);
        scope.interval(update, 500);
        // Only a switch to another chat clears the finished and error marks. Sending from /new gives
        // the chat its id mid-reply, and claude.ai rewrites the URL of the same chat; neither counts.
        let chatId = currentRoute().chatId ?? null;
        scope.on("route", () => {
            const next = currentRoute().chatId ?? null;
            if (next !== chatId && chatId !== null && !streaming) {
                finished = false;
                errored = false;
            }
            chatId = next;
            update();
            paint();
        });
        // The editor updates its own state after the input event, so read the draft a moment later.
        let inputTimer: ReturnType<typeof setTimeout> | undefined;
        scope.listen(document, "input", (event: Event) => {
            if (!(event.target as Element | null)?.closest?.(SEL.editor)) return;
            clearTimeout(inputTimer);
            inputTimer = setTimeout(() => scope.alive && update(), 60);
        }, { capture: true });
        scope.defer(() => clearTimeout(inputTimer));
        // A failed send, or an error event inside the reply stream, turns the icon red.
        const fail = () => {
            errored = true;
            update();
        };
        onResponse(scope, req => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), async response => {
            inflight++;
            pendingUntil = 0;
            update();
            try {
                if (!response.ok) return fail();
                const text = await response.text();
                if (/^event:\s*error\s*$/m.test(text) || /"type"\s*:\s*"error"/.test(text)) fail();
            } catch {
            } finally {
                inflight = Math.max(0, inflight - 1);
                update();
            }
        });
        // claude.ai sets the href of every icon link while it replies, ours included; put ours back.
        scope.observe(link, { attributes: true, attributeFilter: ["href"] }, () => {
            const want = faviconFor(settings.store.style as FaviconStyle, state, official, mark);
            if (onChatSurface() && link.getAttribute("href") !== want) link.setAttribute("href", want);
        });
        // claude.ai (or another script) may put its icon back or drop ours; take the slot again.
        if (document.head) scope.observe(document.head, { childList: true }, () => onChatSurface() && (!link.isConnected || [...document.head.querySelectorAll("link")].some(isIconLink)) && paint());
        scope.defer(release);
        paint();
    },
});
