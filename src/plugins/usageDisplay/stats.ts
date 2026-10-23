/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { readJson, removeKey, writeJson } from "@kernel/storage";

/**
 * Daily usage, recorded on this device from the usage snapshots UsageDisplay already fetches
 * (void++'s UsageDisplay.usageStats). claude.ai only reports "x% of the current window", so a day's
 * usage is how far each window's percentage rose that day, summed over every window that reset.
 */

export interface Track {
    /** Percent at the first snapshot of the current window today. */
    start: number | null;
    /** Percent at the latest snapshot. */
    last: number | null;
    resetAt: number | null;
    /** Usage of windows that already reset today. */
    accrued: number;
}

export interface DayRecord {
    /** Local date, YYYY-MM-DD. */
    date: string;
    week: Track;
    session: Track;
    updatedAt: number;
}

interface StatsFile {
    version: 1;
    days: Record<string, DayRecord>;
}

export const RETAIN_MIN = 7;
export const RETAIN_MAX = 180;
/** Days the chart shows even before that many were recorded. */
export const CHART_DAYS = 7;
/** A window whose reset time moved by more than this is a new window. */
const RESET_TOLERANCE_MS = 60_000;
/** Utilization only rises inside a window; a drop bigger than this means it reset. */
const DROP = 1;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n: number) => String(n).padStart(2, "0");

export function localDateKey(at: number) {
    const d = new Date(at);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftDateKey(date: string, days: number) {
    const [y, m, d] = date.split("-").map(Number);
    return localDateKey(new Date(y, m - 1, d + days).getTime());
}

export const emptyTrack = (): Track => ({ start: null, last: null, resetAt: null, accrued: 0 });
export const emptyDay = (date: string, now: number): DayRecord => ({ date, week: emptyTrack(), session: emptyTrack(), updatedAt: now });

/** Folds one snapshot of a window into the day's track. */
export function applySnapshot(track: Track, percent: number | null, resetAt: number | null, now: number): Track {
    const next = { ...track };
    if (percent == null) {
        if (resetAt != null) next.resetAt = resetAt;
        return next;
    }
    const moved = resetAt != null && next.resetAt != null && Math.abs(resetAt - next.resetAt) >= RESET_TOLERANCE_MS;
    const expired = next.resetAt != null && now >= next.resetAt;
    const dropped = next.last != null && percent < next.last - DROP;
    if (moved || expired || dropped) {
        next.accrued = trackDelta(next);
        next.start = percent;
        next.last = percent;
        next.resetAt = resetAt;
        return next;
    }
    next.start ??= percent;
    next.last = percent;
    if (resetAt != null) next.resetAt = resetAt;
    return next;
}

/** Percentage points of the window used on this day. */
export function trackDelta(track: Track) {
    return track.accrued + (track.start != null && track.last != null ? Math.max(0, track.last - track.start) : 0);
}

/** Whether a day has any snapshot at all (an empty day reads "—", not "0%"). */
export const recorded = (day: DayRecord | undefined) => !!day && (day.week.last != null || day.week.accrued > 0 || day.session.last != null || day.session.accrued > 0);

/**
 * A new day's first track. If yesterday was recorded too and the window has not reset since, it
 * starts where yesterday ended, so usage while no claude.ai page was open counts on the day it was seen
 * and the days of a week add up to the weekly percentage.
 */
function carryOver(prev: Track | undefined, percent: number | null, resetAt: number | null, now: number): Track {
    if (!prev || prev.last == null || percent == null || percent < prev.last) return emptyTrack();
    if (prev.resetAt != null && (now >= prev.resetAt || (resetAt != null && Math.abs(resetAt - prev.resetAt) >= RESET_TOLERANCE_MS))) return emptyTrack();
    return { start: prev.last, last: prev.last, resetAt: prev.resetAt, accrued: 0 };
}

export function pruneDays(days: Record<string, DayRecord>, retainDays: number, now: number) {
    const cutoff = shiftDateKey(localDateKey(now), 1 - Math.min(RETAIN_MAX, Math.max(RETAIN_MIN, Math.floor(retainDays))));
    return Object.fromEntries(Object.entries(days).filter(([date]) => date >= cutoff));
}

export interface Snapshot {
    week: { percent: number; resetAt: number | null } | null;
    session: { percent: number; resetAt: number | null } | null;
}

/** Pure core of recordSnapshot: the day file after one snapshot. */
export function addSnapshot(days: Record<string, DayRecord>, snap: Snapshot, retainDays: number, now: number) {
    const date = localDateKey(now);
    let day = days[date];
    if (!day) {
        const prev = days[shiftDateKey(date, -1)];
        day = {
            ...emptyDay(date, now),
            week: carryOver(prev?.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now),
            session: carryOver(prev?.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now),
        };
    }
    const next: DayRecord = {
        date,
        week: applySnapshot(day.week, snap.week?.percent ?? null, snap.week?.resetAt ?? null, now),
        session: applySnapshot(day.session, snap.session?.percent ?? null, snap.session?.resetAt ?? null, now),
        updatedAt: now,
    };
    return pruneDays({ ...days, [date]: next }, retainDays, now);
}

/** Days to chart, oldest first: every recorded day, gaps filled, and at least the last CHART_DAYS. */
export function chartDays(days: Record<string, DayRecord>, now: number): DayRecord[] {
    const today = localDateKey(now);
    let start = shiftDateKey(today, 1 - CHART_DAYS);
    for (const date of Object.keys(days)) if (date < start) start = date;
    const out: DayRecord[] = [];
    for (let date = start; date <= today; date = shiftDateKey(date, 1)) out.push(days[date] ?? emptyDay(date, now));
    return out;
}

/** The chart's top: at least 20%, rounded up to a multiple of 10. */
export function chartScale(days: DayRecord[]) {
    const max = Math.max(0, ...days.map(day => trackDelta(day.week)));
    return Math.max(20, Math.ceil(max / 10) * 10);
}

/* ---------- storage, one file per organization ---------- */

const keyFor = (org: string) => `usageStats:${org}`;

function isDay(value: unknown): value is DayRecord {
    const day = value as DayRecord;
    const track = (t: unknown) => !!t && typeof t === "object" && typeof (t as Track).accrued === "number";
    return !!day && typeof day === "object" && DATE_RE.test(day.date) && track(day.week) && track(day.session);
}

export function loadDays(org: string): Record<string, DayRecord> {
    const file = readJson<StatsFile | null>(keyFor(org), null);
    if (!file || file.version !== 1 || !file.days || typeof file.days !== "object") return {};
    return Object.fromEntries(Object.entries(file.days).filter(([date, day]) => isDay(day) && day.date === date));
}

export function recordSnapshot(org: string, snap: Snapshot, retainDays: number, now = Date.now()) {
    // Read fresh each time: every open claude.ai tab records into the same file.
    const days = addSnapshot(loadDays(org), snap, retainDays, now);
    writeJson(keyFor(org), { version: 1, days } satisfies StatsFile);
    return days;
}

export const clearDays = (org: string) => removeKey(keyFor(org));
