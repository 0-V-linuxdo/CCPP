/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { persisted } from "@kernel/storage";

export interface Star {
    /** claude.ai's turn key for the message, or "i<index>" when it has none. */
    key: string;
    index: number;
    role: "user" | "assistant";
    text: string;
    at: number;
}

export interface ChatStars {
    title: string;
    stars: Star[];
    /** Where the conversation lives, for keys that are not claude.ai chat ids (Claude Code pages). */
    url?: string;
}

export type StarBook = Record<string, ChatStars>;

const isStar = (v: any): v is Star => v && typeof v.key === "string" && Number.isInteger(v.index) && (v.role === "user" || v.role === "assistant") && typeof v.text === "string" && typeof v.at === "number";

export function isBook(value: unknown): value is StarBook {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.values(value as Record<string, any>).every(chat => chat && typeof chat.title === "string" && (chat.url === undefined || typeof chat.url === "string") && Array.isArray(chat.stars) && chat.stars.every(isStar));
}

export const book = persisted<StarBook>("message-stars", {}, isBook);

export const starsFor = (chatId: string | null) => (chatId ? book.get()[chatId]?.stars ?? [] : []);

/** Adds or removes a star; returns whether the message is starred afterwards. */
export function toggleStar(chatId: string, title: string, star: Star, current = book.get(), url?: string): { next: StarBook; starred: boolean } {
    const chat = current[chatId] ?? { title, stars: [] };
    const exists = chat.stars.some(s => s.key === star.key);
    const stars = exists ? chat.stars.filter(s => s.key !== star.key) : [...chat.stars, star].sort((a, b) => a.index - b.index);
    const next = { ...current };
    const href = url ?? chat.url;
    if (stars.length) next[chatId] = { title: title || chat.title, stars, ...(href ? { url: href } : {}) };
    else delete next[chatId];
    return { next, starred: !exists };
}

/** Starred messages move when rows are added above them; keep each one's index current. Returns null if nothing changed. */
export function reindex(current: StarBook, chatId: string, seen: Map<string, number>): StarBook | null {
    const chat = current[chatId];
    if (!chat?.stars.some(s => seen.has(s.key) && seen.get(s.key) !== s.index)) return null;
    const stars = chat.stars.map(s => (seen.has(s.key) ? { ...s, index: seen.get(s.key)! } : s)).sort((a, b) => a.index - b.index);
    return { ...current, [chatId]: { ...chat, stars } };
}

export interface ChatKey {
    key: string;
    url: string;
}

/**
 * Which conversation a message belongs to. Chats use their id. Claude Code pages have no chat id: a project's
 * own chat is keyed by its channel (chan_…), a thread open in the side pane by channel:thread, and any other
 * Claude Code page (a session) by its last path segment.
 */
export function chatKeyFor(path: string, search: string, inSidePane: boolean): ChatKey | null {
    const chat = /^\/chat\/([0-9a-f-]{36})/i.exec(path);
    if (chat) return { key: chat[1].toLowerCase(), url: `/chat/${chat[1].toLowerCase()}` };
    const project = /^\/code\/project\/([\w-]+)/.exec(path);
    if (project) {
        const thread = new URLSearchParams(search).get("thread");
        if (inSidePane && thread) return { key: `${project[1]}:${thread}`, url: `/code/project/${project[1]}?thread=${encodeURIComponent(thread)}` };
        return inSidePane ? null : { key: project[1], url: `/code/project/${project[1]}` };
    }
    const code = /^\/code\/([\w-]+)\/?$/.exec(path);
    if (code && code[1] !== "project") return { key: code[1], url: `/code/${code[1]}` };
    return null;
}
