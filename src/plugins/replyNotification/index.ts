/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { toast } from "@api/notices";
import { currentRoute } from "@api/router";

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
    test: { type: "action", label: { zh: "试一下", en: "Try it" }, button: { zh: "发送测试提醒", en: "Send a test" }, run: () => notify({ chatId: currentRoute().chatId, title: "CC++", durationMs: 0, at: Date.now() }, true) },
});

const L = {
    done: { zh: "Claude 回复完成", en: "Claude finished replying" },
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

function notify(event: { chatId: string | null; title: string; durationMs: number; at: number }, test = false) {
    const body = [event.title, event.durationMs ? t(L.took).replace("{s}", String(Math.round(event.durationMs / 1000))) : ""].filter(Boolean).join(" · ");
    const back = () => {
        window.focus();
        if (event.chatId && currentRoute().chatId !== event.chatId) location.assign(`/chat/${event.chatId}`);
    };
    if (settings.store.sound) chime(settings.store.volume);
    if (settings.store.toast) toast(body, { title: t(L.done), kind: "ok", onClick: back, key: "reply-done" });
    if (settings.store.desktop && "Notification" in window) {
        const show = () => {
            try {
                const n = new Notification(t(L.done), { body: `${body}\n${t(L.open)}`, tag: `ccpp-${event.chatId ?? "reply"}`, silent: true });
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
    dependencies: ["ChatStateApi", "NoticesApi", "RouterApi"],
    settings,
    start(scope) {
        scope.on("reply:end", event => {
            if (event.durationMs < settings.store.minSeconds * 1000) return;
            if (settings.store.when === "hidden" && !document.hidden && document.hasFocus()) return;
            notify(event);
        });
        // Ask for permission on the first click after enabling, since browsers require a gesture.
        if (settings.store.desktop && "Notification" in window && Notification.permission === "default") {
            scope.listen(document, "pointerdown", () => void Notification.requestPermission(), { once: true });
        }
    },
});
