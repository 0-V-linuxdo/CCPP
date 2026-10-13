/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { emit } from "@kernel/events";
import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { pageWindow } from "@lib/page";

export type RouteKind = "new" | "chat" | "project" | "settings" | "other";

export interface Route {
    path: string;
    kind: RouteKind;
    /** Conversation uuid on /chat/:id. */
    chatId: string | null;
    projectId: string | null;
}

declare module "@kernel/events" {
    interface EventMap {
        route: { route: Route; previous: Route | null };
    }
}

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const CHAT_RE = new RegExp(`^/chat/(${UUID})`, "i");
const PROJECT_RE = new RegExp(`^/project/(${UUID})`, "i");

export function parseRoute(path: string): Route {
    const chat = CHAT_RE.exec(path);
    const project = PROJECT_RE.exec(path);
    const kind: RouteKind = chat ? "chat" : project ? "project" : path === "/new" || path === "/" ? "new" : path.startsWith("/settings") ? "settings" : "other";
    return { path, kind, chatId: chat?.[1].toLowerCase() ?? null, projectId: project?.[1].toLowerCase() ?? null };
}

let current: Route = parseRoute(location.pathname);
export const currentRoute = () => current;

function check() {
    const path = location.pathname;
    if (path === current.path) return;
    const previous = current;
    current = parseRoute(path);
    emit("route", { route: current, previous });
}

/** Calls `fn` now (when `immediate`) and on every in-app navigation while the scope lives. */
export function onRoute(scope: Scope, fn: (route: Route, previous: Route | null) => void, immediate = true) {
    scope.on("route", ({ route, previous }) => fn(route, previous));
    if (immediate) fn(current, null);
}

export default definePlugin({
    name: "RouterApi",
    title: { zh: "路由", en: "Router API" },
    description: { zh: "感知 claude.ai 单页应用里的页面切换（新对话、对话、项目……）。", en: "Tells plugins when claude.ai navigates between pages (new chat, chat, project…)." },
    category: "api",
    icon: "link",
    hidden: true,
    startAt: "document-start",
    start(scope) {
        const history = pageWindow.history;
        const originals = { pushState: history.pushState, replaceState: history.replaceState };
        for (const key of ["pushState", "replaceState"] as const) {
            const original = originals[key];
            const patched = function (this: History, ...args: Parameters<History["pushState"]>) {
                const result = original.apply(this, args);
                queueMicrotask(check);
                return result;
            };
            history[key] = patched;
            scope.defer(() => {
                if (history[key] === patched) history[key] = original;
            });
        }
        scope.listen(pageWindow, "popstate", check);
        // Anything else (navigation API, frameworks caching the originals) is caught by polling.
        scope.interval(check, 700);
        current = parseRoute(location.pathname);
    },
});
