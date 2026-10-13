/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { Logger } from "@kernel/logger";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { pageWindow } from "@lib/page";

const settings = definePluginSettings({
    levels: {
        type: "select",
        label: { zh: "静音哪些输出", en: "Silence" },
        default: "info",
        options: [
            { value: "info", label: { zh: "log / info / debug", en: "log / info / debug" } },
            { value: "warn", label: { zh: "以上 + warn", en: "Those + warn" } },
        ],
    },
});

export default definePlugin({
    name: "ConsoleJanitor",
    title: { zh: "控制台清净", en: "Console janitor" },
    description: { zh: "静音 claude.ai 在浏览器控制台里的大量日志，只保留错误和 CC++ 自己的输出，方便调试。", en: "Silences claude.ai's console noise, keeping errors and CC++'s own output." },
    category: "developer",
    icon: "terminal",
    enabledByDefault: false,
    startAt: "document-start",
    settings,
    start(scope) {
        const target = pageWindow.console;
        const levels = settings.store.levels === "warn" ? (["log", "info", "debug", "warn"] as const) : (["log", "info", "debug"] as const);
        for (const level of levels) {
            const original = target[level];
            const quiet = function (this: Console, ...args: unknown[]) {
                if (typeof args[0] === "string" && args[0].includes(Logger.TAG)) original.apply(this, args);
            };
            target[level] = quiet;
            scope.defer(() => {
                if (target[level] === quiet) target[level] = original;
            });
        }
    },
});
