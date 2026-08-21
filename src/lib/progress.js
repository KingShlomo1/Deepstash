/* XP, levels and streaks. Pure: every function takes the clock/state it needs. */

/** Level from total XP. Level N starts at (N-1)^2 * 60 XP. */
export function levelFor(xp) {
  const x = Number(xp);
  if (!Number.isFinite(x) || x < 0) return 1;
  return Math.floor(Math.sqrt(x / 60)) + 1;
}

/** Progress within the current level: { cur, need }, always 0 <= cur < need. */
export function xpIn(xp) {
  const x = Number.isFinite(Number(xp)) && Number(xp) > 0 ? Number(xp) : 0;
  const l = levelFor(x);
  const base = (l - 1) * (l - 1) * 60;
  const next = l * l * 60;
  return { cur: x - base, need: next - base };
}

/**
 * The user's calendar day in THEIR timezone, as "YYYY-MM-DD".
 * Uses local date parts, not toISOString() — a UTC day boundary would roll the
 * streak over at the wrong moment for everyone outside UTC.
 */
export function dayKey(at = Date.now()) {
  const d = new Date(at);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** The local calendar day before `key` ("YYYY-MM-DD" in, "YYYY-MM-DD" out). */
export function prevDayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const p = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/**
 * Advance a streak for activity at `at`.
 * Returns the next { streak, lastActive } — never mutates its input.
 *  - same local day as last activity -> unchanged
 *  - the local day right after       -> +1
 *  - any longer gap                  -> reset to 1
 */
export function advanceStreak(state, at = Date.now()) {
  const today = dayKey(at);
  const last = state.lastActive;
  if (last === today) return { streak: state.streak, lastActive: last };
  const streak = last === prevDayKey(today) ? (state.streak || 0) + 1 : 1;
  return { streak, lastActive: today };
}
