/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import type { Scope } from "@kernel/scope";
import { h } from "@lib/dom";
import { addStyle } from "@api/styles";
import { SEL, watch } from "@api/dom";

/**
 * Places where plugins put small controls inside claude.ai's own UI:
 * - "composer": next to the model picker in the chat input
 * - "header": the chat header's action row (top right of a conversation)
 */
export type SlotName = "composer" | "header";

interface Item {
    id: string;
    slot: SlotName;
    order: number;
    render(): HTMLElement;
    /** One element per slot container, re-created if claude.ai re-renders. */
    nodes: Map<HTMLElement, HTMLElement>;
}

const items = new Set<Item>();
const containers = new Map<SlotName, Set<HTMLElement>>([["composer", new Set()], ["header", new Set()]]);

const CSS = `
.ccpp-slot { display: inline-flex; align-items: center; gap: 4px; flex: none; }
.ccpp-slot:empty { display: none; }
.ccpp-slot-composer { margin-inline-end: 4px; }
.ccpp-slot-header { margin-inline-end: 4px; }
.ccpp-slot-btn { display: inline-flex; align-items: center; justify-content: center; gap: 4px; min-width: 32px; height: 32px; padding: 0 8px; border-radius: 8px; border: 0; background: transparent; color: inherit; opacity: .75; font: inherit; font-size: 12px; cursor: pointer; }
.ccpp-slot-btn:hover { opacity: 1; background: rgba(127,127,127,.14); }
.ccpp-slot-btn.on { color: #d97757; opacity: 1; }
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
    h("button", { type: "button", class: "ccpp-slot-btn", "aria-label": label, title: label, onclick: onClick as EventListener }, ...children);

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
        const mountIn = (slot: SlotName, anchor: HTMLElement, where: "before" | "prepend") => {
            const container = h("span", { class: `ccpp-slot ccpp-slot-${slot}`, "data-ccpp-slot": slot });
            if (where === "before") anchor.before(container);
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
    },
});
