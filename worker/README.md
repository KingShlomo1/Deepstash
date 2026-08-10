# APEX backend Worker (optional)

A tiny Cloudflare Worker that unlocks three optional features **without putting any
secret in the browser**:

- **Keyless AI** — the app's ✨ AI Overview, "Quiz me", and AI-infinite feed work for
  *all* your users, using one Gemini key that stays secret on the server.
- **Shared comments** — real comments people leave, stored per item.
- **Leaderboard** — global XP ranking.

Everything in the app already works **without** this Worker (AI just asks each user for
their own key, comments are simulated, and there's no leaderboard). The Worker only
adds the shared/secret pieces.

## Deploy (5 minutes)

You need a free Cloudflare account and Node installed.

```bash
cd worker

# 1) Log in
npx wrangler login

# 2) Create a KV namespace and copy the printed id into wrangler.toml (id = "...")
npx wrangler kv namespace create APEX_KV

# 3) Store your Gemini key as a secret (get one free at aistudio.google.com/apikey)
npx wrangler secret put GEMINI_KEY

# 4) Ship it
npx wrangler deploy
```

Wrangler prints a URL like `https://apex-api.<your-subdomain>.workers.dev`.

## Connect the app

In APEX: **You → Settings → Connect your server**, and paste that Worker URL.
That's it — AI now works for everyone with no per-user key, comments become shared,
and the leaderboard lights up.

## Endpoints

| Method | Path              | Purpose                                   |
|--------|-------------------|-------------------------------------------|
| POST   | `/ai`             | `{prompt}` → `{text}` (Gemini, key hidden) |
| GET    | `/comments/:id`   | `{items:[{name,txt,likes,t}]}`            |
| POST   | `/comments/:id`   | add `{name,txt}`                          |
| GET    | `/leaderboard`    | `{top:[{id,name,xp,streak}]}`             |
| POST   | `/leaderboard`    | upsert `{id,name,xp,streak}`              |

## Notes

- CORS is open (`*`) so the static site can call it. Lock it to your domain in
  `worker.js` (`Access-Control-Allow-Origin`) once you have a custom domain.
- KV is eventually consistent and there's no auth/rate-limiting here — fine for a
  launch/demo. Add a simple token or Turnstile check before serious public traffic.
