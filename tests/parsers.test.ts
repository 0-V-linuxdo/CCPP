import { describe, expect, test } from "bun:test";

import { getProjectActivity, getProjectPhases, orgFromCookie, parseActivity, parseChannelSessions, parseConversation, parseSessionState, parseUsage } from "../src/plugins/_api/claude";
import { parseRoute } from "../src/plugins/_api/router";
import { matches, parseCombo } from "../src/plugins/_api/hotkeys";
import { titleFrom } from "../src/plugins/_api/chatState";
import { recordVisit, renameVisit } from "../src/plugins/recentChats";
import { level } from "../src/plugins/usageDisplay";
import { cornerKind, dotKind, openProjectOf, projectKind, SEND_GRACE_MS, shownKind } from "../src/plugins/projectStatus";
import { remember } from "../src/plugins/inputHistory";
import { parsePresets } from "../src/plugins/promptPresets";
import { pickPhrase, fillPhrase } from "../src/plugins/customGreeting";
import { toMarkdown } from "../src/plugins/exportChat";
import { splitLinks } from "../src/plugins/betterLinks";
import { isTelemetry } from "../src/plugins/noTelemetry";
import { chatKeyFor, reindex, toggleStar } from "../src/plugins/messageStars/store";
import { starSpot } from "../src/plugins/messageStars/index";
import { codeProjectOf, computeState, faviconFor, parseMark } from "../src/plugins/chatFavicon";
import { channelSendOf } from "../src/plugins/_api/chatState";
import { alignWithApi, outlineFromApi } from "../src/plugins/chatNavigator";
import { parseChannelMessages, parseCodePhase, threadPhasesFrom } from "../src/plugins/_api/claude";

const ID = "2e8860cc-f63c-4514-931c-14080b0aa61e";

describe("claude.ai API parsing", () => {
    test("usage windows", () => {
        const usage = parseUsage({ five_hour: { utilization: 68, resets_at: "2026-10-13T15:50:00.702909+00:00" }, seven_day: { utilization: "17.0", resets_at: null }, seven_day_opus: null }, 1);
        expect(usage.fiveHour).toEqual({ utilization: 68, resetsAt: Date.parse("2026-10-13T15:50:00.702909+00:00") });
        expect(usage.sevenDay).toEqual({ utilization: 17, resetsAt: null });
        expect(usage.extra).toEqual([]);
        expect(parseUsage(null).fiveHour).toBeNull();
    });

    test("conversation follows the current branch", () => {
        const chat = parseConversation({
            uuid: ID,
            name: "Test",
            current_leaf_message_uuid: "c2",
            chat_messages: [
                { uuid: "a", sender: "human", text: "hi", parent_message_uuid: "root" },
                { uuid: "b1", sender: "assistant", content: [{ type: "text", text: "old" }], parent_message_uuid: "a" },
                { uuid: "b2", sender: "assistant", content: [{ type: "thinking", thinking: "x" }, { type: "text", text: "new" }], parent_message_uuid: "a" },
                { uuid: "c2", sender: "human", text: "more", parent_message_uuid: "b2" },
            ],
        });
        expect(chat.messages.map(m => `${m.role}:${m.text}`)).toEqual(["user:hi", "assistant:new", "user:more"]);
    });

    test("org id comes only from a valid cookie value", () => {
        expect(orgFromCookie(`a=1; lastActiveOrg=${ID}; b=2`)).toBe(ID);
        expect(orgFromCookie("lastActiveOrg=nope")).toBeNull();
    });

    test("project activity counts working and blocked threads", () => {
        const raw = { data: [{ bound_sessions: [{ status: "active", status_bucket: "working" }] }, { bound_sessions: [{ status: "active", status_bucket: "blocked" }, { status: "archived", status_bucket: "working" }] }, {}] };
        expect(parseActivity("chan_x", raw)).toEqual({ channelId: "chan_x", working: 1, blocked: 1 });
        // A resolved thread is filed under Resolved, even while its session's bucket still says blocked.
        const resolved = { data: [{ thread_status: "resolved", bound_sessions: [{ status: "active", status_bucket: "blocked" }] }, { thread_status: "idle", bound_sessions: [{ status: "active", status_bucket: "completed" }] }] };
        expect(parseActivity("chan_x", resolved)).toEqual({ channelId: "chan_x", working: 0, blocked: 0 });
        expect(dotKind({ channelId: "c", working: 0, blocked: 2 }, true)).toBe("awaiting");
        expect(dotKind({ channelId: "c", working: 0, blocked: 2 }, false)).toBeNull();
        expect(dotKind({ channelId: "c", working: 1, blocked: 0 }, true)).toBe("clay");
        expect(cornerKind({ channelId: "c", working: 0, blocked: 0, own: "working" }, true)).toBe("clay");
        // A send lights the dot at once; once the grace is over, what was read decides again.
        const idle = { channelId: "c", working: 0, blocked: 1, own: null };
        expect(shownKind(idle, true, true, 1000 + SEND_GRACE_MS, 1000)).toBe("clay");
        expect(shownKind(idle, true, true, 1000 + SEND_GRACE_MS, 1000 + SEND_GRACE_MS)).toBe("awaiting");
        expect(shownKind(undefined, true, true)).toBeNull();
        expect(openProjectOf("/code/project/chan_01AB")).toBe("chan_01AB");
        expect(openProjectOf("/code/project/chan_01AB/settings")).toBe("chan_01AB");
        expect(openProjectOf("/code/session_01")).toBeNull();
        expect(cornerKind({ channelId: "c", working: 3, blocked: 0, own: null }, true)).toBeNull();
    });
});

