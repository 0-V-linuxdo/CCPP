/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { snippet } from "@lib/format";
import { getConversation } from "@api/claude";
import { toast } from "@api/notices";
import { currentRoute, onRoute } from "@api/router";

const settings = definePluginSettings({
    when: {
        type: "select",
        label: { zh: "什么时候提醒", en: "Notify when" },
        default: "hidden",
        options: [
            { value: "hidden", label: { zh: "标签页不在前台时", en: "The tab is in the background" } },
            { value: "always", label: { zh: "每次回复完成", en: "Every reply finishes" } },
        ],
    },
    minSeconds: { type: "number", label: { zh: "回复至少持续多久才提醒", en: "Only replies longer than" }, default: 5, min: 0, max: 120, unit: "s" },
    sound: { type: "boolean", label: { zh: "提示音", en: "Sound" }, default: true },
    volume: { type: "number", label: { zh: "音量", en: "Volume" }, default: 40, min: 5, max: 100, step: 5, unit: "%", visible: v => v.sound === true },
    desktop: { type: "boolean", label: { zh: "系统通知", en: "Desktop notification" }, default: true },
    toast: { type: "boolean", label: { zh: "页面内提示条", en: "In-page toast" }, default: true },
    others: {
        type: "boolean",
        label: { zh: "其它对话完成也提醒", en: "Also for other chats" },
        description: { zh: "侧栏里正在回复的对话完成时弹提示条，点击打开。", en: "A toast when a chat replying in the sidebar finishes; click to open it." },
        default: true,
    },
    preview: { type: "boolean", label: { zh: "提示条显示回复开头", en: "Preview the reply" }, default: true },
    keep: { type: "boolean", label: { zh: "提示条保持到手动关闭", en: "Keep toasts until dismissed" }, description: { zh: "点 × 或打开该对话才关闭。", en: "Close with × or by opening the chat." }, default: false },
    toastSec: { type: "number", label: { zh: "提示条停留", en: "Toast stays for" }, default: 6, min: 2, max: 30, unit: "s", visible: v => !v.keep },
    test: { type: "action", label: { zh: "试一下", en: "Try it" }, button: { zh: "发送测试提醒", en: "Send a test" }, run: () => notify({ chatId: currentRoute().chatId, title: "CC++", durationMs: 0, at: Date.now() }, true) },
});

const L = {
    done: { zh: "Claude 回复完成", en: "Claude finished replying" },
    otherDone: { zh: "另一个对话回复完成", en: "Another chat finished" },
    otherError: { zh: "另一个对话回复出错", en: "Another chat hit an error" },
    took: { zh: "用时 {s} 秒", en: "Took {s}s" },
    open: { zh: "点击回到对话", en: "Click to return to the chat" },
};

/** A short two-note chime made with Web Audio; no sound file is downloaded. */
export function chime(volume: number) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.3;
    gain.connect(ctx.destination);
    [880, 1318.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = ctx.currentTime + i * 0.14;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, start);
        env.gain.linearRampToValueAtTime(1, start + 0.02);
        env.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
        osc.connect(env).connect(gain);
        osc.start(start);
        osc.stop(start + 0.55);
    });
    setTimeout(() => void ctx.close(), 1200);
}

/** Open toasts by chat, so opening that chat closes its toast. */
const openToasts = new Map<string, () => void>();

/** Opens a chat in place through its sidebar link when there is one, else by loading it. */
function openChat(chatId: string) {
    window.focus();
    if (currentRoute().chatId === chatId) return;
    const link = document.querySelector<HTMLAnchorElement>(`a[href="/chat/${chatId}"]`);
    if (link) link.click();
    else location.assign(`/chat/${chatId}`);
}

/** Every claude.ai tab sees the same chat finish; only the first one to notice says so. */
function claim(chatId: string | null) {
    if (!chatId) return true;
    const key = `ccpp:replyNotified:${chatId}`;
    try {
        const last = Number(localStorage.getItem(key));
        if (Date.now() - last < 15000) return false;
        localStorage.setItem(key, String(Date.now()));
    } catch {}
    return true;
}

interface DoneEvent {
    chatId: string | null;
    title: string;
    durationMs: number;
    at: number;
    /** Finished in a chat other than the open one. */
    other?: boolean;
    error?: boolean;
    preview?: string;
}

async function previewOf(chatId: string | null) {
    if (!chatId || !settings.store.preview) return "";
    try {
        const reply = (await getConversation(chatId)).messages.filter(m => m.role === "assistant").at(-1);
        return reply ? snippet(reply.text, 100) : "";
    } catch {
        return "";
    }
}

