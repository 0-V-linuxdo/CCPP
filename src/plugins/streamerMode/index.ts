/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { watch } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    identity: { type: "boolean", label: { zh: "模糊你的名字、邮箱、套餐与设备名", en: "Blur your name, email, plan and device name" }, default: true },
    avatar: { type: "boolean", label: { zh: "模糊你的头像", en: "Blur your avatar" }, default: true },
    settingsPage: {
        type: "boolean",
        label: { zh: "模糊设置页里的姓名和组织 ID", en: "Blur your name and organization ID in settings" },
        description: { zh: "「账户」页的全名、Claude 怎么称呼你、组织 ID，以及那里的头像。", en: "Full name, what Claude calls you, organization ID and the avatar on the Account page." },
        default: true,
    },
    sidebar: { type: "boolean", label: { zh: "模糊侧栏的对话 / 项目标题", en: "Blur chat and project titles in the sidebar" }, default: true },
    title: { type: "boolean", label: { zh: "模糊当前对话 / 项目标题", en: "Blur the current chat or project title" }, default: false },
    hover: { type: "boolean", label: { zh: "悬停时显示", en: "Reveal on hover" }, default: true },
    amount: { type: "number", label: { zh: "模糊程度", en: "Blur amount" }, default: 6, min: 2, max: 16, unit: "px" },
});

/** Settings rows that show who you are, by their label (the inputs have no stable id or name). */
export const PRIVATE_ROW = /^(full name|what should claude call you\??|organization id|全名|姓名|组织\s*id|.*称呼你.*)$/i;
const PRIVATE = "data-ccpp-private";

export function streamerCss(o: { identity: boolean; avatar?: boolean; settingsPage?: boolean; sidebar: boolean; title: boolean; hover: boolean; amount: number }) {
    const avatar = o.avatar ?? o.identity;
    const targets = [
        ...(o.identity ? ['[data-testid="user-menu-button"] .df-user-menu-trailing', '[data-testid="user-menu-header"]', "[data-new-page-greeting-text]", '[data-testid="cowork-computer-link-indicator"]'] : []),
        ...(avatar ? ['[data-testid="user-menu-button"] [data-cds="Avatar"]'] : []),
        ...(o.settingsPage ? [`[${PRIVATE}] [data-settings-control]`, ...(avatar ? ['[data-settings-row] [data-cds="Avatar"][data-ccpp-me]'] : [])] : []),
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
    description: { zh: "模糊你的名字、邮箱、头像、套餐、设置页里的个人信息与侧栏标题，录屏或截图时不泄露隐私；悬停可临时查看。", en: "Blurs your name, email, avatar, plan, personal details in settings and sidebar titles for screen sharing; hover to peek." },
    category: "privacy",
    icon: "eyeOff",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings,
    start(scope) {
        const set = addStyle(scope, streamerCss(settings.store), "streamer");
        this.onSettingsChange = () => set(streamerCss(settings.store));
        // Marks settings rows by their label; the blur itself follows the option, so it can change without a restart.
        watch(scope, "[data-settings-row]", row => {
            const id = row.getAttribute("aria-labelledby");
            const label = (id ? document.getElementById(id) : null)?.textContent?.trim() ?? "";
            if (!PRIVATE_ROW.test(label)) return;
            row.setAttribute(PRIVATE, "");
            return () => row.removeAttribute(PRIVATE);
        });
    },
});
