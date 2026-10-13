/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { emit } from "@kernel/events";
import { definePlugin } from "@kernel/plugins";
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
    }
}

export type ChatPhase = "idle" | "streaming";

let phase: ChatPhase = "idle";
let startedAt = 0;
let quietTicks = 0;
export const chatPhase = () => phase;

export const chatTitle = () => document.title.replace(/\s*[-–|]\s*Claude\s*$/i, "").trim();

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
    description: { zh: "判断 Claude 是否正在回复，并在开始 / 结束时通知其它插件（后台标签页也有效）。", en: "Knows when Claude starts and finishes replying, also in background tabs." },
    category: "api",
    icon: "sparkles",
    hidden: true,
    dependencies: ["RouterApi"],
    start(scope) {
        phase = "idle";
        quietTicks = 0;
        scope.interval(() => tick(!!document.querySelector(SEL.streaming)), CHECK_MS);
        // Switching chats mid-reply is not the reply finishing.
        scope.on("route", () => {
            phase = "idle";
            quietTicks = 0;
        });
    },
});
