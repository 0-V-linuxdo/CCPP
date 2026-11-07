/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { host } from "./host";
import type { Text } from "./i18n";
import { Logger } from "./logger";
import { Scope } from "./scope";
import { getRaw, onSettingsChange, type OptionsDef, type PluginSettings, setRaw } from "./settings";
import { readJson, writeJson } from "./storage";

const logger = new Logger("Plugins");

export type StartAt = "document-start" | "dom-ready";

export type Category =
    | "api"
    | "core"
    | "composer"
    | "messages"
    | "chats"
    | "media"
    | "navigation"
    | "notifications"
    | "appearance"
    | "declutter"
    | "privacy"
    | "developer";

export interface PluginDef<D extends OptionsDef = OptionsDef> {
    /** Stable id, also the settings key. PascalCase. */
    name: string;
    title: Text;
    description: Text;
    category: Category;
    /** Further categories the plugin is also listed under (void++'s multi-tag plugins). */
    tags?: Category[];
    /** Name of an icon from @lib/icons. */
    icon?: string;
    authors?: string[];
    enabledByDefault?: boolean;
    /** Always on; the settings panel shows no switch. */
    required?: boolean;
    /** Not listed unless the settings panel shows API plugins. */
    hidden?: boolean;
    /** Plugins that must run first. Enabling this plugin keeps them running. */
    dependencies?: string[];
    startAt?: StartAt;
    /** Switching it on/off only fully applies after a reload. */
    restartNeeded?: boolean;
    /** YYYY-MM-DD of the last behaviour change, for the "Recent" tab. */
    updatedAt?: string;
    settings?: PluginSettings<D>;
    start(scope: Scope): void;
    stop?(): void;
    /**
     * Called when one of the plugin's settings changes while it runs. Without it the plugin
     * is restarted, which is what most plugins want.
     */
    onSettingsChange?(key: string, scope: Scope): void;
}

export interface Plugin extends PluginDef {
    scope: Scope | null;
}

export const definePlugin = <D extends OptionsDef>(def: PluginDef<D>): Plugin => ({ ...(def as unknown as PluginDef), scope: null });

const plugins = new Map<string, Plugin>();
export const allPlugins = () => [...plugins.values()];
export const getPlugin = (name: string) => plugins.get(name);

/* ---------- errors ---------- */

export interface PluginError {
    stage: "start" | "stop" | "settings";
    message: string;
    at: number;
}

const errors = new Map<string, PluginError>();
const errorListeners = new Set<(name: string) => void>();
export const pluginError = (name: string) => errors.get(name) ?? null;
export function onPluginStateChange(listener: (name: string) => void) {
    errorListeners.add(listener);
    return () => void errorListeners.delete(listener);
}
function notify(name: string) {
    for (const listener of [...errorListeners]) {
        try {
            listener(name);
        } catch {}
    }
}

function fail(plugin: Plugin, stage: PluginError["stage"], error: unknown) {
    logger.error(`${plugin.name} failed (${stage}):`, error);
    const message = error instanceof Error ? error.message || error.name : String(error);
    errors.set(plugin.name, { stage, message: message.slice(0, 300), at: Date.now() });
}

/* ---------- enabled / active ---------- */

/** What the user chose (or the default). */
export function isEnabled(plugin: Plugin) {
    if (plugin.required) return true;
    const value = getRaw(plugin.name, "enabled");
    return typeof value === "boolean" ? value : !!plugin.enabledByDefault;
}

export const setEnabled = (plugin: Plugin, enabled: boolean) => setRaw(plugin.name, "enabled", enabled);

export const dependentsOf = (name: string) => allPlugins().filter(p => p.dependencies?.includes(name));

/** Should run: enabled by the user, or needed by something that should run. */
export function isActive(plugin: Plugin, seen = new Set<string>()): boolean {
    if (isEnabled(plugin)) return true;
    if (seen.has(plugin.name)) return false;
    seen.add(plugin.name);
    return dependentsOf(plugin.name).some(p => isActive(p, seen));
}

/** Running plugins that keep this one alive. */
export const activeDependents = (name: string) => dependentsOf(name).filter(p => isActive(p));

/** Read-only view of one plugin's state, for the runtime global and debugging. */
export interface PluginInfo {
    name: string;
    category: string;
    enabled: boolean;
    active: boolean;
    running: boolean;
    required: boolean;
    hidden: boolean;
    dependencies: string[];
    error: PluginError | null;
}

export const pluginInfo = (plugin: Plugin): PluginInfo => ({
    name: plugin.name,
    category: plugin.category,
    enabled: isEnabled(plugin),
    active: isActive(plugin),
    running: !!plugin.scope,
    required: !!plugin.required,
    hidden: !!plugin.hidden,
    dependencies: [...(plugin.dependencies ?? [])],
    error: pluginError(plugin.name),
});

/* ---------- registration ---------- */

const bootActive = new Map<string, boolean>();

