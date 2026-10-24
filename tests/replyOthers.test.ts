import { describe, expect, test } from "bun:test";

import { finished, readRows } from "../src/plugins/replyNotification";

const row = (id: string, attention: string | null, title: string) => {
    const label = attention
        ? `<span data-attention="${attention}"><span data-cds="ShimmerText">${title}<span aria-hidden="true">${title}</span></span><span role="status" aria-label="Running"></span></span>`
        : title;
    return `<div data-row><a href="/chat/${id}" data-row-main-button><span data-row-label><span>${label}</span></span></a></div>`;
};
const A = "327d0a10-e609-421d-a9ac-541777824155";
const B = "8233b8ee-6f70-4ea0-a31d-293748026c16";

describe("other chats finishing (claude.ai sidebar rows)", () => {
    test("reads which sidebar chats are replying", () => {
        const root = document.createElement("div");
        root.innerHTML = row(A, "working", "Counting") + row(B, null, "Notes");
        const rows = readRows(root);
        expect(rows.get(A)).toEqual({ state: "working", title: "Counting" });
        expect(rows.get(B)).toEqual({ state: "idle", title: "Notes" });
    });

    test("a chat that stops working is finished once; one never seen working is not", () => {
        const working = new Map<string, { since: number; title: string }>();
        expect(finished(working, new Map([[A, { state: "working", title: "Untitled" }], [B, { state: "idle", title: "Notes" }]]), 1000)).toEqual([]);
        // Row scrolled out of view: keep waiting.
        expect(finished(working, new Map(), 2000)).toEqual([]);
        expect(finished(working, new Map([[A, { state: "idle", title: "Counting" }]]), 31000)).toEqual([{ chatId: A, title: "Counting", durationMs: 30000, error: false }]);
        expect(finished(working, new Map([[A, { state: "idle", title: "Counting" }]]), 32000)).toEqual([]);
    });
});
