/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { identityRoots, ORIG_LABEL, realName, repaintOnChange, TextSwaps, textNodes } from "@lib/identity";
import { SEL } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    displayName: {
        type: "string",
        label: { zh: "显示名", en: "Display name" },
        description: { zh: "替换侧栏头像旁和账号菜单里的名字。留空保持官方名字。", en: "Replaces the name next to the sidebar avatar and in the account menu. Empty keeps your real name." },
        placeholder: { zh: "留空保持官方名字", en: "Empty keeps your real name" },
        default: "",
        maxLength: 80,
    },
    avatar: {
        type: "image",
        label: { zh: "头像", en: "Avatar" },
        description: { zh: "图片链接、data:image，或直接粘贴 / 拖入 / 选择图片，再拖动圆圈裁切。留空保持官方头像。", en: "Image URL, data:image, or paste / drop / choose a picture, then drag the circle to crop. Empty keeps the official avatar." },
        default: "",
        size: 256,
    },
    avatarSize: {
        type: "number",
        label: { zh: "侧栏头像大小", en: "Sidebar avatar size" },
        description: { zh: "侧栏展开时头像按钮里的头像直径，官方是 20px。收起成窄栏时保持官方大小。", en: "Diameter of the avatar on the sidebar's account button while the sidebar is expanded. claude.ai's own is 20px. A collapsed rail keeps the official size." },
        default: 24,
        min: 16,
        max: 48,
        unit: "px",
    },
    greeting: {
        type: "boolean",
        label: { zh: "首页问候语也用这个名字", en: "Use the name in the home greeting too" },
        default: true,
        visible: v => !!String(v.displayName ?? "").trim(),
    },
    applyToMenu: {
        type: "boolean",
        label: { zh: "账号菜单里也替换", en: "Also replace in the account menu" },
        description: { zh: "点开头像弹出的菜单里，顶部的头像和名字也一起换掉。", en: "Also replaces the avatar and name at the top of the menu the avatar opens." },
        default: true,
    },
});

/** Marks avatars elsewhere on the page (member lists, shares) whose label is your real name. */
const ME = "data-ccpp-me";

export function initials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    const first = (w: string) => Array.from(w)[0] ?? "";
    return (words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0])).toUpperCase();
}

/** A CSS string literal for any URL, quotes and newlines escaped. */
export const cssUrl = (url: string) => `url("${url.replace(/["\\\n\r]/g, c => `\\${c.charCodeAt(0).toString(16)} `)}")`;

export function avatarCss(url: string, menu: boolean) {
    if (!url) return "";
    const targets = [`${SEL.userMenuButton} ${SEL.avatar}`, `${SEL.avatar}[${ME}]`, ...(menu ? [`${SEL.accountMenu} ${SEL.avatar}`] : [])];
    const list = targets.join(",\n");
    return `${list} { background: center / cover no-repeat ${cssUrl(url)} !important; border-radius: 9999px !important; color: transparent !important; }
${targets.map(t => `${t} > *`).join(",\n")} { opacity: 0 !important; }`;
}

/** Marks the account button while its avatar is resized (not on a collapsed rail, where the name is hidden). */
const SIZED = "data-ccpp-avatar-size";

export function sizeCss(px: number) {
    const button = `${SEL.userMenuButton}[${SIZED}]`;
    const size = `${px}px`;
    return `${button} { height: auto !important; min-height: max(28px, var(--df-footer-btn-size, 32px), calc(${size} + 8px)) !important; }
${button} ${SEL.avatar} { width: ${size} !important; height: ${size} !important; min-width: ${size} !important; min-height: ${size} !important; font-size: calc(${size} * .45) !important; }
${button} :has(> ${SEL.avatar}) { width: max(var(--df-leading-slot, 28px), ${size}) !important; flex-shrink: 0 !important; }`;
}

/** Replaces `real` with `name` in a text node: the whole text when `whole`, else every occurrence. */
export function swapName(text: string, real: string, name: string, whole: boolean) {
    if (!real || !name || real === name) return text;
    if (whole) return text.trim() === real ? text.replace(real, name) : text;
    return text.includes(real) ? text.replaceAll(real, name) : text;
}

