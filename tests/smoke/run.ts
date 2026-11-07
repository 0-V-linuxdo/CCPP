/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/*
 * Runs the built userscript (userscript/CCPP.user.js) on a bare claude.ai page with a stand-in
 * script manager, as an upgrade from 0.3: localStorage still holds 0.3's `ccpp:settings`.
 * Prints a JSON report for tests/userscript.test.ts. Started in its own process so the script's
 * globals (wrapped fetch, menu commands…) don't leak into other tests.
 *
 *   bun --preload ./tests/setup.ts tests/smoke/run.ts [path/to/CCPP.user.js]
 */

import { readFileSync } from "fs";

const file = process.argv[2] ?? "userscript/CCPP.user.js";
const w = globalThis as any;

const gm = new Map<string, unknown>();
const menus: string[] = [];
const errors: string[] = [];
w.GM_getValue = (k: string, d: unknown) => (gm.has(k) ? gm.get(k) : d);
w.GM_setValue = (k: string, v: unknown) => void gm.set(k, v);
w.GM_deleteValue = (k: string) => void gm.delete(k);
const valueListeners: ((name: string, old: unknown, value: unknown, remote: boolean) => void)[] = [];
w.GM_addValueChangeListener = (_k: string, fn: (typeof valueListeners)[number]) => (valueListeners.push(fn), valueListeners.length);
w.GM_removeValueChangeListener = () => {};
w.GM_registerMenuCommand = (name: string) => (menus.push(name), menus.length);
w.GM_unregisterMenuCommand = (id: number) => void (menus[id - 1] = "");
w.GM_info = { scriptHandler: "Violentmonkey", version: "2.31.0", script: { name: "CC++", version: "test" } };
w.unsafeWindow = w;
const origError = console.error;
console.error = (...args: unknown[]) => {
    errors.push(args.map(a => (a instanceof Error ? a.stack ?? a.message : String(a))).join(" "));
};
console.warn = () => {};
console.info = () => {};
console.log = () => {};
console.debug = () => {};

// 0.3's settings: one switch flipped from its default, an option, and the settings UI under its old name.
localStorage.setItem("ccpp:settings", JSON.stringify({ WiderChat: { enabled: true, width: 1100 }, ChatNavigator: { enabled: false }, Settings: { language: "zh" } }));

const fetchBefore = w.fetch;
(0, eval)(readFileSync(file, "utf-8"));
const syncFetchWrapped = w.fetch !== fetchBefore;
await Promise.resolve();
await Promise.resolve();
const earlyFetchWrapped = w.fetch !== fetchBefore;

await new Promise(r => setTimeout(r, 1500));

// Another tab switches ChatNavigator on and WiderChat off.
const remote = (current: any, plugin: string, enabled: boolean) => {
    const data = typeof current === "string" ? JSON.parse(current) : structuredClone(current);
    data.plugins[plugin] = { ...data.plugins[plugin], enabled };
    data.$savedAt = Date.now();
    return data;
};
const runningNow = () => (w.CCPP?.plugins ?? []).filter((p: any) => p.running).map((p: any) => p.name);
const beforeSync = runningNow();
const synced = remote(remote(gm.get("UserscriptPPSettings"), "ChatNavigator", true), "WiderChat", false);
for (const fn of valueListeners) fn("UserscriptPPSettings", null, synced, true);
await new Promise(r => setTimeout(r, 300));
const afterSync = runningNow();

const runtime = w.CCPP;
const info: { name: string; running: boolean; enabled: boolean; error: unknown }[] = runtime?.plugins ?? [];
const stored = gm.get("UserscriptPPSettings") as any;
const plugins = typeof stored === "string" ? JSON.parse(stored).plugins : stored?.plugins;
console.error = origError;
process.stdout.write(
    JSON.stringify({
        version: runtime?.version,
        flag: w.__ccpp,
        framework: runtime?.framework,
        syncFetchWrapped,
        earlyFetchWrapped,
        plugins: info.length,
        running: info.filter(p => p.running).map(p => p.name),
        failed: info.filter(p => p.error).map(p => `${p.name}: ${JSON.stringify(p.error)}`),
        stored: plugins ?? null,
        beforeSync,
        afterSync,
        menus: menus.filter(Boolean),
        errors,
    }),
);
process.exit(0);
