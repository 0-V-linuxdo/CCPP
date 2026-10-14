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
import { ApiError, getProjectActivity, type ProjectActivity } from "@api/claude";
import { watch } from "@api/dom";
import { addStyle } from "@api/styles";

const logger = new Logger("ProjectStatus");

const settings = definePluginSettings({
    showCode: { type: "boolean", label: { zh: "图标右上角显示项目自身的 Code 状态", en: "Show the project's own Code session on the icon corner" }, description: { zh: "右侧圆点是项目里线程（对话）的状态；图标右上角是项目总控 Code 会话的状态，和原生会话图标的角标位置一致。", en: "The dot on the right is for the project's threads; the icon corner is for the project's own Code session, like the native session icons." }, default: true },
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    refreshSec: { type: "number", label: { zh: "刷新间隔", en: "Refresh every" }, default: 30, min: 10, max: 300, step: 5, unit: "s" },
});

const L = {
    running: { zh: "运行中", en: "Running" },
    waiting: { zh: "等你回复", en: "Waiting for you" },
};

/** A sidebar project row: `<div data-group-list="chan_…">` holding the row with the project link. */
const PROJECT_ROW = '[data-group-list^="chan_"]';
const ROW = "[data-row]";
/** The `relative` wrapper around a project's leading icon, where a corner badge sits. */
const ICON_HOLDER = ".df-leading-slot .relative, [data-leading-slot] .relative";
const NATIVE_STATUS = '[data-row-decoration]:not([data-ccpp-status]) [role="status"]';

const CSS = `
[data-ccpp-corner] { position: absolute; top: -1px; inset-inline-end: -2px; display: flex; pointer-events: none; }
[data-ccpp-corner] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; box-shadow: 0 0 0 1.5px var(--cds-surface-1, var(--df-bg, #1f1e1d)); }
[data-ccpp-corner] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-corner] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
[data-ccpp-status] { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; pointer-events: none; transition: opacity .12s; }
[data-row]:hover > [data-ccpp-status], [data-row]:focus-within > [data-ccpp-status] { opacity: 0; }
/* Keep long project names clear of the dot (the label fades out at its end). */
[data-row]:has(> [data-ccpp-status]) [data-row-label] { padding-inline-end: 22px; }
[data-row]:has(> [data-ccpp-status]):hover [data-row-label] { padding-inline-end: 0; }
[data-ccpp-status] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; }
[data-ccpp-status] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-status] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-status] .status-dot { animation: none !important; } }
`;

export type DotKind = "clay" | "awaiting" | null;

export function cornerKind(activity: ProjectActivity | undefined, showWaiting: boolean): DotKind {
    if (activity?.own === "working") return "clay";
    if (showWaiting && activity?.own === "blocked") return "awaiting";
    return null;
}

export function dotKind(activity: ProjectActivity | undefined, showWaiting: boolean): DotKind {
    if (!activity) return null;
    if (activity.working > 0) return "clay";
    if (showWaiting && activity.blocked > 0) return "awaiting";
    return null;
}

