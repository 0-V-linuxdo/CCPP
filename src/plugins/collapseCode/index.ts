/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { SEL, watch } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    lines: { type: "number", label: { zh: "超过多少行折叠（行）", en: "Collapse code longer than (lines)" }, default: 30, min: 8, max: 200, step: 2 },
});

const L = { expand: { zh: "展开全部代码（{n} 行）", en: "Show all {n} lines" }, collapse: { zh: "收起代码", en: "Collapse code" } };

const CSS = `
.ccpp-code-collapsed { max-height: var(--ccpp-code-max, 30lh) !important; overflow: hidden !important; -webkit-mask-image: linear-gradient(#000 70%, transparent); mask-image: linear-gradient(#000 70%, transparent); }
.ccpp-code-toggle { display: block; margin: 4px auto 8px; padding: 2px 12px; border-radius: 999px; border: 1px solid rgba(127,127,127,.3); background: transparent; color: inherit; font: 12px/20px ui-sans-serif, system-ui, sans-serif; opacity: .8; cursor: pointer; }
.ccpp-code-toggle:hover { opacity: 1; }
`;

export default definePlugin({
    name: "CollapseCode",
    title: { zh: "折叠长代码", en: "Collapse long code" },
    description: { zh: "回复完成后把很长的代码块折叠成固定高度，点按钮展开 / 收起。", en: "After a reply finishes, folds very long code blocks to a fixed height with a show/hide button." },
    category: "messages",
    icon: "collapse",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings,
    start(scope) {
        addStyle(scope, CSS, "collapse-code");
        const max = settings.store.lines;
        watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] pre`, pre => {
            const lines = (pre.textContent ?? "").split("\n").length;
            if (lines <= max) return;
            pre.style.setProperty("--ccpp-code-max", `${max}lh`);
            pre.classList.add("ccpp-code-collapsed");
            const button = h("button", { type: "button", class: "ccpp-code-toggle", text: t(L.expand).replace("{n}", String(lines)) });
            button.addEventListener("click", () => {
                const collapsed = pre.classList.toggle("ccpp-code-collapsed");
                button.textContent = collapsed ? t(L.expand).replace("{n}", String(lines)) : t(L.collapse);
            });
            pre.after(button);
            return () => {
                pre.classList.remove("ccpp-code-collapsed");
                button.remove();
            };
        });
    },
});
