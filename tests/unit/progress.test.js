import { describe, it, expect } from "vitest";
import { levelFor, xpIn, dayKey, prevDayKey, advanceStreak } from "../../src/lib/progress.js";

describe("levelFor", () => {
  it.each([[0, 1], [59, 1], [60, 2], [239, 2], [240, 3], [539, 3], [540, 4]])(
    "%i XP is level %i", (xp, lvl) => expect(levelFor(xp)).toBe(lvl));

  it.each([-10, NaN, Infinity, "nonsense", null, undefined])(
    "clamps %p to level 1", (bad) => expect(levelFor(bad)).toBe(1));
});

describe("xpIn", () => {
  it("reports progress inside the current level", () => {
    expect(xpIn(0)).toEqual({ cur: 0, need: 60 });
    expect(xpIn(59)).toEqual({ cur: 59, need: 60 });
    expect(xpIn(60)).toEqual({ cur: 0, need: 180 });
    expect(xpIn(240)).toEqual({ cur: 0, need: 300 });
  });

  it("keeps 0 <= cur < need for every level boundary", () => {
    for (let xp = 0; xp < 20000; xp += 7) {
      const { cur, need } = xpIn(xp);
      expect(need).toBeGreaterThan(0);
      expect(cur).toBeGreaterThanOrEqual(0);
      expect(cur).toBeLessThan(need);
    }
  });

  it.each([-10, NaN, "x", null])("never returns null for %p", (bad) => {
    const r = xpIn(bad);
    expect(Number.isFinite(r.cur)).toBe(true);
    expect(Number.isFinite(r.need)).toBe(true);
  });
});

describe("dayKey / prevDayKey", () => {
  it("uses local calendar parts, not the UTC date", () => {
    // 23:30 local on the 5th is the 5th, whatever UTC thinks.
    const at = new Date(2026, 0, 5, 23, 30).getTime();
    expect(dayKey(at)).toBe("2026-01-05");
  });

  it("walks back across month, year and leap boundaries", () => {
    expect(prevDayKey("2026-01-01")).toBe("2025-12-31");
    expect(prevDayKey("2026-03-01")).toBe("2026-02-28");
    expect(prevDayKey("2024-03-01")).toBe("2024-02-29");
  });
});

describe("advanceStreak", () => {
  const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime();

  it("does not advance twice in the same local day", () => {
    let s = { streak: 0, lastActive: null };
    s = advanceStreak(s, at(2026, 1, 2, 9));
    expect(s).toEqual({ streak: 1, lastActive: "2026-01-02" });
    s = advanceStreak(s, at(2026, 1, 2, 23));
    expect(s).toEqual({ streak: 1, lastActive: "2026-01-02" });
  });

  it("advances on the next local day regardless of time of day", () => {
    // The old UTC implementation lost this streak for UTC+13 users and
    // failed to advance it for UTC-8 users.
    let s = { streak: 0, lastActive: null };
    s = advanceStreak(s, at(2026, 1, 2, 10));
    s = advanceStreak(s, at(2026, 1, 3, 15));
    s = advanceStreak(s, at(2026, 1, 4, 1));
    expect(s).toEqual({ streak: 3, lastActive: "2026-01-04" });
  });

  it("resets after a skipped day", () => {
    let s = { streak: 9, lastActive: "2026-01-02" };
    s = advanceStreak(s, at(2026, 1, 5));
    expect(s).toEqual({ streak: 1, lastActive: "2026-01-05" });
  });

  it("carries a streak across a month boundary", () => {
    let s = { streak: 4, lastActive: "2026-02-28" };
    s = advanceStreak(s, at(2026, 3, 1));
    expect(s).toEqual({ streak: 5, lastActive: "2026-03-01" });
  });

  it("never mutates the state it is given", () => {
    const s = Object.freeze({ streak: 2, lastActive: "2026-01-01" });
    expect(() => advanceStreak(s, at(2026, 1, 2))).not.toThrow();
    expect(s.streak).toBe(2);
  });
});

describe("advanceStreak — missing fields", () => {
  it("treats an absent streak as zero", () => {
    const s = advanceStreak({ lastActive: "2026-01-01" }, new Date(2026, 0, 2, 12).getTime());
    expect(s.streak).toBe(1);
  });
  it("starts a streak from empty state", () => {
    const s = advanceStreak({}, new Date(2026, 0, 2, 12).getTime());
    expect(s).toEqual({ streak: 1, lastActive: "2026-01-02" });
  });
});
