/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/**
 * The Userscript++ instance CC++ runs on (the `U` every site and plugin factory receives).
 * Only the few members the kernel uses are typed here; the full API is in
 * vendor/userscript-pp/types/index.d.ts.
 *
 * Without a host (unit tests) the kernel runs on its own: settings stay in memory / localStorage
 * and the kernel starts and stops plugins itself.
 */
export interface Host {
    version: string;
    frameworkVersion: string;
    scriptName: string;
    Settings: { plugins: Record<string, any> };
    PlainSettings: { plugins: Record<string, Record<string, unknown>> };
    SettingsStore: {
        addPrefixChangeListener(prefix: string, fn: (value: unknown, path: string) => void): void;
        markAsChanged(): void;
    };
    plugins: Record<string, { started?: boolean; startError?: unknown } | undefined>;
    startPlugin(name: string): boolean;
    stopPlugin(name: string): boolean;
    isSafeMode(): boolean;
    StartAt: { Init: string; DOMContentLoaded: string };
    OptionType: Record<"STRING" | "NUMBER" | "BOOLEAN" | "SELECT" | "SLIDER" | "COMPONENT", number>;
    definePluginSettings(def: Record<string, unknown>, checks?: Record<string, unknown>): unknown;
    defineSite<T>(def: T): T;
    openSettingsPanel(opts?: { tab?: string; plugin?: string }): void;
    addSlotItem(slot: string, id: string, item: Record<string, unknown>): void;
    removeSlotItem(slot: string, id: string): void;
    react: { h(type: unknown, props?: unknown, ...children: unknown[]): unknown };
    components: Record<string, unknown> & { confirmDialog(opts: { title: string; body?: unknown; danger?: boolean }): Promise<boolean> };
}

let current: Host | null = null;
const bindListeners = new Set<(host: Host) => void>();

/** The framework instance, or null when the kernel runs on its own (tests). */
export const host = () => current;

/** Called once per page by the site factory (and again, harmlessly, by every plugin factory). */
export function bindHost(next: Host) {
    if (current) return;
    // The build runs site and plugin factories once in Node with a stand-in API, to read their metadata.
    if (!next || typeof next.PlainSettings !== "object" || typeof next.PlainSettings?.plugins !== "object") return;
    current = next;
    for (const fn of [...bindListeners]) fn(next);
}

/** Runs `fn` when the host is bound (right away if it already is). */
export function onHost(fn: (host: Host) => void) {
    if (current) fn(current);
    else bindListeners.add(fn);
}

/** For tests: forget the host. */
export function unbindHost() {
    current = null;
}
