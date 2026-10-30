/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { onDomChange, SEL } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    upgrade: { type: "boolean", label: { zh: "隐藏升级 / 购买入口", en: "Hide upgrade and buy prompts" }, default: true },
    plan: { type: "boolean", label: { zh: "隐藏头像旁的套餐名", en: "Hide the plan name next to your name" }, default: false },
    codeNudge: { type: "boolean", label: { zh: "隐藏输入框里的 Claude Code 推广提示", en: "Hide the Claude Code nudge in the input" }, default: true },
    templates: { type: "boolean", label: { zh: "隐藏侧栏「从模板新建」按钮", en: "Hide the sidebar “New from a template” button" }, default: false },
    modelUpsell: {
        type: "boolean",
        label: { zh: "隐藏模型菜单里的购买提示", en: "Hide upsells in the model menu" },
        description: { zh: "「Buy credits」标签和菜单底部的套餐说明链接。", en: "The “Buy credits” badge and the plan note at the bottom of the menu." },
        default: true,
    },
    lockedModels: {
        type: "boolean",
        label: { zh: "隐藏要额外付费才能用的模型", en: "Hide models that need extra credits" },
        description: { zh: "模型菜单里不能直接选、要买用量额度的那几行。", en: "Rows in the model menu you can't pick without buying usage credits." },
        default: false,
    },
});

/** claude.ai's model menu. */
const MODEL_MENU = '[role="menu"][data-cds="ModelSelector"]';
const BUY_RE = /^(buy credits|get credits|购买额度|购买用量)$/i;

/** "Buy credits" badges in the model menu, by their wording. */
export function findCreditBadges(root: ParentNode = document): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>(`${MODEL_MENU} [data-cds="Badge"]`)].filter(el => BUY_RE.test(el.textContent?.trim() ?? ""));
}

const UPGRADE_RE = /^(upgrade|upgrade plan|upgrade to (pro|max)|get (pro|max)|try (pro|max)|升级|升级套餐)$/i;

/** Upgrade buttons and links, by their wording; a chat or thread titled "Upgrade" is left alone. */
export function findUpgradeNags(root: ParentNode = document): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>("a, button")].filter(el => !el.closest(`[data-ccpp], ${SEL.userContent}`) && UPGRADE_RE.test(el.textContent?.trim() ?? ""));
}

export function cleanerCss(options: { plan: boolean; codeNudge: boolean; templates: boolean; modelUpsell?: boolean; lockedModels?: boolean }) {
    return [
        `[data-ccpp-cleaned] { display: none !important; }`,
        `a[href^="/upgrade"], a[href*="/upgrade?"] { display: none !important; }`,
        options.plan ? `[data-testid="user-menu-button"] .df-footer-suffix-text { display: none !important; }` : "",
        options.codeNudge ? `#claude-code-nudge-body, [id^="claude-code-nudge"] { display: none !important; }` : "",
        options.templates ? `button[aria-label="New from a template"] { display: none !important; }` : "",
        options.modelUpsell ? `${MODEL_MENU} a[role="menuitem"][href*="support.claude.com"] { display: none !important; }` : "",
        // A model you can pick is a menuitemradio; one that needs credits first is a plain menuitem.
        options.lockedModels ? `${MODEL_MENU} [role="menuitem"][data-model-id] { display: none !important; }` : "",
    ].join("\n");
}

export default definePlugin({
    name: "Cleaner",
    title: { zh: "界面清理", en: "Cleaner" },
    description: { zh: "隐藏升级推销、套餐标签、Claude Code 推广提示、模型菜单里的购买提示等干扰元素（各项可分别开关）。", en: "Hides upgrade nags, the plan label, the Claude Code nudge, model-menu upsells and similar clutter (each switchable)." },
    category: "declutter",
    icon: "brush",
    updatedAt: "2026-10-30",
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        addStyle(scope, cleanerCss(settings.store), "cleaner");
        if (settings.store.upgrade || settings.store.modelUpsell) {
            onDomChange(scope, () => {
                const nags = [...(settings.store.upgrade ? findUpgradeNags() : []), ...(settings.store.modelUpsell ? findCreditBadges() : [])];
                for (const el of nags) if (el.dataset.ccppCleaned === undefined) el.dataset.ccppCleaned = "";
            });
            scope.defer(() => document.querySelectorAll("[data-ccpp-cleaned]").forEach(el => el.removeAttribute("data-ccpp-cleaned")));
        }
    },
});
