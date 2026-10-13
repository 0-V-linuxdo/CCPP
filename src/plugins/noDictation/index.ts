/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    dictation: { type: "boolean", label: { zh: "隐藏听写按钮", en: "Hide dictation" }, default: true },
    voice: { type: "boolean", label: { zh: "隐藏语音模式按钮", en: "Hide voice mode" }, default: true },
});

export function noDictationCss(dictation: boolean, voice: boolean) {
    const selectors = [
        ...(dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]'] : []),
        ...(voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]'] : []),
    ];
    return selectors.length ? `${selectors.map(s => `[data-cds="ChatComposer"] ${s}`).join(",\n")} { display: none !important; }` : "";
}

export default definePlugin({
    name: "NoDictation",
    title: { zh: "隐藏语音按钮", en: "No voice buttons" },
    description: { zh: "隐藏输入框里的听写 / 语音模式按钮。", en: "Hides the dictation and voice-mode buttons in the chat input." },
    category: "declutter",
    icon: "micOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        addStyle(scope, noDictationCss(settings.store.dictation, settings.store.voice), "no-dictation");
    },
});
