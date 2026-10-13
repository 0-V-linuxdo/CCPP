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
import { getProjectActivity, type ProjectActivity } from "@api/claude";
import { watch } from "@api/dom";
import { addStyle } from "@api/styles";

const logger = new Logger("ProjectStatus");

const settings = definePluginSettings({
    showWaiting: { type: "boolean", label: { zh: "也标出「等你回复」的项目", en: "Also mark projects waiting on you" }, description: { zh: "有线程在等你时显示黄色圆点。", en: "A yellow dot when a thread is waiting for you." }, default: true },
    refreshSec: { type: "number", label: { zh: "刷新间隔", en: "Refresh every" }, default: 15, min: 5, max: 120, step: 5, unit: "s" },
});

const L = {
    running: { zh: "运行中", en: "Running" },
    waiting: { zh: "等你回复", en: "Waiting for you" },
};

/** A sidebar project row: `<div data-group-list="chan_…">` holding the row with the project link. */
const PROJECT_ROW = '[data-group-list^="chan_"]';
const ROW = "[data-row]";
const NATIVE_STATUS = '[data-row-decoration]:not([data-ccpp-status]) [role="status"]';

const CSS = `
[data-ccpp-status] { position: absolute; top: 50%; right: 8px; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; width: 20px; height: 20px; pointer-events: none; transition: opacity .12s; }
[data-row]:hover > [data-ccpp-status], [data-row]:focus-within > [data-ccpp-status] { opacity: 0; }
[data-ccpp-status] .status-dot { width: 6px; height: 6px; border-radius: 50%; display: block; }
[data-ccpp-status] .status-dot[data-kind="clay"] { background-color: #d97757; animation: ccpp-breathe 3s ease-in-out infinite; }
[data-ccpp-status] .status-dot[data-kind="awaiting"] { background-color: var(--cds-fill-warning, #c98a12); }
@keyframes ccpp-breathe { 0%, 100% { transform: scale(.86); opacity: .75; } 50% { transform: scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { [data-ccpp-status] .status-dot { animation: none !important; } }
`;

export type DotKind = "clay" | "awaiting" | null;

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
        zh: "claude.ai 侧栏只给当前选中的项目显示运行中的呼吸圆点；本插件为所有项目显示（有线程在跑就呼吸，等你回复就显示黄点）。",
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
        const rows = new Map<string, HTMLElement>();
        let busy = false;

        const paint = (id: string) => {
            const group = rows.get(id);
            const row = group?.querySelector<HTMLElement>(ROW);
            if (!row) return;
            const existing = row.querySelector<HTMLElement>(":scope > [data-ccpp-status]");
            // claude.ai draws its own dot on the selected project; never draw a second one.
            const kind = row.querySelector(NATIVE_STATUS) ? null : dotKind(activity.get(id), settings.store.showWaiting);
            if (!kind) {
                existing?.remove();
                return;
            }
            if (existing?.querySelector(`.status-dot[data-kind="${kind}"]`)) return;
            existing?.remove();
            const label = t(kind === "clay" ? L.running : L.waiting);
            row.appendChild(h("span", { "data-ccpp-status": kind, title: label }, h("span", { role: "status", "aria-label": label }, h("span", { class: "status-dot", "data-kind": kind }))));
        };

        const poll = async () => {
            if (busy || document.hidden || !rows.size) return;
            busy = true;
            try {
                const results = await Promise.allSettled([...rows.keys()].map(id => getProjectActivity(id, scope.signal)));
                if (!scope.alive) return;
                for (const result of results) {
                    if (result.status === "fulfilled") activity.set(result.value.channelId, result.value);
                    else logger.debug("Project activity failed:", result.reason);
                }
                for (const id of rows.keys()) paint(id);
            } finally {
                busy = false;
            }
        };

        let pollSoon: ReturnType<typeof setTimeout> | undefined;
        watch(scope, PROJECT_ROW, group => {
            const id = group.dataset.groupList!;
            rows.set(id, group);
            paint(id);
            clearTimeout(pollSoon);
            pollSoon = setTimeout(poll, 300);
            // React re-renders the row (selection, hover menu); repaint when it does.
            const observer = new MutationObserver(() => paint(id));
            observer.observe(group, { childList: true, subtree: true });
            return () => {
                observer.disconnect();
                if (rows.get(id) === group) rows.delete(id);
                group.querySelector("[data-ccpp-status]")?.remove();
            };
        });
        scope.defer(() => clearTimeout(pollSoon));
        scope.interval(poll, settings.store.refreshSec * 1000);
        scope.listen(document, "visibilitychange", () => !document.hidden && poll());
    },
});
