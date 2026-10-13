/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/** 24×24 stroke icons in the lucide style, as [tag, attributes] lists so no markup parsing is needed. */
type Shape = [string, Record<string, string | number>];

const p = (d: string): Shape => ["path", { d }];
const c = (cx: number, cy: number, r: number): Shape => ["circle", { cx, cy, r }];

const ICONS: Record<string, Shape[]> = {
    plug: [p("M12 22v-5"), p("M9 8V2"), p("M15 8V2"), p("M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z")],
    settings: [c(12, 12, 3), p("M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z")],
    star: [p("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z")],
    pin: [p("M12 17v5"), p("M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z")],
    x: [p("M18 6 6 18"), p("m6 6 12 12")],
    search: [c(11, 11, 8), p("m21 21-4.3-4.3")],
    refresh: [p("M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p("M3 3v5h5"), p("M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"), p("M16 16h5v5")],
    download: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("m7 10 5 5 5-5"), p("M12 15V3")],
    upload: [p("M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"), p("m17 8-5-5-5 5"), p("M12 3v12")],
    history: [p("M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"), p("M3 3v5h5"), p("M12 7v5l4 2")],
    list: [p("M8 6h13"), p("M8 12h13"), p("M8 18h13"), p("M3 6h.01"), p("M3 12h.01"), p("M3 18h.01")],
    gauge: [p("m12 14 4-4"), p("M3.34 19a10 10 0 1 1 17.32 0")],
    bell: [p("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"), p("M10.3 21a1.94 1.94 0 0 0 3.4 0")],
    eyeOff: [p("M9.88 9.88a3 3 0 1 0 4.24 4.24"), p("M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"), p("M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"), p("m2 2 20 20")],
    width: [p("M21 12H3"), p("m7 8-4 4 4 4"), p("m17 8 4 4-4 4")],
    palette: [c(13.5, 6.5, 0.5), c(17.5, 10.5, 0.5), c(8.5, 7.5, 0.5), c(6.5, 12.5, 0.5), p("M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z")],
    message: [p("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z")],
    keyboard: [p("M2 6h20v12H2z"), p("M6 10h.01"), p("M10 10h.01"), p("M14 10h.01"), p("M18 10h.01"), p("M7 14h10")],
    code: [p("m16 18 6-6-6-6"), p("m8 6-6 6 6 6")],
    link: [p("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"), p("M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71")],
    clock: [c(12, 12, 10), p("M12 6v6l4 2")],
    shield: [p("M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z")],
    sparkles: [p("M9.94 14.06 4 20"), p("M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z")],
    trash: [p("M3 6h18"), p("M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"), p("M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")],
    chevronDown: [p("m6 9 6 6 6-6")],
    chevronRight: [p("m9 18 6-6-6-6")],
    brush: [p("m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"), p("M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z")],
    linkOff: [p("M9 17H7A5 5 0 0 1 7 7"), p("M15 7h2a5 5 0 0 1 4 8"), p("M8 12h4"), p("m2 2 20 20")],
    micOff: [p("m2 2 20 20"), p("M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"), p("M5 10v2a7 7 0 0 0 12 5"), p("M15 9.34V5a3 3 0 0 0-5.68-1.33"), p("M9 9v3a3 3 0 0 0 5.12 2.12"), p("M12 19v3")],
    user: [c(12, 8, 5), p("M20 21a8 8 0 0 0-16 0")],
    grid: [p("M3 3h7v7H3z"), p("M14 3h7v7h-7z"), p("M14 14h7v7h-7z"), p("M3 14h7v7H3z")],
    fileText: [p("M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"), p("M14 2v4a2 2 0 0 0 2 2h4"), p("M16 13H8"), p("M16 17H8"), p("M10 9H8")],
    terminal: [p("m4 17 6-6-6-6"), p("M12 19h8")],
    incognito: [p("M2 12h20"), p("M5 12l2-7h10l2 7"), c(7, 17, 3), c(17, 17, 3), p("M10 17h4")],
    blend: [c(9, 9, 7), c(15, 15, 7)],
    tab: [p("M3 5h18v14H3z"), p("M3 9h18")],
    collapse: [p("m7 20 5-5 5 5"), p("m7 4 5 5 5-5")],
    puzzle: [p("M19.44 12.06a2 2 0 1 0-2.83-2.83L14 6.6V4a2 2 0 0 0-2-2H8v2.5a2 2 0 1 1-4 0V2H2v6h2.5a2 2 0 1 1 0 4H2v8h8v-2.5a2 2 0 1 1 4 0V20h4a2 2 0 0 0 2-2v-4l-.56-1.94Z")],
};

export const iconNames = Object.keys(ICONS);

export function icon(name: string, size = 16) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const attrs: Record<string, string> = {
        width: String(size),
        height: String(size),
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": "true",
    };
    for (const [key, value] of Object.entries(attrs)) svg.setAttribute(key, value);
    for (const [tag, shapeAttrs] of ICONS[name] ?? ICONS.puzzle) {
        const el = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(shapeAttrs)) el.setAttribute(key, String(value));
        svg.appendChild(el);
    }
    return svg;
}
