/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { Logger } from "@kernel/logger";

export { SEL } from "./selectors";

const logger = new Logger("DomApi");

type Cleanup = void | (() => void);

interface Watcher {
    selector: string;
    onAdd(el: Element): Cleanup;
    live: Map<Element, Cleanup>;
}

const watchers = new Set<Watcher>();
let observer: MutationObserver | null = null;
let pending: ReturnType<typeof setTimeout> | null = null;
/** Mutations are batched; a timer (not rAF) so background tabs still update. */
const FLUSH_MS = 60;

function runCleanup(cleanup: Cleanup) {
    try {
        cleanup?.();
    } catch (error) {
        logger.error("Watcher cleanup failed:", error);
    }
}

function flushWatcher(watcher: Watcher) {
    const found = new Set(document.querySelectorAll(watcher.selector));
    for (const [el, cleanup] of watcher.live) {
        if (found.has(el) && el.isConnected) continue;
        watcher.live.delete(el);
        runCleanup(cleanup);
    }
    for (const el of found) {
        if (watcher.live.has(el)) continue;
        try {
            watcher.live.set(el, watcher.onAdd(el));
        } catch (error) {
            watcher.live.set(el, undefined);
            logger.error(`Watcher for ${watcher.selector} failed:`, error);
        }
    }
}

function flush() {
    pending = null;
    for (const watcher of [...watchers]) flushWatcher(watcher);
}

const schedule = () => {
    pending ??= setTimeout(flush, FLUSH_MS);
};

/**
 * Calls `onAdd` once for every element matching `selector`, now and whenever one appears.
 * What `onAdd` returns runs when that element leaves the page or the scope ends.
 */
export function watch(scope: Scope, selector: string, onAdd: (el: HTMLElement) => Cleanup) {
    const watcher: Watcher = { selector, onAdd: onAdd as Watcher["onAdd"], live: new Map() };
    watchers.add(watcher);
    flushWatcher(watcher);
    scope.defer(() => {
        watchers.delete(watcher);
        for (const cleanup of watcher.live.values()) runCleanup(cleanup);
        watcher.live.clear();
    });
}

/** Runs `fn` (batched) after any DOM change while the scope lives. */
export function onDomChange(scope: Scope, fn: () => void) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const run = () => {
        timer = null;
        if (scope.alive) fn();
    };
    const observer = new MutationObserver(() => (timer ??= setTimeout(run, FLUSH_MS)));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scope.defer(() => {
        observer.disconnect();
        if (timer) clearTimeout(timer);
    });
    fn();
}

export function waitFor<T extends Element = HTMLElement>(selector: string, timeoutMs = 10000, root: ParentNode = document): Promise<T | null> {
    const found = root.querySelector<T>(selector);
    if (found) return Promise.resolve(found);
    return new Promise(resolve => {
        const obs = new MutationObserver(() => {
            const el = root.querySelector<T>(selector);
            if (!el) return;
            obs.disconnect();
            clearTimeout(timer);
            resolve(el);
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
        const timer = setTimeout(() => {
            obs.disconnect();
            resolve(null);
        }, timeoutMs);
    });
}

export default definePlugin({
    name: "DomApi",
    title: { zh: "DOM 观察", en: "DOM API" },
    description: { zh: "一个共享的 MutationObserver，供其它插件监听 claude.ai 元素的出现与消失。", en: "One shared MutationObserver that tells plugins when claude.ai elements appear and leave." },
    category: "api",
    icon: "code",
    hidden: true,
    startAt: "document-start",
    start(scope) {
        observer = new MutationObserver(schedule);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        scope.defer(() => {
            observer?.disconnect();
            observer = null;
            if (pending) clearTimeout(pending);
            pending = null;
        });
    },
});
