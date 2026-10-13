/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { h } from "@lib/dom";
import { SEL, watch } from "@api/dom";

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
    title: { zh: "裸域名可点击", en: "Clickable bare domains" },
    description: { zh: "把回复里没有加链接的域名（如 example.com/docs）变成可点击的链接，只处理已完成的回复。", en: "Turns bare domains in finished replies (like example.com/docs) into links." },
    category: "messages",
    icon: "link",
    enabledByDefault: false,
    dependencies: ["DomApi"],
    start(scope) {
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
