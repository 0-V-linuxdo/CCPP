import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { definePlugin, isActive, pendingRestart, registerPlugins, resetRegistry, setEnabled, startPhase, getPlugin, findCycle } from "../src/kernel/plugins";
import { coerce, definePluginSettings, diffBags, setRaw } from "../src/kernel/settings";
import { Scope } from "../src/kernel/scope";

const log: string[] = [];
const make = (name: string, extra: Partial<Parameters<typeof definePlugin>[0]> = {}) =>
    definePlugin({
        name,
        title: name,
        description: name,
        category: "developer",
        start: scope => {
            log.push(`start ${name}`);
            scope.defer(() => log.push(`stop ${name}`));
        },
        ...extra,
    });

beforeEach(() => {
    localStorage.clear();
    log.length = 0;
});
afterEach(() => resetRegistry());

describe("plugin lifecycle", () => {
    test("dependencies start first and stop last", () => {
        registerPlugins([make("Feature", { enabledByDefault: true, dependencies: ["Api"] }), make("Api")]);
        startPhase("dom-ready");
        expect(log).toEqual(["start Api", "start Feature"]);
        setEnabled(getPlugin("Feature")!, false);
        expect(log).toEqual(["start Api", "start Feature", "stop Feature", "stop Api"]);
    });

    test("a dependency stays on while something needs it", () => {
        registerPlugins([make("A", { enabledByDefault: true, dependencies: ["Api"] }), make("B", { enabledByDefault: true, dependencies: ["Api"] }), make("Api")]);
        startPhase("dom-ready");
        setEnabled(getPlugin("A")!, false);
        expect(isActive(getPlugin("Api")!)).toBe(true);
        expect(log).not.toContain("stop Api");
        setEnabled(getPlugin("B")!, false);
        expect(log).toContain("stop Api");
    });

    test("a throwing plugin is isolated", () => {
        registerPlugins([make("Bad", { enabledByDefault: true, start: () => { throw new Error("boom"); } }), make("Good", { enabledByDefault: true })]);
        startPhase("dom-ready");
        expect(getPlugin("Bad")!.scope).toBeNull();
        expect(getPlugin("Good")!.scope).not.toBeNull();
    });

    test("document-start plugins run before DOM-ready ones", () => {
        registerPlugins([make("Early", { enabledByDefault: true, startAt: "document-start" }), make("Late", { enabledByDefault: true })]);
        startPhase("document-start");
        expect(log).toEqual(["start Early"]);
        startPhase("dom-ready");
        expect(log).toEqual(["start Early", "start Late"]);
    });

    test("unknown dependencies and cycles are rejected", () => {
        expect(() => registerPlugins([make("X", { dependencies: ["Nope"] })])).toThrow();
        resetRegistry();
        expect(() => registerPlugins([make("P", { dependencies: ["Q"] }), make("Q", { dependencies: ["P"] })])).toThrow(/cycle/i);
        expect(findCycle()).not.toBeNull();
    });

    test("settings changes restart a plugin without its own handler", () => {
        const settings = definePluginSettings({ size: { type: "number", label: "s", default: 1, min: 0, max: 9 } });
        registerPlugins([make("Tuned", { enabledByDefault: true, settings })]);
        startPhase("dom-ready");
        settings.store.size = 4;
        expect(log).toEqual(["start Tuned", "stop Tuned", "start Tuned"]);
        expect(settings.store.size).toBe(4);
    });

    test("restartNeeded plugins are reported after switching", () => {
        registerPlugins([make("Hook", { restartNeeded: true })]);
        startPhase("dom-ready");
        expect(pendingRestart()).toHaveLength(0);
        setEnabled(getPlugin("Hook")!, true);
        expect(pendingRestart().map(p => p.name)).toEqual(["Hook"]);
    });
});

describe("settings", () => {
    test("coerce clamps and falls back", () => {
        expect(coerce({ type: "number", label: "", default: 5, min: 0, max: 10 }, 99)).toBe(10);
        expect(coerce({ type: "number", label: "", default: 5, min: 0, max: 10, step: 5 }, 7)).toBe(5);
        expect(coerce({ type: "boolean", label: "", default: true }, "x" as never)).toBe(true);
        expect(coerce({ type: "select", label: "", default: "a", options: [{ value: "a", label: "" }] }, "z")).toBe("a");
        expect(coerce({ type: "color", label: "", default: "#000000" }, "#ABCDEF")).toBe("#abcdef");
    });

    test("diffBags lists enabled first", () => {
        expect(diffBags({ A: { x: 1 } }, { A: { x: 2, enabled: true } })).toEqual([["A", "enabled"], ["A", "x"]]);
    });

    test("values persist under the ccpp: prefix", () => {
        setRaw("P", "k", true);
        expect(JSON.parse(localStorage.getItem("ccpp:settings")!).P.k).toBe(true);
    });
});

describe("scope", () => {
    test("dispose runs cleanups in reverse and child scopes end with the parent", () => {
        const scope = new Scope();
        const order: number[] = [];
        scope.defer(() => order.push(1));
        const child = scope.child();
        child.defer(() => order.push(3));
        scope.defer(() => order.push(2));
        scope.dispose();
        expect(order).toEqual([2, 3, 1]);
        expect(child.alive).toBe(false);
    });
});

describe("i18n", () => {
    test("follows claude.ai's locale, not the browser's, and falls back to English", async () => {
        const { getLang, setLang } = await import("../src/kernel/i18n");
        try {
            localStorage.setItem("spa:locale", "en-US");
            setLang("auto");
            expect(getLang()).toBe("en");
            localStorage.setItem("spa:locale", "zh-CN");
            setLang("auto");
            expect(getLang()).toBe("zh");
            localStorage.removeItem("spa:locale");
            document.documentElement.lang = "";
            setLang("auto");
            expect(getLang()).toBe("en");
            setLang("zh");
            expect(getLang()).toBe("zh");
        } finally {
            localStorage.removeItem("spa:locale");
            setLang("auto");
        }
    });
});
