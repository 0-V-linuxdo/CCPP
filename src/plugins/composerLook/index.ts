/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    opacity: { type: "number", label: { zh: "输入框背景不透明度", en: "Input background opacity" }, description: { zh: "100 为完全不透明。", en: "100 is fully opaque." }, default: 100, min: 20, max: 100, step: 5, unit: "%" },
    blur: { type: "number", label: { zh: "背景模糊", en: "Background blur" }, default: 16, min: 0, max: 40, unit: "px" },
    radius: { type: "number", label: { zh: "圆角", en: "Corner radius" }, description: { zh: "0 表示保持官方样式。", en: "0 keeps claude.ai's own radius." }, default: 0, min: 0, max: 40, unit: "px" },
});

/**
 * claude.ai paints the input card with a surface colour class; mixing that colour with
 * transparency keeps light and dark themes correct without hard-coded colours.
 */
export const composerCss = (opacity: number, blur: number, radius: number) => `
[data-cds="ChatComposer"] > .bg-surface-3, [data-cds="ChatComposer"] [class*="bg-surface-3"] {
  background-color: color-mix(in srgb, var(--cds-surface-3, var(--bg-300, #fff)) ${opacity}%, transparent) !important;
  ${blur ? `backdrop-filter: blur(${blur}px) saturate(1.2); -webkit-backdrop-filter: blur(${blur}px) saturate(1.2);` : ""}
  ${radius ? `border-radius: ${radius}px !important;` : ""}
}
[data-composer-card-holder] { background: transparent !important; }
`;

export default definePlugin({
    name: "ComposerLook",
    title: { zh: "输入框外观", en: "Composer look" },
    description: { zh: "调整输入框背景的不透明度、毛玻璃模糊与圆角。", en: "Tune the chat input's background opacity, frosted blur and corner radius." },
    category: "composer",
    tags: ["appearance"],
    icon: "blend",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        const css = () => composerCss(settings.store.opacity, settings.store.blur, settings.store.radius);
        const set = addStyle(scope, css(), "composer-look");
        this.onSettingsChange = () => set(css());
    },
});
