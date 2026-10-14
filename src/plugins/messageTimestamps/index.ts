/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { dateTimeText } from "@lib/format";
import { SEL, watch } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    always: { type: "boolean", label: { zh: "始终显示时间（不用悬停）", en: "Always show the time (no hover needed)" }, default: true },
    absolute: { type: "boolean", label: { zh: "显示具体时间而不是「x 分钟前」", en: "Show the exact time instead of “x minutes ago”" }, default: true },
});

export default definePlugin({
    name: "MessageTimestamps",
    title: { zh: "消息时间", en: "Message timestamps" },
    description: { zh: "让回复操作栏里的时间始终可见，并显示为具体时间（今天只显示时:分），悬停看完整日期。", en: "Keeps the time in the reply action bar visible and shows the exact time (just hh:mm today), full date on hover." },
    category: "messages",
    icon: "clock",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings,
    start(scope) {
        if (settings.store.always) addStyle(scope, `${SEL.messageActions} ${SEL.messageTime} { opacity: 1 !important; visibility: visible !important; }`, "timestamps");
        if (!settings.store.absolute) return;
        watch(scope, `${SEL.messageActions} ${SEL.messageTime}`, el => {
            const paint = () => {
                const at = Date.parse(el.getAttribute("datetime") ?? "");
                if (!Number.isFinite(at)) return;
                const text = dateTimeText(at);
                if (el.textContent !== text) el.textContent = text;
                el.setAttribute("data-ccpp-tip", new Date(at).toLocaleString());
            };
            paint();
            const observer = new MutationObserver(paint);
            observer.observe(el, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["datetime"] });
            return () => observer.disconnect();
        });
    },
});
