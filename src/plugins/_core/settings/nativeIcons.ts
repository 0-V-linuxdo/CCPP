/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { readJson, writeJson } from "@kernel/storage";

/**
 * claude.ai's own icons for its settings sections. They only exist in the settings dialog's nav, so
 * we keep a copy of each (by section hash) whenever that nav is shown, for the account menu flyout.
 */
const KEY = "native-icons";
let cache: Record<string, string> = readJson<Record<string, string>>(KEY, {});

/** Elements an icon may hold; anything else and the copy is dropped. */
const SHAPES = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "clippath", "mask", "lineargradient", "radialgradient", "stop", "title"]);

interface Section {
    hash: string;
    label: { zh: string; en: string };
}

/** Which section a nav row opens: by its data-testid ("general-settings") or, failing that, its label. */
function sectionOf(sections: Section[], row: HTMLElement): string | null {
    const id = row.dataset.testid?.replace(/-settings$/, "");
    const label = row.textContent?.trim().toLowerCase() ?? "";
    const byId = id && sections.find(s => s.hash.split("/")[1] === id);
    if (byId) return byId.hash;
    return sections.find(s => label === s.label.en.toLowerCase() || label === s.label.zh)?.hash ?? null;
}

export function learnNativeIcons(nav: HTMLElement, sections: Section[]) {
    let changed = false;
    for (const row of nav.querySelectorAll<HTMLElement>("li:not([data-ccpp-nav])")) {
        const svg = row.querySelector('[data-cds="Icon"] svg') ?? row.querySelector("button svg");
        const hash = svg && sectionOf(sections, row);
        if (!svg || !hash) continue;
        const markup = svg.outerHTML;
        if (cache[hash] === markup) continue;
        cache = { ...cache, [hash]: markup };
        changed = true;
    }
    if (changed) writeJson(KEY, cache);
}

/** A fresh copy of the native icon for `hash`, or null when we haven't seen it yet. */
export function nativeIcon(hash: string): SVGElement | null {
    const markup = cache[hash];
    if (!markup) return null;
    try {
        const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
        const svg = doc.documentElement;
        if (svg.localName !== "svg" || doc.querySelector("parsererror")) return null;
        for (const el of [svg, ...svg.querySelectorAll("*")]) {
            if (!SHAPES.has(el.localName.toLowerCase())) return null;
            for (const attr of [...el.attributes]) if (/^on|href$/i.test(attr.name)) el.removeAttribute(attr.name);
        }
        return document.importNode(svg, true) as unknown as SVGElement;
    } catch {
        return null;
    }
}

/** For tests. */
export function resetNativeIcons() {
    cache = {};
}
