/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { dateTimeText, fullDateText } from "@lib/format";
import { SEL, watch } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    always: { type: "boolean", label: { zh: "始终显示时间（不用悬停）", en: "Always show the time (no hover needed)" }, default: true },
    absolute: { type: "boolean", label: { zh: "显示具体时间而不是「x 分钟前」", en: "Show the exact time instead of “x minutes ago”" }, default: true },
    hideOwn: {
        type: "boolean",
        label: { zh: "隐藏你自己消息的时间", en: "Hide the time on your own messages" },
        description: { zh: "你的消息悬停时，操作栏最前面那个时间。", en: "The time at the start of the bar that shows when you hover your message." },
        default: false,
    },
});

/** The time in a reply's action bar, and the one in the bar under your own message. */
const REPLY_TIME = `${SEL.messageActions} ${SEL.messageTime}`;
const OWN_TIME = `${SEL.userMessageActions} ${SEL.messageTime}`;

export default definePlugin({
    name: "MessageTimestamps",
    title: { zh: "消息时间", en: "Message timestamps" },
    description: {
        zh: "让回复操作栏里的时间始终可见；回复和你自己消息的时间都显示为具体时间（今天只显示时:分），悬停看完整日期。也可以隐藏你自己消息的时间。",
        en: "Keeps the time in the reply action bar visible; replies and your own messages show the exact time (just hh:mm today), full date on hover. The time on your own messages can be hidden.",
    },
    category: "messages",
    icon: "clock",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings,
    start(scope) {
        const css = [
            settings.store.always ? `${REPLY_TIME} { opacity: 1 !important; visibility: visible !important; }` : "",
            settings.store.hideOwn ? `${OWN_TIME} { display: none !important; }` : "",
        ].join("\n");
        addStyle(scope, css, "timestamps");
        if (!settings.store.absolute) return;
        watch(scope, settings.store.hideOwn ? REPLY_TIME : `${REPLY_TIME}, ${OWN_TIME}`, el => {
            const paint = () => {
                const at = Date.parse(el.getAttribute("datetime") ?? "");
                if (!Number.isFinite(at)) return;
                const text = dateTimeText(at);
                if (el.textContent !== text) el.textContent = text;
                el.setAttribute("data-ccpp-tip", fullDateText(at));
            };
            paint();
            const observer = new MutationObserver(paint);
            observer.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["datetime"] });
            return () => observer.disconnect();
        });
    },
});
