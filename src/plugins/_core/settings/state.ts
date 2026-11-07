/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import type { Text } from "@kernel/i18n";
import { persisted } from "@kernel/storage";

/**
 * CC++'s version, e.g. "0.4.0". On Userscript++ it comes from the script's @version
 * ("20261107.0.4.0": the build date keeps script managers updating), set when the site starts.
 */
export let version = "dev";
export function setVersion(next: string) {
    version = next.replace(/^\d{8}\./, "") || version;
}

/** A CC++ page in the settings nav. Plugins add theirs with registerTab(). */
export interface SettingsTab {
    id: string;
    title: Text;
    icon: string;
    order: number;
    render(container: HTMLElement): void;
}

export const tabs = new Map<string, SettingsTab>();

export interface UiPrefs {
    favorites: string[];
    pinned: string[];
}
const isPrefs = (v: unknown): v is UiPrefs => !!v && Array.isArray((v as UiPrefs).favorites) && Array.isArray((v as UiPrefs).pinned);
export const prefs = persisted<UiPrefs>("settings-ui", { favorites: [], pinned: [] }, isPrefs);

export const isFavorite = (name: string) => prefs.get().favorites.includes(name);
export const isPinned = (name: string) => prefs.get().pinned.includes(name);
export function toggleIn(key: keyof UiPrefs, name: string) {
    const current = prefs.get();
    const list = current[key].includes(name) ? current[key].filter(n => n !== name) : [...current[key], name];
    prefs.set({ ...current, [key]: list });
}

/** Everything that redraws when plugins, settings or prefs change. */
const redrawers = new Set<() => void>();
export function onRedraw(fn: () => void) {
    redrawers.add(fn);
    return () => void redrawers.delete(fn);
}
let queued = false;
export function redraw() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
        queued = false;
        for (const fn of [...redrawers]) {
            try {
                fn();
            } catch {}
        }
    });
}

export const view = {
    category: "",
    query: "",
    filter: "all" as "all" | "enabled" | "disabled",
    showApi: false,
};
