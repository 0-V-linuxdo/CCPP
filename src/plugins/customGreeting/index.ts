/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings, resetRaw } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { SEL } from "@api/dom";
import { onRoute } from "@api/router";
import { addStyle } from "@api/styles";
import { textNodes, TextSwaps } from "@lib/identity";

const settings = definePluginSettings({
    phrases: {
        type: "text",
        label: { zh: "问候语（每行一条）", en: "Greetings (one per line)" },
        description: { zh: "可用 {name}、{time}。留空保持官方问候语。", en: "Supports {name} and {time}. Empty keeps claude.ai's greeting." },
        rows: 5,
        default: t({ zh: "{time}，{name}\n今天想做点什么？\n灵感来了就写下来", en: "{time}, {name}\nWhat shall we work on today?\nWrite it down while the idea is fresh" }),
    },
    order: {
        type: "select",
        label: { zh: "顺序", en: "Order" },
        default: "random",
        options: [
            { value: "random", label: { zh: "随机", en: "Random" } },
            { value: "sequential", label: { zh: "依次", en: "In order" } },
        ],
    },
    rotate: {
        type: "select",
        label: { zh: "什么时候换", en: "Change on" },
        default: "visit",
        options: [
            { value: "visit", label: { zh: "每次打开首页", en: "Each visit to the home page" } },
            { value: "click", label: { zh: "点击问候语", en: "Clicking the greeting" } },
            { value: "timer", label: { zh: "定时", en: "A timer" } },
        ],
    },
    intervalSec: { type: "number", label: { zh: "定时间隔", en: "Timer interval" }, default: 30, min: 5, max: 600, step: 5, unit: "s", visible: v => v.rotate === "timer" },
});

const position = persisted<number>("greeting-index", 0, (v): v is number => Number.isInteger(v));

export function pickPhrase(phrases: string[], order: string, last: number, random = Math.random) {
    if (!phrases.length) return { index: -1, text: "" };
    if (order === "sequential") {
        const index = (last + 1) % phrases.length;
        return { index, text: phrases[index] };
    }
    let index = Math.floor(random() * phrases.length);
    if (phrases.length > 1 && index === last) index = (index + 1) % phrases.length;
    return { index, text: phrases[index] };
}

export function fillPhrase(text: string, name: string, hour: number, zh: boolean) {
    const time = hour < 5 ? (zh ? "夜深了" : "Good night") : hour < 12 ? (zh ? "早上好" : "Good morning") : hour < 18 ? (zh ? "下午好" : "Good afternoon") : zh ? "晚上好" : "Good evening";
    return text.replaceAll("{name}", name).replaceAll("{time}", time);
}

/**
 * The home greeting(s). Pages that drop claude.ai's text marker (some new-chat and Code layouts)
 * still put the spark right before the words: the spark's row is the greeting, as long as it
 * sits on an empty home page (a prompt box, no transcript) and isn't a link, button or the sidebar.
 */
export function findGreetings(root: ParentNode = document): HTMLElement[] {
    const marked = [...root.querySelectorAll<HTMLElement>(SEL.greeting)];
    if (marked.length) return marked;
    const editor = document.querySelector(SEL.editor);
    if (!editor || document.querySelector(`${SEL.transcript}, ${SEL.userMessage}, ${SEL.assistantMessage}`)) return [];
    const found = new Set<HTMLElement>();
    for (const spark of root.querySelectorAll<Element>(SEL.greetingSpark)) {
        const holder = spark.closest<Element>("[data-new-page-greeting-spark]") ?? spark;
        // The spark may sit in a wrapper of its own: climb to the first box that also holds words.
        let row = holder.parentElement;
        for (let up = 0; row && up < 3 && !greetingText(row).trim(); up++) row = row.parentElement;
        if (!row || row.contains(editor) || row.closest(`a, button, [role="button"], ${SEL.sidebar}, ${SEL.composer}`)) continue;
        const words = greetingText(row).trim();
        if (!words || words.length > 200 || words === "Claude") continue;
        found.add(row);
    }
    return [...found];
}

