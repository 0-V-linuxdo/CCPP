import { describe, expect, test } from "bun:test";

import { addSnapshot, applySnapshot, chartDays, chartScale, emptyTrack, localDateKey, pruneDays, shiftDateKey, trackDelta, type DayRecord } from "../src/plugins/usageDisplay/stats";

const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();
const reset = at(30, 9);

describe("daily usage stats", () => {
    test("a day is how far the window rose", () => {
        let track = emptyTrack();
        track = applySnapshot(track, 10, reset, at(20, 9));
        track = applySnapshot(track, 14, reset, at(20, 12));
        track = applySnapshot(track, 17, reset + 300, at(20, 18));
        expect(trackDelta(track)).toBe(7);
    });

    test("a reset adds the old window's use and starts again", () => {
        const fiveHour = at(20, 14);
        let track = applySnapshot(emptyTrack(), 20, fiveHour, at(20, 10));
        track = applySnapshot(track, 80, fiveHour, at(20, 13));
        // Past the reset time, a new window with its own reset time.
        track = applySnapshot(track, 5, at(20, 19), at(20, 15));
        track = applySnapshot(track, 30, at(20, 19), at(20, 17));
        expect(trackDelta(track)).toBe(85);
        // A drop without a new reset time is a reset too.
        track = applySnapshot(track, 2, null, at(20, 18));
        expect(trackDelta(track)).toBe(85);
    });

    test("missing windows leave the track alone", () => {
        const track = applySnapshot(applySnapshot(emptyTrack(), 40, reset, at(20, 9)), null, null, at(20, 10));
        expect(track.last).toBe(40);
        expect(trackDelta(track)).toBe(0);
    });

    test("a new day carries on from yesterday inside the same window", () => {
        let days: Record<string, DayRecord> = {};
        days = addSnapshot(days, { week: { percent: 10, resetAt: reset }, session: null }, 90, at(20, 9));
        days = addSnapshot(days, { week: { percent: 18, resetAt: reset }, session: null }, 90, at(20, 22));
        days = addSnapshot(days, { week: { percent: 25, resetAt: reset }, session: null }, 90, at(21, 9));
        expect(trackDelta(days["2026-10-20"].week)).toBe(8);
        expect(trackDelta(days["2026-10-21"].week)).toBe(7);
        // A gap day breaks the chain: the next record starts fresh.
        days = addSnapshot(days, { week: { percent: 40, resetAt: reset }, session: null }, 90, at(23, 9));
        expect(trackDelta(days["2026-10-23"].week)).toBe(0);
    });

    test("no carry-over across a weekly reset", () => {
        let days: Record<string, DayRecord> = {};
        days = addSnapshot(days, { week: { percent: 90, resetAt: at(21, 3) }, session: null }, 90, at(20, 20));
        days = addSnapshot(days, { week: { percent: 4, resetAt: at(28, 3) }, session: null }, 90, at(21, 9));
        expect(trackDelta(days["2026-10-21"].week)).toBe(0);
    });

    test("history is pruned and charted with gaps filled", () => {
        const now = at(20, 12);
        const old: DayRecord = { date: "2026-01-01", week: emptyTrack(), session: emptyTrack(), updatedAt: 0 };
        const kept = pruneDays({ "2026-01-01": old, "2026-10-19": { ...old, date: "2026-10-19" } }, 30, now);
        expect(Object.keys(kept)).toEqual(["2026-10-19"]);
        const bars = chartDays(kept, now);
        expect(bars.length).toBe(7);
        expect(bars[bars.length - 1].date).toBe(localDateKey(now));
        expect(shiftDateKey("2026-10-31", 1)).toBe("2026-11-01");
        expect(chartScale(bars)).toBe(20);
        expect(chartScale([{ ...old, week: { start: 0, last: 34, resetAt: null, accrued: 0 } }])).toBe(40);
    });
});
