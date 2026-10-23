/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { getLang, t } from "@kernel/i18n";
import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { agoText, dateTimeText, untilText } from "@lib/format";
import { icon } from "@lib/icons";
import { hideTip, tipAttrs } from "@lib/tooltip";
import { createPopover } from "@lib/popover";
import { ApiError, getOrgId, getUsage, type Usage, type UsageWindow } from "@api/claude";
import { addStyle } from "@api/styles";
import { addSlotItem, refreshSlotItem } from "@api/slots";
import { chartDays, chartScale, clearDays, type DayRecord, loadDays, localDateKey, RETAIN_MAX, RETAIN_MIN, recordSnapshot, recorded, trackDelta } from "./stats";

const logger = new Logger("UsageDisplay");

const settings = definePluginSettings({
    style: {
        type: "select",
        label: { zh: "输入框里的样式", en: "Style in the chat input" },
        default: "rings",
        options: [
            { value: "rings", label: { zh: "双圆环", en: "Two rings" } },
            { value: "text", label: { zh: "百分比文字", en: "Percent text" } },
            { value: "both", label: { zh: "圆环 + 文字", en: "Rings + text" } },
        ],
    },
    refreshSec: { type: "number", label: { zh: "自动刷新间隔", en: "Refresh every" }, default: 60, min: 30, max: 600, step: 10, unit: "s" },
    warnAt: { type: "number", label: { zh: "黄色提醒阈值", en: "Amber from" }, default: 75, min: 10, max: 99, unit: "%" },
    dangerAt: { type: "number", label: { zh: "红色提醒阈值", en: "Red from" }, default: 90, min: 10, max: 100, unit: "%" },
    stats: {
        type: "boolean",
        label: { zh: "按日记录用量", en: "Record daily usage" },
        description: {
            zh: "在本机记下每天用掉的每周额度和 5 小时额度。悬停圆环看今天，点开看按日柱状图。只在打开 claude.ai 时记录。",
            en: "Keeps a per-day log of weekly and 5-hour usage on this device. Hover a ring for today; click for a daily chart. Recorded only while claude.ai is open.",
        },
        default: true,
    },
    retainDays: { type: "number", label: { zh: "保留多少天", en: "Days to keep" }, default: 90, min: RETAIN_MIN, max: RETAIN_MAX, visible: v => !!v.stats },
    clearStats: {
        type: "action",
        label: { zh: "清空用量记录", en: "Clear usage history" },
        button: { zh: "清空", en: "Clear" },
        confirm: { zh: "删除本机记录的当前账号全部按日用量？此操作无法撤销。", en: "Delete every day of usage recorded on this device for this account? This can't be undone." },
        visible: v => !!v.stats,
        run() {
            void getOrgId().then(org => {
                clearDays(org);
                days = {};
                changed();
            });
        },
    },
});

const L = {
    title: { zh: "用量", en: "Usage" },
    session: { zh: "5 小时会话", en: "5-hour session" },
    weekly: { zh: "每周", en: "Weekly" },
    resetsIn: { zh: "{t}后重置", en: "Resets in {t}" },
    resetsAt: { zh: "重置于 {t}", en: "Resets {t}" },
    updated: { zh: "更新于 {t} · claude.ai 同源接口", en: "Updated {t} · claude.ai API" },
    refresh: { zh: "刷新", en: "Refresh" },
    open: { zh: "打开官方用量页", en: "Open usage page" },
    loading: { zh: "读取中…", en: "Loading…" },
    timeout: { zh: "读取用量超时，稍后自动重试", en: "Usage request timed out; retrying shortly" },
    error: { zh: "读取用量失败：{e}", en: "Could not read usage: {e}" },
    signedOut: { zh: "未登录或无权读取用量", en: "Not signed in or no access to usage" },
    none: { zh: "当前套餐没有用量窗口", en: "No usage windows on this plan" },
    today: { zh: "今天 {p}", en: "Today {p}" },
    daily: { zh: "按日用量", en: "Usage by day" },
    dailyNote: { zh: "本机打开 claude.ai 时记录；没打开时的用量算在下次看到的那天。", en: "Recorded while claude.ai is open here; usage while it's closed counts on the day it's next seen." },
    noDays: { zh: "还没有记录，从现在开始统计。", en: "Nothing recorded yet; counting starts now." },
    noRecord: { zh: "没有记录", en: "Not recorded" },
    todayShort: { zh: "今", en: "Today" },
    todayLong: { zh: "今天", en: "Today" },
    dayWeekly: { zh: "每周额度 {p}", en: "Weekly {p}" },
    daySession: { zh: "5 小时额度 {p}", en: "5-hour {p}" },
};

