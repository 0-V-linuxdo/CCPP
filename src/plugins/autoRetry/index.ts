/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { getText, onSubmit } from "@api/composer";
import { SEL } from "@api/dom";
import { toast } from "@api/notices";

const settings = definePluginSettings({
    maxRetries: { type: "number", label: { zh: "最多连续重试几次", en: "Maximum retries in a row" }, default: 3, min: 1, max: 10 },
    delay: { type: "number", label: { zh: "重试前等待", en: "Wait before retrying" }, default: 2, min: 0, max: 60, unit: "s" },
});

const L = {
    retrying: { zh: "发送失败，正在重试（{n}/{max}）", en: "Couldn't send, retrying ({n}/{max})" },
    gaveUp: { zh: "已重试 {max} 次仍未发出，请稍后手动发送。", en: "Still not sent after {max} retries. Send it again later." },
    changed: { zh: "输入框内容已改动，没有自动重试。", en: "The message box changed, so it wasn't retried." },
};

const norm = (text: string) => text.replace(/\s+/g, " ").trim();
const fill = (text: string, n: number, max: number) => text.replace("{n}", String(n)).replace(/\{max\}/g, String(max));

/** The send button next to an editor: a project page can show two composers (the chat and a thread). */
function sendButtonFor(editor: HTMLElement) {
    let near: HTMLElement | null = editor;
    while (near && !near.querySelector(SEL.sendButton)) near = near.parentElement;
    return near?.querySelector<HTMLButtonElement>(SEL.sendButton) ?? null;
}

/** Sends what the editor holds, the way the user would: the send button, or Enter. */
function resend(editor: HTMLElement) {
    const button = sendButtonFor(editor);
    if (button && !button.disabled) return button.click();
    editor.focus();
    editor.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", keyCode: 13, bubbles: true, cancelable: true }));
}

export default definePlugin({
    name: "AutoRetry",
    title: { zh: "发送失败自动重试", en: "Auto retry" },
    description: {
        zh: "Claude Code 项目页弹出「Couldn't send the message」时，自动把放回输入框的消息重新发送，可设次数和间隔。",
        en: "When a Claude Code project page says \"Couldn't send the message\", sends the message claude.ai put back in the box again. Retries and delay are adjustable.",
    },
    category: "chats",
    icon: "refresh",
    enabledByDefault: true,
    updatedAt: "2026-10-24",
    dependencies: ["ChatStateApi", "ComposerApi", "NoticesApi"],
    settings,
    start(scope) {
        // The last message sent and the editor it came from; claude.ai puts the text back there when it fails.
        let last: { text: string; editor: HTMLElement | null } | null = null;
        const counts = new Map<string, number>();
        let timer: ReturnType<typeof setTimeout> | undefined;
        scope.defer(() => clearTimeout(timer));

        onSubmit(scope, (text, editor) => {
            last = { text: norm(text), editor };
        });
        scope.on("send:ok", ({ channelId }) => {
            counts.delete(channelId);
        });
        scope.on("send:failed", ({ channelId }) => {
            const sent = last;
            if (!sent?.editor) return;
            const max = settings.store.maxRetries;
            const count = (counts.get(channelId) ?? 0) + 1;
            if (count > max) {
                counts.delete(channelId);
                toast(fill(t(L.gaveUp), count, max), { kind: "error", key: "auto-retry", timeoutMs: 8000 });
                return;
            }
            counts.set(channelId, count);
            toast(fill(t(L.retrying), count, max), { kind: "warn", key: "auto-retry" });
            clearTimeout(timer);
            timer = setTimeout(() => {
                const editor = sent.editor!;
                // Only resend what claude.ai put back; anything the user typed since is theirs.
                if (!editor.isConnected || norm(getText(editor)) !== sent.text) {
                    counts.delete(channelId);
                    toast(t(L.changed), { kind: "info", key: "auto-retry" });
                    return;
                }
                resend(editor);
            }, settings.store.delay * 1000);
        });
    },
});
