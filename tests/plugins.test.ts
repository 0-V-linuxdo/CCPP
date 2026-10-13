import { afterAll, describe, expect, test } from "bun:test";

import { allPlugins, pluginError, pluginInfo, registerPlugins, resetRegistry, setEnabled, startPhase } from "../src/kernel/plugins";
import { PLUGINS } from "../src/plugins";

describe("every plugin", () => {
    afterAll(() => resetRegistry());

    test("starts without throwing on a bare claude.ai page", () => {
        resetRegistry();
        registerPlugins(PLUGINS);
        for (const plugin of allPlugins()) setEnabled(plugin, true);
        startPhase("document-start");
        startPhase("dom-ready");
        const failed = allPlugins()
            .map(plugin => [plugin.name, pluginError(plugin.name)] as const)
            .filter(([, error]) => error?.stage === "start")
            .map(([name, error]) => `${name}: ${error!.message}`);
        expect(failed).toEqual([]);
    });
});

describe("runtime info", () => {
    test("pluginInfo reports state per plugin", () => {
        resetRegistry();
        registerPlugins(PLUGINS);
        const info = allPlugins().map(pluginInfo);
        const settingsInfo = info.find(p => p.name === "Settings")!;
        expect(settingsInfo.required).toBe(true);
        expect(settingsInfo.enabled).toBe(true);
        expect(info.every(p => Array.isArray(p.dependencies))).toBe(true);
    });
});
