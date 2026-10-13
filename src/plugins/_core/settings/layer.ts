/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t, type Text } from "@kernel/i18n";
import type { Scope } from "@kernel/scope";
import { clear, h } from "@lib/dom";
import { icon } from "@lib/icons";
import { shadowBox } from "@lib/ui";

import { LAYER_CSS, PANEL_CSS } from "./styles";

/** claude.ai's settings dialog. */
export const NATIVE_DIALOG = '[role="dialog"][data-perf-overlay="settings_modal"]';

const L = {
    close: { zh: "关闭", en: "Close" },
    ok: { zh: "确定", en: "OK" },
    cancel: { zh: "取消", en: "Cancel" },
};

interface Layer {
    el: HTMLElement;
    onClose?: () => void;
}

let shadow: ReturnType<typeof shadowBox> | null = null;
const stack: Layer[] = [];

/**
 * One shadow layer for every CC++ dialog. While claude.ai's settings dialog is open the layer lives
 * inside it, so clicks in our dialogs count as inside that modal and don't dismiss it.
 */
export function initLayer(scope: Scope) {
    shadow = shadowBox(LAYER_CSS + PANEL_CSS);
    shadow.host.dataset.ccpp = "layer";
    Object.assign(shadow.host.style, { inset: "0", zIndex: "2147483600", pointerEvents: "none" });
    scope.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "class"] }, () => shadow?.sync());
    scope.listen(window, "keydown", (event: KeyboardEvent) => {
        if (event.key !== "Escape" || !stack.length || !shadow?.host.isConnected) return;
        event.preventDefault();
        event.stopPropagation();
        closeTop();
    }, { capture: true });
    scope.defer(() => {
        stack.length = 0;
        shadow?.host.remove();
        shadow = null;
    });
}

function place() {
    if (!shadow) return null;
    const dialog = document.querySelector<HTMLElement>(NATIVE_DIALOG);
    const parent = dialog ?? document.body;
    shadow.host.style.position = dialog ? "absolute" : "fixed";
    if (shadow.host.parentNode !== parent) parent.appendChild(shadow.host);
    shadow.sync();
    return shadow.box;
}

export const layerOpen = () => stack.length > 0 && !!shadow?.host.isConnected;

function closeTop() {
    const top = stack.pop();
    top?.el.remove();
    top?.onClose?.();
}

/** Shows `content` in a modal; returns a function that closes it. */
export function openModal(content: HTMLElement, options: { onClose?: () => void; backdrop?: "dim" | "clear" } = {}) {
    // A dialog left in a closed settings dialog is gone with it.
    for (let i = stack.length - 1; i >= 0; i--) if (!stack[i].el.isConnected || stack[i].el.getRootNode() !== shadow?.root) stack.splice(i, 1);
    const box = place();
    if (!box) return () => {};
    const backdrop = h("div", { class: `backdrop${options.backdrop === "clear" ? " clear" : ""}` }, content);
    backdrop.addEventListener("mousedown", event => event.target === backdrop && close());
    const layer: Layer = { el: backdrop, onClose: options.onClose };
    stack.push(layer);
    box.appendChild(backdrop);
    queueMicrotask(() => content.querySelector<HTMLElement>("[autofocus], input, textarea, button:not(.icon-btn)")?.focus());
    function close() {
        const index = stack.indexOf(layer);
        if (index < 0) return;
        stack.splice(index, 1);
        backdrop.remove();
        layer.onClose?.();
    }
    return close;
}

export function closeAllModals() {
    while (stack.length) closeTop();
    if (shadow) clear(shadow.box);
}

/** The standard dialog frame: head (icon, title, close), body, optional footer. */
export function dialogFrame(options: { title: string; icon?: string; size?: "small" | "wide"; body: Node[]; foot?: Node[]; onClose: () => void }) {
    const close = h("button", { type: "button", class: "icon-btn", "aria-label": t(L.close), title: t(L.close) }, icon("x", 16));
    close.addEventListener("click", options.onClose);
    return h(
        "div",
        { class: `dialog${options.size ? ` ${options.size}` : ""}`, role: "dialog", "aria-modal": "true", "aria-label": options.title },
        h("div", { class: "d-head" }, options.icon ? h("span", { class: "chip-icon" }, icon(options.icon, 16)) : null, h("h2", { text: options.title }), close),
        h("div", { class: "d-body" }, ...options.body),
        options.foot?.length ? h("div", { class: "d-foot" }, ...options.foot) : null,
    );
}

/** void++'s ConfirmDialog. Resolves true on confirm. */
export function confirmDialog(options: { title: string; body: string; ok?: Text; cancel?: Text; danger?: boolean }): Promise<boolean> {
    return new Promise(resolve => {
        let settled = false;
        const done = (value: boolean) => {
            if (settled) return;
            settled = true;
            close();
            resolve(value);
        };
        const ok = h("button", { type: "button", class: `btn ${options.danger ? "danger-solid" : "primary"}`, text: t(options.ok ?? L.ok) });
        ok.addEventListener("click", () => done(true));
        const cancel = h("button", { type: "button", class: "btn", text: t(options.cancel ?? L.cancel) });
        cancel.addEventListener("click", () => done(false));
        const frame = dialogFrame({ title: options.title, size: "small", body: [h("p", { class: "d-desc", text: options.body })], foot: [cancel, ok], onClose: () => done(false) });
        const close = openModal(frame, { onClose: () => done(false) });
        queueMicrotask(() => ok.focus());
    });
}
