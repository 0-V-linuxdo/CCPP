/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { getRaw } from "@kernel/settings";
import type { ProjectActivity } from "@api/claude";

/**
 * The project status dot, as the sidebar (ProjectStatus) draws it on a project's icon and the tab icon's
 * "project" style draws it on the tab: what it shows, in what order.
 */
export type DotKind = "clay" | "awaiting" | null;

/**
 * The project's own session (its project chat) only adds "running": the Threads panel's "Waiting on you" counts
 * threads, not the project chat.
 */
export function cornerKind(activity: ProjectActivity | undefined, _showWaiting?: boolean): DotKind {
    return activity?.own === "working" ? "clay" : null;
}

/** One dot per project, on its icon corner, in claude.ai's own order: waiting on you first, then running. */
export function projectKind(activity: ProjectActivity | undefined, showWaiting: boolean, withOwn: boolean): DotKind {
    if (!activity) return null;
    const own = withOwn ? cornerKind(activity, showWaiting) : null;
    const threads = dotKind(activity, showWaiting);
    if (showWaiting && activity.blocked > 0) return "awaiting";
    return own === "clay" || threads === "clay" ? "clay" : null;
}

/** A send to the project counts as running at once, until a read confirms it or the grace runs out. */
export const SEND_GRACE_MS = 15_000;

export function shownKind(activity: ProjectActivity | undefined, showWaiting: boolean, withOwn: boolean, sentUntil = 0, now = Date.now()): DotKind {
    return now < sentUntil ? "clay" : projectKind(activity, showWaiting, withOwn);
}

export function dotKind(activity: ProjectActivity | undefined, showWaiting: boolean): DotKind {
    if (!activity) return null;
    if (activity.working > 0) return "clay";
    if (showWaiting && activity.blocked > 0) return "awaiting";
    return null;
}

/** ProjectStatus's own options for what the dot counts, read the same way wherever the dot is drawn. */
export function projectDotOptions() {
    const flag = (key: string) => getRaw("ProjectStatus", key) !== false;
    return { showWaiting: flag("showWaiting"), withOwn: flag("showCode") };
}
