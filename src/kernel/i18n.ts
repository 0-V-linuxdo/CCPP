/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

export type Lang = "zh" | "en";
export type Text = string | { zh: string; en: string };

/** claude.ai's own interface language (its `spa:locale`, else `<html lang>`), not the browser's. English otherwise. */
function claudeLocale() {
    try {
        const stored = globalThis.localStorage?.getItem("spa:locale");
        if (stored) return stored.replace(/^"|"$/g, "");
    } catch {}
    return globalThis.document?.documentElement?.lang ?? "";
}

const detect = (): Lang => (/^zh/i.test(claudeLocale()) ? "zh" : "en");

let mode: Lang | "auto" = "auto";
let lang: Lang = detect();

export const getLang = () => lang;
export const setLang = (next: Lang | "auto") => void ((mode = next), (lang = next === "auto" ? detect() : next));
export const t = (text: Text) => (typeof text === "string" ? text : text[lang]);

// claude.ai can switch language without a reload; follow it while on "auto".
try {
    new MutationObserver(() => mode === "auto" && (lang = detect())).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
} catch {}
