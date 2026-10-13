/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

export type Lang = "zh" | "en";
export type Text = string | { zh: string; en: string };

const detect = (): Lang => (/^zh/i.test(globalThis.navigator?.language ?? "") ? "zh" : "en");

let lang: Lang = detect();

export const getLang = () => lang;
export const setLang = (next: Lang | "auto") => void (lang = next === "auto" ? detect() : next);
export const t = (text: Text) => (typeof text === "string" ? text : text[lang]);
