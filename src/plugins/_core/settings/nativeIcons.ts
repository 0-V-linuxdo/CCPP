/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { readJson, writeJson } from "@kernel/storage";

/**
 * claude.ai draws its icons with the Anthropicons font: a `span[data-cds="Icon"]` holding one private-use
 * character. These are the glyphs of its settings sections as of 2026-10; whenever the settings nav is
 * shown we re-read them, so a renumbered font heals itself.
 */
const SECTION_GLYPHS: Record<string, number> = {
    "settings/general": 0xe0d6,
    "settings/account": 0xe104,
    "settings/data-privacy-controls": 0xe0a3,
    "settings/billing": 0xe058,
    "settings/usage": 0xe130,
    "settings/capabilities": 0xe100,
    "settings/memory": 0xe0a8,
    "settings/design-systems": 0xe0b8,
    "settings/claude-code": 0xe048,
    "settings/browser-extension": 0xe059,
    "customize/skills/yours": 0xe0d2,
    "customize/connectors/yours": 0xe055,
    "customize/plugins/yours": 0xe0c5,
};

const KEY = "native-icons";
let learned: Record<string, string> = readJson<Record<string, string>>(KEY, {});

interface Section {
    hash: string;
    label: { zh: string; en: string };
}

/** Which section a nav row opens: by its data-testid ("general-settings", "customize-skills-settings") or its label. */
function sectionOf(sections: Section[], row: HTMLElement): string | null {
    const id = row.dataset.testid?.replace(/-settings$/, "").replace(/^customize-/, "");
    const byId = id && sections.find(s => s.hash.split("/")[1] === id);
    if (byId) return byId.hash;
    const label = (row.textContent ?? "").replace(/[\ue000-\uf8ff]/g, "").trim().toLowerCase();
    return sections.find(s => label === s.label.en.toLowerCase() || label === s.label.zh)?.hash ?? null;
}

const isGlyph = (text: string) => /^[-]$/.test(text);

export function learnNativeIcons(nav: HTMLElement, sections: Section[]) {
    let changed = false;
    for (const row of nav.querySelectorAll<HTMLElement>("li:not([data-ccpp-nav])")) {
        const text = row.querySelector('[data-cds="Icon"]')?.textContent ?? "";
        const hash = isGlyph(text) && sectionOf(sections, row);
        if (!hash || learned[hash] === text) continue;
        learned = { ...learned, [hash]: text };
        changed = true;
    }
    if (changed) writeJson(KEY, learned);
}

/** claude.ai's glyph for the section at `hash`, or null for a section we don't know. */
export function sectionGlyph(hash: string): string | null {
    const seen = learned[hash];
    if (seen && isGlyph(seen)) return seen;
    const code = SECTION_GLYPHS[hash];
    return code ? String.fromCodePoint(code) : null;
}

/** For tests. */
export function resetNativeIcons() {
    learned = {};
}
