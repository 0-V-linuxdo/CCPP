/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { emit } from "@kernel/events";
import { definePlugin } from "@kernel/plugins";
import { onRequestError, onResponse, sameOrigin, type RequestInfoLite } from "@api/network";
import { currentRoute } from "@api/router";
import { SEL } from "@api/dom";

export interface ReplyEvent {
    chatId: string | null;
    title: string;
    at: number;
}

declare module "@kernel/events" {
    interface EventMap {
        "reply:start": ReplyEvent;
        "reply:end": ReplyEvent & { durationMs: number };
        /** A message on a Claude Code project page went out (any attempt succeeded). */
        "send:ok": SendEvent;
        /** A message on a Claude Code project page couldn't be sent: claude.ai gave up retrying. */
        "send:failed": SendEvent;
    }
}

export interface SendEvent {
    channelId: string;
    at: number;
}

/** The channel a Claude Code project send goes to, or null when the path isn't one. */
export function channelSendOf(path: string) {
    return /^\/v1\/code\/channels\/(chan_[A-Za-z0-9]+)\/messages$/.exec(path)?.[1] ?? null;
}
/**
 * claude.ai retries a failed project send up to 3 times, at most 4s apart, and only says
 * "Couldn't send the message" once the last one fails. A failure no retry follows within this long is final.
 */
const SEND_RETRY_GRACE_MS = 6000;

export type ChatPhase = "idle" | "streaming";

let phase: ChatPhase = "idle";
let startedAt = 0;
let quietTicks = 0;
export const chatPhase = () => phase;

/** Leading status marks that tab-title plugins add, like "⏳ " or "✅ ". */
const STATUS_PREFIX = /^(?:[\p{Extended_Pictographic}\p{So}\uFE0F\u200D]+\s+)+/u;
/** claude.ai's placeholder title before a chat gets its generated name. */
const PLACEHOLDER = /^(?:claude|new chat|untitled)$/i;

/** The open chat's name from the tab title: "" while it is still the placeholder. */
export function titleFrom(raw: string) {
    const title = raw.replace(STATUS_PREFIX, "").replace(/\s*[-–|]\s*Claude(?:\s+Code)?\s*$/i, "").trim();
    return PLACEHOLDER.test(title) ? "" : title;
}

export const chatTitle = () => titleFrom(document.title);

/** A reply only counts as finished after this many quiet checks, so a brief flicker is not "done". */
export const QUIET_TICKS = 2;
const CHECK_MS = 400;

export function tick(streamingNow: boolean, now = Date.now()) {
    const base = { chatId: currentRoute().chatId, title: chatTitle(), at: now };
    if (streamingNow) {
        quietTicks = 0;
        if (phase === "idle") {
            phase = "streaming";
            startedAt = now;
            emit("reply:start", base);
        }
        return;
    }
    if (phase !== "streaming") return;
    quietTicks++;
    if (quietTicks < QUIET_TICKS) return;
    phase = "idle";
    quietTicks = 0;
    emit("reply:end", { ...base, durationMs: now - startedAt });
}

export default definePlugin({
    name: "ChatStateApi",
    title: { zh: "回复状态", en: "Reply state API" },
    description: { zh: "判断 Claude 是否正在回复，并在开始 / 结束、项目页消息发送失败时通知其它插件（后台标签页也有效）。", en: "Knows when Claude starts and finishes replying, and when a project message couldn't be sent, also in background tabs." },
    category: "api",
    icon: "sparkles",
    hidden: true,
    dependencies: ["NetworkApi", "RouterApi"],
    start(scope) {
        phase = "idle";
        quietTicks = 0;
        scope.interval(() => tick(!!document.querySelector(SEL.streaming)), CHECK_MS);
        // Each send attempt is counted as it starts, so a failure claude.ai retries isn't final; one with no
        // retry after it is.
        let attempt = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const isSend = (req: RequestInfoLite) => sameOrigin(req) && req.method === "POST" && !!channelSendOf(req.url.pathname);
        const failed = (req: RequestInfoLite) => {
            const mine = attempt;
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (scope.alive && mine === attempt) emit("send:failed", { channelId: channelSendOf(req.url.pathname)!, at: Date.now() });
            }, SEND_RETRY_GRACE_MS);
        };
        const counted = (req: RequestInfoLite) => {
            if (!isSend(req)) return false;
            attempt++;
            clearTimeout(timer);
            return true;
        };
        onResponse(scope, counted, (response, req) => {
            if (!response.ok) return failed(req);
            clearTimeout(timer);
            emit("send:ok", { channelId: channelSendOf(req.url.pathname)!, at: Date.now() });
        });
        onRequestError(scope, isSend, (_, req) => failed(req));
        scope.defer(() => clearTimeout(timer));
        // Switching chats mid-reply is not the reply finishing.
        scope.on("route", () => {
            phase = "idle";
            quietTicks = 0;
        });
    },
});
