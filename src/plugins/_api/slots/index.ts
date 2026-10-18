/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { h } from "@lib/dom";
import { tipAttrs } from "@lib/tooltip";
import { addStyle } from "@api/styles";
import { SEL, watch } from "@api/dom";

/**
 * Places where plugins put small controls inside claude.ai's own UI:
 * - "composer": next to the model picker in the chat input
 * - "header": the chat header's action row (top right of a conversation)
 * - "codeHeader": the header of a Claude Code conversation (a project chat, the thread beside it, a session),
 *   just before its own action buttons
 */
export type SlotName = "composer" | "header" | "codeHeader";

interface Item {
    id: string;
    slot: SlotName;
    order: number;
    render(): HTMLElement;
    /** One element per slot container, re-created if claude.ai re-renders. */
    nodes: Map<HTMLElement, HTMLElement>;
}

const items = new Set<Item>();
const containers = new Map<SlotName, Set<HTMLElement>>([["composer", new Set()], ["header", new Set()], ["codeHeader", new Set()]]);

const CSS = `
.ccpp-slot { display: inline-flex; align-items: center; gap: 4px; flex: none; }
.ccpp-slot:empty { display: none; }
.ccpp-slot-composer { margin-inline-end: 4px; }
.ccpp-slot-header { margin-inline-end: 4px; }
.ccpp-slot-codeHeader { margin-inline: 0; }
.ccpp-slot-codeHeader .ccpp-slot-btn { min-width: var(--cds-h-control, 32px); height: var(--cds-h-control, 32px); padding: 0 6px; border-radius: calc(0.375rem * var(--cds-rem-scale, 1)); }
.ccpp-slot-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 0; background: transparent; color: var(--cds-text-secondary, inherit); font: inherit; font-size: 12px; cursor: pointer; }
/* Same colors and hover as claude.ai's ghost buttons next to it. */
.ccpp-slot-btn:hover { color: var(--cds-text-primary, inherit); background: var(--cds-fill-ghost-hover, rgba(127,127,127,.14)); }
.ccpp-slot-btn.on { color: #d97757; opacity: 1; }
.ccpp-slot-btn[hidden] { display: none; }
`;

function place(item: Item, container: HTMLElement) {
    let node = item.nodes.get(container);
    if (!node || !node.isConnected) {
        node = item.render();
        node.dataset.ccppItem = item.id;
        item.nodes.set(container, node);
    }
    const siblings = [...container.children] as HTMLElement[];
    const before = siblings.find(el => el !== node && Number(el.dataset.ccppOrder ?? 0) > item.order);
    node.dataset.ccppOrder = String(item.order);
    if (node.parentNode !== container || (before && node.nextSibling !== before)) container.insertBefore(node, before ?? null);
}

function fill(container: HTMLElement, slot: SlotName) {
    for (const item of items) if (item.slot === slot) place(item, container);
}

/** Adds a control to a slot. `render` may be called again whenever claude.ai rebuilds that area. */
export function addSlotItem(scope: Scope, slot: SlotName, id: string, render: () => HTMLElement, order = 0) {
    const item: Item = { id, slot, order, render, nodes: new Map() };
    items.add(item);
    for (const container of containers.get(slot)!) place(item, container);
    scope.defer(() => {
        items.delete(item);
        for (const node of item.nodes.values()) node.remove();
        item.nodes.clear();
    });
    return item;
}

/** Re-renders an item in every slot container (e.g. after its data changed). */
export function refreshSlotItem(item: Item) {
    for (const [container, node] of item.nodes) {
        const next = item.render();
        next.dataset.ccppItem = item.id;
        next.dataset.ccppOrder = String(item.order);
        node.replaceWith(next);
        item.nodes.set(container, next);
    }
}

export const slotButton = (label: string, onClick: (e: MouseEvent) => void, ...children: (Node | string)[]) =>
    h("button", { type: "button", class: "ccpp-slot-btn", "aria-label": label, ...tipAttrs(label), onclick: onClick as EventListener }, ...children);

/** Claude Code pane titles: the project/session title button, and the thread title in the side pane. */
const CODE_TITLE = '[data-pane-title], [data-perf-region="side_pane"] [data-top-right] [data-cds="OverflowTooltip"]';

/**
 * Where a Claude Code header's own buttons start: the first button near the title that isn't part of it, lifted
 * out of single-child wrappers. With no such button the slot goes right after the title.
 */
/** The side pane's grip between title and buttons is a button too, but not one of the header's actions. */
const isDragHandle = (b: HTMLElement) => /(^|\s)tiles-drag-handle(\s|$)/.test(b.className) || b.matches("[data-drag-handle], [aria-roledescription='drag handle']");

export function codeHeaderAnchor(title: HTMLElement): { anchor: HTMLElement; where: "before" | "after" } {
    let branch: HTMLElement = title;
    for (let depth = 0; depth < 6 && branch.parentElement; depth++) {
        const row = branch.parentElement;
        const button = [...row.querySelectorAll<HTMLElement>("button")].find(
            b => !branch.contains(b) && !b.closest(".ccpp-slot") && !isDragHandle(b) && branch.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
        );
        if (button) {
            let anchor = button;
            while (anchor.parentElement && anchor.parentElement !== row && anchor.parentElement.children.length === 1) anchor = anchor.parentElement;
            return { anchor, where: "before" };
        }
        branch = row;
    }
    let anchor = title;
    while (anchor.parentElement && anchor.parentElement.children.length === 1) anchor = anchor.parentElement;
    return { anchor, where: "after" };
}

export default definePlugin({
    name: "SlotsApi",
    title: { zh: "界面插槽", en: "UI slots API" },
    description: { zh: "在输入框模型选择器旁、对话标题栏右侧放置插件按钮。", en: "Puts plugin controls next to the model picker and in the chat header." },
    category: "api",
    icon: "grid",
    hidden: true,
    dependencies: ["DomApi", "StylesApi"],
    start(scope) {
        addStyle(scope, CSS, "slots");
        const mountIn = (slot: SlotName, anchor: HTMLElement, where: "before" | "after" | "prepend") => {
            const container = h("span", { class: `ccpp-slot ccpp-slot-${slot}`, "data-ccpp-slot": slot });
            if (where === "before") anchor.before(container);
            else if (where === "after") anchor.after(container);
            else anchor.prepend(container);
            containers.get(slot)!.add(container);
            fill(container, slot);
            return () => {
                containers.get(slot)!.delete(container);
                container.remove();
            };
        };
        watch(scope, SEL.modelSelector, el => {
            // The picker sometimes sits inside a wrapper; anchor on the outermost single-child wrapper.
            let anchor: HTMLElement = el;
            while (anchor.parentElement && anchor.parentElement.children.length === 1 && !anchor.parentElement.matches(SEL.composer)) anchor = anchor.parentElement;
            return mountIn("composer", anchor, "before");
        });
        watch(scope, SEL.headerActions, el => mountIn("header", el, "prepend"));
        watch(scope, CODE_TITLE, el => {
            // Conversations only: the /code landing page has a pane title over its composer too.
            if (!/^\/code\/[^/]/.test(location.pathname)) return;
            const { anchor, where } = codeHeaderAnchor(el);
            // Both title selectors can match inside one header; one slot per header.
            if (anchor.parentElement?.querySelector(":scope > .ccpp-slot-codeHeader")) return;
            return mountIn("codeHeader", anchor, where);
        });
    },
});
