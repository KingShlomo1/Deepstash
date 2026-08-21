import { describe, it, expect } from "vitest";
import { steps, wMin, totalSecs, isRest, nextIndex } from "../../src/lib/workout.js";

const W = { rounds: 2, ex: [["Jumping jacks", 40], ["Rest", 20], ["High knees", 30]] };

describe("steps", () => {
  it("expands rounds x exercises in order", () => {
    const s = steps(W);
    expect(s).toHaveLength(6);
    expect(s.map((x) => x.name)).toEqual([
      "Jumping jacks", "Rest", "High knees", "Jumping jacks", "Rest", "High knees",
    ]);
    expect(s.map((x) => x.round)).toEqual([1, 1, 1, 2, 2, 2]);
  });

  it("carries duration and cue through", () => {
    const s = steps({ rounds: 1, ex: [["Plank", 45, "brace hard"]] });
    expect(s[0]).toMatchObject({ dur: 45, cue: "brace hard", rest: false });
  });
});

describe("isRest", () => {
  it("matches an exact Rest interval", () => {
    expect(isRest(["Rest", 20])).toBe(true);
    expect(isRest(["rest", 20])).toBe(true);
  });

  it("does not classify a work set as rest just because the name contains it", () => {
    // A substring match would call this a rest interval and drop it from the
    // active-minutes total.
    expect(isRest(["Rest-pause press", 30])).toBe(false);
    expect(isRest(["Wrestler bridge", 30])).toBe(false);
  });

  it("honours an explicit rest flag", () => {
    expect(isRest(["Catch your breath", 20, "", true])).toBe(true);
    expect(isRest(["Rest", 20, "", false])).toBe(false);
  });
});

describe("wMin / totalSecs", () => {
  it("counts work only, rests excluded", () => {
    expect(wMin(W)).toBe(Math.round(((40 + 30) * 2) / 60));
  });
  it("counts everything for wall-clock", () => {
    expect(totalSecs(W)).toBe((40 + 20 + 30) * 2);
  });
  it("includes a set whose name merely contains 'rest'", () => {
    expect(wMin({ rounds: 1, ex: [["Rest-pause press", 60]] })).toBe(1);
  });
});

describe("nextIndex", () => {
  it("advances and finishes", () => {
    expect(nextIndex(0, 1, 3)).toBe(1);
    expect(nextIndex(2, 1, 3)).toBe(-1);
  });
  it("clamps backwards past the start", () => {
    expect(nextIndex(0, -1, 3)).toBe(0);
    expect(nextIndex(2, -1, 3)).toBe(1);
  });
});

describe("isRest — arity", () => {
  it("uses the name when no flag is present", () => {
    expect(isRest(["Rest", 20, "cue"])).toBe(true);
    expect(isRest(["Squats", 20, "cue"])).toBe(false);
  });
  it("tolerates a missing name", () => {
    expect(isRest([undefined, 20])).toBe(false);
  });
});