describe("routing and keys", () => {
    test("routes", () => {
        expect(parseRoute(`/chat/${ID}`)).toMatchObject({ kind: "chat", chatId: ID });
        expect(parseRoute("/new").kind).toBe("new");
        expect(parseRoute("/settings/usage").kind).toBe("settings");
    });

    test("combos", () => {
        const combo = parseCombo("ctrl+`");
        expect(matches(new KeyboardEvent("keydown", { key: "`", code: "Backquote", ctrlKey: true }), combo)).toBe(true);
        expect(matches(new KeyboardEvent("keydown", { key: "`", code: "Backquote" }), combo)).toBe(false);
    });
});

describe("feature helpers", () => {
    test("usage colour levels", () => {
        expect([level(10, 70, 90), level(75, 70, 90), level(95, 70, 90)]).toEqual(["ok", "warn", "bad"]);
    });

    test("input history keeps every send newest first, except a repeat of the last one (void++)", () => {
        expect(remember(["b", "a"], "a ", 3)).toEqual(["a", "b", "a"]);
        expect(remember(["a", "b"], "a", 3)).toEqual(["a", "b"]);
        expect(remember(["c", "b", "a"], "d", 3)).toEqual(["d", "c", "b"]);
        expect(remember(["x"], "  ", 3)).toEqual(["x"]);
    });

    test("presets", () => {
        expect(parsePresets("T1\nbody one\n\nT2")).toEqual([{ title: "T1", body: "body one" }, { title: "T2", body: "T2" }]);
    });

    test("greetings", () => {
        expect(pickPhrase(["a", "b", "c"], "sequential", 2).index).toBe(0);
        expect(pickPhrase(["a", "b"], "random", 0, () => 0).index).toBe(1);
        expect(fillPhrase("{time}，{name}", "GG", 20, true)).toBe("晚上好，GG");
    });

    test("recent chats", () => {
        expect(recordVisit([{ id: "a", title: "A", at: 1 }], { id: "a", title: "A2", at: 2 })).toEqual([{ id: "a", title: "A2", at: 2 }]);
    });

    test("markdown export", () => {
        const md = toMarkdown({ uuid: ID, name: "T", model: null, createdAt: null, updatedAt: null, messages: [{ uuid: "1", parent: null, role: "user", text: "q", createdAt: null }, { uuid: "2", parent: "1", role: "assistant", text: "a", createdAt: null }] }, false);
        expect(md).toContain("# T");
        expect(md).toContain("## 🧑 You\n\nq");
        expect(md).toContain("## 🤖 Claude\n\na");
    });

    test("bare links", () => {
        expect(splitLinks("see example.com/docs. ok")).toEqual(["see ", { href: "https://example.com/docs", text: "example.com/docs" }, ". ok"]);
        expect(splitLinks("mail me@example.com")).toEqual(["mail me@example.com"]);
    });

    test("telemetry matcher", () => {
        expect(isTelemetry({ url: new URL("https://o1.ingest.sentry.io/api/1"), method: "POST" })).toBe(true);
        expect(isTelemetry({ url: new URL("https://claude.ai/api/organizations/x/usage"), method: "GET" })).toBe(false);
    });

    test("stars toggle", () => {
        const star = { key: "k", index: 2, role: "user" as const, text: "t", at: 1 };
        const once = toggleStar("c", "Chat", star, {});
        expect(once.starred).toBe(true);
        expect(toggleStar("c", "Chat", star, once.next).next).toEqual({});
    });
});

