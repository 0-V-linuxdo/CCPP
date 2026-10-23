/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { h } from "@lib/dom";
import { addStyle } from "@api/styles";
import { registerTab } from "@core/settings";

const css = persisted<string>("quick-css", "", (v): v is string => typeof v === "string");

const settings = definePluginSettings({
    apply: { type: "boolean", label: { zh: "启用自定义 CSS", en: "Enable Quick CSS" }, description: { zh: "关掉后保留内容，但不再作用于页面。", en: "Off keeps your CSS but stops applying it." }, default: true },
});

let refresh = () => {};

const L = {
    title: { zh: "自定义 CSS", en: "Quick CSS" },
    editor: { zh: "编辑器", en: "Editor" },
    hint: { zh: "实时应用到 claude.ai（停止输入 0.4 秒后生效）。Tab 键缩进。", en: "Applies to claude.ai live, 0.4 s after you stop typing. Tab indents." },
    placeholder: { zh: "/* 例如：让侧栏头像淡一点 */\n[data-testid=\"user-menu-button\"] { opacity: .6; }", en: "/* e.g. dim the account button */\n[data-testid=\"user-menu-button\"] { opacity: .6; }" },
};

export default definePlugin({
    name: "QuickCss",
    title: L.title,
    description: { zh: "在设置里写自己的 CSS，实时作用于页面。", en: "Write your own CSS in settings and see it applied live." },
    category: "appearance",
    icon: "braces",
    enabledByDefault: true,
    dependencies: ["StylesApi", "Settings"],
    settings,
    start(scope) {
        const setCss = addStyle(scope, settings.store.apply ? css.get() : "", "quick-css");
        refresh = () => setCss(settings.store.apply ? css.get() : "");
        scope.defer(() => (refresh = () => {}));
        scope.defer(css.subscribe(value => setCss(settings.store.apply ? value : "")));
        registerTab(scope, {
            id: "quick-css",
            title: L.title,
            icon: "braces",
            order: 20,
            render(container) {
                const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(settings.store.apply), "aria-label": t(settings.def.apply.label) });
                sw.addEventListener("click", () => {
                    settings.store.apply = !settings.store.apply;
                    sw.setAttribute("aria-checked", String(settings.store.apply));
                    setCss(settings.store.apply ? css.get() : "");
                });
                const area = h("textarea", { class: "input editor", rows: 22, spellcheck: false, placeholder: t(L.placeholder), "aria-label": t(L.editor) });
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
                container.append(
                    h("div", { class: "rows" }, h("div", { class: "row" }, h("div", { class: "row-text" }, h("div", { class: "row-title", text: t(settings.def.apply.label) }), h("div", { class: "row-desc", text: t(settings.def.apply.description!) })), h("div", { class: "row-control" }, sw))),
                    h("div", { class: "section-head", style: { marginTop: "12px" } }, h("h3", { text: t(L.editor) })),
                    h("p", { class: "hint", text: t(L.hint) }),
                    area,
                );
            },
        });
    },
    // The switch and editor update the style in place; no restart needed.
    onSettingsChange() {
        refresh();
    },
});
