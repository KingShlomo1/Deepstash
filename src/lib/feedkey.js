/* Stable identity for feed ideas.
   Ideas used to be keyed by their array index ("f12"), so inserting or
   reordering a single entry silently reassigned every saved item, like and
   history row to different content. Keys are now derived from the idea's own
   text, so they survive edits elsewhere in the catalogue. */

import { hs } from "./rng.js";

/** Stable key for one FEED entry: [topic, type, title, body, extra]. */
export function feedKey(item) {
  // Topic plus title: enough to separate near-duplicate lines across subjects,
  // and stable against body copy being reworded.
  const basis = (item?.[0] ?? "") + " " + (item?.[2] ?? "");
  return "f" + hs(basis)().toString(36);
}

/** True when `k` addresses a feed idea (as opposed to an article, map, ...). */
export function isFeedKey(k) {
  return typeof k === "string" && k[0] === "f";
}

/** Build key -> index and index -> key lookups for a catalogue. */
export function feedIndex(feed) {
  const byKey = new Map();
  const keys = new Array(feed.length);
  for (let i = 0; i < feed.length; i++) {
    let k = feedKey(feed[i]);
    // Two entries with the same topic and title would otherwise collide.
    if (byKey.has(k)) {
      let n = 2;
      while (byKey.has(k + "_" + n)) n++;
      k = k + "_" + n;
    }
    byKey.set(k, i);
    keys[i] = k;
  }
  return { byKey, keys };
}

/** The old scheme: "f" followed by a decimal array index. */
const LEGACY = /^f(\d+)$/;

/**
 * Rewrite legacy index keys to content keys throughout a saved state.
 * `keys[i]` must be the content key for the idea that sat at index i when the
 * state was written, i.e. the catalogue this build ships.
 * Mutates `state` and returns the number of keys rewritten.
 */
export function migrateKeys(state, keys) {
  let changed = 0;
  const remap = (k) => {
    const m = typeof k === "string" ? k.match(LEGACY) : null;
    if (!m) return k;
    const next = keys[+m[1]];
    if (!next || next === k) return k;
    changed++;
    return next;
  };
  const remapMap = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[remap(k)] = v;
    return out;
  };

  for (const field of ["likes", "saves", "done", "ownComments", "readProgress"]) {
    if (state[field]) state[field] = remapMap(state[field]);
  }

  if (Array.isArray(state.history)) {
    for (const h of state.history) if (h && h.kind === "idea") h.id = remap(h.id);
  }

  if (Array.isArray(state.collections)) {
    for (const c of state.collections) {
      if (c && Array.isArray(c.items)) c.items = c.items.map(remap);
    }
  }

  return changed;
}
