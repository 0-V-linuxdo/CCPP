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
    approaching: { type: "boolean", label: { zh: "隐藏「接近用量上限」提示（Approaching session usage limit）", en: "Hide “Approaching usage limit” banners" }, default: true },
    exhausted: { type: "boolean", label: { zh: "隐藏「用量已耗尽」提示（You've hit your limit 等）", en: "Hide “Usage limit reached” banners" }, default: true },
});

/** Text of claude.ai's usage limit bar ("Approaching session usage limit", "You've hit your weekly limit", "Out of free messages"). */
const LIMIT_RE = /\b(usage|session|weekly|daily|message|5-hour) limits?\b|\bout of (free |extra )?(messages|usage)\b|用量(上限|限制|已用完|已耗尽)|使用(上限|限制)/i;
const APPROACHING_RE = /\bapproaching\b|接近|即将/i;
/** The bar is one line of text plus its buttons; anything longer is page content. */
const MAX_TEXT = 240;
/** Where the bar never is: messages, the input itself, CC++'s own UI and claude.ai's menus and dialogs. */
const SKIP = `${SEL.transcriptRow}, ${SEL.transcript}, ${SEL.editor}, ${SEL.sidebar}, nav, [role="menu"], [role="dialog"], [contenteditable="true"], textarea, [data-ccpp]`;
const MARK = "data-ccpp-usage-banner";

export type BannerKind = "approaching" | "exhausted";

/** The whole bar holding `text`: its largest short ancestor that still sits outside the input and has a button. */
function barOf(text: Element): HTMLElement | null {
    let bar: HTMLElement | null = null;
    for (let node: HTMLElement | null = text as HTMLElement; node && node !== document.body; node = node.parentElement) {
        if ((node.textContent?.trim().length ?? 0) > MAX_TEXT || node.querySelector(`${SEL.editor}, textarea, [contenteditable="true"]`)) break;
        if (node.querySelector('button, a[href], [role="button"]')) bar = node;
    }
    return bar;
}

/** Usage limit bars on the page, with which kind each one is. */
export function findUsageBanners(root: ParentNode = document): { el: HTMLElement; kind: BannerKind }[] {
    const found = new Map<HTMLElement, BannerKind>();
    for (const el of root.querySelectorAll<HTMLElement>("p, span, div, h2, h3, strong")) {
        if (el.childElementCount > 2 || el.closest(SKIP)) continue;
        const text = el.textContent?.trim() ?? "";
        if (!text || text.length > MAX_TEXT || !LIMIT_RE.test(text)) continue;
        const bar = barOf(el);
        if (bar && !found.has(bar)) found.set(bar, APPROACHING_RE.test(bar.textContent ?? "") ? "approaching" : "exhausted");
    }
    return [...found].map(([el, kind]) => ({ el, kind }));
}

export default definePlugin({
    name: "UsageBannerHider",
    title: { zh: "隐藏用量限制提示条", en: "Hide usage limit banner" },
    description: {
        zh: "隐藏输入框上方的用量提示条：「接近用量上限」（Approaching session usage limit · Resets at … · Get more usage）和「用量已耗尽」两种可分别开关。设置页里的用量信息不受影响。",
        en: "Hides the usage bar above the input: “Approaching session usage limit · Resets at … · Get more usage” and the limit-reached one, each switchable. Usage on the settings pages is left alone.",
    },
    category: "declutter",
    icon: "gauge",
    enabledByDefault: true,
    updatedAt: "2026-10-25",
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        const { approaching, exhausted } = settings.store;
        if (!approaching && !exhausted) return;
        addStyle(scope, `[${MARK}] { display: none !important; }`, "usage-banner");
        onDomChange(scope, () => {
            if (location.pathname.startsWith("/settings")) return;
            for (const { el, kind } of findUsageBanners()) {
                if (el.hasAttribute(MARK) || !(kind === "approaching" ? approaching : exhausted)) continue;
                el.setAttribute(MARK, kind);
            }
        });
        scope.defer(() => document.querySelectorAll(`[${MARK}]`).forEach(el => el.removeAttribute(MARK)));
    },
});
