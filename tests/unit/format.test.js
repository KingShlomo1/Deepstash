import { describe, it, expect } from "vitest";
import { esc, fmt, mmss, timeAgo, ini, wrapLines } from "../../src/lib/format.js";

describe("esc", () => {
  it("escapes every character that can break out of markup", () => {
    expect(esc(`<script>`)).toBe("&lt;script&gt;");
    expect(esc(`a & b`)).toBe("a &amp; b");
    expect(esc(`"q"`)).toBe("&quot;q&quot;");
    // The old implementation left ' alone, so anything interpolated into a
    // single-quoted attribute could break out of it.
    expect(esc(`it's`)).toBe("it&#39;s");
  });

  it("neutralises a full attribute breakout in both quote styles", () => {
    for (const payload of [`" onerror="alert(1)`, `' onerror='alert(1)`]) {
      const out = esc(payload);
      expect(out).not.toMatch(/["']/);
    }
  });

  it("coerces non-strings", () => {
    expect(esc(null)).toBe("null");
    expect(esc(12)).toBe("12");
  });
});

describe("fmt", () => {
  it.each([[0, "0"], [999, "999"], [1000, "1k"], [1200, "1.2k"], [9500, "9.5k"], [10000, "10k"], [24000, "24k"]])(
    "%i -> %s", (n, s) => expect(fmt(n)).toBe(s));
  it.each([NaN, Infinity, undefined])("survives %p", (bad) => expect(fmt(bad)).toBe("0"));
});

describe("mmss", () => {
  it.each([[0, "0:00"], [5, "0:05"], [59, "0:59"], [60, "1:00"], [3599, "59:59"], [3600, "60:00"]])(
    "%i -> %s", (n, s) => expect(mmss(n)).toBe(s));
  it.each([-5, NaN, undefined])("clamps %p to 0:00", (bad) => expect(mmss(bad)).toBe("0:00"));
  it("always renders two digits of seconds", () => {
    for (let s = 0; s < 600; s++) expect(mmss(s)).toMatch(/^\d+:\d{2}$/);
  });
});

describe("timeAgo", () => {
  const now = Date.parse("2026-08-21T12:00:00Z");
  it.each([
    [now, "now"], [now - 30e3, "now"], [now - 5 * 60e3, "5m"],
    [now - 3 * 3600e3, "3h"], [now - 4 * 86400e3, "4d"],
  ])("renders %i as %s", (t, s) => expect(timeAgo(t, now)).toBe(s));
  it.each([0, null, undefined, NaN])("treats %p as now", (bad) => expect(timeAgo(bad, now)).toBe("now"));
});

describe("ini", () => {
  it.each([["quietriot", "Q"], ["  sam", "S"], ["9lives", "L"], ["", "?"], ["123", "?"]])(
    "%p -> %s", (n, s) => expect(ini(n)).toBe(s));
  it.each([null, undefined])("survives %p", (bad) => expect(ini(bad)).toBe("?"));
});

describe("wrapLines", () => {
  const measure = (s) => s.length * 10; // 10px per character

  it("breaks on width, never mid-word", () => {
    const lines = wrapLines(measure, "the quick brown fox jumps", 100);
    expect(lines.every((l) => measure(l) <= 100 || !l.includes(" "))).toBe(true);
    expect(lines.join(" ")).toBe("the quick brown fox jumps");
  });

  it("keeps an over-long word on its own line rather than dropping it", () => {
    const lines = wrapLines(measure, "a supercalifragilistic b", 60);
    expect(lines.join(" ")).toContain("supercalifragilistic");
  });

  it.each([["", 0], ["   ", 0], ["one", 1]])("%p yields %i lines", (t, n) =>
    expect(wrapLines(measure, t, 100)).toHaveLength(n));
});
