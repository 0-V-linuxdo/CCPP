/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { clear, h } from "@lib/dom";
import { snippet } from "@lib/format";
import { icon } from "@lib/icons";
import { createPopover } from "@lib/popover";
import { tipAttrs } from "@lib/tooltip";
import { getEditor, getText, onSubmit, setText } from "@api/composer";
import { SEL } from "@api/dom";
import { onRoute } from "@api/router";
import { addSlotItem, slotButton } from "@api/slots";
import { addStyle } from "@api/styles";
import { confirmDialog, dialogFrame, openModal } from "@core/settings";

const MAX_DEFAULT = 100;
/** Enter and the send button can both report one send. */
const CAPTURE_DEDUPE_MS = 2000;
/** How long after we fill the editor its input events are ours, not the user's. */
const APPLY_QUIET_MS = 300;

const L = {
    title: { zh: "输入历史", en: "Input history" },
    sub: { zh: "保存在这台设备上。", en: "Stored on this device." },
    open: { zh: "浏览输入历史", en: "Browse input history" },
    openBtn: { zh: "打开", en: "Open" },
    empty: { zh: "还没有保存的提问。", en: "No stored prompts." },
    noMatch: { zh: "没有匹配的提问。", en: "No matches." },
    search: { zh: "搜索提问", en: "Search prompts" },
    stored: { zh: "已保存 {n} 条提问", en: "{n} stored prompts" },
    matches: { zh: "{n} 条匹配", en: "{n} matches" },
    clear: { zh: "清空历史", en: "Clear history" },
    clearBody: { zh: "删除这里保存的全部提问？无法撤销。", en: "Delete all stored prompts? This cannot be undone." },
    clearOk: { zh: "清空", en: "Clear" },
    use: { zh: "使用", en: "Use" },
    copy: { zh: "复制", en: "Copy" },
    remove: { zh: "删除", en: "Delete" },
    exit: { zh: "退出历史", en: "Exit history" },
    showAll: { zh: "查看输入历史（{n}）", en: "Show input history ({n})" },
};

const history = persisted<string[]>("input-history", [], (v): v is string[] => Array.isArray(v) && v.every(x => typeof x === "string"));

const settings = definePluginSettings({
    max: { type: "number", label: { zh: "最多保存几条", en: "Maximum stored prompts" }, default: MAX_DEFAULT, min: 10, max: 500, step: 10 },
    browse: { type: "action", label: L.open, button: L.openBtn, run: () => openHistory(false) },
    button: { type: "boolean", label: { zh: "在输入框旁显示历史按钮", en: "History button next to the model picker" }, default: false },
});

/**
 * Newest first, like void++: a prompt is kept every time it is sent, except right after the same one.
 * Trimmed to `max`.
 */
export function remember(list: string[], text: string, max: number) {
    const clean = text.replace(/​/g, "").replace(/\r\n?/g, "\n").replace(/\s+$/, "");
    if (!clean.trim() || list[0] === clean) return list.slice(0, max);
    return [clean, ...list].slice(0, max);
}

/** Whether the caret sits on the first (or last) visual line, where ↑ (or ↓) leaves the text for history. */
function caretAtEdge(editor: HTMLElement, edge: "start" | "end") {
    const selection = getSelection();
    if (!selection?.rangeCount || !selection.isCollapsed) return false;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return false;
    const caret = range.getClientRects()[0] ?? (range.startContainer as Element).getBoundingClientRect?.();
    if (!caret || (!caret.height && !caret.width)) return true;
    // The tops of the text's visual lines (wrapped lines and paragraphs alike), as void++ measures them.
    const all = document.createRange();
    all.selectNodeContents(editor);
    const tops: number[] = [];
    for (const rect of all.getClientRects()) {
        if (rect.height < 1 && rect.width < 1) continue;
        if (!tops.some(top => Math.abs(top - rect.top) < 4)) tops.push(rect.top);
    }
    if (tops.length < 2) return true;
    tops.sort((x, y) => x - y);
    const line = tops.reduce((best, top, i) => (Math.abs(top - caret.top) < Math.abs(tops[best] - caret.top) ? i : best), 0);
    return edge === "start" ? line === 0 : line === tops.length - 1;
}

function placeCaret(editor: HTMLElement, atStart: boolean) {
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(atStart);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
}

