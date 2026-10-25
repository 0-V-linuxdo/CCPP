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
    disclaimer: { type: "boolean", label: { zh: "隐藏底部的 AI 声明（Claude is AI and can make mistakes.）", en: "Hide the AI notice under the input (Claude is AI and can make mistakes.)" }, default: true },
    appPromo: { type: "boolean", label: { zh: "隐藏 App 下载提示（侧栏底部的「Get apps and extensions」按钮等）", en: "Hide app download prompts (the sidebar’s “Get apps and extensions” button and similar)" }, default: true },
    bugReport: { type: "boolean", label: { zh: "隐藏 Claude Code 侧栏右下角的 Bug 反馈按钮", en: "Hide the bug report button at the bottom right of the Claude Code sidebar" }, default: true },
});

const APP_PROMO_RE = /^(get the (desktop |mobile )?app|download (the )?(desktop |mobile )?app|download claude( for (mac|windows|desktop))?|get claude for (mac|windows|desktop)|下载(桌面|客户端|应用|App)|获取(桌面版|应用|App))/i;

/** App download prompts, by their wording; a chat or thread titled "Download the app…" is left alone. */
export function findAppPromos(root: ParentNode = document): HTMLElement[] {
    return [...root.querySelectorAll<HTMLElement>('a, button, [role="link"]')].filter(el => !el.closest(`[data-ccpp], [role="menu"], nav, ${SEL.userContent}`) && APP_PROMO_RE.test(el.textContent?.trim() ?? ""));
}

export function chatNoticeCss(options: { disclaimer: boolean; appPromo: boolean; bugReport: boolean }) {
    return [
        options.disclaimer ? `[data-disclaimer="true"] { display: none !important; }` : "",
        options.appPromo ? `[data-ccpp-app-promo], a[href="/downloads"][data-cds-icon-only], a[aria-label="Get apps and extensions"] { display: none !important; }` : "",
        options.bugReport ? `[data-testid="code-sidebar-feedback-button"] { display: none !important; }` : "",
    ].join("\n");
}

export default definePlugin({
    name: "ChatNoticeHider",
    title: { zh: "隐藏 AI 声明与 App 提示", en: "Hide AI notice and app prompt" },
    description: {
        zh: "在聊天页隐藏输入框下方的 AI 声明，侧栏底部的 App 下载按钮，以及 Claude Code 侧栏右下角的 Bug 反馈按钮（各项可分别开关）。",
        en: "On chat pages, hides the AI notice under the input the app download button at the bottom of the sidebar, and the bug report button in the Claude Code sidebar (each switchable).",
    },
    category: "declutter",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        addStyle(scope, chatNoticeCss(settings.store), "chat-notices");
        if (!settings.store.appPromo) return;
        onDomChange(scope, () => {
            for (const el of findAppPromos()) if (el.dataset.ccppAppPromo === undefined) el.dataset.ccppAppPromo = "";
        });
        scope.defer(() => document.querySelectorAll("[data-ccpp-app-promo]").forEach(el => el.removeAttribute("data-ccpp-app-promo")));
    },
});