describe("project sessions", () => {
    test("a busy coordinator counts as working", () => {
        expect(parseSessionState({ response_shape: { status: "active", worker_status: "running", status_bucket: "review_ready" } })).toBe("working");
        expect(parseSessionState({ response_shape: { status: "active", worker_status: "idle", status_bucket: "review_ready" } })).toBe(null);
        expect(parseSessionState({ response_shape: { status: "active", worker_status: "idle", status_bucket: "SESSION_STATUS_BUCKET_BLOCKED" } })).toBe("blocked");
        expect(parseSessionState({ session_status: "requires_action" })).toBe("blocked");
        expect(parseSessionState({ response_shape: { status: "archived", worker_status: "running" } })).toBe(null);
    });
    test("channel list maps projects to their own session", () => {
        const map = parseChannelSessions({ data: [{ id: "chan_a", channel_session_id: "cse_1" }, { id: "chan_b" }, { id: "chan_c", channel_session_id: "bad id" }] });
        expect([...map]).toEqual([["chan_a", "cse_1"]]);
    });
});

describe("chat titles", () => {
    test("drops tab status marks and the site suffix", () => {
        expect(titleFrom("⏳ C++ 验收测试 - Claude")).toBe("C++ 验收测试");
        expect(titleFrom("✅ ✅ Plan trip | Claude")).toBe("Plan trip");
        expect(titleFrom("C# tips - Claude")).toBe("C# tips");
    });
    test("treats the placeholder as no title", () => {
        expect(titleFrom("Claude")).toBe("");
        expect(titleFrom("⏳ Claude")).toBe("");
    });
});

describe("recent chats", () => {
    test("keeps a known name and picks up a generated one", () => {
        let list = recordVisit([], { id: "a", title: "", at: 1 });
        list = renameVisit(list, "a", "Trip plan");
        expect(list[0].title).toBe("Trip plan");
        list = recordVisit(list, { id: "a", title: "", at: 2 });
        expect(list[0]).toEqual({ id: "a", title: "Trip plan", at: 2 });
        expect(renameVisit(list, "a", "")).toBe(list);
    });
});