const HUD_CSS = `
.ccpp-ih-hud { position: fixed; z-index: 2147483646; display: flex; align-items: center; gap: 2px; padding: 4px 8px; border: 1px solid var(--cds-border-subtle, rgba(127,127,127,.25)); border-radius: 8px; background: var(--cds-surface-raised, var(--cds-bg-primary, #262624)); color: var(--cds-text-secondary, #a3a3a3); font-size: 12px; font-variant-numeric: tabular-nums; line-height: 1.2; pointer-events: none; opacity: 0; transform: translate(-50%, -100%); transition: opacity .12s ease; }
.ccpp-ih-hud.on { opacity: 1; }
.ccpp-ih-hud.on button { pointer-events: auto; cursor: pointer; }
.ccpp-ih-hud button { margin: 0; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; }
.ccpp-ih-hud .x { width: 14px; font-size: 14px; line-height: 1; }
.ccpp-ih-hud button:hover { color: var(--cds-text-primary, #fff); }
`;

const LIST_CSS = `
.ih-meta { display: flex; align-items: center; gap: 8px; margin: 8px 0; }
.ih-count { flex: 1; min-width: 0; color: var(--fg3); font-size: var(--fs-sm); font-variant-numeric: tabular-nums; white-space: nowrap; }
.ih-list { display: flex; flex-direction: column; gap: 2px; }
.ih-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 4px 6px 8px; border-radius: var(--radius); }
.ih-item:hover, .ih-item.on { background: var(--bg2); }
.ih-item.live { box-shadow: inset 0 0 0 1px var(--field-ring); }
.ih-index { flex: none; min-width: 1.75rem; padding-top: 3px; color: var(--fg3); font-size: var(--fs-xs); font-variant-numeric: tabular-nums; text-align: right; }
.ih-main { flex: 1; min-width: 0; padding-top: 2px; cursor: pointer; white-space: pre-wrap; word-break: break-word; }
.ih-main.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ih-actions { flex: none; display: flex; gap: 0; }
.ih-empty { margin: 12px 0; color: var(--fg3); }
`;

/* ---------- browsing state ---------- */

let cursor = -1;
let draft = "";
let applying = 0;
let hudEditor: HTMLElement | null = null;
let historyOpen = false;
let hudEl: HTMLElement | null = null;

function resetBrowse() {
    cursor = -1;
    draft = "";
    hideHud();
}

function fill(editor: HTMLElement, text: string, atStart: boolean) {
    applying = Date.now();
    setText(text, editor);
    // Multi-line text lands a frame later; put the caret where void++ does once it is in.
    const place = () => editor.isConnected && placeCaret(editor, atStart);
    requestAnimationFrame(place);
    setTimeout(place, 90);
}

function hud(): HTMLElement {
    if (hudEl?.isConnected) return hudEl;
    const count = h("button", { type: "button", class: "count" });
    count.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openHistory(true);
    });
    const close = h("button", { type: "button", class: "x", "aria-label": t(L.exit), text: "×" });
    close.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        cancelBrowse(hudEditor?.isConnected ? hudEditor : getEditor());
    });
    hudEl = h("div", { class: "ccpp-ih-hud", role: "group", "aria-live": "polite", "aria-label": t(L.title) }, count, close);
    document.body.appendChild(hudEl);
    return hudEl;
}

function hideHud() {
    hudEl?.classList.remove("on");
}

function showHud(editor: HTMLElement) {
    const list = history.get();
    if (historyOpen || cursor < 0 || cursor >= list.length) return;
    hudEditor = editor;
    const el = hud();
    const label = `${list.length - cursor} / ${list.length}`;
    const count = el.querySelector<HTMLElement>(".count")!;
    count.textContent = label;
    count.setAttribute("aria-label", t(L.showAll).replace("{n}", label));
    const bar = composerBox(editor);
    const place = () => {
        if (historyOpen || !bar.isConnected || cursor < 0) return;
        const r = bar.getBoundingClientRect();
        el.style.left = `${r.left + r.width / 2}px`;
        el.style.top = `${r.top - 8}px`;
        el.classList.add("on");
    };
    // A multi-line prompt lands a moment later and grows the card upward; follow it.
    requestAnimationFrame(place);
    setTimeout(place, 120);
    setTimeout(place, 300);
}