/* ---------- state ---------- */

let usage: Usage | null = null;
let error: string | null = null;
let loading = false;
let lastAttempt = 0;
let inflight: AbortController | null = null;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach(fn => fn());

/** Daily usage of the signed-in organization, newest snapshot included. */
let org: string | null = null;
let days: Record<string, DayRecord> = {};
/** The day picked in the chart; null follows today. */
let picked: string | null = null;

async function snapshot(current: Usage) {
    if (!settings.store.stats) return;
    try {
        org = await getOrgId();
    } catch {
        return;
    }
    const win = (w: UsageWindow | null) => (w ? { percent: w.utilization, resetAt: w.resetsAt } : null);
    days = recordSnapshot(org, { week: win(current.sevenDay), session: win(current.fiveHour) }, settings.store.retainDays, current.fetchedAt);
}

/** "+6%", one decimal at most. */
export const deltaText = (value: number) => `+${Math.round(value * 10) / 10}%`;

function todayDetail(kind: "week" | "session") {
    if (!settings.store.stats || !org) return "";
    const day = days[localDateKey(Date.now())];
    return recorded(day) ? t(L.today).replace("{p}", deltaText(trackDelta(day![kind]))) : "";
}

/** Successive manual refreshes are spaced at least this far apart. */
export const MIN_GAP_MS = 5000;

async function refresh(force = false) {
    if (loading || (!force && Date.now() - lastAttempt < MIN_GAP_MS)) return;
    if (!force && document.hidden) return;
    loading = true;
    lastAttempt = Date.now();
    const controller = (inflight = new AbortController());
    let timedOut = false;
    const timeout = setTimeout(() => ((timedOut = true), controller.abort()), 12000);
    clearTimeout(retryTimer);
    changed();
    try {
        usage = await getUsage(controller.signal);
        error = null;
        await snapshot(usage);
    } catch (err) {
        if (timedOut) {
            // With numbers already on screen a slow request is not worth an error; just retry.
            if (!usage) error = t(L.timeout);
            retryTimer = setTimeout(() => refresh(true), 8000);
            return;
        }
        // Aborted because the plugin stopped.
        if ((err as Error).name === "AbortError") return;
        error = err instanceof ApiError && (err.status === 401 || err.status === 403) ? t(L.signedOut) : (err as Error).message || String(err);
        logger.warn("Usage refresh failed:", err);
    } finally {
        clearTimeout(timeout);
        inflight = null;
        loading = false;
        changed();
    }
}

export function level(percent: number, warnAt: number, dangerAt: number): "ok" | "warn" | "bad" {
    if (percent >= dangerAt) return "bad";
    if (percent >= warnAt) return "warn";
    return "ok";
}

/* ---------- rendering ---------- */

const resetText = (window: UsageWindow) =>
    !window.resetsAt
        ? ""
        : window.resetsAt - Date.now() < 24 * 3600 * 1000
          ? t(L.resetsIn).replace("{t}", untilText(window.resetsAt))
          : t(L.resetsAt).replace("{t}", dateTimeText(window.resetsAt));



// claude.ai's own usage-ring colours (accent / warning / danger).
const COLORS = { ok: "var(--cds-fill-accent, #2a78d6)", warn: "var(--cds-fill-warning, #fab219)", bad: "var(--cds-fill-danger, #d03b3b)" };
const SVG_NS = "http://www.w3.org/2000/svg";

/** claude.ai's ring track differs by page (--cds-alpha-2 in chat composers, --cds-alpha-4 in the Claude Code bar); copy the one on screen. */
const nativeTrack = () => document.querySelector("svg [data-ring-track]")?.getAttribute("stroke") || "var(--cds-alpha-2, rgba(127,127,127,.12))";