describe("chat favicon", () => {
    test("state follows replies, drafts and errors", () => {
        const f = { streaming: false, errored: false, finished: false, draft: false };
        expect(computeState(f)).toBe("idle");
        expect(computeState({ ...f, streaming: true })).toBe("streaming");
        expect(computeState({ ...f, finished: true })).toBe("done");
        expect(computeState({ ...f, finished: true, draft: true })).toBe("ready");
        expect(computeState({ ...f, streaming: true, draft: true })).toBe("streaming");
        expect(computeState({ ...f, errored: true, streaming: true })).toBe("error");
    });
    test("Claude Code project pages follow their sessions", () => {
        expect(codeProjectOf("/code/project/chan_01AB", "?thread=cmsg_01XY&x=1")).toEqual({ channel: "chan_01AB", thread: "cmsg_01XY" });
        expect(codeProjectOf("/code/project/chan_01AB", "")).toEqual({ channel: "chan_01AB", thread: null });
        expect(codeProjectOf("/chat/abc", "?thread=cmsg_1")).toBeNull();
        expect(channelSendOf("/v1/code/channels/chan_01AB/messages")).toBe("chan_01AB");
        expect(channelSendOf("/v1/code/channels/chan_01AB/messages/cmsg_1")).toBeNull();
        expect(channelSendOf("/v1/code/channels/chan_01AB/timeline")).toBeNull();
        expect(parseCodePhase({ response_shape: { status: "active", status_bucket: "working", worker_status: "running" } })).toBe("working");
        expect(parseCodePhase({ response_shape: { status: "active", status_bucket: "review_ready", worker_status: "idle" } })).toBe("idle");
        expect(parseCodePhase({ status: "active", status_bucket: "SESSION_STATUS_BUCKET_FAILED" })).toBe("failed");
        expect(parseCodePhase({ response_shape: { status: "active", status_bucket: "blocked", worker_status: "requires_action" } })).toBe("blocked");
        const timeline = { data: [
            { id: "cmsg_A", bound_sessions: [{ id: "cse_1", status: "archived", status_bucket: "working" }, { id: "cse_2", status: "active", status_bucket: "SESSION_STATUS_BUCKET_WORKING" }] },
            { id: "cmsg_B", bound_sessions: [{ id: "cse_3", status: "active", status_bucket: "blocked" }, { id: "cse_4", status: "active", status_bucket: "completed" }] },
            { id: "cmsg_C" },
        ] };
        expect([...threadPhasesFrom(timeline)]).toEqual([["cse_1", "idle"], ["cse_2", "working"], ["cse_3", "blocked"], ["cse_4", "idle"]]);
        const withResolved = { data: [...timeline.data, { id: "cmsg_D", thread_status: "resolved", bound_sessions: [{ id: "cse_5", status: "active", status_bucket: "blocked" }] }] };
        expect(threadPhasesFrom(withResolved).has("cse_5")).toBe(false);
    });
    test("five styles, emoji mode keeps the official icon when idle", () => {
        expect(faviconFor("hole", "idle", "https://claude.ai/favicon.ico")).toBe("https://claude.ai/favicon.ico");
        for (const style of ["emoji", "badge", "dot", "hole", "bg", "project"] as const) {
            const icons = (["streaming", "done", "ready", "error"] as const).map(state => faviconFor(style, state, "x"));
            expect(new Set(icons).size).toBe(4);
            expect(icons.every(href => href.startsWith("data:image/svg+xml"))).toBe(true);
        }
        const mark = parseMark('<svg width="248" height="248" viewBox="0 0 248 248" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h9" fill="#D97757"/></svg>')!;
        expect(mark.viewBox).toBe("0 0 248 248");
        const tinted = decodeURIComponent(faviconFor("hole", "error", "x", mark));
        expect(tinted).toContain('fill="#EF4444"');
        expect(tinted).not.toContain("#D97757");
        expect(decodeURIComponent(faviconFor("dot", "done", "x", mark))).toContain('fill="#D97757"');
        // The project style: the sidebar dot's colours on the top-right corner, the running one breathing.
        const running = decodeURIComponent(faviconFor("project", "streaming", "x", mark));
        expect(running).toContain('cx="52" cy="12" r="12" fill="#D97757"');
        expect(decodeURIComponent(faviconFor("project", "streaming", "x", mark, 0))).toContain('r="10.3" fill="#D97757" opacity=".75"');
        expect(decodeURIComponent(faviconFor("project", "ready", "x", mark))).toContain('fill="#C98A12"');
        expect(decodeURIComponent(faviconFor("project", "error", "x", mark))).toContain('fill="#EF4444"');
        // Colours set through a style block or inline style are tinted too.
        const styled = parseMark('<svg viewBox="0 0 10 10"><style>.a{fill:#D97757}.b{fill:#8f8d89}</style><path class="a" d="M0 0h5"/><path style="fill:#8f8d89" d="M5 5h5"/></svg>')!;
        const blue = decodeURIComponent(faviconFor("hole", "streaming", "x", styled));
        expect(blue).not.toMatch(/#D97757|#8f8d89/i);
        expect(blue).toContain("#3B82F6");
    });
});

describe("project outline", () => {
    test("channel messages drop status cards and sort oldest first", () => {
        const list = parseChannelMessages({ data: [
            { id: "b", body: "reply", created_at: "2026-10-13T12:00:02Z" },
            { id: "s", body: '{"kind":"status","text":"x"}', created_at: "2026-10-13T12:00:03Z" },
            { id: "a", body: "question", author_account_id: "u", created_at: "2026-10-13T12:00:01Z" },
        ] });
        expect(list.map(m => `${m.role}:${m.text}:${!!m.notice}`)).toEqual(["user:question:false", "assistant:reply:false", "assistant::true"]);
        // Routing lines have no row in the project chat.
        expect(parseChannelMessages({ data: [{ id: "r", body: '{"type":"message_routed"}', created_at: "2026-10-13T12:00:00Z" }] })).toEqual([]);
        expect(parseChannelMessages({ data: [{ id: "r", body: '{"kind":"message_routed","to":"x"}', created_at: "2026-10-13T12:00:00Z" }] })).toEqual([]);
    });
    test("unrendered rows get labels from the project messages", () => {
        const api = ["q1 hello there", "a1 answer text", "q2 second question", "a2 second answer"].map((text, i) => ({ role: (i % 2 ? "assistant" : "user") as "user" | "assistant", text }));
        const rows = [
            { index: 0, role: "user" as const, text: "" },
            { index: 1, role: "assistant" as const, text: "" },
            { index: 2, role: "user" as const, text: "You said: q2 second question" },
            { index: 3, role: "assistant" as const, text: "" },
        ];
        expect(alignWithApi(rows, api).map(r => r.text)).toEqual(["q1 hello there", "a1 answer text", "You said: q2 second question", "a2 second answer"]);
        // Card rows (thread started, errors) and the trailing spacer drop out of the outline.
        const withCard = [api[0], { role: "assistant" as const, text: "", notice: true }, ...api.slice(1)];
        const cardRows = [0, 1, 2, 3, 4, 5].map(index => ({ index, role: "user" as const, text: index === 3 ? "You said: q2 second question" : "" }));
        expect(alignWithApi(cardRows, withCard).map(r => r.text)).toEqual(["q1 hello there", "a1 answer text", "You said: q2 second question", "a2 second answer"]);
        // No rendered row: the newest message lines up with the last row.
        expect(alignWithApi(rows.slice(0, 2).map(r => ({ ...r, text: "" })), api).map(r => r.text)).toEqual(["q2 second question", "a2 second answer"]);
    });
    test("project outline pins messages to rows by message id", () => {
        const api = [
            { id: "m1", role: "user" as const, text: "q1" },
            { id: "m2", role: "assistant" as const, text: "a1" },
            { id: "c1", role: "assistant" as const, text: "", notice: true },
            { id: "m3", role: "user" as const, text: "q2" },
            { id: "m4", role: "assistant" as const, text: "a2" },
        ];
        // Two header rows before the first message; only the last rows are rendered, plus a just-sent one and a tool row.
        const rows = [
            { index: 5, role: "user" as const, text: "You said: q2", entry: "m3" },
            { index: 6, role: "assistant" as const, text: "a2", entry: "m4" },
            { index: 7, role: "user" as const, text: "You said: q3", entry: "m5" },
            { index: 8, role: "assistant" as const, text: "Using tools…", entry: null },
        ];
        expect(outlineFromApi(api, rows)!.map(r => `${r.index}:${r.text}`)).toEqual(["2:q1", "3:a1", "5:q2", "6:a2", "7:You said: q3"]);
        expect(outlineFromApi(api, [{ index: 0, role: "user", text: "" }])).toBeNull();
    });
});

import { noDictationCss } from "../src/plugins/noDictation";
import { streamerCss } from "../src/plugins/streamerMode";
import { getText } from "../src/plugins/_api/composer";
import { SEL } from "../src/plugins/_api/dom/selectors";

describe("declutter selectors match the current claude.ai DOM", () => {
    const hidden = (css: string, html: string) => {
        document.body.innerHTML = html;
        const sel = css.slice(0, css.lastIndexOf("{")).trim();
        return document.body.firstElementChild!.matches(sel);
    };
    test("noDictation hides the Code dictation chevron and Read aloud", () => {
        const css = noDictationCss(true, true, true);
        expect(hidden(css, `<button aria-label="Dictation settings"></button>`)).toBe(true);
        expect(hidden(css, `<button data-testid="action-bar-read-aloud" aria-label="Read aloud"></button>`)).toBe(true);
        expect(hidden(noDictationCss(true, true, false), `<button data-testid="action-bar-read-aloud"></button>`)).toBe(false);
    });
    test("streamerMode blurs the project title and device name", () => {
        const css = streamerCss({ identity: true, sidebar: false, title: true, hover: false, amount: 6 });
        expect(hidden(css, `<button data-pane-title aria-label="CC++, rename project">CC++</button>`)).toBe(true);
        expect(hidden(css, `<a data-testid="cowork-computer-link-indicator">MacBook</a>`)).toBe(true);
        document.body.innerHTML = `<div data-perf-region="side_pane"><div data-top-right><span data-cds="OverflowTooltip">t</span></div></div>`;
        expect(document.querySelector("[data-cds=OverflowTooltip]")!.matches(css.slice(0, css.lastIndexOf("{")).trim())).toBe(true);
    });
    test("the composer API finds the Claude Code prompt", () => {
        document.body.innerHTML = `<div data-testid="code-prompt-input" contenteditable="true"><p>hello</p></div>`;
        const editor = document.querySelector<HTMLElement>(SEL.editor);
        expect(editor?.dataset.testid).toBe("code-prompt-input");
        expect(getText(editor)).toBe("hello");
        document.body.innerHTML = `<button data-testid="code-prompt-send"></button>`;
        expect(document.querySelector(SEL.sendButton)).not.toBeNull();
    });
});

describe("outlineFromApi estimates", () => {
    test("rows above the anchors never go below 0 and stay in order", () => {
        const api = Array.from({ length: 20 }, (_, i) => ({ id: `m${i}`, role: (i % 2 ? "assistant" : "user") as "user" | "assistant", text: `t${i}` }));
        const rows = [
            { index: 10, role: "user" as const, text: "t18", entry: "m18" },
            { index: 11, role: "assistant" as const, text: "t19", entry: "m19" },
        ];
        const out = outlineFromApi(api, rows)!;
        expect(out.length).toBe(20);
        expect(Math.min(...out.map(i => i.index))).toBeGreaterThanOrEqual(0);
        const bySeq = [...out].sort((a, b) => a.seq! - b.seq!).map(i => i.index);
        expect(bySeq).toEqual([...bySeq].sort((a, b) => a - b));
        expect(out.find(i => i.entry === "m18")!.index).toBe(10);
    });
    test("between anchors, positions are interpolated", () => {
        const api = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, role: "user" as const, text: `t${i}` }));
        const rows = [
            { index: 0, role: "user" as const, text: "t0", entry: "m0" },
            { index: 5, role: "user" as const, text: "t9", entry: "m9" },
        ];
        const out = outlineFromApi(api, rows)!;
        const idx = out.sort((a, b) => a.seq! - b.seq!).map(i => i.index);
        expect(idx[0]).toBe(0);
        expect(idx[9]).toBe(5);
        expect(idx.every(n => n >= 0 && n <= 5)).toBe(true);
    });
});

