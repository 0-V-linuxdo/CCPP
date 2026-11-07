/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { host, onHost } from "./host";
import type { Text } from "./i18n";
import { Logger } from "./logger";
import { readJson, writeJson } from "./storage";

const logger = new Logger("Settings");

export const SETTINGS_KEY = "settings";

export type Value = string | number | boolean;

interface Base {
    label: Text;
    description?: Text;
    /** Hide this option unless the predicate holds (evaluated against the plugin's current values). */
    visible?: (values: Record<string, Value | undefined>) => boolean;
}

export interface BooleanOption extends Base {
    type: "boolean";
    default: boolean;
}
export interface NumberOption extends Base {
    type: "number";
    default: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
}
export interface SelectOption extends Base {
    type: "select";
    default: string;
    options: { value: string; label: Text }[];
}
export interface StringOption extends Base {
    type: "string";
    default: string;
    placeholder?: Text;
    maxLength?: number;
}
export interface TextOption extends Base {
    type: "text";
    default: string;
    placeholder?: Text;
    rows?: number;
}
export interface ColorOption extends Base {
    type: "color";
    /** #rrggbb */
    default: string;
}
/** A picture: an http(s) URL or a data:image URL, "" for none. The settings panel can paste, drop, pick and crop it. */
export interface ImageOption extends Base {
    type: "image";
    default: string;
    placeholder?: Text;
    /** Edge of the square, in pixels, that picked pictures are cropped and scaled to. */
    size?: number;
}
/** A button; stores nothing. */
export interface ActionOption extends Base {
    type: "action";
    button: Text;
    confirm?: Text;
    run(): void;
}

export type Option = BooleanOption | NumberOption | SelectOption | StringOption | TextOption | ColorOption | ImageOption | ActionOption;
export type OptionsDef = Record<string, Option>;

export type Values<D extends OptionsDef> = {
    [K in keyof D]: D[K] extends BooleanOption ? boolean : D[K] extends NumberOption ? number : D[K] extends ActionOption ? undefined : string;
};

export type Bag = Record<string, Record<string, Value>>;

type Listener = (plugin: string, key: string) => void;
const listeners = new Set<Listener>();

const isRecord = (value: unknown): value is Record<string, any> => !!value && typeof value === "object" && !Array.isArray(value);

/*
 * Where the values live. On Userscript++ (the normal case) they are the framework's own plugin
 * settings, `U.Settings.plugins.<Plugin>.<key>`: kept in the script manager's storage, backed up to
 * the site's IndexedDB and synced across tabs by the framework. Without a host (unit tests) they stay
 * in a bag here, saved to localStorage under `ccpp:settings` the way CC++ 0.3 did.
 */
let bag: Bag = (() => {
    const stored = readJson<unknown>(SETTINGS_KEY, {});
    return isRecord(stored) ? (stored as Bag) : {};
})();

/** The framework's own core plugin; its entry is not CC++'s and never goes into CC++ backups. */
export const FRAMEWORK_PLUGIN = "Settings";
/** CC++'s settings UI plugin. It was called "Settings" before 0.4, a name the framework now owns. */
export const SETTINGS_UI_PLUGIN = "CCPPSettings";
const LEGACY_NAMES: Record<string, string> = { Settings: SETTINGS_UI_PLUGIN };
/** Set on the settings UI plugin once the 0.3 localStorage settings were copied into the framework. */
const MIGRATED_KEY = "migratedFrom03";

const values = (): Bag => {
    const h = host();
    return h ? (h.PlainSettings.plugins as Bag) : bag;
};

function announce(plugin: string, key: string) {
    for (const listener of [...listeners]) {
        try {
            listener(plugin, key);
        } catch (error) {
            logger.error("Settings listener failed:", error);
        }
    }
}

export const getRaw = (plugin: string, key: string): Value | undefined => {
    const entry = values()[plugin];
    return isRecord(entry) ? (entry[key] as Value | undefined) : undefined;
};

