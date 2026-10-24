import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { getPlugin, registerPlugins, resetRegistry, setEnabled, startPhase } from "../src/kernel/plugins";
import { coerce, setRaw } from "../src/kernel/settings";
import { PLUGINS } from "../src/plugins";
import { cropRect, imageField } from "../src/plugins/_core/settings/imageField";
import { avatarCss, cssUrl, initials, sizeCss, swapName } from "../src/plugins/customIdentity";
import { isEmail, stripEmail } from "../src/plugins/hideIdentity";

const tick = () => new Promise(resolve => setTimeout(resolve, 150));

/** A trimmed copy of the sidebar's account button and the menu it opens. */
function fakeAccount() {
    document.body.innerHTML = `
<div data-testid="sidebar"><button data-testid="user-menu-button">
  <span data-cds="Avatar" aria-label="Gia Thao"><span>GT</span></span>
  <div class="df-user-menu-trailing"><span>Gia Thao</span><span>Max plan</span></div>
</button></div>
<div role="menu"><div class="scroll">
  <div class="label"><span class="block truncate">gia@example.com</span></div>
  <div role="separator"></div>
  <div role="menuitem" data-testid="user-menu-settings"><span>Settings</span></div>
  <div role="menuitem"><span>Personal · gia@example.com</span></div>
</div></div>
<h1 data-new-page-greeting-text="">Evening, Gia Thao</h1>`;
}

const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!;

describe("identity helpers", () => {
    test("emails are recognised and stripped", () => {
        expect(isEmail(" gia@example.com ")).toBe(true);
        expect(isEmail("Gia Thao")).toBe(false);
        expect(stripEmail("Personal · gia@example.com")).toBe("Personal");
        expect(stripEmail("gia@example.com · Team")).toBe("Team");
    });

    test("names, initials and css", () => {
        expect(initials("Gia Thao")).toBe("GT");
        expect(initials("小明")).toBe("小");
        expect(swapName("Gia Thao", "Gia Thao", "Neo", true)).toBe("Neo");
        expect(swapName("Gia Thao's org", "Gia Thao", "Neo", true)).toBe("Gia Thao's org");
        expect(swapName("Evening, Gia Thao", "Gia Thao", "Neo", false)).toBe("Evening, Neo");
        expect(cssUrl('https://x/a"b.png')).toBe('url("https://x/a\\22 b.png")');
        expect(avatarCss("", true)).toBe("");
        expect(sizeCss(32)).toContain("[data-ccpp-avatar-size] [data-cds=\"Avatar\"] { width: 32px !important; height: 32px !important;");
        expect(avatarCss("data:image/png;base64,AA", false)).not.toContain('[role="menu"]');
    });

    test("image options keep only image URLs", () => {
        const option = { type: "image", label: "x", default: "" } as const;
        expect(coerce(option, "data:image/png;base64,AA")).toBe("data:image/png;base64,AA");
        expect(coerce(option, "https://example.com/a.png")).toBe("https://example.com/a.png");
        expect(coerce(option, "javascript:alert(1)")).toBe("");
        expect(coerce(option, 3)).toBe("");
    });

    test("the picture field shows the stored link and clears it", () => {
        let saved = "unset";
        const field = imageField({ type: "image", label: "Avatar", default: "" }, "https://example.com/a.png", v => (saved = v));
        document.body.appendChild(field);
        expect(field.querySelector<HTMLInputElement>(".input")!.value).toBe("https://example.com/a.png");
        expect(field.querySelector<HTMLImageElement>(".img-stage img")!.getAttribute("src")).toBe("https://example.com/a.png");
        const clear = field.querySelector<HTMLButtonElement>(".img-line .btn:last-child")!;
        clear.click();
        expect(saved).toBe("");
        field.remove();
    });

    test("crop stays inside the picture", () => {
        const r = cropRect(200, 100, { x: 0, y: 0.5, zoom: 1 });
        expect(r.side).toBe(100);
        expect(r.x).toBe(50);
        expect(cropRect(200, 100, { x: 0.5, y: 0.5, zoom: 9 }).zoom).toBe(4);
    });
});

describe("HideIdentity and CustomIdentity", () => {
    beforeAll(() => {
        resetRegistry();
        registerPlugins(PLUGINS);
        // Other test files leave every plugin on; CustomGreeting would rewrite the greeting too.
        setEnabled(getPlugin("CustomGreeting")!, false);
        startPhase("document-start");
        startPhase("dom-ready");
    });
    afterAll(() => {
        resetRegistry();
        document.body.innerHTML = "";
    });

    test("hides the email in the account menu and puts it back when turned off", async () => {
        fakeAccount();
        setEnabled(getPlugin("HideIdentity")!, true);
        await tick();
        expect($(".label").hasAttribute("data-ccpp-hide-identity")).toBe(true);
        expect($('[role="separator"]').hasAttribute("data-ccpp-hide-identity")).toBe(true);
        expect($('[role="menuitem"]:last-child span').textContent).toBe("Personal");
        expect($('[data-testid="user-menu-settings"]').hasAttribute("data-ccpp-hide-identity")).toBe(false);
        // The name stays unless asked.
        expect($(".df-user-menu-trailing span").hasAttribute("data-ccpp-hide-identity")).toBe(false);

        setRaw("HideIdentity", "hideName", true);
        await tick();
        expect($(".df-user-menu-trailing span").hasAttribute("data-ccpp-hide-identity")).toBe(true);

        setEnabled(getPlugin("HideIdentity")!, false);
        await tick();
        expect(document.querySelector("[data-ccpp-hide-identity]")).toBeNull();
        expect($('[role="menuitem"]:last-child span').textContent).toBe("Personal · gia@example.com");
    });

    test("replaces the name, initials and greeting, and restores them", async () => {
        fakeAccount();
        setRaw("CustomIdentity", "displayName", "Neo");
        setEnabled(getPlugin("CustomIdentity")!, true);
        await tick();
        expect($(".df-user-menu-trailing span").textContent).toBe("Neo");
        expect($('[data-cds="Avatar"]').getAttribute("aria-label")).toBe("Neo");
        expect($('[data-cds="Avatar"] span').textContent).toBe("N");
        expect($("[data-new-page-greeting-text]").textContent).toBe("Evening, Neo");

        // React writing the real name back gets replaced again.
        $(".df-user-menu-trailing span").textContent = "Gia Thao";
        await tick();
        expect($(".df-user-menu-trailing span").textContent).toBe("Neo");

        setRaw("CustomIdentity", "avatar", "data:image/png;base64,AA");
        await tick();
        expect(document.querySelector('[data-ccpp-style="custom-identity"]')!.textContent).toContain("data:image/png;base64,AA");

        setEnabled(getPlugin("CustomIdentity")!, false);
        await tick();
        expect($(".df-user-menu-trailing span").textContent).toBe("Gia Thao");
        expect($('[data-cds="Avatar"]').getAttribute("aria-label")).toBe("Gia Thao");
        expect($('[data-cds="Avatar"] span').textContent).toBe("GT");
        expect($("[data-new-page-greeting-text]").textContent).toBe("Evening, Gia Thao");
        expect(document.querySelector('[data-ccpp-style="custom-identity"]')).toBeNull();
    });
});