describe("projectKind", () => {
    const a = (o: object) => ({ channelId: "chan_x", working: 0, blocked: 0, own: null, ...o }) as any;
    test("running beats waiting, own session counts when enabled", () => {
        expect(projectKind(a({ blocked: 1, own: "working" }), true, true)).toBe("clay");
        expect(projectKind(a({ own: "working" }), true, false)).toBe(null);
        expect(projectKind(a({ blocked: 2 }), true, true)).toBe("awaiting");
        expect(projectKind(a({ blocked: 2 }), false, true)).toBe(null);
        expect(projectKind(undefined, true, true)).toBe(null);
    });
});

import { installTooltips, tipAttrs } from "../src/lib/tooltip";

describe("native-style tooltips", () => {
    test("an element with data-ccpp-tip opens a two-line card on hover", async () => {
        installTooltips();
        document.body.innerHTML = "";
        const btn = document.createElement("button");
        for (const [k, v] of Object.entries(tipAttrs("Weekly: 85%", "Resets Sun 8:00 AM"))) btn.setAttribute(k, v);
        document.body.appendChild(btn);
        btn.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, composed: true }));
        await new Promise(r => setTimeout(r, 600));
        const card = document.querySelector<HTMLElement>("[data-ccpp-tooltip]")!;
        expect(card.style.display).toBe("flex");
        expect(card.textContent).toBe("Weekly: 85%Resets Sun 8:00 AM");
        btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(card.style.display).toBe("none");
    });
});