/** The same 14px ring claude.ai draws in its usage button: r 6, 2px stroke, faint track, round-capped arc from 12 o'clock. */
function ringSvg(percent: number | null) {
    const svg = document.createElementNS(SVG_NS, "svg");
    for (const [k, v] of Object.entries({ width: "14", height: "14", viewBox: "0 0 14 14", "aria-hidden": "true" })) svg.setAttribute(k, v);
    svg.style.transform = "rotate(-90deg)";
    const circle = (attrs: Record<string, string>) => {
        const c = document.createElementNS(SVG_NS, "circle");
        for (const [k, v] of Object.entries({ cx: "7", cy: "7", r: "6", fill: "none", "stroke-width": "2", ...attrs })) c.setAttribute(k, v);
        return svg.appendChild(c);
    };
    circle({ stroke: nativeTrack() });
    if (percent !== null) {
        const length = 2 * Math.PI * 6;
        const clamped = Math.max(0, Math.min(100, percent));
        circle({
            stroke: COLORS[level(percent, settings.store.warnAt, settings.store.dangerAt)],
            "stroke-dasharray": String(length),
            "stroke-dashoffset": String(length * (1 - clamped / 100)),
            "stroke-linecap": "round",
        });
    }
    return svg;
}

/** A square ghost button like claude.ai's: one per ring, or one for the percent text. */
function usageButton(open: (anchor: HTMLElement) => void, label: string, tip: Record<string, string>, ...children: Node[]) {
    const button = h("button", { type: "button", class: "ccpp-usage-btn", "aria-label": label, ...tip }, ...children);
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        hideTip();
        open(button);
    });
    return button;
}

function ring(open: (anchor: HTMLElement) => void, window: UsageWindow | null, label: string, kind: "week" | "session") {
    const percent = window ? Math.round(window.utilization) : null;
    // Each ring explains itself, like claude.ai's single usage ring.
    return usageButton(
        open,
        percent === null ? label : `${label} ${percent}%`,
        window ? tipAttrs(`${label}: ${percent}%`, [resetText(window), todayDetail(kind)].filter(Boolean).join(" · ")) : tipAttrs(label, error ?? t(L.loading)),
        ringSvg(window ? window.utilization : null),
    );
}

function chip(open: (anchor: HTMLElement) => void) {
    const style = settings.store.style;
    const five = usage?.fiveHour ?? null;
    const week = usage?.sevenDay ?? null;
    const pct = (w: UsageWindow | null) => (w ? `${Math.round(w.utilization)}%` : "–");
    const text = !usage ? (error ? "!" : "…") : `${pct(five)} · ${pct(week)}`;
    const tip = usage ? `${t(L.session)} ${pct(five)} · ${t(L.weekly)} ${pct(week)}` : error ?? t(L.loading);
    return h(
        "span",
        { class: `ccpp-usage${error && !usage ? " err" : ""}` },
        ...(style !== "text" ? [ring(open, five, t(L.session), "session"), ring(open, week, t(L.weekly), "week")] : []),
        ...(style !== "rings" ? [usageButton(open, tip, tipAttrs(tip, five ? resetText(five) : ""), h("span", { text }))] : []),
    );
}

// Sized by claude.ai's own control height token, so the buttons match their neighbours (24px in Claude Code's bar, 32px in chats).
const SLOT_CSS = `
.ccpp-usage { display: inline-flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
.ccpp-usage-btn { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; height: var(--cds-h-control, 32px); min-width: var(--cds-h-control, 32px); padding: 0; border: 0; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: calc(0.8125rem * var(--cds-rem-scale, 1)); cursor: pointer; transition: background-color .15s ease-out; }
.ccpp-usage-btn:has(> span) { padding: 0 6px; }
.ccpp-usage-btn:hover, .ccpp-usage-btn[aria-expanded="true"] { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-usage-btn:focus-visible { outline: none; box-shadow: var(--cds-shadow-focus, 0 0 0 2px var(--cds-fill-accent, #2a78d6)); }
.ccpp-usage.err .ccpp-usage-btn { color: var(--cds-text-danger, #d03b3b); }
`;