/** The greeting's own text nodes, leaving out the spark. */
const greetingNodes = (el: Element) => textNodes(el).filter(node => !node.parentElement?.closest(`svg, [data-new-page-greeting-spark]`));
const greetingText = (el: Element) => greetingNodes(el).map(node => node.data).join("");

const displayName = () => document.querySelector(`${SEL.userMenuButton} [data-cds="Avatar"]`)?.getAttribute("aria-label")?.trim() || document.querySelector(`${SEL.userMenuName} span`)?.textContent?.trim() || "";

const CLICKABLE = "data-ccpp-greeting-click";

export default definePlugin({
    name: "CustomGreeting",
    title: { zh: "自定义问候语", en: "Custom greeting" },
    description: { zh: "替换首页问候语（含新版首页），多条随机 / 依次轮换（打开时、点击或定时）。", en: "Your own home greeting (new layouts too), rotated on visit, click or a timer." },
    category: "appearance",
    icon: "message",
    enabledByDefault: false,
    updatedAt: "2026-10-24",
    dependencies: ["DomApi", "RouterApi", "StylesApi"],
    settings,
    start(scope) {
        const phrases = () => settings.store.phrases.split("\n").map(s => s.trim()).filter(Boolean);
        // The input placeholder options are gone; drop what older versions saved for them.
        resetRaw(settings.owner(), ["input", "placeholder"]);
        const swaps = new TextSwaps();
        addStyle(scope, `[${CLICKABLE}] { cursor: pointer; }`, "custom-greeting");
        let template = "";
        let shown = false;
        const fill = (text: string) => fillPhrase(text, displayName(), new Date().getHours(), /[一-龥]/.test(text));
        const next = () => {
            const pick = pickPhrase(phrases(), settings.store.order, position.get());
            if (pick.index >= 0) position.set(pick.index);
            template = pick.text;
        };

        const paintGreeting = () => {
            const targets = findGreetings();
            swaps.prune();
            if (!targets.length) {
                shown = false;
                return;
            }
            // Each arrival on a page with a greeting is a visit.
            if (!shown && (settings.store.rotate === "visit" || !template)) next();
            shown = true;
            const list = phrases();
            const text = list.length ? fill(template || list[0]) : "";
            const clickable = settings.store.rotate === "click" && list.length > 1;
            for (const el of targets) {
                const nodes = greetingNodes(el);
                if (!text) for (const node of nodes) swaps.restore(node);
                else nodes.forEach((node, i) => swaps.set(node, i ? "" : text));
                if (clickable !== el.hasAttribute(CLICKABLE)) el.toggleAttribute(CLICKABLE, clickable);
            }
        };

        const paint = paintGreeting;

        // React writes the original text back on re-render; keep ours.
        let timer: ReturnType<typeof setTimeout> | null = null;
        const observer = new MutationObserver(() => (timer ??= setTimeout(() => {
            timer = null;
            if (scope.alive) paint();
        }, 60)));
        observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
        scope.defer(() => {
            observer.disconnect();
            if (timer) clearTimeout(timer);
            swaps.restore();
            for (const el of document.querySelectorAll(`[${CLICKABLE}]`)) el.removeAttribute(CLICKABLE);
        });

        scope.listen(document, "click", event => {
            const target = event.target instanceof Element ? event.target : null;
            // New chat while already on the home page: same URL, same greeting element, still a new visit.
            const home: Element | null | undefined = target?.closest("a[href]");
            if (home && ["/", "/new"].includes(home.getAttribute("href")!) && ["/", "/new"].includes(location.pathname)) {
                shown = false;
                setTimeout(() => scope.alive && paint(), 120);
                return;
            }
            if (settings.store.rotate !== "click" || phrases().length < 2) return;
            if (!target || !findGreetings().some(el => el.contains(target))) return;
            // Selecting the greeting's text is not a request for a new one.
            if (String(window.getSelection?.() ?? "").trim()) return;
            next();
            paint();
        });
        if (settings.store.rotate === "timer") scope.interval(() => {
            if (!shown) return;
            next();
            paint();
        }, settings.store.intervalSec * 1000);
        // A new page is a new visit, even when the greeting stays mounted (New chat on the home page).
        // The route changes before React swaps the page; the observer repaints once it has.
        onRoute(scope, () => {
            shown = false;
        }, false);
        paint();
    },
});