function notify(event: DoneEvent, test = false) {
    const body = [event.title, event.durationMs ? t(L.took).replace("{s}", String(Math.round(event.durationMs / 1000))) : ""].filter(Boolean).join(" · ");
    const title = event.other ? t(event.error ? L.otherError : L.otherDone) : t(L.done);
    const back = () => {
        window.focus();
        if (event.chatId) openChat(event.chatId);
    };
    const away = test || settings.store.when === "always" || document.hidden || !document.hasFocus();
    if (settings.store.sound && away) chime(settings.store.volume);
    if (settings.store.toast || event.other) {
        const key = event.chatId ? `reply-${event.chatId}` : "reply-done";
        const close = toast([body, event.preview].filter(Boolean).join("\n"), { title, kind: event.error ? "error" : "ok", onClick: back, key, timeoutMs: settings.store.keep ? 0 : settings.store.toastSec * 1000 });
        if (event.chatId) openToasts.set(event.chatId, close);
    }
    if (!away) return;
    if (settings.store.desktop && "Notification" in window) {
        const show = () => {
            try {
                const n = new Notification(title, { body: `${[body, event.preview].filter(Boolean).join("\n")}\n${t(L.open)}`, tag: `ccpp-${event.chatId ?? "reply"}`, silent: true });
                n.onclick = () => {
                    back();
                    n.close();
                };
            } catch {}
        };
        if (Notification.permission === "granted") show();
        else if (Notification.permission === "default" && test) void Notification.requestPermission().then(p => p === "granted" && show());
    }
}

export type RowState = "working" | "idle" | "error";

/** Sidebar chats claude.ai marks as replying (data-attention="working" on the row label), by chat id. */
export function readRows(root: ParentNode = document) {
    const rows = new Map<string, { state: RowState; title: string }>();
    for (const link of root.querySelectorAll<HTMLAnchorElement>('a[href^="/chat/"][data-row-main-button]')) {
        const id = /^\/chat\/([0-9a-f-]{36})/i.exec(link.getAttribute("href") ?? "")?.[1]?.toLowerCase();
        if (!id) continue;
        const attention = link.querySelector("[data-attention]")?.getAttribute("data-attention") ?? "";
        const state: RowState = attention === "working" ? "working" : /error|fail/i.test(attention) ? "error" : "idle";
        const label = link.querySelector("[data-row-label]");
        const shimmer = label?.querySelector('[data-cds="ShimmerText"]');
        const title = ((shimmer?.firstChild?.textContent ?? label?.textContent) || "").trim();
        const prev = rows.get(id);
        if (!prev || state === "working") rows.set(id, { state, title: title || prev?.title || "" });
    }
    return rows;
}

/**
 * Chats that were replying and now show no longer do. A chat whose row is out of view keeps its
 * last state until the row shows again.
 */
export function finished(working: Map<string, { since: number; title: string }>, rows: Map<string, { state: RowState; title: string }>, now: number) {
    const done: { chatId: string; title: string; durationMs: number; error: boolean }[] = [];
    for (const [chatId, row] of rows) {
        const was = working.get(chatId);
        if (row.state === "working") {
            if (!was) working.set(chatId, { since: now, title: row.title });
            continue;
        }
        if (!was) continue;
        working.delete(chatId);
        done.push({ chatId, title: row.title || was.title, durationMs: now - was.since, error: row.state === "error" });
    }
    return done;
}

export default definePlugin({
    name: "ReplyNotification",
    title: { zh: "回复完成提醒", en: "Reply notification" },
    description: {
        zh: "Claude 回复完成时播放提示音、弹出系统通知或页面提示条（默认只在标签页处于后台时）。",
        en: "Plays a chime, shows a desktop notification or an in-page toast when Claude finishes (by default only while the tab is in the background).",
    },
    category: "notifications",
    icon: "bell",
    enabledByDefault: true,
    dependencies: ["ChatStateApi", "NoticesApi", "RouterApi", "ClaudeApi"],
    settings,
    start(scope) {
        scope.on("reply:end", event => {
            if (event.durationMs < settings.store.minSeconds * 1000) return;
            if (settings.store.when === "hidden" && !document.hidden && document.hasFocus()) return;
            if (!claim(event.chatId)) return;
            void previewOf(event.chatId).then(preview => scope.alive && notify({ ...event, preview }));
        });
        // Other chats: claude.ai's sidebar already knows which ones are replying.
        const working = new Map<string, { since: number; title: string }>();
        scope.interval(() => {
            const rows = readRows();
            for (const done of finished(working, rows, Date.now())) {
                if (!settings.store.others || done.chatId === currentRoute().chatId) continue;
                if (!claim(done.chatId)) continue;
                void previewOf(done.chatId).then(preview => scope.alive && notify({ ...done, at: Date.now(), other: true, preview }));
            }
        }, 1000);
        // Opening a chat closes its toast.
        onRoute(scope, route => {
            const close = route.chatId ? openToasts.get(route.chatId) : undefined;
            if (close) {
                close();
                openToasts.delete(route.chatId!);
            }
        });
        scope.defer(() => openToasts.clear());
        // Ask for permission on the first click after enabling, since browsers require a gesture.
        if (settings.store.desktop && "Notification" in window && Notification.permission === "default") {
            scope.listen(document, "pointerdown", () => void Notification.requestPermission(), { once: true });
        }
    },
});
