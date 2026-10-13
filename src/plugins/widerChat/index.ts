/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    width: { type: "number", label: { zh: "对话最大宽度", en: "Maximum chat width" }, default: 64, min: 40, max: 160, step: 2, unit: "rem" },
    composer: { type: "boolean", label: { zh: "输入框同步加宽", en: "Widen the chat input too" }, default: true },
});

export const widerCss = (width: number, composer: boolean) => `
:root { --transcript-width: ${width}rem !important; }
[data-testid="transcript-list"] { max-width: ${width}rem !important; }
${composer ? `[data-composer-card-holder], [data-cds="ChatComposer"] { max-width: ${width}rem !important; }
[data-composer-card-holder] { margin-inline: auto; }` : ""}
`;

export default definePlugin({
    name: "WiderChat",
    title: { zh: "加宽对话", en: "Wider chat" },
    description: { zh: "调整对话区（以及输入框）的最大宽度，宽屏上一屏看更多。", en: "Sets the maximum width of the conversation (and the input) for wide screens." },
    category: "appearance",
    icon: "width",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        const set = addStyle(scope, widerCss(settings.store.width, settings.store.composer), "wider-chat");
        this.onSettingsChange = () => set(widerCss(settings.store.width, settings.store.composer));
    },
});