/** Every CC++ plugin's stored values (the framework's own entry left out). */
export const snapshot = (): Bag => {
    const out: Bag = {};
    for (const [plugin, entry] of Object.entries(values())) {
        if (plugin === FRAMEWORK_PLUGIN && host()) continue;
        if (isRecord(entry)) out[plugin] = JSON.parse(JSON.stringify(entry));
    }
    return out;
};

/** The framework's settings proxy for one plugin, created when missing. Writes through it are saved and announced. */
function hostEntry(plugin: string) {
    const h = host()!;
    if (!isRecord(h.PlainSettings.plugins[plugin])) h.Settings.plugins[plugin] = {};
    return h.Settings.plugins[plugin] as Record<string, unknown>;
}

export function setRaw(plugin: string, key: string, value: Value) {
    if (getRaw(plugin, key) === value && key in (values()[plugin] ?? {})) return;
    if (host()) {
        // The framework's change listener (installed below) announces it.
        hostEntry(plugin)[key] = value;
        return;
    }
    bag = { ...bag, [plugin]: { ...bag[plugin], [key]: value } };
    if (!writeJson(SETTINGS_KEY, bag)) logger.warn("Settings could not be saved");
    announce(plugin, key);
}

export function resetRaw(plugin: string, keys: string[]) {
    const current = values()[plugin];
    if (!isRecord(current)) return;
    const changed = keys.filter(key => key in current);
    if (!changed.length) return;
    if (host()) {
        const entry = hostEntry(plugin);
        for (const key of changed) delete entry[key];
        return;
    }
    const next = { ...current };
    for (const key of changed) delete next[key];
    bag = { ...bag, [plugin]: next };
    writeJson(SETTINGS_KEY, bag);
    for (const key of changed) announce(plugin, key);
}

export function onSettingsChange(listener: Listener) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
}

/** Every [plugin, key] that differs between two bags, "enabled" keys first so plugins start before they are tuned. */
export function diffBags(before: Bag, after: Bag): [string, string][] {
    const out: [string, string][] = [];
    for (const plugin of new Set([...Object.keys(before), ...Object.keys(after)])) {
        const a = isRecord(before[plugin]) ? before[plugin] : {};
        const b = isRecord(after[plugin]) ? after[plugin] : {};
        const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(key => a[key] !== b[key]);
        keys.sort((x, y) => Number(y === "enabled") - Number(x === "enabled"));
        for (const key of keys) out.push([plugin, key]);
    }
    return out;
}

/** Replaces every CC++ value (another tab saved, or a backup was restored) and announces only real changes. */
export function replaceBag(next: unknown) {
    const parsed = isRecord(next) ? (next as Bag) : {};
    if (host()) {
        // A 0.3 backup still calls the settings UI plugin "Settings".
        const renamed: Bag = {};
        for (const [plugin, entry] of Object.entries(parsed)) {
            if (!isRecord(entry)) continue;
            const name = LEGACY_NAMES[plugin] ?? plugin;
            renamed[name] = { ...renamed[name], ...entry };
        }
        for (const [plugin, key] of diffBags(snapshot(), renamed)) {
            const entry = hostEntry(plugin);
            if (key in (renamed[plugin] ?? {})) entry[key] = renamed[plugin][key];
            else delete entry[key];
        }
        return;
    }
    const changed = diffBags(bag, parsed);
    bag = parsed;
    writeJson(SETTINGS_KEY, bag);
    for (const [plugin, key] of changed) announce(plugin, key);
}

/** Erases every CC++ value (the framework's own entry stays). */
export function clearAll() {
    if (!host()) return replaceBag({});
    const h = host()!;
    for (const plugin of Object.keys(h.PlainSettings.plugins)) if (plugin !== FRAMEWORK_PLUGIN) delete h.Settings.plugins[plugin];
}

/**
 * Copies CC++ 0.3's settings (localStorage `ccpp:settings`) into the framework once per browser,
 * the first time 0.4 runs. Values the framework already holds win. The old key is left in place
 * so going back to 0.3 still finds its settings. Returns true when anything was copied.
 */
