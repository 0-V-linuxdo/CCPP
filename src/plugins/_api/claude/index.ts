/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { pageWindow } from "@lib/page";

/**
 * Read-only helpers for claude.ai's own same-origin API. The browser sends its normal
 * session; CC++ never reads, stores or forwards cookies or tokens (the org id cookie is
 * a public identifier, not a credential).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let orgPromise: Promise<string> | null = null;

export class ApiError extends Error {
    constructor(readonly status: number, message: string) {
        super(message);
    }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: { accept: "application/json" } });
    if (!response.ok) throw new ApiError(response.status, `${response.status} ${path.replace(/[0-9a-f-]{36}/gi, ":id")}`);
    return (await response.json()) as T;
}

export function orgFromCookie(cookie = document.cookie) {
    const match = /(?:^|;\s*)lastActiveOrg=([^;]+)/.exec(cookie);
    const value = match ? decodeURIComponent(match[1]) : "";
    return UUID_RE.test(value) ? value.toLowerCase() : null;
}

export function getOrgId(): Promise<string> {
    const fromCookie = orgFromCookie();
    if (fromCookie) return Promise.resolve(fromCookie);
    orgPromise ??= getJson<{ uuid: string; capabilities?: string[] }[]>("/api/organizations").then(orgs => {
        const chat = orgs.find(o => o.capabilities?.includes("chat")) ?? orgs[0];
        if (!chat || !UUID_RE.test(chat.uuid)) throw new Error("No organization");
        return chat.uuid;
    });
    orgPromise.catch(() => (orgPromise = null));
    return orgPromise;
}

/* ---------- usage ---------- */

export interface UsageWindow {
    /** 0–100 */
    utilization: number;
    resetsAt: number | null;
}

export interface Usage {
    fiveHour: UsageWindow | null;
    sevenDay: UsageWindow | null;
    /** Per-model weekly windows when the plan has them (e.g. Opus). */
    extra: { key: string; window: UsageWindow }[];
    fetchedAt: number;
}

function parseWindow(raw: unknown): UsageWindow | null {
    if (!raw || typeof raw !== "object") return null;
    const { utilization, resets_at } = raw as { utilization?: unknown; resets_at?: unknown };
    const value = typeof utilization === "string" ? Number(utilization) : utilization;
    if (typeof value !== "number" || !Number.isFinite(value)) return null;
    const reset = typeof resets_at === "string" ? Date.parse(resets_at) : NaN;
    return { utilization: Math.min(100, Math.max(0, value)), resetsAt: Number.isFinite(reset) ? reset : null };
}

const EXTRA_KEYS: Record<string, string> = { seven_day_opus: "Opus", seven_day_sonnet: "Sonnet" };

export function parseUsage(raw: unknown, now = Date.now()): Usage {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const extra: Usage["extra"] = [];
    for (const [key, label] of Object.entries(EXTRA_KEYS)) {
        const window = parseWindow(data[key]);
        if (window) extra.push({ key: label, window });
    }
    return { fiveHour: parseWindow(data.five_hour), sevenDay: parseWindow(data.seven_day), extra, fetchedAt: now };
}

export async function getUsage(signal?: AbortSignal) {
    const org = await getOrgId();
    return parseUsage(await getJson(`/api/organizations/${org}/usage`, signal));
}

/* ---------- conversations ---------- */

export interface ChatMessage {
    uuid: string;
    parent: string | null;
    role: "user" | "assistant";
    text: string;
    createdAt: number | null;
}

export interface Conversation {
    uuid: string;
    name: string;
    model: string | null;
    createdAt: number | null;
    updatedAt: number | null;
    /** The branch on screen, oldest first. */
    messages: ChatMessage[];
}

function messageText(raw: Record<string, any>): string {
    if (Array.isArray(raw.content)) {
        const parts = raw.content
            .filter((part: any) => part && part.type === "text" && typeof part.text === "string")
            .map((part: any) => part.text as string);
        if (parts.length) return parts.join("\n\n");
    }
    return typeof raw.text === "string" ? raw.text : "";
}

