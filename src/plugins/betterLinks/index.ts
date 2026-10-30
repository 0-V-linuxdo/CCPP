/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { definePluginSettings } from "@kernel/settings";
import { h } from "@lib/dom";
import { SEL, watch } from "@api/dom";
import { addStyle } from "@api/styles";

const settings = definePluginSettings({
    bare: { type: "boolean", label: { zh: "裸域名变成链接", en: "Turn bare domains into links" }, default: true },
    colors: { type: "boolean", label: { zh: "给回复里的链接上色", en: "Color links in replies" }, default: false },
    linkColor: { type: "color", label: { zh: "链接颜色", en: "Link color" }, default: "#4a9eff", visible: v => v.colors === true },
    visited: { type: "boolean", label: { zh: "访问过的链接用另一种颜色", en: "Another color for visited links" }, default: true, visible: v => v.colors === true },
    visitedColor: { type: "color", label: { zh: "已访问链接颜色", en: "Visited link color" }, default: "#9b59b6", visible: v => v.colors === true && v.visited === true },
});

export function linkCss(o: { colors: boolean; linkColor: string; visited: boolean; visitedColor: string }) {
    if (!o.colors) return "";
    const links = `:is(${SEL.assistantMessage}, ${SEL.userMessage}) a[href]`;
    const visited = o.visited ? `\n${links}:visited { color: ${o.visitedColor} !important; text-decoration-color: ${o.visitedColor} !important; }` : "";
    return `${links} { color: ${o.linkColor} !important; text-decoration-color: ${o.linkColor} !important; }${visited}`;
}

/** Bare domains such as example.com/path — not e-mail addresses, not inside words. */
export const DOMAIN_RE = /(?<![@\w./-])((?:https?:\/\/)?(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|ai|app|edu|gov|co|cn|me|info|xyz|so|sh|gg|tv|uk|de|jp)(?:\/[^\s<>()"'，。、）]*)?)(?![\w@-])/gi;

export function splitLinks(text: string): (string | { href: string; text: string })[] {
    const out: (string | { href: string; text: string })[] = [];
    let last = 0;
    DOMAIN_RE.lastIndex = 0;
    for (let m = DOMAIN_RE.exec(text); m; m = DOMAIN_RE.exec(text)) {
        let value = m[1];
        const trail = /[.,;:!?]+$/.exec(value)?.[0] ?? "";
        value = value.slice(0, value.length - trail.length);
        if (m.index > last) out.push(text.slice(last, m.index));
        out.push({ href: /^https?:\/\//i.test(value) ? value : `https://${value}`, text: value });
        last = m.index + value.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

const HAS_DOMAIN = new RegExp(DOMAIN_RE.source, "i");
const SKIP = "a, code, pre, button, [contenteditable], .katex";

export default definePlugin({
    name: "BetterLinks",
    title: { zh: "更好的链接", en: "Better links" },
    description: {
        zh: "把回复里没有加链接的域名（如 example.com/docs）变成可点击的链接（只处理已完成的回复），可给链接和访问过的链接分别上色。",
        en: "Turns bare domains in finished replies (like example.com/docs) into links, and can color links and visited links.",
    },
    category: "messages",
    icon: "link",
    updatedAt: "2026-10-30",
    enabledByDefault: false,
    dependencies: ["DomApi", "StylesApi"],
    settings,
    start(scope) {
        addStyle(scope, linkCss(settings.store), "better-links");
        if (!settings.store.bare) return;
        watch(scope, `${SEL.assistantMessage}[data-is-streaming="false"] ${SEL.prose}`, prose => {
            const added: HTMLAnchorElement[] = [];
            const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
                acceptNode: node => (node.parentElement?.closest(SKIP) || !HAS_DOMAIN.test(node.nodeValue ?? "") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
            });
            const nodes: Text[] = [];
            for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
            for (const node of nodes) {
                const parts = splitLinks(node.nodeValue ?? "");
                if (parts.length < 2) continue;
                const frag = document.createDocumentFragment();
                for (const part of parts) {
                    if (typeof part === "string") frag.append(part);
                    else {
                        const a = h("a", { href: part.href, target: "_blank", rel: "noopener noreferrer", text: part.text, "data-ccpp-link": "" });
                        added.push(a);
                        frag.append(a);
                    }
                }
                node.replaceWith(frag);
            }
            return () => {
                for (const a of added) if (a.isConnected) a.replaceWith(a.textContent ?? "");
            };
        });
    },
});
