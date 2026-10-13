/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/** Every key CC++ writes to the claude.ai localStorage starts with this. */
export const PREFIX = "ccpp:";

export function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
        return fallback;
    }
}

export function writeJson(key: string, value: unknown) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

export function removeKey(key: string) {
    try {
        localStorage.removeItem(PREFIX + key);
    } catch {}
}

/** All CC++ keys (without the prefix) and their raw values, for backups. */
export function dumpAll(): Record<string, string> {
    const out: Record<string, string> = {};
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(PREFIX)) out[key.slice(PREFIX.length)] = localStorage.getItem(key) ?? "";
        }
    } catch {}
    return out;
}

/** A small JSON value kept in localStorage, with change listeners inside this tab. */
export function persisted<T>(key: string, fallback: T, valid: (value: unknown) => value is T) {
    const listeners = new Set<(value: T) => void>();
    const load = (): T => {
        const value = readJson<unknown>(key, fallback);
        return valid(value) ? value : fallback;
    };
    let value = load();
    return {
        get: () => value,
        set(next: T) {
            value = next;
            writeJson(key, next);
            for (const listener of [...listeners]) listener(next);
        },
        reload() {
            value = load();
            for (const listener of [...listeners]) listener(value);
        },
        subscribe(listener: (value: T) => void) {
            listeners.add(listener);
            return () => void listeners.delete(listener);
        },
    };
}
