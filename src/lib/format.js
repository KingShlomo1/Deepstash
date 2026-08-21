/* Pure formatting + escaping helpers. No DOM, no state. */

/**
 * Escape text for interpolation into HTML.
 * Escapes the single quote too, so the result is safe in single-quoted
 * attributes as well as double-quoted ones and text nodes.
 */
export function esc(s) {
  return ("" + s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

/** Compact counts: 1200 -> "1.2k", 24000 -> "24k". */
export function fmt(n) {
  if (!Number.isFinite(n)) return "0";
  if (n < 1000) return "" + Math.round(n);
  return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k";
}

/** Seconds -> "m:ss". Clamps negatives to 0. */
export function mmss(s) {
  s = Number.isFinite(s) ? Math.max(0, Math.ceil(s)) : 0;
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

/** Relative time from an epoch-ms timestamp. */
export function timeAgo(t, now = Date.now()) {
  if (!t || !Number.isFinite(t)) return "now";
  const s = (now - t) / 1000;
  if (s < 60) return "now";
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  return Math.floor(s / 86400) + "d";
}

/** First letter of a display name, uppercased. */
export function ini(n) {
  const c = ("" + (n ?? "")).replace(/[^a-z]/gi, "");
  return (c[0] || "?").toUpperCase();
}

/** Greedy line wrapper for canvas text. `measure` returns a width for a string. */
export function wrapLines(measure, text, maxW) {
  const words = ("" + text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (measure(test) > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
