/*
 * CC++, a userscript for claude.ai
 * Copyright (c) 2026 CC++ Contributors
 * SPDX-License-Identifier: MIT
 */

/*
 * Builds userscript/CCPP.user.js (and CCPP.meta.js) with Userscript++ (vendor/userscript-pp):
 * the framework's core, the claude.ai site in sites/claude, and one plugin entry per CC++ plugin.
 */

import { spawnSync } from "child_process";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
// Build date (Beijing time) in front of the version, as since 0.1: Violentmonkey compares @version
// part by part, so 20261107.0.4.0 stays newer than every 0.3 build (20261107.0.3.x) before it.
const VERSION_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .replaceAll("-", "");
const version = `${VERSION_DATE}.${pkg.version}`;

const run = (cmd: string, args: string[], env: Record<string, string> = {}) => {
    const result = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } });
    if (result.status !== 0) process.exit(result.status ?? 1);
};

run(process.execPath, ["--preload", "./tests/setup.ts", "scripts/entries.ts"]);
run("node", ["vendor/userscript-pp/scripts/build.mjs", "--site-dir", "sites/claude", "--out", "userscript", "--prod"], { USPP_VERSION: version });
console.log(`Built userscript/CCPP.user.js [${VERSION_DATE}] v${pkg.version}`);
