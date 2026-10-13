/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const VERSION_DATE = "20261013";
const displayVersion = `[${VERSION_DATE}] v${pkg.version}`;
const REPO = "https://github.com/0-V-linuxdo/CCPP";
const RAW = "https://raw.githubusercontent.com/0-V-linuxdo/CCPP/main/userscript/CCPP.user.js";

const HEADER = `// ==UserScript==
// @name         CC++
// @namespace    ${REPO}
// @version      ${VERSION_DATE}.${pkg.version}
// @description  Everything-is-a-plugin enhancements for claude.ai: usage meter, chat outline, starred messages, prompt history, notifications and more.
// @author       CC++ Contributors
// @homepageURL  ${REPO}
// @supportURL   ${REPO}/issues
// @downloadURL  ${RAW}
// @updateURL    ${RAW}
// @match        https://claude.ai/*
// @run-at       document-start
// @inject-into  page
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// @noframes
// @license      MIT
// ==/UserScript==
`;

const result = await Bun.build({
    entrypoints: ["src/index.ts"],
    target: "browser",
    format: "iife",
    minify: false,
    define: { VERSION: JSON.stringify(displayVersion) },
});

if (!result.success) {
    for (const log of result.logs) console.error(log);
    process.exit(1);
}

const code = await result.outputs[0].text();
writeFileSync("userscript/CCPP.user.js", `${HEADER}\n${code}`);
console.log(`Built userscript/CCPP.user.js (${(code.length / 1024).toFixed(1)} KiB) ${displayVersion}`);
