/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/** CC++'s one star colour (void++'s orange): starred messages, their marks in the navigator, starred plugins. */
export const STAR_COLOR = "#ff7a17";

const resolved = new Map<string, { at: number; color: string }>();

/**
 * A CSS colour as the page draws it right now, `var(--cds-…)` included: for drawings outside the page's CSS (the tab
 * icon), which can't read claude.ai's theme variables themselves. Re-read every 2s, so a theme switch shows up.
 */
export function resolveColor(css: string, fallback: string, now = Date.now()) {
    const cached = resolved.get(css);
    if (cached && now - cached.at < 2000) return cached.color;
    let color = fallback;
    try {
        const probe = document.createElement("span");
        probe.style.cssText = "position:absolute;visibility:hidden";
        probe.style.color = css;
        (document.body ?? document.documentElement).appendChild(probe);
        color = getComputedStyle(probe).color || fallback;
        probe.remove();
    } catch {}
    resolved.set(css, { at: now, color });
    return color;
}
