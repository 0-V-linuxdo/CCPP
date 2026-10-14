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
    readAloud: { type: "boolean", label: { zh: "隐藏回复下方的「朗读」按钮", en: "Hide Read aloud under replies" }, default: true },
});

export function noDictationCss(dictation: boolean, voice: boolean, readAloud = false) {
    const selectors = [
        // The chevron next to the mic opens dictation settings ("Hold to record"); the Claude Code composer
        // is not a ChatComposer, so these labels are matched anywhere.
        ...(dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]', 'button[aria-label="Dictation settings"]', 'button[aria-label^="Dictation" i]', 'button[aria-label*="dictat" i]'] : []),
        ...(voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]', 'button[aria-label*="voice mode" i]'] : []),
        ...(readAloud ? ['[data-testid="action-bar-read-aloud"]', 'button[aria-label="Read aloud"]'] : []),
    ];
    return selectors.length ? `${selectors.join(",\n")} { display: none !important; }` : "";
}

export default definePlugin({
    name: "NoDictation",
    title: { zh: "隐藏语音按钮", en: "No voice buttons" },
    description: { zh: "隐藏输入框里的听写 / 语音模式按钮、听写设置（按住录音）入口，以及回复下方的「朗读」按钮，普通对话和 Claude Code 都适用。", en: "Hides the dictation and voice-mode buttons, the dictation settings (hold to record) menu and Read aloud under replies, in chats and Claude Code." },
    category: "declutter",
    icon: "micOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        addStyle(scope, noDictationCss(settings.store.dictation, settings.store.voice, settings.store.readAloud), "no-dictation");
    },
});
