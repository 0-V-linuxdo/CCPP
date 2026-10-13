/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "./logger";

const logger = new Logger("Events");

/**
 * Events that plugins announce to each other. API plugins add their own entries by
 * declaration merging, so the kernel itself knows nothing about claude.ai.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventMap {}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

const handlers = new Map<keyof EventMap, Set<Handler<any>>>();

export function on<K extends keyof EventMap>(name: K, handler: Handler<K>) {
    let set = handlers.get(name);
    if (!set) handlers.set(name, (set = new Set()));
    set.add(handler);
    return () => void set.delete(handler);
}

export function emit<K extends keyof EventMap>(name: K, payload: EventMap[K]) {
    for (const handler of [...(handlers.get(name) ?? [])]) {
        try {
            handler(payload);
        } catch (error) {
            logger.error(`Handler for ${String(name)} failed:`, error);
        }
    }
}
