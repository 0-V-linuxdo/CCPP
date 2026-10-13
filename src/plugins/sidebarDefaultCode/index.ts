/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { SEL, watch } from "@api/dom";
import { currentRoute } from "@api/router";

/** Past this the page is in use; switching would yank the user away. */
const GIVE_UP_MS = 15000;

/** Once per page load: re-enabling the plugin or later navigation never forces it again. */
let decided = false;

const hasDraft = () => !!document.querySelector(SEL.editor)?.textContent?.trim();

export default definePlugin({
    name: "SidebarDefaultCode",
    title: { zh: "侧栏默认 Code", en: "Sidebar defaults to Code" },
    description: {
        zh: "打开 claude.ai 首页时，侧栏顶部的 Chat / Code 切换自动停在 Code（Claude Code）。只在页面加载时切一次，之后手动切回 Chat 不受影响；打开具体对话链接时不切。",
        en: "When claude.ai opens on the home page, the Chat / Code switch at the top of the sidebar starts on Code (Claude Code). It switches once per page load, never after you pick Chat yourself, and never when you open a specific chat.",
    },
    category: "chats",
    icon: "terminal",
    enabledByDefault: true,
    updatedAt: "2026-10-13",
    dependencies: ["DomApi", "RouterApi"],
    start(scope) {
        if (decided) return;
        const run = scope.child();
        run.timeout(() => {
            decided = true;
            run.dispose();
        }, GIVE_UP_MS);
        watch(run, SEL.modeCode, code => {
            if (decided) return;
            decided = true;
            queueMicrotask(() => run.dispose());
            // The switch navigates to /code, so only leave the empty home page, never an open chat or a draft.
            if (currentRoute().kind !== "new" || hasDraft()) return;
            if (code.getAttribute("aria-checked") !== "true") code.click();
        });
    },
});
