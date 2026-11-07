import { afterAll, describe, expect, test } from "bun:test";

import { allPlugins, registerPlugins, resetRegistry, setEnabled, startPhase } from "../src/kernel/plugins";
import { PLUGINS } from "../src/plugins";

const ids = ["11111111-1111-4111-8111-111111111111", "22222222-2222-4222-8222-222222222222", "33333333-3333-4333-8333-333333333333"];
const key = (type: "keydown" | "keyup", init: KeyboardEventInit) => window.dispatchEvent(new KeyboardEvent(type, { bubbles: true, cancelable: true, ...init }));
const press = (shiftKey = false) => key("keydown", { key: "`", code: "Backquote", ctrlKey: true, shiftKey });
const release = () => key("keyup", { key: "Control", code: "ControlLeft", ctrlKey: false });
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const cards = () => [...(document.getElementById("ccpp-recent-chats")?.shadowRoot?.querySelectorAll(".card") ?? [])];

describe("recent chats switcher", () => {
    afterAll(() => resetRegistry());

    test("works like Arc: hold Ctrl, press ` to move, release to open; a quick tap goes back", async () => {
        localStorage.setItem("ccpp:recent-chats", JSON.stringify(ids.map((id, i) => ({ id, title: `T${i}`, at: Date.now() - i * 1000 }))));
        // The store was read at import; tell it the value changed, as another tab would.
        window.dispatchEvent(new StorageEvent("storage", { key: "ccpp:recent-chats" }));
        const clicked: string[] = [];
        for (const id of ids) {
            const a = document.createElement("a");
            a.href = `/chat/${id}`;
            a.addEventListener("click", e => (e.preventDefault(), clicked.push(id)));
            document.body.appendChild(a);
        }
        resetRegistry();
        registerPlugins(PLUGINS);
        for (const plugin of allPlugins()) setEnabled(plugin, ["RouterApi", "HotkeysApi", "ChatStateApi", "RecentChats"].includes(plugin.name));
        startPhase("document-start");
        startPhase("dom-ready");

        // Quick tap: straight to the first entry that isn't this page, no cards.
        press();
        release();
        expect(cards().length).toBe(0);
        expect(clicked).toEqual([ids[0]]);

        // Hold: the second press shows the cards and moves on, Shift moves back, release opens the pick.
        press();
        press();
        expect(cards().length).toBe(3);
        expect(cards()[1].classList.contains("sel")).toBe(true);
        press();
        expect(cards()[2].classList.contains("sel")).toBe(true);
        press(true);
        expect(cards()[1].classList.contains("sel")).toBe(true);
        release();
        expect(clicked).toEqual([ids[0], ids[1]]);
        expect(cards().length).toBe(0);

        // Held long enough, the cards show without a second press; Esc cancels.
        press();
        await wait(250);
        expect(cards().length).toBe(3);
        key("keydown", { key: "Escape", code: "Escape", ctrlKey: true });
        release();
        expect(clicked.length).toBe(2);
    });
});
