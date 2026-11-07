import { describe, expect, test } from "bun:test";
import { spawnSync } from "child_process";
import { existsSync } from "fs";

const bun = process.execPath;

describe("plugin entries", () => {
    test("sites/claude/plugins matches src/plugins/index.ts", () => {
        const result = spawnSync(bun, ["--preload", "./tests/setup.ts", "scripts/entries.ts", "--check"], { encoding: "utf-8" });
        expect(result.stderr.trim()).toBe("");
        expect(result.status).toBe(0);
    });
});

// The built script (bun run build) on Userscript++, upgrading from 0.3.
describe.skipIf(!existsSync("userscript/CCPP.user.js"))("built userscript", () => {
    const result = spawnSync(bun, ["--preload", "./tests/setup.ts", "tests/smoke/run.ts"], { encoding: "utf-8", timeout: 60000 });
    const report = JSON.parse(result.stdout || "{}");

    test("boots every plugin on the framework", () => {
        expect(report.version).toMatch(/^0\.4\./);
        expect(report.flag).toBe(report.version);
        expect(report.plugins).toBeGreaterThan(40);
        expect(report.failed).toEqual([]);
        expect(report.running).toContain("UsageDisplay");
        expect(report.running).toContain("CCPPSettings");
        expect(report.errors.filter((e: string) => !/40[13] \(Forbidden\)/.test(e))).toEqual([]);
    });

    test("wraps fetch before the framework reads its async storage", () => {
        expect(report.earlyFetchWrapped).toBe(true);
    });

    test("copies 0.3 settings into the framework store", () => {
        expect(report.stored.WiderChat).toMatchObject({ enabled: true, width: 1100 });
        expect(report.stored.CCPPSettings).toMatchObject({ language: "zh" });
        expect(typeof report.stored.CCPPSettings.migratedFrom03).toBe("number");
        expect(report.beforeSync).toContain("WiderChat");
        expect(report.beforeSync).not.toContain("ChatNavigator");
    });

    test("starts and stops plugins switched in another tab", () => {
        expect(report.afterSync).toContain("ChatNavigator");
        expect(report.afterSync).not.toContain("WiderChat");
    });

    test("keeps one settings entry in the script-manager menu", () => {
        expect(report.menus.filter((m: string) => /CC\+\+ (settings|设置)/.test(m))).toHaveLength(1);
    });
});