describe("message star conversation keys", () => {
    test("chats, Claude Code project chats, threads and sessions", () => {
        const id = "f2d2fe2d-0852-4e8a-9fd8-87e867e7be5e";
        expect(chatKeyFor(`/chat/${id}`, "", false)).toEqual({ key: id, url: `/chat/${id}` });
        expect(chatKeyFor("/code/project/chan_01ABC", "?thread=cmsg_9", false)).toEqual({ key: "chan_01ABC", url: "/code/project/chan_01ABC" });
        expect(chatKeyFor("/code/project/chan_01ABC", "?thread=cmsg_9", true)).toEqual({ key: "chan_01ABC:cmsg_9", url: "/code/project/chan_01ABC?thread=cmsg_9" });
        expect(chatKeyFor("/code/project/chan_01ABC", "", true)).toBeNull();
        expect(chatKeyFor("/code/session_01XYZ", "", false)).toEqual({ key: "session_01XYZ", url: "/code/session_01XYZ" });
        expect(chatKeyFor("/new", "", false)).toBeNull();
    });

    test("a star remembers where a Claude Code conversation lives", () => {
        const star = { key: "k", index: 0, role: "user" as const, text: "hi", at: 1 };
        expect(toggleStar("chan_1", "P", star, {}, "/code/project/chan_1").next).toEqual({ chan_1: { title: "P", stars: [star], url: "/code/project/chan_1" } });
    });
});