/**
 * On Userscript++: adds one plugin as its factory runs. The framework checks names and dependencies
 * and owns the switch; boot-time state is noted once every plugin is in (see noteBoot).
 */
export function registerOne(plugin: Plugin) {
    if (plugins.has(plugin.name)) return plugins.get(plugin.name)!;
    plugins.set(plugin.name, plugin);
    plugin.settings?.bind(plugin.name);
    return plugin;
}

let booted = false;
/** Notes which plugins were active at load (for pendingRestart) and which are new; once, when every plugin is registered. */
export function noteBoot() {
    if (booted) return;
    booted = true;
    for (const plugin of plugins.values()) bootActive.set(plugin.name, isActive(plugin));
    trackSeen();
}

/** Checks names and dependencies; throws on a broken plugin list, since that is a build bug. */
export function registerPlugins(list: Plugin[]) {
    for (const plugin of list) {
        if (plugins.has(plugin.name)) throw new Error(`Duplicate plugin ${plugin.name}`);
        plugins.set(plugin.name, plugin);
    }
    for (const plugin of list) {
        for (const dep of plugin.dependencies ?? []) {
            if (!plugins.has(dep)) throw new Error(`${plugin.name} depends on unknown plugin ${dep}`);
        }
        plugin.settings?.bind(plugin.name);
    }
    const cycle = findCycle();
    if (cycle) throw new Error(`Dependency cycle: ${cycle.join(" → ")}`);
    for (const plugin of list) bootActive.set(plugin.name, isActive(plugin));
    booted = true;
    trackSeen();
}

export function findCycle(): string[] | null {
    const state = new Map<string, 1 | 2>();
    const stack: string[] = [];
    const visit = (name: string): string[] | null => {
        if (state.get(name) === 2) return null;
        if (state.get(name) === 1) return [...stack.slice(stack.indexOf(name)), name];
        state.set(name, 1);
        stack.push(name);
        for (const dep of plugins.get(name)?.dependencies ?? []) {
            const found = visit(dep);
            if (found) return found;
        }
        stack.pop();
        state.set(name, 2);
        return null;
    };
    for (const name of plugins.keys()) {
        const found = visit(name);
        if (found) return found;
    }
    return null;
}

/** Plugins whose on/off state changed since load and that only fully apply after a reload. */
export const pendingRestart = () => allPlugins().filter(p => p.restartNeeded && bootActive.get(p.name) !== isActive(p));

/* ---------- new plugins ---------- */

const SEEN_KEY = "plugins-seen";
export const NEW_FOR_MS = 3 * 24 * 3600 * 1000;
export const RECENT_FOR_MS = 7 * 24 * 3600 * 1000;
let seen: Record<string, number> = {};

function trackSeen(now = Date.now()) {
    const stored = readJson<unknown>(SEEN_KEY, null);
    const first = !stored || typeof stored !== "object";
    seen = first ? {} : { ...(stored as Record<string, number>) };
    let changed = first;
    for (const name of plugins.keys()) {
        if (typeof seen[name] === "number") continue;
        // On a fresh install nothing counts as new.
        seen[name] = first ? 0 : now;
        changed = true;
    }
    if (changed) writeJson(SEEN_KEY, seen);
}

export const isNew = (name: string, now = Date.now()) => (seen[name] ?? 0) > 0 && now - seen[name] < NEW_FOR_MS;

export function isRecent(plugin: Plugin, now = Date.now()) {
    if (isNew(plugin.name, now)) return true;
    const at = plugin.updatedAt ? Date.parse(plugin.updatedAt) : NaN;
    return Number.isFinite(at) && now >= at && now - at < RECENT_FOR_MS;
}

/* ---------- lifecycle ---------- */

/*
 * Two modes. On Userscript++ the framework starts and stops plugins (U.startPlugin / U.stopPlugin,
 * at its Init and DOMContentLoaded stages), and each framework plugin's start/stop calls runStart /
 * runStop here. Without a host (unit tests) the kernel does it all itself, as CC++ 0.3 did.
 * Restarts after a settings change stay inside CC++ either way: the framework keeps seeing a running plugin.
 */

let phase: StartAt | null = null;
const phaseReached = (plugin: Plugin) => phase === "dom-ready" || (phase === "document-start" && plugin.startAt === "document-start");

/** Runs one plugin's start() in a fresh scope (dependencies must already run). Throws when `rethrow` and it fails. */
export function runStart(plugin: Plugin, rethrow = false) {
    if (plugin.scope) return true;
    const scope = new Scope();
    try {
        plugin.start(scope);
        plugin.scope = scope;
        errors.delete(plugin.name);
        notify(plugin.name);
        return true;
    } catch (error) {
        scope.dispose();
        fail(plugin, "start", error);
        notify(plugin.name);
        if (rethrow) throw error;
        return false;
    }
}

/** Runs one plugin's stop() and disposes its scope. */
export function runStop(plugin: Plugin) {
    if (!plugin.scope) return;
    const scope = plugin.scope;
    plugin.scope = null;
    try {
        plugin.stop?.();
    } catch (error) {
        fail(plugin, "stop", error);
    }
    scope.dispose();
    notify(plugin.name);
}

