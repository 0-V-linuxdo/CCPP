/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { getLang } from "@kernel/i18n";

const zh = () => getLang() === "zh";

/** "3 小时 20 分钟" / "3h 20m" until a moment; past moments read as "now". */
export function untilText(target: number, now = Date.now()) {
    const minutes = Math.max(0, Math.round((target - now) / 60000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    if (zh()) {
        if (days) return `${days} 天 ${hours} 小时`;
        if (hours) return `${hours} 小时 ${mins} 分钟`;
        return `${mins} 分钟`;
    }
    if (days) return `${days}d ${hours}h`;
    if (hours) return `${hours}h ${mins}m`;
    return `${mins}m`;
}

export function agoText(at: number, now = Date.now()) {
    const s = Math.max(0, Math.round((now - at) / 1000));
    if (s < 10) return zh() ? "刚刚" : "just now";
    if (s < 60) return zh() ? `${s} 秒前` : `${s}s ago`;
    const m = Math.round(s / 60);
    if (m < 60) return zh() ? `${m} 分钟前` : `${m}m ago`;
    const hr = Math.round(m / 60);
    if (hr < 48) return zh() ? `${hr} 小时前` : `${hr}h ago`;
    const d = Math.round(hr / 24);
    return zh() ? `${d} 天前` : `${d}d ago`;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function dateTimeText(at: number, now = Date.now()) {
    const d = new Date(at);
    const today = new Date(now);
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (d.toDateString() === today.toDateString()) return time;
    const date = d.getFullYear() === today.getFullYear() ? `${d.getMonth() + 1}/${d.getDate()}` : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    return `${date} ${time}`;
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const snippet = (text: string, max = 80) => {
    const flat = text.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};
