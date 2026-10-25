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

export interface ChannelMessage {
    id: string;
    role: "user" | "assistant";
    text: string;
    at: number;
    /** A card the project chat shows as its own row (thread started, error, suggestion…), not a message. */
    notice?: boolean;
}

/**
 * Messages of a project chat or thread, oldest first. JSON bodies are app cards: routing lines are
 * dropped, the rest stay as blank `notice` entries because the page gives each its own row.
 */
export function parseChannelMessages(raw: unknown): ChannelMessage[] {
    const list = (raw as { data?: unknown })?.data;
    if (!Array.isArray(list)) return [];
    const out: ChannelMessage[] = [];
    for (const m of list) {
        if (!m || typeof m !== "object" || typeof m.body !== "string") continue;
        const body = m.body.trim();
        if (!body) continue;
        const base = { id: String(m.id ?? ""), role: (m.author_account_id ? "user" : "assistant") as ChannelMessage["role"], at: Date.parse(m.created_at) || 0 };
        if (body.startsWith("{")) {
            let card: { type?: unknown; kind?: unknown } | null = null;
            try {
                card = JSON.parse(body);
            } catch {}
            if (card && typeof card === "object") {
                // Routing lines never get a row; every other card does, so keep its place in the list.
                if ((card.kind ?? card.type) !== "message_routed") out.push({ ...base, role: "assistant", text: "", notice: true });
                continue;
            }
        }
        out.push({ ...base, text: body });
    }
    return out.sort((a, b) => a.at - b.at);
}

const channelCache = new Map<string, { at: number; value: Promise<ChannelMessage[]> }>();

/** A project's chat (threadId null) or one thread, cached briefly. */
export function getChannelMessages(channelId: string, threadId: string | null, force = false): Promise<ChannelMessage[]> {
    if (!/^chan_[A-Za-z0-9]+$/.test(channelId) || (threadId && !/^cmsg_[A-Za-z0-9]+$/.test(threadId))) return Promise.reject(new Error("Bad id"));
    const key = `${channelId}|${threadId ?? ""}`;
    const cached = channelCache.get(key);
    if (!force && cached && Date.now() - cached.at < 15000) return cached.value;
    const path = threadId ? `/v1/code/channels/${channelId}/threads/${threadId}?limit=200&include_draft=true` : `/v1/code/channels/${channelId}/timeline?limit=200&include_draft=true`;
    const value = getCodeJson(path).then(parseChannelMessages);
    value.catch(() => channelCache.delete(key));
    channelCache.set(key, { at: Date.now(), value });
    return value;
}

export type ThreadBucket = "working" | "blocked" | "review_ready" | "completed" | "failed";

export interface ProjectActivity {
    channelId: string;
    /** Thread sessions working / waiting on you. */
    working: number;
    blocked: number;
    /** The project's own (coordinator) Code session. */
    own?: "working" | "blocked" | null;
}

const CHANNEL_RE = /^chan_[A-Za-z0-9]+$/;
const SESSION_RE = /^cse_[A-Za-z0-9]+$/;

/** "SESSION_STATUS_BUCKET_WORKING" and "working" both mean working. */
function normalizeBucket(value: unknown): string {
    if (typeof value !== "string") return "";
    return value.replace(/^SESSION_STATUS_BUCKET_/, "").toLowerCase();
}

/**
 * The sessions bound to a project's threads, from its timeline. A resolved thread is left out: the project page
 * files it under Resolved whatever its session's bucket says, so it is never running or waiting on you.
 */
function threadSessions(raw: unknown): any[] {
    const data = raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data) ? (raw as { data: any[] }).data : [];
    const sessions: any[] = [];
    for (const message of data) {
        if (message?.thread_status === "resolved") continue;
        if (Array.isArray(message?.bound_sessions)) sessions.push(...message.bound_sessions);
    }
    return sessions;
}

