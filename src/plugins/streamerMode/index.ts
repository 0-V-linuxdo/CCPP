/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    identity: { type: "boolean", label: { zh: "模糊你的名字、头像、套餐与设备名", en: "Blur your name, avatar, plan and device name" }, default: true },
    sidebar: { type: "boolean", label: { zh: "模糊侧栏的对话 / 项目标题", en: "Blur chat and project titles in the sidebar" }, default: true },
    title: { type: "boolean", label: { zh: "模糊当前对话 / 项目标题", en: "Blur the current chat or project title" }, default: false },
    hover: { type: "boolean", label: { zh: "悬停时显示", en: "Reveal on hover" }, default: true },
    amount: { type: "number", label: { zh: "模糊程度", en: "Blur amount" }, default: 6, min: 2, max: 16, unit: "px" },
});

export function streamerCss(o: { identity: boolean; sidebar: boolean; title: boolean; hover: boolean; amount: number }) {
    const targets = [
        ...(o.identity ? ['[data-testid="user-menu-button"] .df-user-menu-trailing', '[data-testid="user-menu-button"] [data-cds="Avatar"]', "[data-new-page-greeting-text]", '[data-testid="cowork-computer-link-indicator"]'] : []),
        ...(o.sidebar ? ['[data-testid="sidebar"] [data-row-label]', '[data-testid="sidebar"] a[href^="/chat/"]'] : []),
        ...(o.title ? ['[data-testid="session-title-split"]', "[data-pane-title]", '[data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]'] : []),
    ];
    if (!targets.length) return "";
    const list = targets.join(",\n");
    const reveal = o.hover ? `\n${targets.map(t => `${t}:hover`).join(",\n")} { filter: none !important; }` : "";
    return `${list} { filter: blur(${o.amount}px) !important; transition: filter .15s; }${reveal}`;
}

export default definePlugin({
    name: "StreamerMode",
    title: { zh: "直播 / 截图模式", en: "Streamer mode" },
    description: { zh: "模糊你的名字、头像、套餐与侧栏标题，录屏或截图时不泄露隐私；悬停可临时查看。", en: "Blurs your name, avatar, plan and sidebar titles for screen sharing; hover to peek." },
    category: "privacy",
    icon: "eyeOff",
    enabledByDefault: false,
    dependencies: ["StylesApi"],
    settings,
    start(scope) {
        const set = addStyle(scope, streamerCss(settings.store), "streamer");
        this.onSettingsChange = () => set(streamerCss(settings.store));
    },
});
