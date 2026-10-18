/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { definePlugin } from "@kernel/plugins";
import { addStyle } from "@api/styles";

/** A running thread's progress pill: a busy rounded badge holding claude.ai's Spinner and an "N/M" count. */
export const RUNNING_PILL = '[aria-busy="true"].rounded-full:has(> [data-cds="Spinner"])';

// The spinner draws in currentColor, so turning the text orange turns the spinner orange too.
const BRAND = "var(--cds-fill-brand, #c6613f)";
const CSS = `
${RUNNING_PILL} {
    color: ${BRAND} !important;
    border-color: color-mix(in srgb, ${BRAND} 55%, transparent) !important;
    background-color: color-mix(in srgb, ${BRAND} 14%, var(--cds-surface-1, transparent)) !important;
    font-weight: 500;
}
`;

export default definePlugin({
    name: "RunningPill",
    title: { zh: "高亮运行中的进度", en: "Highlight running progress" },
    description: {
        zh: "项目页里正在运行的线程，右侧的进度标记（转圈 + 1/6 这样的计数）改用 Claude 的橙色主题色，一眼看出哪些在跑。",
        en: "On project pages, the progress pill (spinner plus a count like 1/6) of a running thread uses Claude's orange brand color, so running work stands out.",
    },
    category: "appearance",
    icon: "sparkles",
    enabledByDefault: true,
    updatedAt: "2026-10-18",
    dependencies: ["StylesApi"],
    start(scope) {
        addStyle(scope, CSS, "running-pill");
    },
});