export default definePlugin({
    name: "CustomIdentity",
    title: { zh: "自定义头像与用户名", en: "Custom avatar & name" },
    description: { zh: "替换侧栏和账号菜单里的头像与显示名，只改你看到的样子，不改账号资料。留空的项保持官方值。", en: "Replaces the avatar and display name in the sidebar and account menu, only on your screen; your account is unchanged. Empty fields keep the official values." },
    category: "appearance",
    tags: ["privacy"],
    icon: "user",
    enabledByDefault: false,
    updatedAt: "2026-10-22",
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        const swaps = new TextSwaps();
        const setCss = addStyle(scope, "", "custom-identity");
        let lastUrl: string | null = null;
        const setSizeCss = addStyle(scope, sizeCss(settings.store.avatarSize), "custom-identity-size");

        const paint = () => {
            const { displayName, avatar, applyToMenu, greeting } = settings.store;
            const name = displayName.trim();
            const url = avatar.trim();
            if (url !== lastUrl) {
                lastUrl = url;
                setCss(avatarCss(url, applyToMenu));
            }
            const real = realName();
            swaps.prune();
            for (const button of document.querySelectorAll<HTMLElement>(SEL.userMenuButton)) {
                // The name beside the avatar is gone when the sidebar is collapsed to a rail.
                const name = button.querySelector<HTMLElement>(".df-user-menu-trailing");
                const expanded = !!name && name.offsetWidth > 0;
                if (expanded !== button.hasAttribute(SIZED)) button.toggleAttribute(SIZED, expanded);
            }
            const roots = identityRoots().filter(root => applyToMenu || !root.matches(SEL.menu));

            for (const avatarEl of document.querySelectorAll<HTMLElement>(SEL.avatar)) {
                const inRoot = roots.some(root => root.contains(avatarEl));
                const label = avatarEl.getAttribute(ORIG_LABEL) ?? avatarEl.getAttribute("aria-label") ?? "";
                const mine = !!real && label.trim() === real;
                if (mine && !inRoot) avatarEl.setAttribute(ME, "");
                else avatarEl.removeAttribute(ME);
                if ((inRoot || mine) && name) {
                    if (!avatarEl.hasAttribute(ORIG_LABEL)) avatarEl.setAttribute(ORIG_LABEL, label);
                    if (avatarEl.getAttribute("aria-label") !== name) avatarEl.setAttribute("aria-label", name);
                    // Initials avatars: show the new name's initials (hidden anyway under a custom picture).
                    for (const node of textNodes(avatarEl)) {
                        const text = swaps.original(node).trim();
                        if (text && text.length <= 3) swaps.set(node, initials(name));
                    }
                } else if (avatarEl.hasAttribute(ORIG_LABEL)) {
                    avatarEl.setAttribute("aria-label", avatarEl.getAttribute(ORIG_LABEL)!);
                    avatarEl.removeAttribute(ORIG_LABEL);
                    for (const node of textNodes(avatarEl)) swaps.restore(node);
                }
            }

            const rename = (root: Element, whole: boolean) => {
                for (const node of textNodes(root)) {
                    if (node.parentElement?.closest(SEL.avatar)) continue;
                    const original = swaps.original(node);
                    const next = swapName(original, real, name, whole);
                    if (next !== original) swaps.set(node, next);
                    else swaps.restore(node);
                }
            };
            for (const root of roots) rename(root, true);
            if (greeting) for (const el of document.querySelectorAll(SEL.greeting)) rename(el, false);
        };

        repaintOnChange(scope, paint);
        this.onSettingsChange = () => {
            lastUrl = null;
            setSizeCss(sizeCss(settings.store.avatarSize));
            swaps.restore();
            for (const el of document.querySelectorAll(`[${ME}]`)) el.removeAttribute(ME);
            paint();
        };
        scope.defer(() => {
            swaps.restore();
            for (const el of document.querySelectorAll(`[${ORIG_LABEL}]`)) {
                el.setAttribute("aria-label", el.getAttribute(ORIG_LABEL)!);
                el.removeAttribute(ORIG_LABEL);
            }
            for (const el of document.querySelectorAll(`[${ME}]`)) el.removeAttribute(ME);
            for (const el of document.querySelectorAll(`[${SIZED}]`)) el.removeAttribute(SIZED);
        });
    },
});