/** The composer card around an editor; Claude Code composers (project chat, thread pane) have no ChatComposer mark. */
function composerBox(editor: HTMLElement): HTMLElement {
    const marked = editor.closest<HTMLElement>(SEL.composer);
    if (marked) return marked;
    // Climb to the outermost box that still holds this composer's send button and no other editor.
    let box: HTMLElement = editor;
    for (let el = editor.parentElement; el && el !== document.body; el = el.parentElement) {
        if (el.querySelectorAll(SEL.editor).length > 1) break;
        if (el.querySelector(SEL.sendButton)) {
            box = el;
            break;
        }
    }
    return box;
}

function cancelBrowse(editor: HTMLElement | null) {
    const saved = draft;
    resetBrowse();
    if (editor?.isConnected) fill(editor, saved, false);
}

/** Steps one prompt older (↑) or newer (↓); past the newest the draft comes back. */
function cycle(older: boolean, editor: HTMLElement) {
    const list = history.get();
    if (cursor < 0) draft = getText(editor);
    cursor += older ? 1 : -1;
    if (cursor < 0) {
        const saved = draft;
        resetBrowse();
        fill(editor, saved, false);
        return;
    }
    fill(editor, list[cursor], older);
    showHud(editor);
}

/* ---------- history dialog (void++'s HistoryPanel) ---------- */

function openHistory(picker: boolean) {
    historyOpen = true;
    hideHud();
    let query = "";
    let open: number | null = null;
    const body = h("div");
    const search = h("input", { class: "input", type: "search", placeholder: t(L.search), "aria-label": t(L.search) });
    search.addEventListener("input", () => {
        query = search.value;
        draw();
    });
    // Title, note, search and count stay fixed; only the list scrolls.
    // The search box is never rebuilt, so typing keeps its focus.
    const meta = h("div");
    const top = h("div", {}, h("style", { text: LIST_CSS }), h("p", { class: "d-desc", text: t(L.sub) }), search, meta);
    const draw = () => {
        clear(meta);
        clear(body);
        const list = history.get();
        const total = list.length;
        const needle = query.trim().toLowerCase();
        // Shown newest first; the number is the prompt's place counted from the oldest, as in the counter.
        const rows = list.map((text, i) => ({ text, i, n: total - i })).filter(row => !needle || row.text.toLowerCase().includes(needle));
        search.hidden = !total;
        const wipe = h("button", { type: "button", class: "btn", text: t(L.clear), disabled: !total });
        wipe.addEventListener("click", async () => {
            if (!(await confirmDialog({ title: t(L.clear), body: t(L.clearBody), ok: L.clearOk, danger: true }))) return;
            history.set([]);
            resetBrowse();
            query = "";
            search.value = "";
            open = null;
            draw();
        });
        meta.appendChild(h("div", { class: "ih-meta" }, h("span", { class: "ih-count", text: (needle ? t(L.matches) : t(L.stored)).replace("{n}", String(needle ? rows.length : total)) }), wipe));
        if (!total) return void body.appendChild(h("p", { class: "ih-empty", text: t(L.empty) }));
        if (!rows.length) return void body.appendChild(h("p", { class: "ih-empty", text: t(L.noMatch) }));
        const listEl = h("div", { class: "ih-list" });
        for (const row of rows) {
            const expanded = open === row.i;
            const main = h("div", { class: `ih-main${expanded ? "" : " clamp"}`, role: "button", tabindex: "0", text: row.text });
            const toggle = () => {
                open = expanded ? null : row.i;
                draw();
            };
            main.addEventListener("click", toggle);
            main.addEventListener("keydown", event => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                toggle();
            });
            const action = (name: string, label: Parameters<typeof t>[0], run: () => void) => {
                const button = h("button", { type: "button", class: "icon-btn", "aria-label": t(label), ...tipAttrs(t(label)) }, icon(name, 16));
                button.addEventListener("click", run);
                return button;
            };
            const actions = h("div", { class: "ih-actions" });
            if (picker) actions.appendChild(action("pencil", L.use, () => {
                close();
                adopt(row.text, row.i);
            }));
            actions.appendChild(action("copy", L.copy, () => void navigator.clipboard?.writeText(row.text).catch(() => {})));
            actions.appendChild(action("trash", L.remove, () => {
                if (open === row.i) open = null;
                const next = history.get().filter((_, i) => i !== row.i);
                history.set(next);
                if (cursor >= next.length || cursor === row.i) resetBrowse();
                else if (cursor > row.i) cursor--;
                draw();
            }));
            const live = picker && row.i === cursor;
            listEl.appendChild(h("div", { class: `ih-item${expanded ? " on" : ""}${live ? " live" : ""}` }, h("span", { class: "ih-index", text: String(row.n) }), main, actions));
        }
        body.appendChild(listEl);
        listEl.querySelector(".live")?.scrollIntoView({ block: "nearest" });
    };
    const done = () => {
        historyOpen = false;
        if (cursor >= 0 && hudEditor?.isConnected) showHud(hudEditor);
    };
    const close = openModal(dialogFrame({ title: t(L.title), icon: "history", top: [top], body: [body], onClose: () => close() }), { onClose: done });
    draw();
}

