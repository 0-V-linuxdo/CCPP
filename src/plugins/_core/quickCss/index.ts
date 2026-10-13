/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { persisted } from "@kernel/storage";
import { h } from "@lib/dom";
import { addStyle } from "@api/styles";
import { registerTab } from "@core/settings";

const css = persisted<string>("quick-css", "", (v): v is string => typeof v === "string");

const L = {
    title: { zh: "自定义 CSS", en: "Quick CSS" },
    hint: { zh: "写入的 CSS 会实时应用到 claude.ai（输入停顿 0.4 秒后生效）。", en: "CSS here applies to claude.ai live (0.4 s after you stop typing)." },
    placeholder: { zh: "/* 例如：隐藏侧栏底部头像 */\n[data-testid=\"user-menu-button\"] { opacity: .6; }", en: "/* e.g. dim the account button */\n[data-testid=\"user-menu-button\"] { opacity: .6; }" },
};

export default definePlugin({
    name: "QuickCss",
    title: L.title,
    description: { zh: "在设置面板里写自己的 CSS，实时作用于页面。", en: "Write your own CSS in the settings panel and see it applied live." },
    category: "core",
    icon: "brush",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings"],
    start(scope) {
        const setCss = addStyle(scope, css.get(), "quick-css");
        scope.defer(css.subscribe(setCss));
        registerTab(scope, {
            id: "quick-css",
            title: L.title,
            icon: "brush",
            order: 10,
            render(container) {
                const area = h("textarea", { class: "input", rows: 24, spellcheck: false, placeholder: t(L.placeholder), style: { width: "100%", minHeight: "420px" } });
                area.value = css.get();
                let timer: ReturnType<typeof setTimeout> | undefined;
                area.addEventListener("input", () => {
                    clearTimeout(timer);
                    timer = setTimeout(() => css.set(area.value), 400);
                });
                area.addEventListener("keydown", event => {
                    if (event.key !== "Tab") return;
                    event.preventDefault();
                    area.setRangeText("  ", area.selectionStart, area.selectionEnd, "end");
                });
                container.append(h("p", { class: "muted", text: t(L.hint), style: { margin: "0 0 10px" } }), area);
            },
        });
    },
});
