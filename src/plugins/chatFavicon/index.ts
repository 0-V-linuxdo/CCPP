/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { chatPhase } from "@api/chatState";
import { getText } from "@api/composer";
import { SEL } from "@api/dom";
import { onResponse, sameOrigin } from "@api/network";

export type FaviconState = "idle" | "streaming" | "done" | "ready" | "error";
export type FaviconStyle = "emoji" | "badge" | "dot" | "tint" | "bg";

const settings = definePluginSettings({
    style: {
        type: "select",
        label: { zh: "图标样式", en: "Icon style" },
        description: { zh: "回复中蓝色、完成绿色、输入框有内容待发送黄色、出错红色。", en: "Blue while replying, green when done, amber when a draft is ready to send, red on error." },
        default: "tint",
        options: [
            { value: "emoji", label: { zh: "只用表情", en: "Emoji only" } },
            { value: "badge", label: { zh: "角标 + 符号", en: "Badge + glyph" } },
            { value: "dot", label: { zh: "彩色圆点", en: "Colour dot" } },
            { value: "tint", label: { zh: "图标变色", en: "Mark tint" } },
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

/** A twelve-spoke spark in the spirit of Claude's mark, drawn from scratch. */
function spark(color: string, cx = 32, cy = 32, outer = 26, inner = 5, width = 6.5) {
    const spokes: string[] = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6 + (i % 2 ? 0.08 : 0);
        const length = i % 2 ? outer * 0.78 : outer;
        const x1 = cx + Math.cos(angle) * inner;
        const y1 = cy + Math.sin(angle) * inner;
        const x2 = cx + Math.cos(angle) * length;
        const y2 = cy + Math.sin(angle) * length;
        spokes.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
    }
    return `<g stroke="${color}" stroke-width="${width}" stroke-linecap="round">${spokes.join("")}</g>`;
}

const svgUrl = (inner: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${inner}</svg>`)}`;

function glyph(state: Exclude<FaviconState, "idle">) {
    const s = `fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if (state === "streaming") return `<path d="M51.5 45.5a6 6 0 1 1-5.2 3" ${s}/>`;
    if (state === "done") return `<path d="M46.8 51.8l3.4 3.4 6.4-7.4" ${s}/>`;
    if (state === "ready") return `<path d="M51.5 56.5v-9.6M46.8 51.2l4.7-4.8 4.7 4.8" ${s}/>`;
    return `<path d="M47.3 47.3l8.4 8.4M55.7 47.3l-8.4 8.4" ${s}/>`;
}

/** The favicon for a state in a style; `official` is claude.ai's own icon, used when idle in emoji mode. */
export function faviconFor(style: FaviconStyle, state: FaviconState, official: string) {
    if (style === "emoji") {
        if (state === "idle") return official;
        return svgUrl(`<text x="32" y="54" font-size="54" text-anchor="middle">${EMOJI[state]}</text>`);
    }
    const color = state === "idle" ? null : COLOR[state];
    if (style === "tint") return svgUrl(spark(color ?? CLAY));
    if (style === "bg") return svgUrl(`<rect width="64" height="64" rx="14" fill="${color ?? CLAY}"/>${spark("#fff", 32, 32, 22, 4, 5.5)}`);
    const base = spark(CLAY);
    if (!color || state === "idle") return svgUrl(base);
    const badge =
        style === "dot"
            ? `<circle cx="52" cy="52" r="11" fill="#fff"/><circle cx="52" cy="52" r="8" fill="${color}"/>`
            : `<circle cx="51.5" cy="51.5" r="12.5" fill="#fff"/><circle cx="51.5" cy="51.5" r="10" fill="${color}"/>${glyph(state as Exclude<FaviconState, "idle">)}`;
    return svgUrl(base + badge);
}

/** What the tab shows next: replies win, an error sticks until the next send, a finished reply stays until you type. */
export function nextState(current: FaviconState, event: "start" | "end" | "error" | "input" | "route", hasDraft: boolean): FaviconState {
    switch (event) {
        case "start":
            return "streaming";
        case "error":
            return "error";
        case "end":
            return current === "error" ? "error" : "done";
        case "route":
            return hasDraft ? "ready" : "idle";
        case "input":
            if (current === "streaming" || current === "error") return current;
            if (hasDraft) return "ready";
            return current === "done" ? "done" : "idle";
    }
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
        let state: FaviconState = chatPhase() === "streaming" ? "streaming" : "idle";
        const draft = () => !!getText().trim();

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
                if (node.href && !node.href.startsWith("data:")) official = node.href;
                removed.push(node);
                node.remove();
            }
            if (head.firstChild !== link) head.prepend(link);
        };
        const paint = () => {
            claim();
            const href = faviconFor(settings.store.style as FaviconStyle, state, official);
            if (link.getAttribute("href") !== href) link.setAttribute("href", href);
        };
        const go = (event: Parameters<typeof nextState>[1]) => {
            const next = nextState(state, event, draft());
            if (next === state) return;
            state = next;
            paint();
        };

        scope.on("reply:start", () => go("start"));
        scope.on("reply:end", () => go("end"));
        scope.on("route", () => {
            state = "idle";
            go("route");
            paint();
        });
        scope.listen(document, "input", (event: Event) => {
            if ((event.target as Element | null)?.closest?.(SEL.editor)) go("input");
        }, { capture: true });
        // A failed send, or an error event inside the reply stream, turns the icon red.
        onResponse(scope, req => sameOrigin(req) && req.method === "POST" && isCompletion(req.url.pathname), async response => {
            if (!response.ok) return go("error");
            try {
                const text = await response.text();
                if (/^event:\s*error\s*$/m.test(text) || /"type"\s*:\s*"error"/.test(text)) go("error");
            } catch {}
        });
        if (document.head) scope.observe(document.head, { childList: true }, () => [...document.head.querySelectorAll("link")].some(isIconLink) && paint());
        scope.defer(() => {
            link.remove();
            for (const node of removed.splice(0)) if (!node.isConnected) document.head?.appendChild(node);
        });
        paint();
    },
});
