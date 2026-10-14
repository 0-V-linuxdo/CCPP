/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { t } from "@kernel/i18n";
import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { persisted } from "@kernel/storage";
import { SEL, watch } from "@api/dom";
import { onRoute } from "@api/router";

const settings = definePluginSettings({
    phrases: {
        type: "text",
        label: { zh: "问候语（每行一条）", en: "Greetings (one per line)" },
        description: { zh: "{name} 会替换成你的显示名，{time} 替换成早上好 / 下午好 / 晚上好。", en: "{name} becomes your display name, {time} becomes morning / afternoon / evening." },
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
    placeholder: { type: "string", label: { zh: "输入框占位文字", en: "Input placeholder" }, description: { zh: "留空保持官方文字。", en: "Empty keeps claude.ai's text." }, default: "" },
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

const displayName = () => document.querySelector(`${SEL.userMenuButton} [data-cds="Avatar"]`)?.getAttribute("aria-label")?.trim() || document.querySelector(`${SEL.userMenuName} span`)?.textContent?.trim() || "";

export default definePlugin({
    name: "CustomGreeting",
    title: { zh: "自定义问候语", en: "Custom greeting" },
    description: { zh: "替换新对话首页的问候语，支持多条随机 / 依次轮换（打开时、点击或定时），也可改输入框占位文字。", en: "Replaces the new-chat greeting with your own lines, rotated on visit, click or a timer; can also change the input placeholder." },
    category: "appearance",
    icon: "message",
    enabledByDefault: false,
    dependencies: ["DomApi", "RouterApi"],
    settings,
    start(scope) {
        const phrases = () => settings.store.phrases.split("\n").map(s => s.trim()).filter(Boolean);
        let text = "";
        const next = () => {
            const pick = pickPhrase(phrases(), settings.store.order, position.get());
            if (pick.index >= 0) position.set(pick.index);
            text = fillPhrase(pick.text, displayName(), new Date().getHours(), /[一-龥]/.test(pick.text));
        };
        const paint = () => {
            for (const el of document.querySelectorAll<HTMLElement>(SEL.greeting)) {
                if (text && el.textContent !== text) el.textContent = text;
            }
            const placeholder = settings.store.placeholder.trim();
            if (placeholder) {
                for (const p of document.querySelectorAll<HTMLElement>(`${SEL.editor} p[data-placeholder]`)) {
                    if (p.dataset.placeholder !== placeholder) p.dataset.placeholder = placeholder;
                }
            }
        };
        next();
        onRoute(scope, route => {
            if (route.kind === "new" && settings.store.rotate === "visit") next();
            paint();
        }, false);
        watch(scope, SEL.greeting, el => {
            paint();
            // React writes the original text back on re-render; keep ours.
            const observer = new MutationObserver(paint);
            observer.observe(el, { childList: true, characterData: true, subtree: true });
            const onClick = () => {
                if (settings.store.rotate !== "click") return;
                next();
                paint();
            };
            el.style.cursor = settings.store.rotate === "click" ? "pointer" : "";
            el.addEventListener("click", onClick);
            return () => {
                observer.disconnect();
                el.removeEventListener("click", onClick);
            };
        });
        if (settings.store.placeholder.trim()) watch(scope, `${SEL.editor} p[data-placeholder]`, p => {
            paint();
            const observer = new MutationObserver(paint);
            observer.observe(p, { attributes: true, attributeFilter: ["data-placeholder"] });
            return () => observer.disconnect();
        });
        if (settings.store.rotate === "timer") scope.interval(() => {
            next();
            paint();
        }, settings.store.intervalSec * 1000);
    },
});
