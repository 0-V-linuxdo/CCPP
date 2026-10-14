/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { isShown } from "@lib/dom";
import { SEL } from "@api/dom";

/** The visible chat input (a ProseMirror editor). */
export function getEditor(): HTMLElement | null {
    const all = [...document.querySelectorAll<HTMLElement>(SEL.editor)];
    return all.find(el => el === document.activeElement) ?? all.find(isShown) ?? null;
}

/** Plain text of the editor, one line per paragraph. */
export function getText(editor = getEditor()): string {
    if (!editor || editor.dataset.docEmpty === "true") return "";
    const blocks = [...editor.children] as HTMLElement[];
    if (!blocks.length) return editor.innerText.trim();
    return blocks.map(block => block.innerText.replace(/\n$/, "")).join("\n").replace(/ /g, " ").trim();
}

function selectAll(editor: HTMLElement) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

/** Puts the caret at the end of the editor. */
export function caretToEnd(editor = getEditor()) {
    if (!editor) return;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

/**
 * Inserts text the way a user paste would, so ProseMirror keeps its state in sync
 * (multi-line text becomes paragraphs). Falls back to execCommand when paste is ignored.
 */
export function insertText(text: string, editor = getEditor()) {
    if (!editor) return false;
    editor.focus();
    const data = new DataTransfer();
    data.setData("text/plain", text);
    const event = new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true });
    editor.dispatchEvent(event);
    if (!event.defaultPrevented) document.execCommand("insertText", false, text);
    return true;
}

/** Replaces everything in the editor. An empty string clears it. */
export function setText(text: string, editor = getEditor()) {
    if (!editor) return false;
    // ProseMirror only picks up a DOM selection, or a delete, in its own time: a paste dispatched right
    // after selecting lands at the old caret, and one right after a delete is swallowed. Typing over the
    // selection goes through its input path at once; multi-line text is pasted a frame after clearing so
    // it keeps its paragraphs.
    selectAll(editor);
    if (!text) {
        document.execCommand("delete");
        return true;
    }
    if (!text.includes("\n")) {
        if (document.execCommand("insertText", false, text)) return true;
    }
    document.execCommand("delete");
    requestAnimationFrame(() => setTimeout(() => insertText(text, editor), 30));
    return true;
}

/**
 * Calls `fn` with the prompt just before it is sent (Enter without Shift, or the send
 * button). Runs in the capture phase so the text is still in the editor.
 */
export function onSubmit(scope: Scope, fn: (text: string) => void) {
    scope.listen(
        document,
        "keydown",
        (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return;
            const target = event.target as HTMLElement | null;
            if (!target?.closest?.(SEL.editor)) return;
            const text = getText(target.closest(SEL.editor) as HTMLElement);
            if (text) fn(text);
        },
        { capture: true },
    );
    scope.listen(
        document,
        "click",
        (event: MouseEvent) => {
            const button = (event.target as HTMLElement | null)?.closest?.(SEL.sendButton) as HTMLButtonElement | null;
            if (!button || button.disabled) return;
            const text = getText();
            if (text) fn(text);
        },
        { capture: true },
    );
}

export default definePlugin({
    name: "ComposerApi",
    title: { zh: "输入框", en: "Composer API" },
    description: { zh: "读写 claude.ai 输入框内容、感知发送动作。", en: "Read and write the chat input and know when a prompt is sent." },
    category: "api",
    icon: "keyboard",
    hidden: true,
    start() {},
});
