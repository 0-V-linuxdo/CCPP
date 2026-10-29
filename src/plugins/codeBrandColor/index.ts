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
});

/**
 * Only the "Code" wordmark; the sidebar toggle beside it keeps claude.ai's color.
 * Web only: the desktop app (no data-web on .dframe-root) hides the wordmark under the
 * window's traffic lights, and coloring it there brings it back on top of them.
 */
export const codeBrandCss = (color: string) => `
.dframe-root[data-web] [data-app-wordmark="code"] > span { color: ${color} !important; }
`;

export default definePlugin({
    name: "CodeBrandColor",
    title: { zh: "侧栏 Code 主题色", en: "Colored Code title" },
    description: {
        zh: "网页版 Code 模式下，侧栏顶部的「Code」字样改用主题色，默认 Claude 橙色，可自选颜色。桌面版不生效。",
        en: "In Code mode on the web, the \"Code\" title at the top of the sidebar uses a theme color, Claude's orange by default. Not applied in the desktop app.",
    },
    category: "appearance",
    icon: "palette",
    enabledByDefault: true,
    updatedAt: "2026-10-29",
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        const color = () => (/^#[0-9a-f]{6}$/i.test(settings.store.color) ? settings.store.color : CLAUDE_ORANGE);
        const css = () => codeBrandCss(color());
        const set = addStyle(scope, css(), "code-brand-color");
        this.onSettingsChange = () => set(css());
    },
});