export default definePlugin({
    name: "ProjectStatus",
    title: { zh: "项目运行状态", en: "Project status dots" },
    description: {
        zh: "claude.ai 侧栏只给当前选中的项目显示运行中的呼吸圆点；本插件为所有项目显示。右侧圆点是线程状态（在跑就呼吸，等你回复是黄点），图标右上角是项目自身 Code 会话的状态。",
        en: "claude.ai only shows the breathing running dot on the selected project; this shows it on every project in the sidebar (breathing while a thread runs, yellow when one waits for you).",
    },
    category: "chats",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["ClaudeApi", "DomApi", "StylesApi"],
    settings,
    start(scope) {
        addStyle(scope, CSS, "project-status");
        const activity = new Map<string, ProjectActivity>();
        // One project can be listed twice (the hidden Chat sidebar list and the visible Code one), so each id
        // keeps every group it appears in.
        const rows = new Map<string, Set<HTMLElement>>();
        let busy = false;

        const paint = (id: string) => {
            for (const group of rows.get(id) ?? []) paintGroup(id, group);
        };

        const paintGroup = (id: string, group: HTMLElement) => {
            const row = group.querySelector<HTMLElement>(ROW);
            if (!row) return;
            const info = activity.get(id);
            // claude.ai draws its own dot on the selected project; never draw a second one.
            const kind = row.querySelector(NATIVE_STATUS) ? null : dotKind(info, settings.store.showWaiting);
            place(row, ":scope > [data-ccpp-status]", kind, "data-ccpp-status", () => row);
            // The project's own Code session goes on the icon corner, where native session icons put theirs.
            const holder = row.querySelector<HTMLElement>(ICON_HOLDER);
            const nativeCorner = holder?.querySelector(".status-dot:not([data-ccpp-corner] *), [aria-hidden] > .status-dot:not([data-ccpp-corner] *)");
            const corner = settings.store.showCode && holder && !nativeCorner ? cornerKind(info, settings.store.showWaiting) : null;
            place(row, "[data-ccpp-corner]", corner, "data-ccpp-corner", () => holder);
        };

        const place = (row: HTMLElement, selector: string, kind: DotKind, attr: string, parent: () => HTMLElement | null | undefined) => {
            const existing = row.querySelector<HTMLElement>(selector);
            if (!kind) {
                existing?.remove();
                return;
            }
            if (existing?.querySelector(`.status-dot[data-kind="${kind}"]`)) return;
            existing?.remove();
            const target = parent();
            if (!target) return;
            const label = t(kind === "clay" ? L.running : L.waiting);
            target.appendChild(h("span", { [attr]: kind, title: label }, h("span", { role: "status", "aria-label": label }, h("span", { class: "status-dot", "data-kind": kind }))));
        };

        // claude.ai limits project reads per account ("Too many project reads"), and its own pages share
        // that quota. So projects are read one after another, and a 429 pauses polling for a while.
        let pausedUntil = 0;
        const poll = async () => {
            if (busy || document.hidden || !rows.size || Date.now() < pausedUntil) return;
            busy = true;
            try {
                for (const id of [...rows.keys()]) {
                    if (!scope.alive || document.hidden) return;
                    try {
                        const result = await getProjectActivity(id, scope.signal);
                        activity.set(result.channelId, result);
                        paint(id);
                    } catch (error) {
                        if (error instanceof ApiError && error.status === 429) {
                            pausedUntil = Date.now() + 60_000;
                            logger.debug("Project reads rate-limited; pausing a minute.");
                            return;
                        }
                        logger.debug("Project activity failed:", error);
                    }
                    await new Promise(resolve => setTimeout(resolve, 400));
                }
            } finally {
                busy = false;
            }
        };

        let pollSoon: ReturnType<typeof setTimeout> | undefined;
        watch(scope, PROJECT_ROW, group => {
            const id = group.dataset.groupList!;
            let groups = rows.get(id);
            if (!groups) rows.set(id, (groups = new Set()));
            groups.add(group);
            paintGroup(id, group);
            clearTimeout(pollSoon);
            pollSoon = setTimeout(poll, 300);
            // React re-renders the row (selection, hover menu); repaint when it does.
            const observer = new MutationObserver(() => paintGroup(id, group));
            observer.observe(group, { childList: true, subtree: true });
            return () => {
                observer.disconnect();
                groups.delete(group);
                if (!groups.size && rows.get(id) === groups) rows.delete(id);
                group.querySelector("[data-ccpp-status]")?.remove();
                group.querySelector("[data-ccpp-corner]")?.remove();
            };
        });
        scope.defer(() => clearTimeout(pollSoon));
        scope.interval(poll, settings.store.refreshSec * 1000);
        scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    },
});