/** Starts a plugin and its dependencies without the framework (tests, early start, restarts). */
function startLocal(plugin: Plugin): boolean {
    if (plugin.scope) return true;
    for (const dep of plugin.dependencies ?? []) {
        const depPlugin = plugins.get(dep);
        if (!depPlugin || !startLocal(depPlugin)) {
            fail(plugin, "start", new Error(`Dependency ${dep} did not start`));
            notify(plugin.name);
            return false;
        }
    }
    return runStart(plugin);
}

function startOne(plugin: Plugin) {
    if (plugin.scope) return true;
    const h = host();
    if (!h) return startLocal(plugin);
    // The framework believes it runs (CC++ stopped it for a restart that failed): start it here.
    if (h.plugins[plugin.name]?.started) return startLocal(plugin);
    try {
        h.startPlugin(plugin.name);
    } catch (error) {
        fail(plugin, "start", error);
    }
    return !!plugin.scope;
}

function stopOne(plugin: Plugin) {
    if (!plugin.scope) return;
    for (const dependent of dependentsOf(plugin.name)) stopOne(dependent);
    const h = host();
    if (h?.plugins[plugin.name]?.started) {
        try {
            h.stopPlugin(plugin.name);
        } catch (error) {
            fail(plugin, "stop", error);
        }
    }
    // Not known to the framework as running (started early, before the framework's Init stage).
    runStop(plugin);
}

export function restartPlugin(plugin: Plugin) {
    if (!plugin.scope) return;
    const running = dependentsOf(plugin.name).filter(p => p.scope);
    // Inside CC++ only: dependents first, then the plugin, then back up in order.
    const stopTree = (p: Plugin) => {
        for (const dependent of dependentsOf(p.name)) if (dependent.scope) stopTree(dependent);
        runStop(p);
    };
    stopTree(plugin);
    startLocal(plugin);
    for (const dependent of running) startLocal(dependent);
}

let reconciling = false;
let again = false;
/** Brings the running set in line with isActive(), in dependency order. */
export function reconcile() {
    if (!phase) return;
    // Starting a plugin on the framework can write `enabled` for its dependencies, which lands here again.
    if (reconciling) {
        again = true;
        return;
    }
    reconciling = true;
    try {
        do {
            again = false;
            for (const plugin of plugins.values()) if (plugin.scope && !isActive(plugin)) stopOne(plugin);
            for (const plugin of plugins.values()) if (!plugin.scope && isActive(plugin) && phaseReached(plugin) && !errors.has(plugin.name)) startOne(plugin);
        } while (again);
    } finally {
        reconciling = false;
    }
}

export function startPhase(next: StartAt) {
    phase = next;
    reconcile();
    if (next === "dom-ready") scheduleRetries();
}

/**
 * On Userscript++: document-start plugins (network and route hooks, telemetry blocking) start in the
 * same task the script was injected in, as in 0.3, not after the framework has read its async storage.
 * The framework's Init stage later finds them running. Only plugins that are on per the settings read
 * synchronously; safe mode starts none.
 */
export function startEarly() {
    const h = host();
    if (!h || phase) return;
    noteBoot();
    if (h.isSafeMode()) return;
    phase = "document-start";
    for (const plugin of plugins.values()) {
        if (plugin.startAt !== "document-start" || plugin.scope || !isActive(plugin)) continue;
        startLocal(plugin);
    }
}

/** Marks a phase without starting anything (the framework is doing it). */
export function enterPhase(next: StartAt) {
    if (phase === "dom-ready") return;
    phase = next;
}

/** claude.ai keeps building its UI after DOMContentLoaded; a plugin that threw on start gets a few more tries. */
export const RETRY_DELAYS_MS = [1500, 4000, 10000];

function scheduleRetries() {
    for (const delay of RETRY_DELAYS_MS) setTimeout(retryFailed, delay);
}

export function retryFailed() {
    for (const plugin of plugins.values()) {
        if (plugin.scope || !isActive(plugin) || errors.get(plugin.name)?.stage !== "start") continue;
        errors.delete(plugin.name);
        startOne(plugin);
    }
}

onSettingsChange((name, key) => {
    if (key === "enabled") {
        const plugin = plugins.get(name);
        if (plugin) errors.delete(plugin.name);
        reconcile();
        return;
    }
    const plugin = plugins.get(name);
    if (!plugin?.scope || !plugin.settings?.def[key]) return;
    if (!plugin.onSettingsChange) {
        restartPlugin(plugin);
        return;
    }
    try {
        plugin.onSettingsChange(key, plugin.scope);
    } catch (error) {
        fail(plugin, "settings", error);
        notify(plugin.name);
    }
});

/** For tests: forget everything. */
export function resetRegistry() {
    for (const plugin of plugins.values()) stopOne(plugin);
    plugins.clear();
    errors.clear();
    bootActive.clear();
    phase = null;
    booted = false;
}
