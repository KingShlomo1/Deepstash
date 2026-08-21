import { describe, it, expect } from "vitest";
import { validateBackup, parseBackup } from "../../src/lib/backup.js";

const REAL = {
  xp: 1240, streak: 6, reads: 88, workouts: 3, minutes: 42, sessions: 2,
  lastActive: "2026-08-20", name: "Ely", theme: "dark", accent: "gold",
  likes: { f12: true }, saves: { f12: true, r1: false }, quizBest: { q1: 100 },
  interests: ["mind", "money"], history: [{ kind: "idea", id: "f12", topic: "mind", title: "x", t: 1 }],
  collections: [{ id: "c1", name: "Later", items: ["f12"] }],
  videos: [{ id: "v1", url: "https://youtu.be/dQw4w9WgXcQ", title: "t" }],
};

describe("validateBackup — happy path", () => {
  it("accepts a full, well-formed backup unchanged", () => {
    const r = validateBackup(REAL);
    expect(r.ok).toBe(true);
    expect(r.rejected).toEqual([]);
    expect(r.value).toEqual(REAL);
  });

  it("round-trips through JSON", () => {
    const r = parseBackup(JSON.stringify(REAL));
    expect(r.ok).toBe(true);
    expect(r.value).toEqual(REAL);
  });
});

describe("validateBackup — corrupt input cannot reach state", () => {
  // The previous importData() did Object.assign with no checks and saved
  // before rendering, so this exact payload bricked the You tab for good.
  it("drops collections:null instead of persisting it", () => {
    const r = validateBackup({ xp: 50, collections: null });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ xp: 50 });
    expect(r.rejected).toContain("collections");
  });

  it.each([
    ["xp", "999"], ["xp", -5], ["xp", NaN],
    ["streak", 1.5], ["saves", "nope"], ["saves", ["a"]],
    ["likes", { f1: "yes" }], ["history", 42], ["interests", [1, 2]],
    ["collections", [{ id: "c1" }]], ["theme", "neon"],
    ["videos", [{ nope: 1 }]], ["ownComments", { k: [1] }],
    ["lastActive", "20th August"],
  ])("rejects %s = %p", (field, bad) => {
    const r = validateBackup({ ...REAL, [field]: bad });
    expect(r.rejected).toContain(field);
    expect(r.value).not.toHaveProperty(field);
  });

  it("salvages the readable half of a partly-corrupt backup", () => {
    const r = validateBackup({ xp: 300, streak: 4, saves: "broken", collections: null });
    expect(r.ok).toBe(true);
    expect(r.value).toEqual({ xp: 300, streak: 4 });
    expect(r.rejected.sort()).toEqual(["collections", "saves"]);
  });

  it("ignores unknown fields rather than absorbing them", () => {
    const r = validateBackup({ xp: 10, __proto__polluted: 1, evil: "x" });
    expect(r.value).toEqual({ xp: 10 });
    expect(r.rejected).toContain("evil");
  });

  it.each([null, undefined, 42, "text", [1, 2], true])("refuses %p outright", (bad) => {
    const r = validateBackup(bad);
    expect(r.ok).toBe(false);
    expect(r.error).toBeTruthy();
  });

  it("reports a readable error when nothing survives", () => {
    const r = validateBackup({ xp: "nope", saves: 1 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/no readable progress/i);
  });
});

describe("parseBackup", () => {
  it.each(["{oops", "", "undefined"])("explains bad JSON for %p", (t) => {
    const r = parseBackup(t);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/valid JSON/i);
  });

  it("rejects a JSON array", () => {
    expect(parseBackup("[1,2,3]").ok).toBe(false);
  });
});

describe("validateBackup — every field guard is exercised", () => {
  // One payload touching every key the schema knows about, so no guard is
  // silently unreachable when fields are added or renamed.
  const FULL = {
    xp: 10, streak: 1, reads: 2, workouts: 3, minutes: 4, sessions: 5,
    quizzes: 6, points: 7, lastActive: "2026-01-01", notifyLast: "2026-01-01",
    name: "n", avatar: "A", uid: "u1", theme: "light", accent: "violet",
    mood: "calm", apiBase: "", geminiKey: "", notify: true, onboarded: true,
    seeded: true, audioAuto: false, seedV: 2,
    likes: { a: true }, saves: { a: false }, done: { a: true },
    storiesSeen: { s1: true }, mapsSeen: { m1: true },
    quizBest: { q1: 90 }, readProgress: { r1: 0.5 }, affinity: { mind: 3 },
    ownComments: { f1: ["hi"] }, aiCache: { "k|simple": "text" },
    interests: ["mind"], history: [{ kind: "idea", id: "f1" }],
    collections: [{ id: "c1", name: "n", items: [] }],
    videos: [{ id: "v1" }], aiIdeas: [["mind", "idea", "t", "x"]],
  };

  it("accepts all of them", () => {
    const r = validateBackup(FULL);
    expect(r.ok).toBe(true);
    expect(r.rejected).toEqual([]);
    expect(Object.keys(r.value).sort()).toEqual(Object.keys(FULL).sort());
  });

  it("rejects all of them when every value has the wrong type", () => {
    const broken = Object.fromEntries(Object.keys(FULL).map((k) => [k, Symbol.iterator]));
    const r = validateBackup(broken);
    expect(r.ok).toBe(false);
    expect(r.rejected.sort()).toEqual(Object.keys(FULL).sort());
  });

  it("accepts the nullable fields as null", () => {
    const r = validateBackup({ xp: 1, lastActive: null, notifyLast: null, interests: null });
    expect(r.rejected).toEqual([]);
  });
});
