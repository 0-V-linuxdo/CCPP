/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { snippet } from "@lib/format";
import { icon } from "@lib/icons";
import { createPopover } from "@lib/popover";
import { getEditor, insertText, setText } from "@api/composer";
import { addSlotItem, slotButton } from "@api/slots";

const settings = definePluginSettings({
    presets: {
        type: "text",
        label: { zh: "预设", en: "Presets" },
        description: { zh: "每段一个预设，段与段之间空一行；第一行是标题。正文里的 \\n 会换行。", en: "One preset per block, blocks separated by a blank line; the first line is the title." },
        rows: 10,
        default: t({
            zh: "翻译成中文\n把下面的内容翻译成自然流畅的中文：\n\n逐行解释代码\n逐行解释下面的代码，指出潜在问题：\n\n总结要点\n用 5 条以内的要点总结：",
            en: "Translate to English\nTranslate the following into natural, fluent English:\n\nExplain code line by line\nExplain the following code line by line and point out potential problems:\n\nSummarize\nSummarize in at most 5 bullet points:",
        }),
    },
    mode: {
        type: "select",
        label: { zh: "点击预设时", en: "Clicking a preset" },
        default: "insert",
        options: [
            { value: "insert", label: { zh: "插入到光标处", en: "Inserts at the caret" } },
            { value: "replace", label: { zh: "替换输入框内容", en: "Replaces the input" } },
        ],
    },
});

const L = {
    title: { zh: "提示词预设", en: "Prompt presets" },
    empty: { zh: "还没有预设，在 CC++ 设置里添加。", en: "No presets yet; add some in CC++ settings." },
};

export interface Preset {
    title: string;
    body: string;
}

export function parsePresets(source: string): Preset[] {
    return source
        .split(/\n\s*\n/)
        .map(block => block.split("\n"))
        .filter(lines => lines[0]?.trim())
        .map(([title, ...rest]) => ({ title: title.trim(), body: (rest.join("\n").trim() || title.trim()).replace(/\\n/g, "\n") }));
}

export default definePlugin({
    name: "PromptPresets",
    title: L.title,
    description: { zh: "输入框旁的预设按钮，一键插入常用提示词。", en: "A button next to the model picker that inserts saved prompts." },
    category: "composer",
    icon: "fileText",
    enabledByDefault: false,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings,
    start(scope) {
        const popover = createPopover(scope, "presets", "", 320);
        addSlotItem(scope, "composer", "presets", () =>
            slotButton(t(L.title), event => popover.open(event.currentTarget as HTMLElement, (panel, close) => {
                panel.appendChild(h("div", { class: "top" }, icon("fileText", 16), h("b", { text: t(L.title) })));
                const presets = parsePresets(settings.store.presets);
                if (!presets.length) panel.appendChild(h("div", { class: "msg", text: t(L.empty) }));
                for (const preset of presets) {
                    const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow" }, h("div", { class: "clip", text: preset.title, style: { fontWeight: "600" } }), h("div", { class: "sub clip", text: snippet(preset.body, 80) })));
                    item.addEventListener("click", () => {
                        close();
                        const editor = getEditor();
                        if (!editor) return;
                        if (settings.store.mode === "replace") setText(preset.body, editor);
                        else insertText(preset.body, editor);
                    });
                    panel.appendChild(item);
                }
            }), icon("fileText", 16)), 30);
    },
});
