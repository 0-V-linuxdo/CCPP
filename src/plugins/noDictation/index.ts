/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";
import { onDomChange, SEL } from "@api/dom";

const settings = definePluginSettings({
    dictation: { type: "boolean", label: { zh: "隐藏听写按钮", en: "Hide dictation" }, default: true },
    voice: { type: "boolean", label: { zh: "隐藏语音模式按钮", en: "Hide voice mode" }, default: true },
    readAloud: { type: "boolean", label: { zh: "隐藏回复下方的「朗读」按钮", en: "Hide Read aloud under replies" }, default: false },
});

const MARK = "data-ccpp-no-dictation";
/** Anthropicons' microphone glyph, as the Claude Code mic draws it (2026-11; micOff is U+E0AD). */
const MIC_GLYPH = "\ue0ab";
const MIC_TEXT = /dictat|microphone|\bmic\b|voice|speech|hold to record|听写|语音|麦克风|录音/i;

/** Everything a button says about itself: its label, title, tooltip and screen-reader text. */
function buttonText(button: Element) {
    const described = (button.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean).map(id => document.getElementById(id)?.textContent ?? "");
    const srOnly = [...button.querySelectorAll(".sr-only")].map(el => el.textContent ?? "");
    return [button.getAttribute("aria-label"), button.getAttribute("title"), button.getAttribute("data-testid"), ...described, ...srOnly].filter(Boolean).join(" ");
}

/**
 * Whether a composer button is the dictation / voice button. claude.ai keeps renaming it (and the Claude Code
 * composer's mic can come without any label), so besides its text the mic icon itself counts: an Anthropicons
 * glyph or a lucide svg.
 */
export function isMicButton(button: Element) {
    if (button.matches(SEL.sendButton) || button.closest(SEL.editor)) return false;
    if (MIC_TEXT.test(buttonText(button))) return true;
    if ([...button.querySelectorAll('[data-cds="Icon"]')].some(icon => icon.textContent?.trim() === MIC_GLYPH)) return true;
    return !!button.querySelector('svg.lucide-mic, svg[class*="lucide-mic"], svg[data-icon*="mic" i], svg[data-icon*="microphone" i]');
}

/** The buttons around each prompt box: walk up from the editor until an ancestor holds a row of buttons. */
function composerButtons(): Element[] {
    const out = new Set<Element>();
    for (const editor of document.querySelectorAll(SEL.editor)) {
        let node: Element | null = editor;
        for (let depth = 0; node && depth < 8; depth++, node = node.parentElement) {
            if (node === document.body) break;
            for (const b of node.querySelectorAll("button")) out.add(b);
            if (node.querySelector(SEL.sendButton) && depth >= 3) break;
        }
    }
    return [...out];
}

export function noDictationCss(dictation: boolean, voice: boolean, readAloud = false) {
    const selectors = [
        // The Claude Code mic is "Press and hold to record" (2026-11). The chevron next to the mic opens dictation settings ("Hold to record"); the Claude Code composer
        // is not a ChatComposer, so these labels are matched anywhere.
        ...(dictation ? ['button[aria-label="Dictate"]', 'button[aria-label="Microphone"]', '[data-testid="chin-mic"]', 'button[aria-label="Dictation settings"]', 'button[aria-label^="Dictation" i]', 'button[aria-label*="dictat" i]', 'button[aria-label*="hold to record" i]'] : []),
        ...(voice ? ['button[aria-label="Use voice mode"]', 'button[aria-label="Voice input"]', 'button[aria-label*="voice mode" i]'] : []),
        // Buttons the composer scan below recognised by their text or mic icon.
        ...(dictation || voice ? [`[${MARK}]`] : []),
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
    enabledByDefault: true,
    dependencies: ["StylesApi", "DomApi"],
    settings,
    start(scope) {
        const { dictation, voice, readAloud } = settings.store;
        addStyle(scope, noDictationCss(dictation, voice, readAloud), "no-dictation");
        if (!dictation && !voice) return;
        onDomChange(scope, () => {
            for (const b of composerButtons()) if (!b.hasAttribute(MARK) && isMicButton(b)) b.setAttribute(MARK, "");
        });
        scope.defer(() => document.querySelectorAll(`[${MARK}]`).forEach(el => el.removeAttribute(MARK)));
    },
});
