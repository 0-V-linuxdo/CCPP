/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { coerce, getRaw, type Option, type PluginSettings, setRaw, type Value } from "@kernel/settings";
import { h } from "@lib/dom";

import { imageField } from "./imageField";
import { confirmDialog } from "./layer";

/** One form row for a plugin option, wired to the settings store. */
export function renderOption(settings: PluginSettings, key: string, option: Option, rerender: () => void): HTMLElement | null {
    const owner = settings.owner();
    const values: Record<string, Value | undefined> = {};
    for (const [k, def] of Object.entries(settings.def)) values[k] = coerce(def, getRaw(owner, k));
    if (option.visible && !option.visible(values)) return null;
    const value = values[key];
    const set = (next: Value) => {
        setRaw(owner, key, next);
        if (Object.values(settings.def).some(def => def.visible)) rerender();
    };
    const text = h("div", { class: "row-text" }, h("div", { class: "row-title", text: t(option.label) }), option.description ? h("div", { class: "row-desc", text: t(option.description) }) : null);
    const row = (control: HTMLElement, wide = false) => h("div", { class: `row${wide ? " wide" : ""}`, "data-key": key }, text, wide ? control : h("div", { class: "row-control" }, control));

    switch (option.type) {
        case "boolean": {
            const sw = h("button", { type: "button", class: "switch", role: "switch", "aria-checked": String(value), "aria-label": t(option.label) });
            sw.addEventListener("click", () => {
                const next = sw.getAttribute("aria-checked") !== "true";
                sw.setAttribute("aria-checked", String(next));
                set(next);
            });
            return row(sw);
        }
        case "number": {
            const output = h("output", { text: `${value}${option.unit ?? ""}` });
            const input = h("input", { type: "range", min: option.min, max: option.max, step: option.step ?? 1, value: String(value), "aria-label": t(option.label) });
            input.addEventListener("input", () => (output.textContent = `${input.value}${option.unit ?? ""}`));
            input.addEventListener("change", () => set(Number(input.value)));
            return row(h("div", { class: "range" }, input, output));
        }
        case "select": {
            const select = h("select", { class: "input", "aria-label": t(option.label) }, ...option.options.map(o => h("option", { value: o.value, text: t(o.label), selected: o.value === value })));
            select.addEventListener("change", () => set(select.value));
            return row(select);
        }
        case "color": {
            const input = h("input", { type: "color", value: String(value), "aria-label": t(option.label) });
            input.addEventListener("change", () => set(input.value));
            return row(input);
        }
        case "string": {
            const input = h("input", { class: "input", value: String(value ?? ""), placeholder: option.placeholder ? t(option.placeholder) : "", maxLength: option.maxLength ?? 2000, "aria-label": t(option.label) });
            input.addEventListener("change", () => set(input.value));
            return row(input, true);
        }
        case "text": {
            const area = h("textarea", { class: "input", rows: option.rows ?? 5, placeholder: option.placeholder ? t(option.placeholder) : "", "aria-label": t(option.label) });
            area.value = String(value ?? "");
            area.addEventListener("change", () => set(area.value));
            return row(area, true);
        }
        case "image":
            return row(imageField(option, String(value ?? ""), next => set(next)), true);
        case "action": {
            const button = h("button", { type: "button", class: "btn", text: t(option.button) });
            button.addEventListener("click", async () => {
                if (option.confirm && !(await confirmDialog({ title: t(option.label), body: t(option.confirm), danger: true }))) return;
                option.run();
            });
            return row(button);
        }
    }
}
