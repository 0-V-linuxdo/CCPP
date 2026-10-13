/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { allPlugins, definePlugin, isActive } from "@kernel/plugins";
import { replaceBag, SETTINGS_KEY } from "@kernel/settings";
import { dumpAll, PREFIX, removeKey } from "@kernel/storage";
import { download, h } from "@lib/dom";
import { icon } from "@lib/icons";
import { toast } from "@api/notices";
import { registerTab, version } from "@core/settings";

const L = {
    title: { zh: "备份与关于", en: "Backup & about" },
    backup: { zh: "备份", en: "Backup" },
    backupHint: { zh: "导出全部 CC++ 数据（插件开关、选项、收藏的消息、输入历史、自定义 CSS），可在另一台电脑导入。", en: "Export all CC++ data (switches, options, starred messages, prompt history, Quick CSS) to restore elsewhere." },
    export: { zh: "导出 JSON", en: "Export JSON" },
    import: { zh: "导入 JSON", en: "Import JSON" },
    reset: { zh: "清空全部数据", en: "Erase all data" },
    resetConfirm: { zh: "清空 CC++ 的全部设置与数据？此操作不可撤销。", en: "Erase every CC++ setting and data? This cannot be undone." },
    imported: { zh: "已导入，部分插件可能需要刷新页面。", en: "Imported. Some plugins may need a reload." },
    bad: { zh: "文件不是 CC++ 备份。", en: "That file is not a CC++ backup." },
    about: { zh: "关于", en: "About" },
    aboutText: {
        zh: "CC++ 是 claude.ai 的插件化用户脚本：内核只负责插件注册、依赖与设置，网络、路由、DOM 观察、设置面板本身也都是插件。只调用 claude.ai 同源接口，不读取或外传 Cookie / token，不连接任何第三方服务器。",
        en: "CC++ is a plugin-based userscript for claude.ai. The kernel only registers plugins, resolves dependencies and stores settings; network, routing, DOM watching and this settings panel are plugins too. It only calls claude.ai's same-origin API, never reads or sends cookies or tokens, and talks to no third-party server.",
    },
    stats: { zh: "已启用 {on} / {all} 个插件", en: "{on} of {all} plugins running" },
};

const FORMAT = "ccpp-backup";

export function buildBackup() {
    return { format: FORMAT, version, exportedAt: new Date().toISOString(), data: dumpAll() };
}

/** Restores a backup object; returns false when it is not one. */
export function restoreBackup(raw: unknown) {
    if (!raw || typeof raw !== "object" || (raw as { format?: unknown }).format !== FORMAT) return false;
    const data = (raw as { data?: unknown }).data;
    if (!data || typeof data !== "object") return false;
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (typeof value !== "string" || key === SETTINGS_KEY) continue;
        try {
            localStorage.setItem(PREFIX + key, value);
        } catch {}
    }
    const settingsRaw = (data as Record<string, unknown>)[SETTINGS_KEY];
    try {
        replaceBag(typeof settingsRaw === "string" ? JSON.parse(settingsRaw) : {});
    } catch {
        replaceBag({});
    }
    return true;
}

export default definePlugin({
    name: "Backup",
    title: L.title,
    description: { zh: "导出 / 导入 / 清空 CC++ 的全部设置与数据。", en: "Export, import or erase all CC++ settings and data." },
    category: "core",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["Settings", "NoticesApi"],
    start(scope) {
        registerTab(scope, {
            id: "backup",
            title: L.title,
            icon: "download",
            order: 20,
            render(container) {
                const file = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
                file.addEventListener("change", async () => {
                    const chosen = file.files?.[0];
                    if (!chosen) return;
                    try {
                        if (!restoreBackup(JSON.parse(await chosen.text()))) throw new Error("format");
                        toast(t(L.imported), { kind: "ok" });
                    } catch {
                        toast(t(L.bad), { kind: "error" });
                    }
                    file.value = "";
                });
                const exportBtn = h("button", { type: "button", class: "btn primary" }, icon("download", 14), t(L.export));
                exportBtn.addEventListener("click", () => download(`ccpp-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), "application/json"));
                const importBtn = h("button", { type: "button", class: "btn" }, icon("upload", 14), t(L.import));
                importBtn.addEventListener("click", () => file.click());
                const resetBtn = h("button", { type: "button", class: "btn danger" }, icon("trash", 14), t(L.reset));
                resetBtn.addEventListener("click", () => {
                    if (!confirm(t(L.resetConfirm))) return;
                    for (const key of Object.keys(dumpAll())) removeKey(key);
                    location.reload();
                });
                const plugins = allPlugins().filter(p => !p.hidden && p.category !== "api");
                container.append(
                    h("div", { class: "section" }, h("h3", { text: t(L.backup) }), h("p", { text: t(L.backupHint) }), h("div", { class: "row" }, exportBtn, importBtn, resetBtn, file)),
                    h(
                        "div",
                        { class: "section" },
                        h("h3", { text: t(L.about) }),
                        h("p", { text: t(L.aboutText) }),
                        h("p", { class: "muted", text: `CC++ ${version} · ` + t(L.stats).replace("{on}", String(plugins.filter(p => isActive(p)).length)).replace("{all}", String(plugins.length)) }),
                        h("p", {}, h("a", { href: "https://github.com/0-V-linuxdo/CCPP", target: "_blank", rel: "noopener", text: "github.com/0-V-linuxdo/CCPP" })),
                    ),
                );
            },
        });
    },
});
