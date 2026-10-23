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
        // The version sits beside the group name, as a plain "v0.x.y".
        const head = group!.querySelector("[data-ccpp-nav-head]")!;
        expect(head.firstElementChild!.textContent).toBe("CC++");
        expect(head.querySelector("[data-ccpp-nav-version]")!.textContent).toMatch(/^v[\w.]+$/);
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

describe("account menu shortcut hint", () => {
    test("copies claude.ai's hint structure with our keys, else falls back to text", async () => {
        const { shortcutHint } = await import("../src/plugins/_core/settings/userMenu");
        const key = (g: string, n: string) => `<kbd class="k"><span>${g}</span><span class="sr-only">${n}</span></kbd>`;
        document.body.innerHTML = `<div id="s"><span>i</span><span>Settings</span><span data-cds="Shortcut" class="hint text-footnote">${key("⇧", "Shift")}${key("⌘", "Command")}${key(",", ",")}</span></div>`;
        const hint = shortcutHint(document.getElementById("s")!, ["⇧", "⌘", "."])!;
        expect(hint.className).toBe("hint text-footnote");
        expect([...hint.children].map(k => `${k.tagName}.${k.className}:${k.firstElementChild!.textContent}|${k.lastElementChild!.textContent}`)).toEqual(["KBD.k:⇧|Shift", "KBD.k:⌘|Command", "KBD.k:.|Period"]);
        document.body.innerHTML = `<div id="s"><span>i</span><span>Settings</span></div>`;
        expect(shortcutHint(document.getElementById("s")!, ["⇧", "⌘", "."])!.textContent).toBe("⇧ ⌘ .");
        expect(shortcutHint(document.getElementById("s")!, [])).toBeNull();
    });
});

describe("account menu icons", () => {
    test("flyout rows reuse claude.ai's icon box, gear, chevron and learned section icons", async () => {
        const { NATIVE_SECTIONS } = await import("../src/plugins/_core/settings/userMenu");
        const { learnNativeIcons, resetNativeIcons } = await import("../src/plugins/_core/settings/nativeIcons");
        resetNativeIcons();
        const nav = document.createElement("nav");
        nav.innerHTML = `<ul><li data-testid="general-settings"><button><span data-cds="Icon"><svg width="20" height="20" viewBox="0 0 20 20" onload="x()"><path d="M1 1h18"/></svg></span><span>General</span></button></li>
            <li data-testid="whatever"><button><span data-cds="Icon"><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/></svg></span><span>Memory</span></button></li></ul>`;
        learnNativeIcons(nav, NATIVE_SECTIONS);

        resetRegistry();
        registerPlugins(PLUGINS);
        startPhase("dom-ready");
        const menu = document.createElement("div");
        menu.setAttribute("role", "menu");
        menu.innerHTML = `<div class="scroll"><div role="menuitem" data-testid="user-menu-settings" class="item"><div class="ico"><svg class="gear" width="16" height="16" viewBox="0 0 20 20"><path d="M2 2"/></svg></div><span>Settings</span></div>
            <div role="menuitem" aria-haspopup="menu" class="item sub"><div class="ico"><svg width="16" height="16"><path d="M3 3"/></svg></div><span>Learn more</span><span class="chev"><svg class="caret"><path d="M9 9"/></svg></span></div></div>`;
        document.body.appendChild(menu);
        await tick();
        const settingsRow = menu.querySelector<HTMLElement>('[data-testid="user-menu-settings"]')!;
        expect(settingsRow.lastElementChild!.matches(".chev[data-ccpp-chevron]")).toBe(true);
        settingsRow.dispatchEvent(new Event("pointerenter"));
        const flyout = [...menu.children].find(el => el.hasAttribute("data-ccpp-panel-level")) as HTMLElement;
        const rows = [...flyout.querySelectorAll<HTMLElement>('[role="menuitem"]')];
        const byLabel = (text: string) => rows.find(r => r.textContent!.trim() === text)!;
        // "Open settings" shows the Settings row's own gear, in the same box.
        const open = rows[0]!;
        expect(open.firstElementChild!.className).toBe("ico");
        expect(open.querySelector("svg")!.getAttribute("class")).toBe("gear");
        // A learned section icon takes the native box, class and size; its handlers are stripped.
        const general = byLabel("General").querySelector("svg")!;
        expect(general.querySelector("path")!.getAttribute("d")).toBe("M1 1h18");
        expect(general.getAttribute("class")).toBe("gear");
        expect(general.getAttribute("width")).toBe("16");
        expect(general.hasAttribute("onload")).toBe(false);
        // Learned by label when the testid doesn't name the section.
        expect(byLabel("Memory").querySelector("circle")).not.toBeNull();
        // Sections we haven't seen fall back to our icon, lighter, in the same box.
        const account = byLabel("Account");
        expect(account.firstElementChild!.className).toBe("ico");
        expect(account.querySelector("svg")!.getAttribute("stroke-width")).toBe("1.75");
        menu.remove();
        resetNativeIcons();
        resetRegistry();
    });
});
