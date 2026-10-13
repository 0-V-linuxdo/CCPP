/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "@kernel/logger";
import { registerPlugins, startPhase } from "@kernel/plugins";
import { replaceBag, SETTINGS_KEY } from "@kernel/settings";
import { PREFIX } from "@kernel/storage";
import { isTopDocument, pageWindow } from "@lib/page";

import { PLUGINS } from "./plugins";

declare const VERSION: string;

const FLAG = "__ccpp";
const logger = new Logger("Kernel");

function boot() {
    const win = pageWindow as unknown as Record<string, unknown>;
    if (win[FLAG] || !isTopDocument()) return;
    win[FLAG] = typeof VERSION === "string" ? VERSION : true;
    registerPlugins(PLUGINS);
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