function adopt(text: string, index: number) {
    const editor = hudEditor?.isConnected ? hudEditor : getEditor();
    if (!editor) return;
    if (cursor < 0) draft = getText(editor);
    cursor = index;
    fill(editor, text, false);
    historyOpen = false;
    showHud(editor);
}

export default definePlugin({
    name: "InputHistory",
    title: { zh: "输入历史", en: "Input history" },
    description: {
        zh: "像终端一样用 ↑ / ↓ 调出之前发送过的提问，Esc 恢复草稿；浏览时输入框上方显示计数，点计数打开历史列表。",
        en: "Recall previous prompts with ↑ and ↓, like a shell. Esc restores your draft. Click the counter to browse history.",
    },
    category: "composer",
    icon: "history",
    enabledByDefault: true,
    dependencies: ["ComposerApi", "SlotsApi", "StylesApi", "Settings"],
    settings,
    start(scope) {
        addStyle(scope, HUD_CSS, "input-history");
        resetBrowse();
        let lastSent = { text: "", at: 0 };

        onSubmit(scope, text => {
            const now = Date.now();
            if (text === lastSent.text && now - lastSent.at < CAPTURE_DEDUPE_MS) return;
            lastSent = { text, at: now };
            // Other tabs may have added prompts since this one last looked.
            history.reload();
            history.set(remember(history.get(), text, settings.store.max));
            resetBrowse();
        });

        // Typing over a recalled prompt makes it the new draft.
        scope.listen(document, "input", (event: Event) => {
            if (cursor < 0 || Date.now() - applying < APPLY_QUIET_MS) return;
            if (!(event.target as HTMLElement | null)?.closest?.(SEL.editor)) return;
            resetBrowse();
        }, { capture: true });

        scope.listen(document, "keydown", (event: KeyboardEvent) => {
            if (event.isComposing || event.keyCode === 229) return;
            if (event.key === "Escape" && !event.altKey && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
                if (cursor < 0 || historyOpen) return;
                const editor = (event.target as HTMLElement | null)?.closest?.(SEL.editor) as HTMLElement | null;
                cancelBrowse(editor ?? (hudEditor?.isConnected ? hudEditor : getEditor()));
                event.preventDefault();
                event.stopImmediatePropagation();
                return;
            }
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            if (event.ctrlKey || event.metaKey || event.shiftKey || historyOpen) return;
            const editor = (event.target as HTMLElement | null)?.closest?.(SEL.editor) as HTMLElement | null;
            if (!editor) return;
            const older = event.key === "ArrowUp";
            // Inside multi-line text the arrows move the caret as usual; Alt jumps straight to history.
            if (!event.altKey && !caretAtEdge(editor, older ? "start" : "end")) return;
            const list = history.get();
            if (older ? cursor >= list.length - 1 : cursor < 0) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            cycle(older, editor);
        }, { capture: true });

        onRoute(scope, () => resetBrowse(), false);
        scope.defer(() => {
            resetBrowse();
            hudEl?.remove();
            hudEl = null;
            hudEditor = null;
        });

        if (settings.store.button) {
            const popover = createPopover(scope, "input-history", "", 360);
            addSlotItem(scope, "composer", "input-history", () =>
                slotButton(t(L.title), event => popover.open(event.currentTarget as HTMLElement, (panel, close) => {
                    panel.appendChild(h("div", { class: "top" }, icon("history", 16), h("b", { text: t(L.title) })));
                    const list = history.get();
                    if (!list.length) panel.appendChild(h("div", { class: "msg", text: t(L.empty) }));
                    list.slice(0, 50).forEach((text, i) => {
                        const item = h("button", { type: "button", class: "item" }, h("span", { class: "grow clip2", text: snippet(text, 200) }));
                        item.addEventListener("click", () => {
                            close();
                            adopt(text, i);
                        });
                        panel.appendChild(item);
                    });
                }), icon("history", 16)), 20);
        }
    },
});
