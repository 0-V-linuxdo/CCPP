/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { agoText, dateTimeText, untilText } from "@lib/format";
import { icon } from "@lib/icons";
import { hideTip, tipAttrs } from "@lib/tooltip";
import { createPopover } from "@lib/popover";
import { ApiError, getUsage, type Usage, type UsageWindow } from "@api/claude";
import { addStyle } from "@api/styles";
import { addSlotItem, refreshSlotItem } from "@api/slots";

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

function ring(open: (anchor: HTMLElement) => void, window: UsageWindow | null, label: string) {
    const percent = window ? Math.round(window.utilization) : null;
    // Each ring explains itself, like claude.ai's single usage ring.
    return usageButton(
        open,
        percent === null ? label : `${label} ${percent}%`,
        window ? tipAttrs(`${label}: ${percent}%`, resetText(window)) : tipAttrs(label, error ?? t(L.loading)),
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
        ...(style !== "text" ? [ring(open, five, t(L.session)), ring(open, week, t(L.weekly))] : []),
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

function renderPanel(panel: HTMLElement) {
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
            panel.open(anchor, renderPanel);
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
