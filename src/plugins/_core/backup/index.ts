/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings, replaceBag, SETTINGS_KEY } from "@kernel/settings";
import { dumpAll, PREFIX, removeKey } from "@kernel/storage";
import { download, h } from "@lib/dom";
import { toast } from "@api/notices";
import { version } from "@core/settings";

const L = {
    title: { zh: "备份", en: "Backup" },
    backupHint: { zh: "导出全部 CC++ 数据（插件开关、选项、收藏的消息、输入历史、自定义 CSS），可在另一台电脑导入。", en: "Export all CC++ data (switches, options, starred messages, prompt history, Quick CSS) to restore elsewhere." },
    export: { zh: "导出 JSON", en: "Export JSON" },
    import: { zh: "导入 JSON", en: "Import JSON" },
    reset: { zh: "清空全部数据", en: "Erase all data" },
    resetConfirm: { zh: "清空 CC++ 的全部设置与数据？此操作不可撤销。", en: "Erase every CC++ setting and data? This cannot be undone." },
    imported: { zh: "已导入，部分插件可能需要刷新页面。", en: "Imported. Some plugins may need a reload." },
    bad: { zh: "文件不是 CC++ 备份。", en: "That file is not a CC++ backup." },
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

function importBackup() {
    const file = h("input", { type: "file", accept: "application/json,.json", style: { display: "none" } });
    file.addEventListener("change", async () => {
        const chosen = file.files?.[0];
        file.remove();
        if (!chosen) return;
        try {
            if (!restoreBackup(JSON.parse(await chosen.text()))) throw new Error("format");
            toast(t(L.imported), { kind: "ok" });
        } catch {
            toast(t(L.bad), { kind: "error" });
        }
    });
    document.body.appendChild(file);
    file.click();
}

const settings = definePluginSettings({
    exportData: {
        type: "action",
        label: { zh: "导出备份", en: "Export backup" },
        description: L.backupHint,
        button: L.export,
        run: () => download(`ccpp-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(), null, 2), "application/json"),
    },
    importData: { type: "action", label: { zh: "导入备份", en: "Import backup" }, description: { zh: "从导出的 JSON 恢复。", en: "Restore from an exported JSON file." }, button: L.import, run: importBackup },
    eraseData: {
        type: "action",
        label: L.reset,
        description: { zh: "清空后页面会刷新。", en: "The page reloads afterwards." },
        button: { zh: "清空", en: "Erase" },
        confirm: L.resetConfirm,
        run: () => {
            for (const key of Object.keys(dumpAll())) removeKey(key);
            location.reload();
        },
    },
});

export default definePlugin({
    name: "Backup",
    title: L.title,
    description: {
        zh: "导出 / 导入 / 清空 CC++ 的全部设置与数据。CC++ 只调用 claude.ai 同源接口，不读取或外传 Cookie / token；只有在线主题会去下载你填写的 CSS 地址。",
        en: "Export, import or erase all CC++ settings and data. CC++ only calls claude.ai's own API and never reads or sends cookies or tokens; only online themes download the CSS URLs you add.",
    },
    category: "core",
    icon: "download",
    enabledByDefault: true,
    dependencies: ["NoticesApi"],
    settings,
    start() {},
});
