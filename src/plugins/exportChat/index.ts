/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { download, fileSafe, h } from "@lib/dom";
import { icon } from "@lib/icons";
import { createPopover } from "@lib/popover";
import type { Conversation } from "@api/claude";
import { toast } from "@api/notices";
import { currentRoute } from "@api/router";
import { addSlotItem, slotButton } from "@api/slots";
import { loadConversation } from "@api/transcript";

const settings = definePluginSettings({
    timestamps: { type: "boolean", label: { zh: "Markdown 里包含时间", en: "Include times in Markdown" }, default: true },
});

const L = {
    title: { zh: "导出对话", en: "Export chat" },
    md: { zh: "Markdown (.md)", en: "Markdown (.md)" },
    txt: { zh: "纯文本 (.txt)", en: "Plain text (.txt)" },
    json: { zh: "JSON (.json)", en: "JSON (.json)" },
    copy: { zh: "复制为 Markdown", en: "Copy as Markdown" },
    copied: { zh: "已复制到剪贴板", en: "Copied to the clipboard" },
    failed: { zh: "导出失败：{e}", en: "Export failed: {e}" },
    note: { zh: "导出当前显示的分支，内容来自 claude.ai 接口。", en: "Exports the branch on screen, read from claude.ai's API." },
};

const stamp = (at: number | null) => (at ? new Date(at).toLocaleString() : "");

export function toMarkdown(chat: Conversation, timestamps: boolean) {
    const head = [`# ${chat.name || "Claude chat"}`, "", `- URL: https://claude.ai/chat/${chat.uuid}`, chat.model ? `- Model: ${chat.model}` : "", chat.createdAt ? `- Created: ${stamp(chat.createdAt)}` : ""].filter(line => line !== "");
    const body = chat.messages.map(m => {
        const who = m.role === "user" ? "## 🧑 You" : "## 🤖 Claude";
        return `${who}${timestamps && m.createdAt ? ` · ${stamp(m.createdAt)}` : ""}\n\n${m.text.trim()}`;
    });
    return `${head.join("\n")}\n\n${body.join("\n\n---\n\n")}\n`;
}

export function toText(chat: Conversation) {
    return `${chat.name}\n\n${chat.messages.map(m => `[${m.role === "user" ? "You" : "Claude"}]\n${m.text.trim()}`).join("\n\n")}\n`;
}

export default definePlugin({
    name: "ExportChat",
    title: L.title,
    description: { zh: "对话标题栏加一个导出按钮：下载 Markdown / 纯文本 / JSON，或复制为 Markdown。", en: "An export button in the chat header: download Markdown, text or JSON, or copy as Markdown." },
    category: "chats",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["TranscriptApi", "SlotsApi", "NoticesApi", "RouterApi"],
    settings,
    start(scope) {
        const popover = createPopover(scope, "export", "", 240);
        const run = async (format: "md" | "txt" | "json" | "copy") => {
            popover.close();
            try {
                const chat = await loadConversation(currentRoute().chatId, true);
                if (!chat) return;
                const name = fileSafe(chat.name || chat.uuid);
                if (format === "json") download(`${name}.json`, JSON.stringify(chat, null, 2), "application/json");
                else if (format === "txt") download(`${name}.txt`, toText(chat));
                else {
                    const md = toMarkdown(chat, settings.store.timestamps);
                    if (format === "md") download(`${name}.md`, md, "text/markdown");
                    else {
                        await navigator.clipboard.writeText(md);
                        toast(t(L.copied), { kind: "ok", timeoutMs: 2500 });
                    }
                }
            } catch (error) {
                toast(t(L.failed).replace("{e}", (error as Error).message || String(error)), { kind: "error" });
            }
        };
        addSlotItem(scope, "header", "export", () => {
            const btn = slotButton(t(L.title), event => popover.open(event.currentTarget as HTMLElement, panel => {
                panel.appendChild(h("div", { class: "top" }, icon("download", 16), h("b", { text: t(L.title) })));
                for (const [format, label] of [["md", L.md], ["txt", L.txt], ["json", L.json], ["copy", L.copy]] as const) {
                    const item = h("button", { type: "button", class: "item", text: t(label) });
                    item.addEventListener("click", () => void run(format));
                    panel.appendChild(item);
                }
                panel.appendChild(h("div", { class: "msg", text: t(L.note), style: { fontSize: "12px" } }));
            }), icon("download", 16));
            btn.hidden = !currentRoute().chatId;
            return btn;
        }, 20);
    },
});
