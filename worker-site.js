/**
 * APEX unified Worker — serves the static app AND the tiny API on the SAME origin
 * (https://deepstash.levtech.workers.dev), so the app's AI "just works" with no
 * server URL to paste and no key stored on your phone.
 *
 *   POST /ai            → proxies to Google Gemini using a SECRET key (Worker env)
 *   GET  /comments/:id  → shared comments for an item        (needs KV, optional)
 *   POST /comments/:id  → add a comment                      (needs KV, optional)
 *   GET  /leaderboard   → top scores                         (needs KV, optional)
 *   POST /leaderboard   → upsert your score                  (needs KV, optional)
 *   everything else     → the static site (index.html, icons, sw.js, …)
 *
 * To switch the AI on (one-time):
 *   1) npx wrangler secret put GEMINI_KEY      (paste a free key from aistudio.google.com/apikey)
 *   2) npx wrangler deploy
 * Comments + leaderboard are optional; they light up only if you bind a KV namespace
 * named APEX_KV in wrangler.jsonc. Without it, the app still works — those calls just no-op.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

const API_PATHS = ["/ai", "/comments", "/leaderboard"];
const isApi = (p) => p === "/ai" || p === "/leaderboard" || p.startsWith("/comments/");

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    // CORS preflight for the API routes only.
    if (request.method === "OPTIONS" && (isApi(path) || API_PATHS.includes(path))) {
      return new Response(null, { headers: CORS });
    }

    try {
      // ---- AI proxy (Gemini) --------------------------------------------
      if (path === "/ai" && request.method === "POST") {
        if (!env.GEMINI_KEY) return json({ error: "no key configured" }, 200);
        const { prompt } = await request.json();
        if (!prompt || typeof prompt !== "string") return json({ error: "bad prompt" }, 400);
        const r = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
            encodeURIComponent(env.GEMINI_KEY),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt.slice(0, 4000) }] }] }),
          }
        );
        if (!r.ok) return json({ error: "upstream " + r.status }, 502);
        const j = await r.json();
        const text =
          (((j.candidates || [])[0] || {}).content || {}).parts?.map((p) => p.text || "").join("").trim() || "";
        return json({ text });
      }

      // ---- Comments (optional: needs APEX_KV) ---------------------------
      if (path.startsWith("/comments/")) {
        const id = decodeURIComponent(path.slice("/comments/".length)).slice(0, 120);
        const key = "c:" + id;
        if (request.method === "GET") {
          if (!env.APEX_KV) return json({ items: [] });
          const items = (await env.APEX_KV.get(key, "json")) || [];
          return json({ items });
        }
        if (request.method === "POST") {
          if (!env.APEX_KV) return json({ ok: false });
          const body = await request.json();
          const txt = ("" + (body.txt || "")).slice(0, 280).trim();
          if (!txt) return json({ error: "empty" }, 400);
          const items = (await env.APEX_KV.get(key, "json")) || [];
          items.unshift({
            name: ("" + (body.name || "guest")).slice(0, 24),
            txt,
            likes: 0,
            t: Date.now(),
          });
          await env.APEX_KV.put(key, JSON.stringify(items.slice(0, 200)));
          return json({ ok: true });
        }
      }

      // ---- Leaderboard (optional: needs APEX_KV) ------------------------
      if (path === "/leaderboard") {
        const key = "leaderboard";
        if (request.method === "GET") {
          if (!env.APEX_KV) return json({ top: [] });
          const top = (await env.APEX_KV.get(key, "json")) || [];
          return json({ top });
        }
        if (request.method === "POST") {
          if (!env.APEX_KV) return json({ ok: false });
          const body = await request.json();
          const id = ("" + (body.id || "")).slice(0, 40) || "anon-" + Math.random().toString(36).slice(2, 8);
          let top = (await env.APEX_KV.get(key, "json")) || [];
          top = top.filter((u) => u.id !== id);
          top.push({
            id,
            name: ("" + (body.name || "You")).slice(0, 24),
            xp: Math.max(0, Math.min(10_000_000, body.xp | 0)),
            streak: Math.max(0, Math.min(100000, body.streak | 0)),
          });
          top.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          await env.APEX_KV.put(key, JSON.stringify(top.slice(0, 200)));
          return json({ ok: true });
        }
      }
    } catch (e) {
      return json({ error: "server error" }, 500);
    }

    // ---- Everything else → the static site ------------------------------
    return env.ASSETS.fetch(request);
  },
};
