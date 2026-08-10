/**
 * APEX backend — a single Cloudflare Worker that gives the app three optional
 * superpowers without exposing any secret in the browser:
 *
 *   POST /ai                     → proxies to Gemini using a SECRET key (Worker env)
 *   GET  /comments/:id           → shared comments for an item
 *   POST /comments/:id           → add a comment  { name, txt, id? }
 *   GET  /leaderboard            → top scores
 *   POST /leaderboard            → upsert your score { id, name, xp, streak }
 *
 * Storage: a single KV namespace bound as `APEX_KV`.
 * Secret:  `GEMINI_KEY` (set with `wrangler secret put GEMINI_KEY`).
 *
 * Deploy: see worker/README.md. Then paste the Worker URL into the app under
 * Settings → "Connect your server".
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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "");

    try {
      // ---- AI proxy ------------------------------------------------------
      if (path === "/ai" && request.method === "POST") {
        if (!env.GEMINI_KEY) return json({ error: "no key configured" }, 500);
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
        const text = (((j.candidates || [])[0] || {}).content || {}).parts?.map((p) => p.text || "").join("").trim() || "";
        return json({ text });
      }

      // ---- Comments ------------------------------------------------------
      if (path.startsWith("/comments/")) {
        const id = decodeURIComponent(path.slice("/comments/".length)).slice(0, 120);
        const key = "c:" + id;
        if (request.method === "GET") {
          const items = (await env.APEX_KV.get(key, "json")) || [];
          return json({ items });
        }
        if (request.method === "POST") {
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

      // ---- Leaderboard ---------------------------------------------------
      if (path === "/leaderboard") {
        const key = "leaderboard";
        if (request.method === "GET") {
          const top = (await env.APEX_KV.get(key, "json")) || [];
          return json({ top });
        }
        if (request.method === "POST") {
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

      return json({ error: "not found" }, 404);
    } catch (e) {
      return json({ error: "server error" }, 500);
    }
  },
};
