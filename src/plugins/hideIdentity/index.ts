/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { identityRoots, realName, repaintOnChange, TextSwaps, textNodes } from "@lib/identity";
import { SEL } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    hideEmail: {
        type: "boolean",
        label: { zh: "隐藏邮箱", en: "Hide email" },
        default: true,
    },
    hideName: {
        type: "boolean",
        label: { zh: "隐藏用户名", en: "Hide username" },
        default: false,
    },
});

const HIDE = "data-ccpp-hide-identity";
const EMAIL = /[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}/i;
const MENU_ROW = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

export const isEmail = (text: string) => {
    const match = EMAIL.exec(text.trim());
    return !!match && match[0] === text.trim();
};

/** Removes emails from a line of text, with the separators (·, |, -, brackets) left dangling around them. */
export const stripEmail = (text: string) =>
    text
        .replace(new RegExp(`\\s*[·•|–—-]?\\s*[(<]?${EMAIL.source}[)>]?`, "gi"), "")
        .replace(/^\s*[·•|–—-]\s*/, "")
        .trimEnd();

/**
 * The biggest element around `node` that shows nothing but `text`, without leaving `root` or
 * swallowing a whole menu row (the label sits beside the row, never wraps it).
 */
export function soleHolder(node: Text, root: Element, text: string): HTMLElement | null {
    let el = node.parentElement;
    if (!el || !root.contains(el)) return null;
    while (el.parentElement && el.parentElement !== root && !el.parentElement.matches(MENU_ROW) && el.parentElement.textContent?.trim() === text) el = el.parentElement;
    return el.matches(MENU_ROW) ? null : (el as HTMLElement);
}

export default definePlugin({
    name: "HideIdentity",
    title: { zh: "隐藏邮箱 / 用户名", en: "Hide email / username" },
    description: { zh: "隐藏头像弹出的账号菜单里的邮箱（也可隐藏用户名），截图、录屏时不露出账号。", en: "Hides the email (and optionally your name) in the account menu the avatar opens, so screenshots don't show your account." },
    category: "privacy",
    icon: "eyeOff",
    enabledByDefault: true,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        const { hideEmail, hideName } = settings.store;
        addStyle(scope, `[${HIDE}] { display: none !important; }`, "hide-identity");
        const swaps = new TextSwaps();
        const hidden = new Set<Element>();

        const hide = (el: Element) => {
            el.setAttribute(HIDE, "");
            hidden.add(el);
            // A label that heads the menu leaves its separator behind; hide that too.
            const next = el.nextElementSibling;
            const first = ![...(el.parentElement?.children ?? [])].some(c => c !== el && c.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING && !c.hasAttribute(HIDE));
            if (first && next?.matches('[role="separator"]')) {
                next.setAttribute(HIDE, "");
                hidden.add(next);
            }
        };

        const paint = () => {
            swaps.prune();
            // Your real name, and whatever CustomIdentity shows in its place.
            const shown = document.querySelector(`${SEL.userMenuButton} ${SEL.avatar}`)?.getAttribute("aria-label")?.trim();
            const names = new Set([realName(), shown].filter((n): n is string => !!n));
            for (const root of identityRoots()) {
                for (const node of textNodes(root)) {
                    const text = swaps.original(node).trim();
                    if (!text) continue;
                    if (hideEmail && EMAIL.test(text)) {
                        const holder = isEmail(text) ? soleHolder(node, root, node.data.trim()) : null;
                        if (holder) {
                            if (!holder.hasAttribute(HIDE)) hide(holder);
                        } else {
                            swaps.set(node, stripEmail(swaps.original(node)));
                        }
                        continue;
                    }
                    if (hideName && names.has(node.data.trim()) && !node.parentElement?.closest(SEL.avatar)) {
                        const holder = soleHolder(node, root, node.data.trim());
                        if (holder && !holder.hasAttribute(HIDE)) hide(holder);
                    }
                }
            }
        };

        repaintOnChange(scope, paint);
        scope.defer(() => {
            swaps.restore();
            for (const el of hidden) el.removeAttribute(HIDE);
            for (const el of document.querySelectorAll(`[${HIDE}]`)) el.removeAttribute(HIDE);
        });
    },
});
