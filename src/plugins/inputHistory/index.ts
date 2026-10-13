/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { h } from "@lib/dom";
import { snippet } from "@lib/format";
import { icon } from "@lib/icons";
import { createPopover } from "@lib/popover";
import { caretToEnd, getEditor, getText, onSubmit, setText } from "@api/composer";
import { SEL } from "@api/dom";
import { addSlotItem, slotButton } from "@api/slots";

const settings = definePluginSettings({
    max: { type: "number", label: { zh: "最多保存几条", en: "Prompts to keep" }, default: 100, min: 10, max: 1000, step: 10 },
    button: { type: "boolean", label: { zh: "在输入框旁显示历史按钮", en: "History button next to the model picker" }, default: false },
    clear: { type: "action", label: { zh: "清空历史", en: "Clear history" }, button: { zh: "清空", en: "Clear" }, confirm: { zh: "清空全部输入历史？", en: "Clear all prompt history?" }, run: () => history.set([]) },
});

const L = {
    title: { zh: "输入历史", en: "Prompt history" },
    empty: { zh: "还没有历史。发送过的提问会出现在这里。", en: "No history yet. Prompts you send show up here." },
    hint: { zh: "在空输入框里按 ↑ / ↓ 翻阅，Esc 恢复草稿", en: "↑ / ↓ in the input to browse, Esc restores your draft" },
};

const history = persisted<string[]>("input-history", [], (v): v is string[] => Array.isArray(v) && v.every(x => typeof x === "string"));

/** Newest first, no duplicates, trimmed to `max`. */
export function remember(list: string[], text: string, max: number) {
    const clean = text.trim();
    if (!clean) return list;
    return [clean, ...list.filter(item => item !== clean)].slice(0, max);
}

/** Whether the caret sits on the first (or last) line, where ↑ (or ↓) should leave the text. */
function caretAtEdge(editor: HTMLElement, edge: "start" | "end") {
    const selection = getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    const caret = range.getClientRects()[0] ?? (range.startContainer as Element).getBoundingClientRect?.();
    const box = editor.getBoundingClientRect();
    if (!caret) return true;
    const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 20;
    return edge === "start" ? caret.top - box.top < lineHeight * 1.2 : box.bottom - caret.bottom < lineHeight * 1.2;
}

export default definePlugin({
    name: "InputHistory",
    title: { zh: "输入历史", en: "Input history" },
    description: {
        zh: "像终端一样用 ↑ / ↓ 调出之前发送过的提问，Esc 恢复草稿；可选在输入框旁显示历史列表。",
        en: "Recall earlier prompts with ↑ / ↓ like a shell; Esc restores the draft. Optional history list next to the model picker.",
    },
    category: "composer",
    icon: "history",
    enabledByDefault: true,
    dependencies: ["ComposerApi", "SlotsApi"],
    settings,
    start(scope) {
        let cursor = -1;
        let draft = "";
        let applied = "";

        onSubmit(scope, text => {
            history.set(remember(history.get(), text, settings.store.max));
            cursor = -1;
            draft = "";
        });

        const show = (text: string) => {
            applied = text;
            setText(text);
            requestAnimationFrame(() => caretToEnd());
        };

        scope.listen(document, "keydown", (event: KeyboardEvent) => {
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing) return;
            const editor = (event.target as HTMLElement | null)?.closest?.(SEL.editor) as HTMLElement | null;
            if (!editor) return;
            const list = history.get();
            const current = getText(editor);
            // Typing over a recalled prompt makes it a new draft.
            if (cursor >= 0 && current !== applied) cursor = -1;
            if (event.key === "ArrowUp") {
                if (!list.length || (current && cursor < 0) || !caretAtEdge(editor, "start")) return;
                if (cursor >= list.length - 1) return;
                if (cursor < 0) draft = current;
                cursor++;
            } else if (event.key === "ArrowDown") {
                if (cursor < 0 || !caretAtEdge(editor, "end")) return;
                cursor--;
                if (cursor < 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    show(draft);
                    return;
                }
            } else if (event.key === "Escape") {
                if (cursor < 0) return;
                cursor = -1;
                event.preventDefault();
                event.stopPropagation();
                show(draft);
                return;
            } else return;
            event.preventDefault();
            event.stopPropagation();
            show(list[cursor]);
        }, { capture: true });

        if (settings.store.button) {
            const popover = createPopover(scope, "input-history", "", 360);
            addSlotItem(scope, "composer", "input-history", () =>
                slotButton(t(L.title), event => popover.open(event.currentTarget as HTMLElement, (panel, close) => {
                    panel.appendChild(h("div", { class: "top" }, icon("history", 16), h("b", { text: t(L.title) })));
                    panel.appendChild(h("div", { class: "msg", text: t(L.hint), style: { fontSize: "12px" } }));
                    const list = history.get();
                    if (!list.length) panel.appendChild(h("div", { class: "msg", text: t(L.empty) }));
                    for (const text of list.slice(0, 50)) {
                        const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow clip2", text: snippet(text, 200) }));
                        item.addEventListener("click", () => {
                            close();
                            getEditor()?.focus();
                            show(text);
                        });
                        panel.appendChild(item);
                    }
                }), icon("history", 16)), 20);
        }
    },
});
