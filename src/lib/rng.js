/* Deterministic seeded RNG. Same seed always yields the same sequence, so
   procedurally generated comments/handles stay stable across reloads. */

/** cyrb53-style string hash -> seed generator. */
export function hs(s) {
  let h = 1779033703 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

/** mulberry32 PRNG -> floats in [0, 1). */
export function mul(s) {
  let a = s >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded float generator for a stable id. */
export function sd(id) { return mul(hs("ax" + id)()); }

/** Pick an element using a float generator. */
export function pick(r, a) { return a[Math.floor(r() * a.length)]; }
