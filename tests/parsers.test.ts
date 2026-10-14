import { describe, expect, test } from "bun:test";

import { orgFromCookie, parseActivity, parseChannelSessions, parseConversation, parseSessionState, parseUsage } from "../src/plugins/_api/claude";
import { parseRoute } from "../src/plugins/_api/router";
import { matches, parseCombo } from "../src/plugins/_api/hotkeys";
import { titleFrom } from "../src/plugins/_api/chatState";
import { recordVisit, renameVisit } from "../src/plugins/recentChats";
import { level } from "../src/plugins/usageDisplay";
import { cornerKind, dotKind } from "../src/plugins/projectStatus";
import { remember } from "../src/plugins/inputHistory";
import { parsePresets } from "../src/plugins/promptPresets";
import { withPrefix } from "../src/plugins/tabStatus";
import { pickPhrase, fillPhrase } from "../src/plugins/customGreeting";
import { toMarkdown } from "../src/plugins/exportChat";
import { splitLinks } from "../src/plugins/betterLinks";
import { isTelemetry } from "../src/plugins/noTelemetry";
import { toggleStar } from "../src/plugins/messageStars/store";
import { computeState, faviconFor, parseMark } from "../src/plugins/chatFavicon";
import { alignWithApi, outlineFromApi } from "../src/plugins/chatNavigator";
import { parseChannelMessages } from "../src/plugins/_api/claude";

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
        expect(dotKind({ channelId: "c", working: 0, blocked: 2 }, true)).toBe("awaiting");
        expect(dotKind({ channelId: "c", working: 0, blocked: 2 }, false)).toBeNull();
        expect(dotKind({ channelId: "c", working: 1, blocked: 0 }, true)).toBe("clay");
        expect(cornerKind({ channelId: "c", working: 0, blocked: 0, own: "working" }, true)).toBe("clay");
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

    test("input history dedupes newest first", () => {
        expect(remember(["b", "a"], " a ", 3)).toEqual(["a", "b"]);
        expect(remember(["c", "b", "a"], "d", 3)).toEqual(["d", "c", "b"]);
    });

    test("presets", () => {
        expect(parsePresets("T1\nbody one\n\nT2")).toEqual([{ title: "T1", body: "body one" }, { title: "T2", body: "T2" }]);
    });

    test("tab prefix replaces earlier prefixes", () => {
        expect(withPrefix("⏳ Chat - Claude", "✅", ["⏳", "✅"])).toBe("✅ Chat - Claude");
        expect(withPrefix("✅ Chat", "", ["⏳", "✅"])).toBe("Chat");
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
    test("five styles, emoji mode keeps the official icon when idle", () => {
        expect(faviconFor("hole", "idle", "https://claude.ai/favicon.ico")).toBe("https://claude.ai/favicon.ico");
        for (const style of ["emoji", "badge", "dot", "hole", "bg"] as const) {
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