/** Picks the visible branch: walk up from the current leaf, or fall back to the message order. */
export function parseConversation(raw: unknown): Conversation {
    const data = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
    const list: ChatMessage[] = (Array.isArray(data.chat_messages) ? data.chat_messages : []).map((m: Record<string, any>) => ({
        uuid: String(m.uuid ?? ""),
        parent: typeof m.parent_message_uuid === "string" ? m.parent_message_uuid : null,
        role: m.sender === "human" ? "user" : "assistant",
        text: messageText(m),
        createdAt: typeof m.created_at === "string" ? Date.parse(m.created_at) || null : null,
    }));
    const byId = new Map(list.map(m => [m.uuid, m]));
    let messages = list;
    const leaf = typeof data.current_leaf_message_uuid === "string" ? byId.get(data.current_leaf_message_uuid) : undefined;
    if (leaf) {
        const branch: ChatMessage[] = [];
        const seen = new Set<string>();
        for (let m: ChatMessage | undefined = leaf; m && !seen.has(m.uuid); m = m.parent ? byId.get(m.parent) : undefined) {
            seen.add(m.uuid);
            branch.push(m);
        }
        messages = branch.reverse();
    }
    const date = (value: unknown) => (typeof value === "string" ? Date.parse(value) || null : null);
    return {
        uuid: String(data.uuid ?? ""),
        name: typeof data.name === "string" ? data.name : "",
        model: typeof data.model === "string" ? data.model : null,
        createdAt: date(data.created_at),
        updatedAt: date(data.updated_at),
        messages,
    };
}

export async function getConversation(chatId: string, signal?: AbortSignal) {
    if (!UUID_RE.test(chatId)) throw new Error("Bad chat id");
    const org = await getOrgId();
    return parseConversation(await getJson(`/api/organizations/${org}/chat_conversations/${chatId}?tree=True&rendering_mode=messages&render_all_tools=true`, signal));
}

/* ---------- Claude Code projects (claude.ai/code) ---------- */

/** The /v1/code API wants an API version header like the app sends; auth is still the browser session. */
const CODE_HEADERS = { accept: "application/json", "anthropic-version": "2023-06-01" };

async function getCodeJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await pageWindow.fetch(path, { credentials: "include", cache: "no-store", signal, headers: CODE_HEADERS });
    if (!response.ok) throw new ApiError(response.status, `${response.status} ${path.replace(/(chan|cse|cmsg)_[A-Za-z0-9]+/g, "$1_…")}`);
    return (await response.json()) as T;
}

export type ThreadBucket = "working" | "blocked" | "review_ready" | "completed" | "failed";

export interface ProjectActivity {
    channelId: string;
    working: number;
    blocked: number;
}

const CHANNEL_RE = /^chan_[A-Za-z0-9]+$/;

/** Counts a project's thread sessions by state, from the same timeline the project page reads. */
export function parseActivity(channelId: string, raw: unknown): ProjectActivity {
    const data = raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data) ? (raw as { data: any[] }).data : [];
    const activity: ProjectActivity = { channelId, working: 0, blocked: 0 };
    for (const message of data) {
        for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
            if (session?.status === "archived") continue;
            if (session?.status_bucket === "working") activity.working++;
            else if (session?.status_bucket === "blocked") activity.blocked++;
        }
    }
    return activity;
}

export async function getProjectActivity(channelId: string, signal?: AbortSignal) {
    if (!CHANNEL_RE.test(channelId)) throw new Error("Bad project id");
    return parseActivity(channelId, await getCodeJson(`/v1/code/channels/${channelId}/timeline?limit=200&bound_only=true`, signal));
}

export default definePlugin({
    name: "ClaudeApi",
    title: { zh: "claude.ai 接口", en: "claude.ai API" },
    description: {
        zh: "只读调用 claude.ai 同源接口（用量、对话内容），沿用浏览器登录态，不读取或保存 Cookie / token。",
        en: "Read-only calls to claude.ai's same-origin API (usage, conversations) with the browser's session. Never reads or stores cookies or tokens.",
    },
    category: "api",
    icon: "shield",
    hidden: true,
    startAt: "document-start",
    start() {},
});
