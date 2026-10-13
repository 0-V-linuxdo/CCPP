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
}

export type StarBook = Record<string, ChatStars>;

const isStar = (v: any): v is Star => v && typeof v.key === "string" && Number.isInteger(v.index) && (v.role === "user" || v.role === "assistant") && typeof v.text === "string" && typeof v.at === "number";

export function isBook(value: unknown): value is StarBook {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    return Object.values(value as Record<string, any>).every(chat => chat && typeof chat.title === "string" && Array.isArray(chat.stars) && chat.stars.every(isStar));
}

export const book = persisted<StarBook>("message-stars", {}, isBook);

export const starsFor = (chatId: string | null) => (chatId ? book.get()[chatId]?.stars ?? [] : []);

/** Adds or removes a star; returns whether the message is starred afterwards. */
export function toggleStar(chatId: string, title: string, star: Star, current = book.get()): { next: StarBook; starred: boolean } {
    const chat = current[chatId] ?? { title, stars: [] };
    const exists = chat.stars.some(s => s.key === star.key);
    const stars = exists ? chat.stars.filter(s => s.key !== star.key) : [...chat.stars, star].sort((a, b) => a.index - b.index);
    const next = { ...current };
    if (stars.length) next[chatId] = { title: title || chat.title, stars };
    else delete next[chatId];
    return { next, starred: !exists };
}