describe("Claude Code header slot", () => {
    test("goes before the header's own buttons, or after the title when there are none", async () => {
        const { codeHeaderAnchor } = await import("../src/plugins/_api/slots");
        document.body.innerHTML = `<div id="row"><div><span><button data-pane-title>CC++</button></span></div><div id="actions"><span id="wrap"><button>Share</button></span><button>More</button></div></div>`;
        const got = codeHeaderAnchor(document.querySelector<HTMLElement>("[data-pane-title]")!);
        expect(got.where).toBe("before");
        expect(got.anchor.id).toBe("wrap");
        document.body.innerHTML = `<div><span><button data-pane-title>CC++</button></span><p>x</p></div>`;
        const lone = codeHeaderAnchor(document.querySelector<HTMLElement>("[data-pane-title]")!);
        expect(lone.where).toBe("after");
        expect(lone.anchor.tagName).toBe("SPAN");
        // Current Claude Code: the native buttons sit in a group at the right end of the header toolbar.
        document.body.innerHTML = `<div data-cds="Toolbar"><div class="flex"><span><span><button data-pane-title>CC++</button><span class="contents"><button aria-haspopup="menu"></button></span></span></span><div class="spacer"></div><div id="end"><span class="contents"><button>x</button><span><button>Project settings</button></span></span></div></div></div>`;
        const project = codeHeaderAnchor(document.querySelector<HTMLElement>("[data-pane-title]")!);
        expect(project).toEqual({ anchor: document.getElementById("end")!, where: "prepend" });
        document.body.innerHTML = `<div data-cds="Toolbar"><div><span><button>back</button><span data-cds="OverflowTooltip">Thread</span></span></div><div id="native"><button>Resolve</button><button>More</button><button>Close</button></div></div>`;
        const thread = codeHeaderAnchor(document.querySelector<HTMLElement>('[data-cds="OverflowTooltip"]')!);
        expect(thread).toEqual({ anchor: document.getElementById("native")!, where: "prepend" });
    });
});

