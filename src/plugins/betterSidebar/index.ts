/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { SEL, watch } from "@api/dom";

const settings = definePluginSettings({
    clickToggle: {
        type: "boolean",
        label: { zh: "点侧栏空白处收起 / 展开侧栏", en: "Click empty sidebar space to hide or show it" },
        default: true,
    },
    startHidden: {
        type: "boolean",
        label: { zh: "打开页面时侧栏收起", en: "Start with the sidebar hidden" },
        default: false,
    },
    collapsePinned: {
        type: "boolean",
        label: { zh: "打开页面时折叠「置顶」分组", en: "Start with the Pinned group collapsed" },
        default: false,
    },
    collapseRecents: {
        type: "boolean",
        label: { zh: "打开页面时折叠最近对话的分组", en: "Start with the recents groups collapsed" },
        description: { zh: "最近对话按状态等分出的各组。", en: "The groups recents are sorted into, by state and so on." },
        default: false,
    },
});

/** claude.ai keeps the sidebar's state in this zustand store: `state.collapsed` is the hidden sidebar. */
const STORE_KEY = "dframe-store";

/** Marks the stored sidebar as hidden before claude.ai reads it, so it opens hidden without a flash. */
export function hideOnLoad(storage: Storage) {
    try {
        const raw = storage.getItem(STORE_KEY);
        if (!raw) return false;
        const store = JSON.parse(raw);
        if (!store?.state || typeof store.state !== "object" || store.state.collapsed === true) return false;
        store.state.collapsed = true;
        storage.setItem(STORE_KEY, JSON.stringify(store));
        return true;
    } catch {
        return false;
    }
}

/** The hide / show sidebar button (⌘B or Ctrl+B); only its shortcut is the same in every language. */
const TOGGLE = 'button[aria-keyshortcuts$="+b" i], [data-testid="sidebar-compact-trigger"]';
/** Sidebar areas that are empty space when clicked directly: the list containers grow to fill the sidebar. */
const BLANK = `${SEL.sidebar}, ${SEL.sidebarRecents}, [data-tab-section], [aria-label="Sidebar"], nav`;
const ACTIVE = 'a, button, input, textarea, select, label, [role="button"], [role="menuitem"], [role="link"], [data-row], [contenteditable="true"]';

/** Whether a click on `target` landed on empty sidebar space rather than on a row, link or button. */
export function isBlankClick(target: Element | null) {
    if (!target?.closest(`${SEL.sidebar}, [aria-label="Sidebar"]`)) return false;
    return target.matches(BLANK) && !target.closest(ACTIVE);
}

/** Past this the page is in use; collapsing groups then would move things under the pointer. */
const GROUPS_GIVE_UP_MS = 15000;
/** Group headings are collapsed once per page load; re-enabling the plugin doesn't do it again. */
let groupsDone = false;

export default definePlugin({
    name: "BetterSidebar",
    title: { zh: "侧栏增强", en: "Better sidebar" },
    description: {
        zh: "点侧栏空白处收起 / 展开侧栏；可设打开页面时侧栏收起，或折叠「置顶」、最近对话的分组。",
        en: "Click empty sidebar space to hide or show the sidebar; optionally start with it hidden, or with the Pinned and recents groups collapsed.",
    },
    category: "navigation",
    icon: "collapse",
    enabledByDefault: true,
    updatedAt: "2026-10-30",
    startAt: "document-start",
    dependencies: ["DomApi"],
    settings,
    start(scope) {
        if (settings.store.startHidden && document.readyState === "loading") hideOnLoad(localStorage);

        if (settings.store.clickToggle) {
            scope.listen(document, "click", (event: MouseEvent) => {
                if (event.button !== 0 || event.defaultPrevented || !isBlankClick(event.target as Element | null)) return;
                // Selecting text isn't a click on empty space.
                if (String(getSelection() ?? "").trim()) return;
                document.querySelector<HTMLElement>(TOGGLE)?.click();
            });
        }

        if (groupsDone || !(settings.store.collapsePinned || settings.store.collapseRecents)) return;
        const run = scope.child();
        run.timeout(() => {
            groupsDone = true;
            run.dispose();
        }, GROUPS_GIVE_UP_MS);
        // Each heading once: one the user opens again within the first seconds stays open.
        const seen = new WeakSet<Element>();
        watch(run, `${SEL.sidebar} button[data-group-toggle][aria-expanded="true"]`, toggle => {
            if (groupsDone || seen.has(toggle)) return;
            seen.add(toggle);
            const recents = !!toggle.closest(`${SEL.sidebarRecents}, [data-recents-list], .dframe-recents-by-mode`);
            if (recents ? settings.store.collapseRecents : settings.store.collapsePinned) toggle.click();
        });
    },
});