const PANEL_CSS = `
.metric { display: flex; flex-direction: column; gap: 4px; }
.metric .line { display: flex; justify-content: space-between; } .metric .pct { font-weight: 600; font-variant-numeric: tabular-nums; }
.bar { height: 6px; border-radius: 3px; background: var(--bg3); overflow: hidden; } .bar > i { display: block; height: 100%; border-radius: 3px; }
.foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; color: var(--fg3); }
.foot a { color: var(--accent); text-decoration: none; }
.daily { display: flex; flex-direction: column; gap: 6px; padding-top: 8px; border-top: 1px solid var(--line-soft); }
.daily .line { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
.chart { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: thin; }
.day { flex: 0 0 34px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 3px 0; border: 0; border-radius: 6px; background: transparent; color: var(--fg3); font: inherit; font-size: 11px; font-variant-numeric: tabular-nums; cursor: pointer; }
.day:hover { background: var(--bg2); } .day.on { background: var(--bg3); color: var(--fg); }
.day:focus-visible { outline: none; box-shadow: var(--focus); }
.day .v { height: 14px; font-size: 10px; white-space: nowrap; }
.day .track { display: flex; align-items: flex-end; width: 10px; height: 64px; border-radius: 3px; background: var(--bg2); overflow: hidden; }
.day .track > i { display: block; width: 100%; border-radius: 3px; background: var(--accent); }
.day.empty .track { opacity: .5; }
.daily .detail { font-size: 12px; color: var(--fg2); } .daily .note { font-size: 11px; color: var(--fg3); }
`;

function metric(label: string, window: UsageWindow) {
    const lv = level(window.utilization, settings.store.warnAt, settings.store.dangerAt);
    const reset = window.resetsAt
        ? window.resetsAt - Date.now() < 24 * 3600 * 1000
            ? t(L.resetsIn).replace("{t}", untilText(window.resetsAt))
            : t(L.resetsAt).replace("{t}", dateTimeText(window.resetsAt))
        : "";
    return h(
        "div",
        { class: "metric" },
        h("div", { class: "line" }, h("span", { text: label }), h("span", { class: "pct", text: `${Math.round(window.utilization)}%`, style: { color: COLORS[lv] } })),
        h("div", { class: "bar" }, h("i", { style: { width: `${window.utilization}%`, background: COLORS[lv] } })),
        reset ? h("div", { class: "muted", text: reset, style: { fontSize: "12px" } }) : null,
    );
}

function dayLabel(date: string) {
    if (date === localDateKey(Date.now())) return t(L.todayLong);
    const [y, m, d] = date.split("-").map(Number);
    const at = new Date(y, m - 1, d);
    return getLang() === "zh"
        ? `${m}月${d}日 ${at.toLocaleDateString("zh-CN", { weekday: "short" })}`
        : at.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function dailySection(redraw: () => void) {
    const now = Date.now();
    const today = localDateKey(now);
    const bars = chartDays(days, now);
    const scale = chartScale(bars);
    const active = bars.find(day => day.date === picked) ?? bars[bars.length - 1];
    const chart = h("div", { class: "chart", role: "listbox", "aria-label": t(L.daily) });
    let activeBar: HTMLElement | null = null;
    for (const day of bars) {
        const has = recorded(day);
        const delta = trackDelta(day.week);
        const bar = h(
            "button",
            { type: "button", class: `day${has ? "" : " empty"}${day === active ? " on" : ""}`, role: "option", "aria-selected": String(day === active), "aria-label": `${dayLabel(day.date)} ${has ? deltaText(delta) : t(L.noRecord)}` },
            h("span", { class: "v", text: has ? deltaText(delta) : "" }),
            h("span", { class: "track" }, h("i", { style: { height: `${has ? Math.min(100, (delta / scale) * 100) : 0}%` } })),
            h("span", { text: day.date === today ? t(L.todayShort) : String(Number(day.date.slice(8))) }),
        );
        bar.addEventListener("click", () => {
            picked = day.date === today ? null : day.date;
            redraw();
        });
        if (day === active) activeBar = bar;
        chart.appendChild(bar);
    }
    chart.addEventListener("keydown", event => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const i = bars.indexOf(active) + (event.key === "ArrowRight" ? 1 : -1);
        const next = bars[Math.max(0, Math.min(bars.length - 1, i))];
        picked = next.date === today ? null : next.date;
        redraw();
        (chart.getRootNode() as ShadowRoot | Document).querySelector<HTMLElement>(".day.on")?.focus();
    });
    // Keep the picked day (today by default, at the right end) in view.
    requestAnimationFrame(() => {
        if (!activeBar) return;
        const right = activeBar.offsetLeft + activeBar.offsetWidth - chart.clientWidth;
        if (chart.scrollLeft < right) chart.scrollLeft = right;
        else if (chart.scrollLeft > activeBar.offsetLeft) chart.scrollLeft = activeBar.offsetLeft;
    });
    const detail = recorded(active)
        ? `${t(L.dayWeekly).replace("{p}", deltaText(trackDelta(active.week)))} · ${t(L.daySession).replace("{p}", deltaText(trackDelta(active.session)))}`
        : t(L.noRecord);
    return h(
        "div",
        { class: "daily" },
        h("div", { class: "line" }, h("b", { text: t(L.daily) }), h("span", { class: "detail", text: dayLabel(active.date) })),
        Object.keys(days).length ? chart : h("div", { class: "msg", text: t(L.noDays) }),
        Object.keys(days).length ? h("div", { class: "detail", text: detail }) : null,
        h("div", { class: "note", text: t(L.dailyNote) }),
    );
}

