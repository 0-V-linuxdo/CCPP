/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";

declare const GM_registerMenuCommand: ((name: string, fn: () => void) => number | string) | undefined;
declare const GM_unregisterMenuCommand: ((id: number | string) => void) | undefined;

/** Adds an entry to the userscript manager's menu (Tampermonkey, Violentmonkey, ScriptCat…). */
export function addMenuCommand(scope: Scope, name: string, fn: () => void) {
    if (typeof GM_registerMenuCommand !== "function") return;
    try {
        const id = GM_registerMenuCommand(name, fn);
        scope.defer(() => {
            try {
                if (typeof GM_unregisterMenuCommand === "function") GM_unregisterMenuCommand(id);
            } catch {}
        });
    } catch {}
}

export default definePlugin({
    name: "MenuApi",
    title: { zh: "脚本菜单", en: "Userscript menu API" },
    description: { zh: "在脚本管理器菜单里添加命令。", en: "Adds commands to the userscript manager's menu." },
    category: "api",
    icon: "list",
    hidden: true,
    start() {},
});
