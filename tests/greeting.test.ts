import { afterAll, beforeAll, describe, expect, test } from "bun:test";

import { getPlugin, registerPlugins, resetRegistry, setEnabled, startPhase } from "../src/kernel/plugins";
import { setRaw } from "../src/kernel/settings";
import { PLUGINS } from "../src/plugins";
import { findGreetings, isProjectPage } from "../src/plugins/customGreeting";

const tick = () => new Promise(resolve => setTimeout(resolve, 150));
const $ = (sel: string) => document.querySelector<HTMLElement>(sel)!;

const SPARK = '<svg data-cds="Spark" viewBox="0 0 100 100"><path d="m0 0"/></svg>';
const PROMPT = '<div data-cds="ChatComposer"><div data-testid="chat-input"><p data-placeholder="Type / for skills" class="is-empty is-editor-empty"></p></div></div>';

/** The new-chat home as claude.ai marks it. */
const markedHome = () => `<main><div><div data-new-page-greeting-spark="">${SPARK}</div><span data-new-page-greeting-text="">Good evening, GG</span></div>${PROMPT}</main>`;
/** A home layout without the text marker: only the spark tells where the greeting is. */
const bareHome = () => `<main><h1 class="hero"><span>${SPARK}</span><span>Good evening,</span></h1>${PROMPT}</main>`;

describe("greeting finder", () => {
    afterAll(() => {
        document.body.innerHTML = "";
    });

    test("project pages", () => {
        expect(isProjectPage("/project/0f0e")).toBe(true);
        expect(isProjectPage("/code/project/chan_01")).toBe(true);
        expect(isProjectPage("/code/projects/browse")).toBe(false);
        expect(isProjectPage("/new")).toBe(false);
    });

    test("finds the marked greeting, or the spark's row without the marker", () => {
        document.body.innerHTML = markedHome();
        expect(findGreetings()).toHaveLength(1);
        expect(findGreetings()[0]).toBe($("[data-new-page-greeting-text]"));
        document.body.innerHTML = bareHome();
        expect(findGreetings()).toHaveLength(1);
        expect(findGreetings()[0]).toBe($(".hero"));
    });

    test("leaves sparks elsewhere alone", () => {
        // A 404 page: the spark beside the wordmark, no prompt box.
        document.body.innerHTML = `<main><div>${SPARK}<span>Claude</span></div><p>Page not found</p></main>`;
        expect(findGreetings()).toHaveLength(0);
        // A conversation: the spark beside a reply is not a greeting.
        document.body.innerHTML = `<main><div data-testid="transcript-list"><div>${SPARK}<span>Hello there</span></div></div>${PROMPT}</main>`;
        expect(findGreetings()).toHaveLength(0);
        // The spark inside a button or link.
        document.body.innerHTML = `<main><a href="/new"><span>${SPARK}</span><span>New chat</span></a>${PROMPT}</main>`;
        expect(findGreetings()).toHaveLength(0);
    });
});

describe("CustomGreeting", () => {
    beforeAll(() => {
        resetRegistry();
        registerPlugins(PLUGINS);
        setEnabled(getPlugin("CustomGreeting")!, false);
        setEnabled(getPlugin("CustomIdentity")!, false);
        startPhase("document-start");
        startPhase("dom-ready");
    });
    afterAll(() => {
        setEnabled(getPlugin("CustomGreeting")!, false);
        resetRegistry();
        document.body.innerHTML = "";
    });

    test("replaces a greeting without the text marker, keeps the spark, and restores it", async () => {
        document.body.innerHTML = bareHome();
        setRaw("CustomGreeting", "phrases", "Hello friend");
        setEnabled(getPlugin("CustomGreeting")!, true);
        await tick();
        expect($(".hero").textContent).toBe("Hello friend");
        expect($('.hero svg[data-cds="Spark"]')).not.toBeNull();

        // React writing its text back gets replaced again.
        $(".hero span:last-child").textContent = "Good evening,";
        await tick();
        expect($(".hero").textContent).toBe("Hello friend");

        setEnabled(getPlugin("CustomGreeting")!, false);
        await tick();
        expect($(".hero").textContent).toBe("Good evening,");
    });

    test("the placeholder changes from CSS, only in projects unless asked, and comes back", async () => {
        document.body.innerHTML = markedHome();
        const css = () => document.querySelector('[data-ccpp-style="custom-greeting-placeholder"]')?.textContent ?? "";
        setRaw("CustomGreeting", "phrases", "First line\nSecond line");
        setRaw("CustomGreeting", "input", "project");
        setEnabled(getPlugin("CustomGreeting")!, true);
        await tick();
        expect(css()).toBe("");

        setRaw("CustomGreeting", "input", "all");
        await tick();
        expect(css()).toContain('p.is-editor-empty[data-placeholder]::before { content: "First line" !important; }');
        // The editor's own attribute is left alone: it rebuilds the paragraph all the time.
        expect($("p[data-placeholder]").dataset.placeholder).toBe("Type / for skills");

        setRaw("CustomGreeting", "placeholder", 'Say "hi"');
        await tick();
        expect(css()).toContain('content: "Say \\"hi\\"" !important;');

        setEnabled(getPlugin("CustomGreeting")!, false);
        await tick();
        expect(document.querySelector('[data-ccpp-style="custom-greeting-placeholder"]')).toBeNull();
        setRaw("CustomGreeting", "placeholder", "");
        setRaw("CustomGreeting", "input", "project");
    });

    test("New chat on the home page is a new visit", async () => {
        document.body.innerHTML = `<a href="/new" id="new-chat">New</a>${markedHome()}`;
        setRaw("CustomGreeting", "phrases", "One\nTwo");
        setRaw("CustomGreeting", "order", "sequential");
        setEnabled(getPlugin("CustomGreeting")!, true);
        await tick();
        const before = $("[data-new-page-greeting-text]").textContent;
        $("#new-chat").addEventListener("click", e => e.preventDefault(), { once: true });
        $("#new-chat").click();
        await tick();
        expect($("[data-new-page-greeting-text]").textContent).not.toBe(before);
        setEnabled(getPlugin("CustomGreeting")!, false);
        await tick();
        setRaw("CustomGreeting", "order", "random");
    });

    test("click mode rotates on a click on the greeting", async () => {
        document.body.innerHTML = markedHome();
        setRaw("CustomGreeting", "phrases", "One\nTwo");
        setRaw("CustomGreeting", "order", "sequential");
        setRaw("CustomGreeting", "rotate", "click");
        setEnabled(getPlugin("CustomGreeting")!, true);
        await tick();
        const before = $("[data-new-page-greeting-text]").textContent;
        expect($("[data-new-page-greeting-text]").hasAttribute("data-ccpp-greeting-click")).toBe(true);
        $("[data-new-page-greeting-text]").click();
        await tick();
        expect($("[data-new-page-greeting-text]").textContent).not.toBe(before);
        setEnabled(getPlugin("CustomGreeting")!, false);
        await tick();
        expect(document.querySelector("[data-ccpp-greeting-click]")).toBeNull();
        expect($("[data-new-page-greeting-text]").textContent).toBe("Good evening, GG");
        setRaw("CustomGreeting", "rotate", "visit");
        setRaw("CustomGreeting", "order", "random");
    });
});
