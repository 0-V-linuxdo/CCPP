/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { addStyle } from "@api/styles";

export default definePlugin({
    name: "NoShareLink",
    title: { zh: "隐藏分享按钮", en: "No share button" },
    description: { zh: "隐藏对话右上角的「分享」按钮，避免误点生成公开链接。", en: "Hides the Share button at the top right of chats so you never create a public link by accident." },
    category: "declutter",
    tags: ["privacy"],
    icon: "linkOff",
    enabledByDefault: true,
    dependencies: ["StylesApi"],
    start(scope) {
        addStyle(scope, `[data-testid="wiggle-controls-actions-share"] { display: none !important; }`, "no-share");
    },
});
