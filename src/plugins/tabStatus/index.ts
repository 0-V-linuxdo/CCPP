/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { chatPhase } from "@api/chatState";

const settings = definePluginSettings({
    working: { type: "string", label: { zh: "回复中的标题前缀", en: "Title prefix while replying" }, default: "⏳", maxLength: 8 },
    done: { type: "string", label: { zh: "后台完成后的前缀", en: "Prefix after finishing in the background" }, description: { zh: "回到标签页后自动清除。", en: "Cleared when you come back to the tab." }, default: "✅", maxLength: 8 },
});

type State = "idle" | "working" | "done";

export function withPrefix(title: string, prefix: string, known: string[]) {
    let base = title;
    for (const p of known) if (p && base.startsWith(`${p} `)) base = base.slice(p.length + 1);
    return prefix ? `${prefix} ${base}` : base;
}

export default definePlugin({
    name: "TabStatus",
    title: { zh: "标签页状态", en: "Tab status" },
    description: { zh: "在标签页标题前显示 ⏳（正在回复）/ ✅（后台已完成），多开标签时一眼看出哪个好了。", en: "Prefixes the tab title with ⏳ while replying and ✅ when done in the background." },
    category: "notifications",
    icon: "tab",
    enabledByDefault: true,
    dependencies: ["ChatStateApi"],
    settings,
    start(scope) {
        let state: State = chatPhase() === "streaming" ? "working" : "idle";
        const prefixes = () => [settings.store.working, settings.store.done];
        const apply = () => {
            const prefix = state === "working" ? settings.store.working : state === "done" ? settings.store.done : "";
            const next = withPrefix(document.title, prefix, prefixes());
            if (next !== document.title) document.title = next;
        };
        scope.on("reply:start", () => {
            state = "working";
            apply();
        });
        scope.on("reply:end", () => {
            state = document.hidden ? "done" : "idle";
            apply();
        });
        scope.listen(document, "visibilitychange", () => {
            if (!document.hidden && state === "done") {
                state = "idle";
                apply();
            }
        });
        // claude.ai rewrites the title on navigation; keep our prefix on it.
        const titleEl = () => document.querySelector("title");
        let observed: Element | null = null;
        const observer = new MutationObserver(apply);
        scope.interval(() => {
            const el = titleEl();
            if (el && el !== observed) {
                observer.disconnect();
                observer.observe(el, { childList: true, characterData: true, subtree: true });
                observed = el;
            }
        }, 1000);
        scope.defer(() => {
            observer.disconnect();
            state = "idle";
            document.title = withPrefix(document.title, "", prefixes());
        });
        apply();
    },
});
