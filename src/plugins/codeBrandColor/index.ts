/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";

/** Claude's orange, the same as claude.ai's --cds-fill-brand. */
export const CLAUDE_ORANGE = "#c6613f";

const settings = definePluginSettings({
    color: { type: "color", label: { zh: "颜色", en: "Color" }, description: { zh: "默认是 Claude 的橙色。", en: "Defaults to Claude's orange." }, default: CLAUDE_ORANGE },
    icon: { type: "boolean", label: { zh: "图标也着色", en: "Color the icon too" }, description: { zh: "左边的侧栏开关图标也用这个颜色。", en: "The sidebar toggle icon to its left uses the color as well." }, default: true },
});

/** The sidebar's title bar while it shows the Code wordmark (Claude Code mode). */
const CODE_TITLEBAR = '.df-titlebar:has([data-app-wordmark="code"])';

export const codeBrandCss = (color: string, icon: boolean) => `
${CODE_TITLEBAR} [data-app-wordmark="code"] > span { color: ${color} !important; }
${icon ? `${CODE_TITLEBAR} .df-sidebar-hover-reveal button { color: ${color} !important; }` : ""}
`;

export default definePlugin({
    name: "CodeBrandColor",
    title: { zh: "侧栏 Code 主题色", en: "Colored Code title" },
    description: {
        zh: "Code 模式下，侧栏顶部的「Code」字样和旁边的图标改用主题色，默认 Claude 橙色，可自选颜色。",
        en: "In Code mode, the \"Code\" title at the top of the sidebar and the icon beside it use a theme color, Claude's orange by default.",
    },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        const color = () => (/^#[0-9a-f]{6}$/i.test(settings.store.color) ? settings.store.color : CLAUDE_ORANGE);
        const css = () => codeBrandCss(color(), settings.store.icon);
        const set = addStyle(scope, css(), "code-brand-color");
        this.onSettingsChange = () => set(css());
    },
});
