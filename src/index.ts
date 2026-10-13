/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "@kernel/logger";
import { allPlugins, pluginInfo, registerPlugins, startPhase } from "@kernel/plugins";
import { replaceBag, SETTINGS_KEY } from "@kernel/settings";
import { PREFIX } from "@kernel/storage";
import { isTopDocument, pageWindow } from "@lib/page";

import { PLUGINS } from "./plugins";

declare const VERSION: string;

const FLAG = "__ccpp";
const GLOBAL = "CCPP";
const logger = new Logger("Kernel");

/** A read-only `window.CCPP` that lists plugin state, for checking an install from the console. */
function exposeRuntime(win: Record<string, unknown>) {
    const runtime = Object.freeze({
        version: typeof VERSION === "string" ? VERSION : "",
        get plugins() {
            return allPlugins().map(pluginInfo);
        },
        plugin(name: string) {
            const found = allPlugins().find(p => p.name === name);
            return found ? pluginInfo(found) : null;
        },
    });
    try {
        Object.defineProperty(win, GLOBAL, { value: runtime, enumerable: false, configurable: false, writable: false });
    } catch {}
}

function boot() {
    const win = pageWindow as unknown as Record<string, unknown>;
    if (win[FLAG] || !isTopDocument()) return;
    win[FLAG] = typeof VERSION === "string" ? VERSION : true;
    registerPlugins(PLUGINS);
    exposeRuntime(win);
    startPhase("document-start");
    const ready = () => startPhase("dom-ready");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready, { once: true });
    else ready();
    // Settings changed in another claude.ai tab.
    pageWindow.addEventListener("storage", event => {
        if (event.key !== PREFIX + SETTINGS_KEY) return;
        try {
            replaceBag(JSON.parse(event.newValue ?? "{}"));
        } catch {}
    });
    logger.info(`CC++ ${typeof VERSION === "string" ? VERSION : ""} started with ${PLUGINS.length} plugins`);
}

boot();
