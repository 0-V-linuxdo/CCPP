import { afterAll, describe, expect, test } from "bun:test";

import { Scope } from "../src/kernel/scope";
import { installCodeGear } from "../src/plugins/_core/settings/codeGear";

describe("Code sidebar gear", () => {
    const scope = new Scope();
    let opened = 0;
    let enabled = true;
    afterAll(() => {
        scope.dispose();
        document.body.innerHTML = "";
        history.replaceState(null, "", "/new");
    });

    test("opens CC++ instead of the native Code page, only on /code and without modifiers", () => {
        installCodeGear(scope, () => enabled, () => opened++);
        document.body.innerHTML = `<div aria-label="Sidebar"><button aria-label="Settings" id="gear"><svg></svg></button><button aria-label="New session" id="other"></button></div>`;
        let native = 0;
        document.body.addEventListener("click", () => native++);
        const gear = document.getElementById("gear")!;

        history.replaceState(null, "", "/new");
        gear.click();
        expect([opened, native]).toEqual([0, 1]);

        history.replaceState(null, "", "/code/session_1");
        gear.click();
        expect([opened, native]).toEqual([1, 1]);

        gear.dispatchEvent(new MouseEvent("click", { bubbles: true, altKey: true }));
        expect([opened, native]).toEqual([1, 2]);

        document.getElementById("other")!.click();
        expect([opened, native]).toEqual([1, 3]);

        enabled = false;
        gear.click();
        expect([opened, native]).toEqual([1, 4]);
    });
});