/** Counts a project's thread sessions by state, from the same timeline the project page reads. */
export function parseActivity(channelId: string, raw: unknown): ProjectActivity {
    const activity: ProjectActivity = { channelId, working: 0, blocked: 0 };
    for (const session of threadSessions(raw)) {
        if (session?.status === "archived") continue;
        const bucket = normalizeBucket(session?.status_bucket);
        if (bucket === "working") activity.working++;
        else if (bucket === "blocked") activity.blocked++;
    }
    return activity;
}

/**
 * State of one session from `/v1/code/sessions/:id`, judged the way the sidebar does:
 * a busy worker counts as working even before its bucket catches up.
 */
export function parseSessionState(raw: unknown): "working" | "blocked" | null {
    const root = raw && typeof raw === "object" ? (raw as any) : {};
    const session = root.response_shape && typeof root.response_shape === "object" ? root.response_shape : root;
    const status = session.session_status ?? session.status;
    if (status === "archived" || status === "deleted") return null;
    if (status === "requires_action" || session.worker_status === "requires_action") return "blocked";
    if (status === "pending" || (status === "running" && session.worker_status !== "idle") || session.worker_status === "running") return "working";
    const bucket = normalizeBucket(session.status_bucket);
    if (bucket === "working") return "working";
    if (bucket === "blocked" || bucket === "failed") return "blocked";
    return null;
}

/** Project id → its channel (coordinator) session id, from the projects list. Cached briefly. */
let channelSessions: { at: number; map: Promise<Map<string, string>> } | null = null;
const CHANNEL_LIST_TTL = 5 * 60_000;

export function parseChannelSessions(raw: unknown): Map<string, string> {
    const map = new Map<string, string>();
    const data = raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data) ? (raw as { data: any[] }).data : [];
    for (const channel of data) {
        const session = channel?.channel_session_id ?? channel?.overview_session_id;
        if (typeof channel?.id === "string" && typeof session === "string" && SESSION_RE.test(session)) map.set(channel.id, session);
    }
    return map;
}

/** One shared request: concurrent callers wait on the same promise instead of each fetching the list. */
function getChannelSessions(signal?: AbortSignal) {
    if (channelSessions && Date.now() - channelSessions.at < CHANNEL_LIST_TTL) return channelSessions.map;
    const map = getCodeJson("/v1/code/channels?scope=joined&include_archived=false&limit=200", signal).then(parseChannelSessions);
    const entry = { at: Date.now(), map };
    channelSessions = entry;
    map.catch(() => channelSessions === entry && (channelSessions = null));
    return map;
}

/**
 * What the tab icon needs from one Code session, judged like claude.ai's own lists: waiting on you, failed,
 * finished with replies you haven't read, working, or nothing to show.
 */
export type CodePhase = "working" | "blocked" | "failed" | "unread" | "idle";

const NEEDS_INPUT = new Set(["blocked", "need_input", "needs_input"]);

function phaseOf(session: any): CodePhase {
    if (!session || session.status === "archived" || session.status === "deleted") return "idle";
    const bucket = normalizeBucket(session.status_bucket);
    const category = session.post_turn_summary?.status_category;
    // A worker still "running" on an idle, disconnected session (with no turn summary) has died: claude.ai shows it failed.
    const dead = session.session_status === "idle" && session.worker_status === "running" && session.connection_status === "disconnected" && !category;
    if (bucket === "failed" || category === "failed" || dead) return "failed";
    if (bucket === "blocked" || NEEDS_INPUT.has(category)) return "blocked";
    if (session.session_status !== undefined || session.worker_status !== undefined) {
        const state = parseSessionState(session);
        if (state) return state;
    }
    return bucket === "working" ? "working" : "idle";
}

export function parseCodePhase(raw: unknown): CodePhase {
    const root = raw && typeof raw === "object" ? (raw as any) : {};
    return phaseOf(root.response_shape && typeof root.response_shape === "object" ? root.response_shape : root);
}

