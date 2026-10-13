import { afterAll, describe, expect, test } from "bun:test";

import { allPlugins, getPlugin, registerPlugins, resetRegistry, startPhase } from "../src/kernel/plugins";
import { PLUGINS } from "../src/plugins";
import { combinedCss, parseMeta, validThemeUrl } from "../src/plugins/_core/themes";

const tick = () => new Promise(resolve => setTimeout(resolve, 250));

/** A trimmed copy of claude.ai's settings dialog markup. */
function fakeSettingsDialog() {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.dataset.perfOverlay = "settings_modal";
    dialog.innerHTML = `
<nav data-perf-region="settings_nav"><div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
  <div id="g0" class="px-sm pt-md text-caption text-muted">Settings</div>
  <ul aria-labelledby="g0" class="flex flex-col gap-px">
    <li data-testid="general-settings"><button type="button" aria-current="page" class="row bg-fill-ghost-selected"><span data-cds="Icon" class="shrink-0"></span><span class="min-w-0 flex-1 truncate">General</span></button></li>
    <li data-testid="account-settings"><button type="button" class="row text-secondary"><span data-cds="Icon" class="shrink-0"></span><span class="min-w-0 flex-1 truncate">Account</span></button></li>
  </ul></div></nav>
<div data-perf-region="settings_panel"><div class="head"><button aria-label="Close">x</button></div><div class="shrink-0 px-xl"></div><div class="contents"><div>native page</div></div></div>`;
    document.body.appendChild(dialog);
    return dialog;
}

describe("settings UI", () => {
    afterAll(() => {
        resetRegistry();
        document.body.innerHTML = "";
    });

    test("adds a CC++ group to claude.ai's settings nav and shows our pages in its panel", async () => {
        resetRegistry();
        registerPlugins(PLUGINS);
        startPhase("document-start");
        startPhase("dom-ready");
        const dialog = fakeSettingsDialog();
        await tick();
        const group = dialog.querySelector("[data-ccpp-nav-group]");
        expect(group).not.toBeNull();
        const ids = [...dialog.querySelectorAll<HTMLElement>("[data-ccpp-nav]")].map(li => li.dataset.ccppNav);
        expect(ids).toEqual(["plugins", "themes", "quick-css"]);
        // Our buttons copy the native classes.
        expect(dialog.querySelector('[data-ccpp-nav="themes"] button')!.className).toBe("row text-secondary");

        dialog.querySelector<HTMLElement>('[data-ccpp-nav="plugins"] button')!.click();
        await tick();
        const panel = dialog.querySelector<HTMLElement>('[data-perf-region="settings_panel"]')!;
        expect(panel.hasAttribute("data-ccpp-panel")).toBe(true);
        const host = panel.querySelector<HTMLElement>("[data-ccpp-host]")!;
        expect(host).not.toBeNull();
        const root = host.shadowRoot!;
        expect(root.querySelector(".page-head h2")!.textContent).toBeTruthy();
        expect(root.querySelectorAll(".card").length).toBeGreaterThan(0);
        expect(dialog.querySelector('[data-ccpp-nav="plugins"] button')!.getAttribute("aria-current")).toBe("page");

        // A native nav click hands the panel back.
        dialog.querySelector<HTMLElement>('[data-testid="account-settings"] button')!.click();
        await tick();
        expect(panel.hasAttribute("data-ccpp-panel")).toBe(false);
        expect(panel.querySelector("[data-ccpp-host]")).toBeNull();
        dialog.remove();
    });

    test("the account menu gets a CC++ row that expands into a submenu", async () => {
        if (!getPlugin("Settings")) {
            resetRegistry();
            registerPlugins(PLUGINS);
            startPhase("dom-ready");
        }
        const menu = document.createElement("div");
        menu.setAttribute("role", "menu");
        menu.className = "relative w-[17rem]";
        menu.innerHTML = `<div class="scroll"><div role="menuitem" data-testid="user-menu-settings" class="item"><span class="ico"></span><span>Settings</span></div><div role="separator" class="sep"></div><div role="menuitem" aria-haspopup="menu" class="item sub"><span class="ico"></span><span>Learn more</span></div></div>`;
        document.body.appendChild(menu);
        await tick();
        const entry = menu.querySelector<HTMLElement>("[data-ccpp-item]")!;
        expect(entry).not.toBeNull();
        expect(entry.textContent).toContain("CC++");
        expect(entry.previousElementSibling!.getAttribute("data-testid")).toBe("user-menu-settings");
        expect(entry.className).toBe("item sub");
        entry.dispatchEvent(new Event("pointerenter"));
        const sub = [...menu.children].find(el => el.hasAttribute("data-ccpp-panel-level")) as HTMLElement;
        expect(sub).not.toBeNull();
        expect(sub.className).not.toContain("w-[17rem]");
        expect(sub.querySelectorAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(4);
        sub.querySelector<HTMLElement>('[aria-haspopup="menu"]')!.dispatchEvent(new Event("pointerenter"));
        const list = sub.querySelector("[data-ccpp-panel-level]");
        expect(list?.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(5);
        // claude.ai's Settings row expands too, listing CC++ pages and claude.ai's own sections.
        const settingsRow = menu.querySelector<HTMLElement>('[data-testid="user-menu-settings"]')!;
        settingsRow.dispatchEvent(new Event("pointerenter"));
        const flyout = [...menu.children].find(el => el.hasAttribute("data-ccpp-panel-level")) as HTMLElement;
        expect(flyout.textContent).toContain("CC++");
        expect(flyout.querySelectorAll('[role="menuitem"]').length).toBeGreaterThan(12);
        menu.remove();
        expect(allPlugins().length).toBeGreaterThan(10);
    });
});

describe("themes", () => {
    test("reads theme metadata", () => {
        expect(parseMeta("/**\n * @name Midnight\n * @author GG\n * @description Dark blue\n */\nbody{}")).toEqual({ name: "Midnight", author: "GG", description: "Dark blue" });
        expect(parseMeta("body{}")).toEqual({});
    });
    test("only https theme URLs", () => {
        expect(validThemeUrl(" https://example.com/a.css ")).toBe("https://example.com/a.css");
        expect(validThemeUrl("http://example.com/a.css")).toBeNull();
        expect(validThemeUrl("nope")).toBeNull();
    });
    test("combines enabled themes only", () => {
        const css = combinedCss({ online: [{ url: "https://x/a.css", enabled: true, css: "a{}" }, { url: "https://x/b.css", enabled: false, css: "b{}" }], local: [{ id: "1", name: "L", author: "", css: "c{}", enabled: true }] });
        expect(css).toContain("a{}");
        expect(css).not.toContain("b{}");
        expect(css).toContain("c{}");
    });
});