function renderPanel(panel: HTMLElement, redraw: () => void) {
    const refreshBtn = h("button", { type: "button", class: "icon-btn", ...tipAttrs(t(L.refresh)), "aria-label": t(L.refresh) }, icon("refresh", 15));
    if (loading) refreshBtn.firstElementChild?.classList.add("spin");
    refreshBtn.addEventListener("click", () => refresh(true));
    panel.appendChild(h("div", { class: "top" }, icon("gauge", 16), h("b", { text: t(L.title) }), refreshBtn));
    if (error) panel.appendChild(h("div", { class: "msg bad", text: t(L.error).replace("{e}", error) }));
    if (!usage && !error) panel.appendChild(h("div", { class: "msg", text: t(L.loading) }));
    if (usage) {
        const rows = [
            usage.fiveHour && metric(t(L.session), usage.fiveHour),
            usage.sevenDay && metric(t(L.weekly), usage.sevenDay),
            ...usage.extra.map(e => metric(`${t(L.weekly)} · ${e.key}`, e.window)),
        ].filter(Boolean) as HTMLElement[];
        if (!rows.length) panel.appendChild(h("div", { class: "msg", text: t(L.none) }));
        panel.append(...rows);
        if (settings.store.stats && org) panel.appendChild(dailySection(redraw));
    }
    panel.appendChild(
        h(
            "div",
            { class: "foot" },
            h("span", { text: usage ? t(L.updated).replace("{t}", agoText(usage.fetchedAt)) : "" }),
            h("a", { href: "/settings/usage", text: t(L.open) }),
        ),
    );
}

export default definePlugin({
    name: "UsageDisplay",
    title: { zh: "用量显示", en: "Usage display" },
    description: {
        zh: "在输入框模型选择器旁同时显示 5 小时会话与每周用量（双圆环 / 百分比），点开看重置时间；普通对话、Claude Code 首页和项目页都有。数据来自 claude.ai 自己的用量接口。",
        en: "Shows the 5-hour session and weekly usage side by side next to the model picker (rings or percent), in chats, Claude Code and project pages; click for reset times. Data comes from claude.ai's own usage endpoint.",
    },
    category: "composer",
    icon: "gauge",
    enabledByDefault: true,
    dependencies: ["ClaudeApi", "SlotsApi", "StylesApi", "ChatStateApi"],
    settings,
    start(scope) {
        addStyle(scope, SLOT_CSS, "usage");
        const panel = createPopover(scope, "usage-panel", PANEL_CSS);
        const open = (anchor: HTMLElement) => {
            // Other tabs record too; start from the stored file.
            if (org) days = loadDays(org);
            picked = null;
            panel.open(anchor, p => renderPanel(p, () => panel.update()));
            refresh();
        };
        const item = addSlotItem(scope, "composer", "usage", () => chip(open), -10);
        const update = () => {
            refreshSlotItem(item);
            panel.update();
        };
        listeners.add(update);
        scope.defer(() => listeners.delete(update));
        scope.defer(() => (clearTimeout(retryTimer), inflight?.abort()));
        scope.interval(() => refresh(), settings.store.refreshSec * 1000);
        scope.listen(document, "visibilitychange", () => !document.hidden && Date.now() - lastAttempt > settings.store.refreshSec * 1000 && refresh());
        scope.on("reply:end", () => scope.timeout(() => refresh(true), 2500));
        // Re-render relative times once a minute even without new data.
        scope.interval(() => panel.update(), 60000);
        refresh(true);
    },
});
