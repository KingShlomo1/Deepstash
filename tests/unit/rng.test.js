import { describe, it, expect } from "vitest";
import { hs, mul, sd, pick } from "../../src/lib/rng.js";

describe("seeded RNG determinism", () => {
  it("gives the same sequence for the same seed", () => {
    const a = sd("f42"), b = sd("f42");
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("gives different sequences for different seeds", () => {
    expect(sd("f42")()).not.toBe(sd("f43")());
  });

  it("stays in [0, 1)", () => {
    const r = sd("spread");
    for (let i = 0; i < 5000; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is reasonably uniform across ten buckets", () => {
    const r = sd("uniform"), buckets = new Array(10).fill(0), N = 50000;
    for (let i = 0; i < N; i++) buckets[Math.floor(r() * 10)]++;
    for (const b of buckets) expect(Math.abs(b - N / 10) / (N / 10)).toBeLessThan(0.1);
  });

  it("hashes empty and unicode strings without throwing", () => {
    expect(typeof hs("")()).toBe("number");
    expect(typeof hs("🔥 çà")()).toBe("number");
  });

  it("mul is stable for a numeric seed", () => {
    expect(mul(12345)()).toBe(mul(12345)());
  });
});

describe("pick", () => {
  it("always returns a member of the array", () => {
    const r = sd("pick"), arr = ["a", "b", "c", "d"];
    for (let i = 0; i < 500; i++) expect(arr).toContain(pick(r, arr));
  });

  it("eventually reaches every member", () => {
    const r = sd("cover"), arr = ["a", "b", "c", "d"], seen = new Set();
    for (let i = 0; i < 500; i++) seen.add(pick(r, arr));
    expect(seen.size).toBe(arr.length);
  });
});
