/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { h } from "@lib/dom";
import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";

let container: HTMLElement | null = null;

function ensureContainer() {
    if (container?.isConnected) return container;
    container ??= h("div", { id: "ccpp-styles", hidden: true });
    (document.head ?? document.documentElement).appendChild(container);
    return container;
}

/** A page-level stylesheet that lives as long as the scope. Returns a setter to change its text. */
export function addStyle(scope: Scope, css: string, id?: string) {
    const style = h("style", { "data-ccpp-style": id ?? "" });
    style.textContent = css;
    ensureContainer().appendChild(style);
    scope.defer(() => style.remove());
    return (next: string) => void (style.textContent = next);
}

/** Toggles a class on <html> for the scope's lifetime, for CSS-only plugins. */
export function rootClass(scope: Scope, name: string) {
    document.documentElement.classList.add(name);
    scope.defer(() => document.documentElement.classList.remove(name));
}

export default definePlugin({
    name: "StylesApi",
    title: { zh: "样式注入", en: "Styles API" },
    description: { zh: "管理各插件注入的页面样式，插件停用时自动移除。", en: "Page stylesheets for plugins, removed when a plugin stops." },
    category: "api",
    icon: "palette",
    hidden: true,
    startAt: "document-start",
    start(scope) {
        ensureContainer();
        // Keep our styles after claude.ai's own so equal-specificity rules win.
        scope.interval(() => {
            if (container && container.parentNode && container !== container.parentNode.lastElementChild && document.head) document.head.appendChild(container);
        }, 3000);
        scope.defer(() => {
            container?.remove();
            container = null;
        });
    },
});
