import { describe, it, expect } from "vitest";
import { feedKey, isFeedKey, feedIndex, migrateKeys } from "../../src/lib/feedkey.js";
import { FEED } from "../../src/content/feed.js";

const SAMPLE = [
  ["mind", "idea", "Attention is the rent you pay"],
  ["money", "idea", "Compounding is boring on purpose"],
  ["mind", "quote", "The obstacle is the way"],
];

describe("feedKey", () => {
  it("is stable for the same content", () => {
    expect(feedKey(SAMPLE[0])).toBe(feedKey(["mind", "idea", "Attention is the rent you pay"]));
  });

  it("differs when the title differs", () => {
    expect(feedKey(SAMPLE[0])).not.toBe(feedKey(SAMPLE[1]));
  });

  it("differs when the same title sits under a different topic", () => {
    expect(feedKey(["mind", "idea", "Same"])).not.toBe(feedKey(["money", "idea", "Same"]));
  });

  it("ignores body copy, so rewording an explanation keeps saves intact", () => {
    const a = ["mind", "idea", "Title", "first wording"];
    const b = ["mind", "idea", "Title", "second wording, much longer"];
    expect(feedKey(a)).toBe(feedKey(b));
  });

  it("produces a key shaped like a feed key", () => {
    expect(isFeedKey(feedKey(SAMPLE[0]))).toBe(true);
    expect(feedKey(SAMPLE[0])).toMatch(/^f[0-9a-z]+$/);
  });

  it("survives a malformed entry", () => {
    expect(() => feedKey([])).not.toThrow();
    expect(() => feedKey(undefined)).not.toThrow();
  });
});

describe("feedIndex", () => {
  it("round-trips key -> index for every entry", () => {
    const { byKey, keys } = feedIndex(SAMPLE);
    keys.forEach((k, i) => expect(byKey.get(k)).toBe(i));
  });

  it("keeps keys stable when an entry is prepended", () => {
    const before = feedIndex(SAMPLE).keys;
    const after = feedIndex([["new", "idea", "Inserted at the top"], ...SAMPLE]).keys;
    // This is the whole point: index keys would have shifted every one of these.
    expect(after.slice(1)).toEqual(before);
  });

  it("keeps keys stable when an entry is removed from the middle", () => {
    const before = feedIndex(SAMPLE).keys;
    const after = feedIndex([SAMPLE[0], SAMPLE[2]]).keys;
    expect(after).toEqual([before[0], before[2]]);
  });

  it("disambiguates genuine duplicates", () => {
    const dup = [SAMPLE[0], SAMPLE[0], SAMPLE[0]];
    const { keys, byKey } = feedIndex(dup);
    expect(new Set(keys).size).toBe(3);
    expect(byKey.size).toBe(3);
  });

  it("assigns a unique key to every idea in the real catalogue", () => {
    const { keys } = feedIndex(FEED);
    expect(keys).toHaveLength(FEED.length);
    expect(new Set(keys).size).toBe(FEED.length);
  });
});

describe("migrateKeys", () => {
  const keys = feedIndex(SAMPLE).keys;

  it("rewrites index keys across every field that holds them", () => {
    const state = {
      likes: { f0: true, f2: true },
      saves: { f1: true, r1: true },
      done: { f0: true },
      ownComments: { f1: ["nice"] },
      readProgress: { f2: 0.5 },
      history: [{ kind: "idea", id: "f2" }, { kind: "article", id: "r1" }],
      collections: [{ id: "c1", name: "Later", items: ["f0", "r1"] }],
    };
    const changed = migrateKeys(state, keys);
    expect(changed).toBeGreaterThan(0);
    expect(state.likes).toEqual({ [keys[0]]: true, [keys[2]]: true });
    expect(state.saves).toEqual({ [keys[1]]: true, r1: true });
    expect(state.ownComments).toEqual({ [keys[1]]: ["nice"] });
    expect(state.readProgress).toEqual({ [keys[2]]: 0.5 });
    expect(state.history[0].id).toBe(keys[2]);
    expect(state.collections[0].items).toEqual([keys[0], "r1"]);
  });

  it("leaves non-feed keys alone", () => {
    const state = { saves: { r1: true, q3: true, "map-money": true } };
    migrateKeys(state, keys);
    expect(state.saves).toEqual({ r1: true, q3: true, "map-money": true });
  });

  it("leaves article ids in history untouched", () => {
    const state = { history: [{ kind: "article", id: "f1" }] };
    migrateKeys(state, keys);
    expect(state.history[0].id).toBe("f1");
  });

  it("drops nothing when an index is out of range", () => {
    const state = { saves: { f999: true } };
    migrateKeys(state, keys);
    expect(state.saves).toEqual({ f999: true });
  });

  it("is idempotent — a second run changes nothing", () => {
    const state = { saves: { f0: true }, history: [], collections: [] };
    migrateKeys(state, keys);
    const afterFirst = JSON.parse(JSON.stringify(state));
    expect(migrateKeys(state, keys)).toBe(0);
    expect(state).toEqual(afterFirst);
  });

  it("survives missing and malformed fields", () => {
    for (const state of [{}, { saves: null }, { history: "nope" }, { collections: [null] }]) {
      expect(() => migrateKeys(state, keys)).not.toThrow();
    }
  });
});