describe("starSpot", () => {
    const html = (s: string) => {
        document.body.innerHTML = s;
        for (const b of document.querySelectorAll("button")) b.getBoundingClientRect = () => ({ width: b.dataset.w === "0" ? 0 : 24 }) as DOMRect;
        return document.querySelector<HTMLElement>("[role=toolbar]")!;
    };
    test("after the last native button's top-level child", () => {
        const bar = html(`<div role="toolbar"><button id="copy"></button><span class="star-host"><button class="ccpp-star-btn"></button></span><div id="more"><button></button></div></div>`);
        expect(starSpot(bar)!.after.id).toBe("more");
    });
    test("a More options sibling outside the toolbar", () => {
        const bar = html(`<div><div role="toolbar"><button></button></div><button class="ccpp-star-btn"></button><div id="more"><button></button></div></div>`);
        expect(starSpot(bar)!.after.id).toBe("more");
    });
    test("placeholder only: no spot", () => {
        const bar = html(`<div role="toolbar"><button data-w="0" aria-label="Show message actions"></button></div>`);
        expect(starSpot(bar)).toBeNull();
    });
});

describe("starSpot outside message bars", () => {
    const html = (s: string) => {
        document.body.innerHTML = s;
        for (const b of document.querySelectorAll("button")) b.getBoundingClientRect = () => ({ width: b.dataset.w === "0" ? 0 : 24 }) as DOMRect;
        return document.querySelector<HTMLElement>("[role=toolbar]")!;
    };
    test("an empty bar doesn't borrow buttons from what follows", () => {
        expect(starSpot(html(`<div><div role="toolbar"></div><div><button></button></div></div>`))).toBeNull();
    });
    test("the composer is never a host", () => {
        expect(starSpot(html(`<div role="toolbar"><button></button><div contenteditable="true"></div></div>`))).toBeNull();
        expect(starSpot(html(`<div><div role="toolbar"><button id="copy"></button></div><form><button></button></form></div>`))!.after.id).toBe("copy");
    });
});

describe("reindex", () => {
    test("moves stars to where their rows are now", () => {
        const star = (key: string, index: number) => ({ key, index, role: "assistant" as const, text: "", at: 1 });
        const book = { c: { title: "t", stars: [star("a", 92), star("b", 95)] } };
        expect(reindex(book, "c", new Map([["b", 95]]))).toBeNull();
        expect(reindex(book, "c", new Map([["a", 94]]))!.c.stars.map(s => [s.key, s.index])).toEqual([["a", 94], ["b", 95]]);
    });
});

test("the tab icon and the sidebar dot share one read of a project", async () => {
    const original = window.fetch;
    let timelines = 0;
    window.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/timeline")) timelines++;
        const body = url.includes("/timeline")
            ? { data: [{ thread_status: "working", bound_sessions: [{ id: "cse_1", status: "active", status_bucket: "working" }] }] }
            : url.includes("/v1/code/channels?") ? { data: [] } : {};
        return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
    }) as typeof fetch;
    try {
        const [activity, phases] = await Promise.all([getProjectActivity("chan_SHARE1"), getProjectPhases("chan_SHARE1")]);
        expect(timelines).toBe(1);
        expect(activity.working).toBe(1);
        expect(phases.get("cse_1")).toBe("working");
    } finally {
        window.fetch = original;
    }
});
