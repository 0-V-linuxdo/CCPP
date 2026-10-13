/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined | EventListener | Partial<CSSStyleDeclaration>>;

/**
 * Builds an element without innerHTML. Keys starting with "on" become listeners, `style`
 * may be an object, `class` and `text` are shortcuts, `false`/`null` attributes are skipped.
 */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (value == null || value === false) continue;
        if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
        else if (key === "style" && typeof value === "object") Object.assign(el.style, value);
        else if (key === "class") el.className = String(value);
        else if (key === "text") el.textContent = String(value);
        else if (key in el && typeof value !== "string" && key !== "role") (el as any)[key] = value;
        else el.setAttribute(key, value === true ? "" : String(value));
    }
    append(el, children);
    return el;
}

export function append(parent: Node, children: Child[]) {
    for (const child of children) {
        if (child == null || child === false) continue;
        parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
    }
}

export const clear = (el: Node) => {
    while (el.firstChild) el.firstChild.remove();
};

/** Visible in layout (not display:none, not zero-sized). */
export function isShown(el: Element | null | undefined): el is HTMLElement {
    if (!el || !(el as HTMLElement).isConnected) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
}

export function download(filename: string, content: string, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
    const a = h("a", { href: url, download: filename, style: { display: "none" } });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Makes a string safe for a file name. */
export const fileSafe = (name: string) => name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) || "untitled";

export const isEditable = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false;
    return el.isContentEditable || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
};
