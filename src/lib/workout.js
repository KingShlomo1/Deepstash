/* Interval-timer maths. Pure. */

/** An exercise is a rest interval when it is explicitly typed as one. */
export function isRest(ex) {
  return ex.length > 3 ? !!ex[3] : /^rest$/i.test((ex[0] || "").trim());
}

/** Expand a workout into a flat list of timed steps (rounds x exercises). */
export function steps(w) {
  const out = [];
  for (let r = 0; r < w.rounds; r++)
    for (const e of w.ex)
      out.push({ name: isRest(e) ? "Rest" : e[0], dur: e[1], cue: e[2] || "", rest: isRest(e), round: r + 1 });
  return out;
}

/** Active minutes in a workout: work intervals only, rests excluded. */
export function wMin(w) {
  let s = 0;
  for (const e of w.ex) if (!isRest(e)) s += e[1];
  return Math.round((s * w.rounds) / 60);
}

/** Total wall-clock seconds including rests. */
export function totalSecs(w) {
  return w.ex.reduce((a, e) => a + e[1], 0) * w.rounds;
}

/** Advance the step index. Returns the next index, or -1 when the workout is done. */
export function nextIndex(i, delta, total) {
  const n = i + delta;
  if (n >= total) return -1;
  return n < 0 ? 0 : n;
}
