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
        enabled = true;
        scope.dispose();
    });

    test("swaps the gear glyph for the sliders glyph, found by the glyph alone, and restores it", async () => {
        const gearChar = String.fromCodePoint(0xe0d6);
        const slidersChar = String.fromCodePoint(0xe070);
        document.body.innerHTML = `<div aria-label="Sidebar"><button id="g2"><span data-cds="Icon">${gearChar}</span></button></div>`;
        history.replaceState(null, "", "/code");
        const local = new Scope();
        let hits = 0;
        const api = installCodeGear(local, () => enabled, () => hits++);
        await new Promise(r => setTimeout(r, 300));
        const glyphEl = document.querySelector("#g2 [data-cds]")!;
        expect(glyphEl.textContent).toBe(slidersChar);
        (document.getElementById("g2") as HTMLElement).click();
        expect(hits).toBe(1);
        enabled = false;
        api.repaint();
        expect(glyphEl.textContent).toBe(gearChar);
        local.dispose();
    });
});
