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
import { tipAttrs } from "@lib/tooltip";
import { ApiError, getProjectActivity, type ProjectActivity } from "@api/claude";
import { watch } from "@api/dom";
import { onRoute } from "@api/router";
import { addStyle } from "@api/styles";

const logger = new Logger("ProjectStatus");

const settings = definePluginSettings({
    showCode: { type: "boolean", label: { zh: "也算上项目自身的 Code 会话", en: "Include the project's own Code session" }, description: { zh: "关闭后只看线程。", en: "Off counts threads only." }, default: true },
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    hideNative: {
        type: "boolean",
        label: { zh: "隐藏原生行尾圆点", en: "Hide claude.ai's row-end dot" },
        description: { zh: "当前打开的项目也只用图标角上的圆点，和其它项目一致。", en: "The open project then shows only the icon-corner dot, like the others." },
        default: true,
    },
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

const CSS = `
[data-ccpp-corner] { position: absolute; top: -1px; inset-inline-end: -2px; display: flex; pointer-events: none; }
[data-ccpp-corner] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; box-shadow: 0 0 0 1.5px var(--cds-surface-1, var(--df-bg, #1f1e1d)); }
[data-ccpp-corner] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-corner] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-corner] .status-dot { animation: none !important; } }
`;


export type DotKind = "clay" | "awaiting" | null;

export function cornerKind(activity: ProjectActivity | undefined, showWaiting: boolean): DotKind {
    if (activity?.own === "working") return "clay";
    if (showWaiting && activity?.own === "blocked") return "awaiting";
    return null;
}

/** One dot per project, on its icon corner: running if anything runs, else waiting if anything waits. */
export function projectKind(activity: ProjectActivity | undefined, showWaiting: boolean, withOwn: boolean): DotKind {
    if (!activity) return null;
    const own = withOwn ? cornerKind(activity, showWaiting) : null;
    const threads = dotKind(activity, showWaiting);
    if (own === "clay" || threads === "clay") return "clay";
    return own ?? threads;
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
        zh: "在每个项目图标的右上角画状态圆点（含当前打开的项目）：有线程或 Code 会话在跑就呼吸（橙色），有线程等你回复是黄色；可隐藏 claude.ai 自己的行尾圆点。",
        en: "A status dot on every project's icon corner, the open one included: breathing orange while anything runs, yellow when a thread waits for you. claude.ai's own row-end dot can be hidden.",
    },
    category: "notifications",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ClaudeApi", "DomApi", "StylesApi", "RouterApi"],
    settings,
    start(scope) {
        addStyle(scope, CSS, "project-status");
        if (settings.store.hideNative) addStyle(scope, `${PROJECT_ROW} ${ROW} > [data-row-decoration]:has(> [role="status"]) { display: none !important; }`, "project-status-native");
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
            row.querySelector(":scope > [data-ccpp-status]")?.remove();
            // The status goes on the icon corner, where native session icons put theirs; never next to a native one.
            const holder = row.querySelector<HTMLElement>(ICON_HOLDER);
            const nativeCorner = holder?.querySelector(".status-dot:not([data-ccpp-corner] *), [aria-hidden] > .status-dot:not([data-ccpp-corner] *)");
            // The open project gets claude.ai's own dot at the row end too; ours goes on its icon like every other row.
            const corner = holder && !nativeCorner ? projectKind(info, settings.store.showWaiting, settings.store.showCode) : null;
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
            target.appendChild(h("span", { [attr]: kind, ...tipAttrs(label) }, h("span", { role: "status", "aria-label": label }, h("span", { class: "status-dot", "data-kind": kind }))));
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
        onRoute(scope, () => rows.forEach((_, id) => paint(id)), false);
        scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    },
});