export function migrateLegacy(): boolean {
    const h = host();
    if (!h) return false;
    const plain = h.PlainSettings.plugins;
    if (isRecord(plain[SETTINGS_UI_PLUGIN]) && plain[SETTINGS_UI_PLUGIN][MIGRATED_KEY]) return false;
    const legacy = readJson<unknown>(SETTINGS_KEY, null);
    let copied = false;
    if (isRecord(legacy)) {
        for (const [oldName, entry] of Object.entries(legacy)) {
            if (!isRecord(entry)) continue;
            const name = LEGACY_NAMES[oldName] ?? oldName;
            for (const [key, value] of Object.entries(entry)) {
                if (isRecord(plain[name]) && key in plain[name]) continue;
                hostEntry(name)[key] = value;
                copied = true;
            }
        }
    }
    hostEntry(SETTINGS_UI_PLUGIN)[MIGRATED_KEY] = Date.now();
    if (copied) logger.info("Copied CC++ 0.3 settings into Userscript++ storage");
    return copied;
}

// Every change to a framework plugin setting, from any source: CC++'s own UI, the framework's panel,
// another tab, a backup import. Paths are "plugins.<Plugin>.<key>[.…]", or "plugins.<Plugin>" when a
// whole entry arrives or goes.
onHost(h =>
    h.SettingsStore.addPrefixChangeListener("plugins.", (value, path) => {
        const [, plugin, key] = path.split(".");
        if (!plugin || plugin === FRAMEWORK_PLUGIN) return;
        if (key) return announce(plugin, key);
        const keys = isRecord(value) ? Object.keys(value) : [];
        keys.sort((x, y) => Number(y === "enabled") - Number(x === "enabled"));
        for (const k of keys.length ? keys : ["enabled"]) announce(plugin, k);
    }),
);

/** Reads a stored value through its option definition: wrong types and out-of-range numbers fall back or clamp. */
export function coerce(option: Option, value: Value | undefined): Value | undefined {
    switch (option.type) {
        case "action":
            return undefined;
        case "boolean":
            return typeof value === "boolean" ? value : option.default;
        case "number": {
            if (typeof value !== "number" || !Number.isFinite(value)) return option.default;
            const step = option.step ?? 1;
            const stepped = Math.round(value / step) * step;
            return Math.min(option.max, Math.max(option.min, Number(stepped.toFixed(6))));
        }
        case "select":
            return typeof value === "string" && option.options.some(o => o.value === value) ? value : option.default;
        case "color":
            return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : option.default;
        case "string":
            return typeof value === "string" ? value.slice(0, option.maxLength ?? 2000) : option.default;
        case "text":
            return typeof value === "string" ? value : option.default;
        case "image":
            return typeof value === "string" && isImageUrl(value) ? value : option.default;
    }
}

/** What an image option accepts: nothing, an http(s) URL, or an inline data:image URL. */
export function isImageUrl(value: string) {
    const v = value.trim();
    if (!v || v.startsWith("data:image/")) return true;
    try {
        return /^https?:$/.test(new URL(v).protocol);
    } catch {
        return false;
    }
}

export interface PluginSettings<D extends OptionsDef = OptionsDef> {
    def: D;
    store: Values<D>;
    bind(plugin: string): void;
    owner(): string;
    reset(): void;
}

export function definePluginSettings<D extends OptionsDef>(def: D): PluginSettings<D> {
    let owner = "";
    const store = new Proxy({} as Values<D>, {
        get: (_, key: string) => (def[key] ? coerce(def[key], getRaw(owner, key)) : undefined),
        set: (_, key: string, value: Value) => {
            setRaw(owner, key, value);
            return true;
        },
    });
    return {
        def,
        store,
        bind: plugin => void (owner = plugin),
        owner: () => owner,
        reset: () => resetRaw(owner, Object.keys(def)),
    };
}
