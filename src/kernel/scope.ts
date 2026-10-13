/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { type EventMap, on } from "./events";
import { Logger } from "./logger";

const logger = new Logger("Scope");

/**
 * What a plugin gets while it runs. Everything registered through it (listeners, timers,
 * observers, styles, DOM it added) is undone when the plugin stops, so stop() is optional.
 */
export class Scope {
    private readonly cleanups: (() => void)[] = [];
    private readonly controller = new AbortController();

    get signal() {
        return this.controller.signal;
    }

    get alive() {
        return !this.controller.signal.aborted;
    }

    /** Runs `fn` when the plugin stops. Returns `fn` for chaining. */
    defer(fn: () => void) {
        if (this.alive) this.cleanups.push(fn);
        else fn();
        return fn;
    }

    listen<T extends EventTarget>(target: T, type: string, fn: (event: any) => void, options: AddEventListenerOptions = {}) {
        target.addEventListener(type, fn, { ...options, signal: this.signal });
    }

    on<K extends keyof EventMap>(name: K, handler: (payload: EventMap[K]) => void) {
        this.defer(on(name, handler));
    }

    timeout(fn: () => void, ms: number) {
        const id = setTimeout(() => this.alive && fn(), ms);
        this.defer(() => clearTimeout(id));
        return id;
    }

    interval(fn: () => void, ms: number) {
        const id = setInterval(() => this.alive && fn(), ms);
        this.defer(() => clearInterval(id));
        return id;
    }

    /** Adds a node to the page and removes it on stop. */
    mount<T extends Node>(node: T, parent: Node = document.body ?? document.documentElement) {
        parent.appendChild(node);
        this.defer(() => (node as unknown as ChildNode).remove?.());
        return node;
    }

    observe(target: Node, options: MutationObserverInit, fn: MutationCallback) {
        const observer = new MutationObserver(fn);
        observer.observe(target, options);
        this.defer(() => observer.disconnect());
        return observer;
    }

    /** A scope that ends with this one but can also be ended early. */
    child() {
        const scope = new Scope();
        const remove = this.defer(() => scope.dispose());
        scope.defer(() => {
            const i = this.cleanups.indexOf(remove);
            if (i >= 0) this.cleanups.splice(i, 1);
        });
        return scope;
    }

    dispose() {
        if (!this.alive) return;
        this.controller.abort();
        for (const fn of this.cleanups.splice(0).reverse()) {
            try {
                fn();
            } catch (error) {
                logger.error("Cleanup failed:", error);
            }
        }
    }
}