/**
 * Every thread session of a project, by id, from the project timeline; resolved threads left out. The thread's own
 * status ("needs_input", "working") counts too, and a finished thread with unread replies is "unread" unless it is
 * `readThread`, the one open on screen.
 */
export function threadPhasesFrom(raw: unknown, readThread: string | null = null): Map<string, CodePhase> {
    const phases = new Map<string, CodePhase>();
    const data = raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data) ? (raw as { data: any[] }).data : [];
    for (const message of data) {
        if (message?.thread_status === "resolved") continue;
        for (const session of Array.isArray(message?.bound_sessions) ? message.bound_sessions : []) {
            if (typeof session?.id !== "string" || !SESSION_RE.test(session.id)) continue;
            let phase = phaseOf(session);
            const archived = session.status === "archived" || session.status === "deleted";
            if (phase === "idle" && !archived) {
                if (NEEDS_INPUT.has(message.thread_status)) phase = "blocked";
                else if (message.thread_status === "working") phase = "working";
                // The thread open on screen is being read; claude.ai clears its flag some seconds later.
                else if (message.has_unread === true && message.id !== readThread) phase = "unread";
            }
            phases.set(session.id, phase);
        }
    }
    return phases;
}

/** A project's timeline and its own session, as read at one moment. */
interface ProjectSnapshot {
    timeline: unknown;
    own: string | null;
    ownSession: unknown;
}

/**
 * Plugins polling the same project (the tab icon and the sidebar dot) share one read, so a faster poll on the open
 * project doesn't double the requests. A read can take 5–20s, so callers join the one in flight, and a finished one
 * is reused for a moment. Each caller's own signal only stops its own wait.
 */
const SNAPSHOT_TTL = 2000;
const snapshots = new Map<string, { at: number; snapshot: Promise<ProjectSnapshot> }>();

function readProject(channelId: string, signal?: AbortSignal): Promise<ProjectSnapshot> {
    if (!CHANNEL_RE.test(channelId)) return Promise.reject(new Error("Bad project id"));
    const cached = snapshots.get(channelId);
    // `at` stays Infinity while the read is in flight.
    let snapshot = cached && Date.now() - cached.at < SNAPSHOT_TTL ? cached.snapshot : null;
    if (!snapshot) {
        // The timeline and the project's own session are read side by side, not one after the other.
        const ownRead = getChannelSessions()
            .catch(() => new Map<string, string>())
            .then(async sessions => {
                const own = sessions.get(channelId) ?? null;
                const ownSession: unknown = own ? await getCodeJson(`/v1/code/sessions/${own}`).catch(() => null) : null;
                return { own, ownSession };
            });
        snapshot = Promise.all([getCodeJson(`/v1/code/channels/${channelId}/timeline?limit=200&bound_only=true`), ownRead]).then(([timeline, own]) => ({ timeline, ...own }));
        const entry = { at: Infinity, snapshot };
        snapshots.set(channelId, entry);
        snapshot.then(
            () => (entry.at = Date.now()),
            () => snapshots.get(channelId) === entry && snapshots.delete(channelId),
        );
    }
    if (!signal) return snapshot;
    return new Promise((resolve, reject) => {
        if (signal.aborted) return reject(signal.reason);
        const abort = () => reject(signal.reason);
        signal.addEventListener("abort", abort, { once: true });
        snapshot.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
    });
}

/** State of every Code session in a project: its threads and its own session (the project chat). */
export async function getProjectPhases(channelId: string, signal?: AbortSignal, readThread: string | null = null) {
    const { timeline, own, ownSession } = await readProject(channelId, signal);
    const phases = threadPhasesFrom(timeline, readThread);
    if (own && ownSession) phases.set(own, parseCodePhase(ownSession));
    return phases;
}

export async function getProjectActivity(channelId: string, signal?: AbortSignal) {
    const { timeline, own, ownSession } = await readProject(channelId, signal);
    const activity = parseActivity(channelId, timeline);
    activity.own = own && ownSession ? parseSessionState(ownSession) : null;
    return activity;
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
