/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { onDomChange } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    upgrade: { type: "boolean", label: { zh: "隐藏升级 / 购买入口", en: "Hide upgrade and buy prompts" }, default: true },
    plan: { type: "boolean", label: { zh: "隐藏头像旁的套餐名", en: "Hide the plan name next to your name" }, default: false },
    codeNudge: { type: "boolean", label: { zh: "隐藏输入框里的 Claude Code 推广提示", en: "Hide the Claude Code nudge in the input" }, default: true },
    templates: { type: "boolean", label: { zh: "隐藏侧栏「从模板新建」按钮", en: "Hide the sidebar “New from a template” button" }, default: false },
});

const UPGRADE_RE = /^(upgrade|upgrade plan|upgrade to (pro|max)|get (pro|max)|try (pro|max)|升级|升级套餐)$/i;

export function cleanerCss(options: { plan: boolean; codeNudge: boolean; templates: boolean }) {
    return [
        `[data-ccpp-cleaned] { display: none !important; }`,
        `a[href^="/upgrade"], a[href*="/upgrade?"] { display: none !important; }`,
        options.plan ? `[data-testid="user-menu-button"] .df-footer-suffix-text { display: none !important; }` : "",
        options.codeNudge ? `#claude-code-nudge-body, [id^="claude-code-nudge"] { display: none !important; }` : "",
        options.templates ? `button[aria-label="New from a template"] { display: none !important; }` : "",
    ].join("\n");
}

export default definePlugin({
    name: "Cleaner",
    title: { zh: "界面清理", en: "Cleaner" },
    description: { zh: "隐藏升级推销、套餐标签、Claude Code 推广提示等干扰元素（各项可分别开关）。", en: "Hides upgrade nags, the plan label, the Claude Code nudge and similar clutter (each switchable)." },
    category: "declutter",
    icon: "brush",
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        addStyle(scope, cleanerCss(settings.store), "cleaner");
        if (settings.store.upgrade) {
            onDomChange(scope, () => {
                for (const el of document.querySelectorAll<HTMLElement>("a, button")) {
                    if (el.dataset.ccppCleaned !== undefined || el.closest("[data-ccpp]")) continue;
                    if (UPGRADE_RE.test(el.textContent?.trim() ?? "")) el.dataset.ccppCleaned = "";
                }
            });
            scope.defer(() => document.querySelectorAll("[data-ccpp-cleaned]").forEach(el => el.removeAttribute("data-ccpp-cleaned")));
        }
    },
});
