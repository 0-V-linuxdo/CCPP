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
    warnAt: { type: "number", label: { zh: "黄色提醒阈值", en: "Amber from" }, default: 70, min: 10, max: 99, unit: "%" },
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
const listeners = new Set<() => void>();
const changed = () => listeners.forEach(fn => fn());

/** Successive manual refreshes are spaced at least this far apart. */
export const MIN_GAP_MS = 5000;

async function refresh(force = false) {
    if (loading || (!force && Date.now() - lastAttempt < MIN_GAP_MS)) return;
    if (!force && document.hidden) return;
    loading = true;
    lastAttempt = Date.now();
    inflight = new AbortController();
    const timeout = setTimeout(() => inflight?.abort(), 12000);
    changed();
    try {
        usage = await getUsage(inflight.signal);
        error = null;
    } catch (err) {
        if ((err as Error).name === "AbortError" && !inflight) return;
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

const COLORS = { ok: "#3f9a5b", warn: "#c98a12", bad: "#d1453b" };

function ring(window: UsageWindow | null, label: string) {
    const percent = window?.utilization ?? 0;
    const color = COLORS[level(percent, settings.store.warnAt, settings.store.dangerAt)];
    return h("span", {
        class: "ccpp-usage-ring",
        "aria-label": `${label} ${Math.round(percent)}%`,
        style: { background: window ? `conic-gradient(${color} ${percent * 3.6}deg, rgba(127,127,127,.25) 0)` : "rgba(127,127,127,.25)" },
    });
}

function chip(open: (anchor: HTMLElement) => void) {
    const style = settings.store.style;
    const five = usage?.fiveHour ?? null;
    const week = usage?.sevenDay ?? null;
    const pct = (w: UsageWindow | null) => (w ? `${Math.round(w.utilization)}%` : "–");
    const text = !usage ? (error ? "!" : "…") : `${pct(five)} · ${pct(week)}`;
    const tip = usage ? `${t(L.session)} ${pct(five)} · ${t(L.weekly)} ${pct(week)}` : error ?? t(L.loading);
    const button = h(
        "button",
        { type: "button", class: `ccpp-slot-btn ccpp-usage${error && !usage ? " err" : ""}`, title: tip, "aria-label": tip },
        style !== "text" ? h("span", { class: "ccpp-usage-rings" }, ring(five, t(L.session)), ring(week, t(L.weekly))) : null,
        style !== "rings" ? h("span", { class: "ccpp-usage-text", text }) : null,
    );
    button.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        open(button);
    });
    return button;
}

const SLOT_CSS = `
.ccpp-usage { gap: 6px; font-variant-numeric: tabular-nums; }
.ccpp-usage-rings { display: inline-flex; gap: 3px; }
.ccpp-usage-ring { position: relative; width: 14px; height: 14px; border-radius: 50%; }
.ccpp-usage-ring::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--bg-000, #fff); }
html[data-mode="dark"] .ccpp-usage-ring::after { background: #30302e; }
.ccpp-usage.err { color: #d1453b; }
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
    const refreshBtn = h("button", { type: "button", class: "icon-btn", title: t(L.refresh), "aria-label": t(L.refresh) }, icon("refresh", 15));
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
        zh: "在输入框模型选择器旁显示 5 小时会话与每周用量（双圆环 / 百分比），点开看重置时间。数据来自 claude.ai 自己的用量接口。",
        en: "Shows the 5-hour session and weekly usage next to the model picker (rings or percent); click for reset times. Data comes from claude.ai's own usage endpoint.",
    },
    category: "usage",
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
        scope.defer(() => inflight?.abort());
        scope.interval(() => refresh(), settings.store.refreshSec * 1000);
        scope.listen(document, "visibilitychange", () => !document.hidden && Date.now() - lastAttempt > settings.store.refreshSec * 1000 && refresh());
        scope.on("reply:end", () => scope.timeout(() => refresh(true), 2500));
        // Re-render relative times once a minute even without new data.
        scope.interval(() => panel.update(), 60000);
        refresh(true);
    },
});
