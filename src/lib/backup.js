/* Backup import/export. Validates shape before it can touch persisted state. */

/** Field name -> type guard. Anything absent from a backup keeps its default. */
const SCHEMA = {
  xp: (v) => Number.isFinite(v) && v >= 0,
  streak: (v) => Number.isInteger(v) && v >= 0,
  reads: (v) => Number.isInteger(v) && v >= 0,
  workouts: (v) => Number.isInteger(v) && v >= 0,
  minutes: (v) => Number.isFinite(v) && v >= 0,
  sessions: (v) => Number.isInteger(v) && v >= 0,
  quizzes: (v) => Number.isInteger(v) && v >= 0,
  points: (v) => Number.isFinite(v) && v >= 0,
  lastActive: (v) => v === null || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)),
  notifyLast: (v) => v === null || typeof v === "string",
  name: (v) => typeof v === "string",
  avatar: (v) => typeof v === "string",
  uid: (v) => typeof v === "string",
  theme: (v) => v === "dark" || v === "light",
  accent: (v) => typeof v === "string",
  mood: (v) => typeof v === "string",
  apiBase: (v) => typeof v === "string",
  geminiKey: (v) => typeof v === "string",
  notify: (v) => typeof v === "boolean",
  onboarded: (v) => typeof v === "boolean",
  seeded: (v) => typeof v === "boolean",
  audioAuto: (v) => typeof v === "boolean",
  seedV: (v) => Number.isInteger(v),
  likes: isFlagMap, saves: isFlagMap, done: isFlagMap,
  storiesSeen: isFlagMap, mapsSeen: isFlagMap,
  quizBest: isNumberMap, readProgress: isNumberMap, affinity: isNumberMap,
  ownComments: (v) => isPlainObject(v) && Object.values(v).every((a) => Array.isArray(a) && a.every((s) => typeof s === "string")),
  aiCache: (v) => isPlainObject(v) && Object.values(v).every((s) => typeof s === "string"),
  interests: (v) => v === null || (Array.isArray(v) && v.every((s) => typeof s === "string")),
  history: (v) => Array.isArray(v) && v.every((h) => h && typeof h === "object" && typeof h.kind === "string"),
  collections: (v) => Array.isArray(v) && v.every((c) => c && typeof c === "object" && typeof c.id === "string" && typeof c.name === "string" && Array.isArray(c.items)),
  videos: (v) => Array.isArray(v) && v.every((x) => x && typeof x === "object" && typeof x.id === "string"),
  aiIdeas: (v) => Array.isArray(v) && v.every((x) => Array.isArray(x)),
};

function isPlainObject(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
function isFlagMap(v) { return isPlainObject(v) && Object.values(v).every((x) => typeof x === "boolean"); }
function isNumberMap(v) { return isPlainObject(v) && Object.values(v).every((x) => Number.isFinite(x)); }

/**
 * Validate a parsed backup object.
 * Returns { ok, value, accepted, rejected }. `value` contains only fields that
 * passed their guard, so a partly-corrupt backup restores what is salvageable
 * instead of poisoning state or throwing mid-render.
 */
export function validateBackup(obj) {
  if (!isPlainObject(obj)) return { ok: false, value: {}, accepted: [], rejected: [], error: "Not a backup file." };
  const value = {}, accepted = [], rejected = [];
  for (const [k, v] of Object.entries(obj)) {
    const guard = SCHEMA[k];
    if (!guard) { rejected.push(k); continue; }
    if (guard(v)) { value[k] = v; accepted.push(k); } else rejected.push(k);
  }
  if (!accepted.length) return { ok: false, value, accepted, rejected, error: "No readable progress in that file." };
  return { ok: true, value, accepted, rejected };
}

/** Parse + validate raw backup text in one step. */
export function parseBackup(text) {
  let obj;
  try { obj = JSON.parse(text); }
  catch { return { ok: false, value: {}, accepted: [], rejected: [], error: "That file isn't valid JSON." }; }
  return validateBackup(obj);
}
