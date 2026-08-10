# APEX — train your mind & body

A smart-reading, TikTok-style microlearning web app. Swipe bite-sized **ideas**,
take **quizzes**, explore **knowledge maps**, tap through **stories**, train with
**timers & breathing**, and follow **YouTube & Instagram workout videos** — all in a
single, self-contained, installable web app.

Everything runs client-side with **no backend and no build step**, so it deploys to
Cloudflare Pages (or any static host) as-is. Progress, saves, streaks and XP are
stored in the browser via `localStorage`.

## Features

- **Learn feed** — a full-screen, snap-scrolling feed of 100+ ideas, quotes, facts,
  money tips and micro-stories. Like, save, comment (procedurally generated threads),
  and share. Earns XP and builds a daily streak.
- **Stories** — Instagram/TikTok-style tap-through stories with timed progress bars,
  save & share, on the Home screen's story bar.
- **Quizzes** — six interactive quizzes with instant right/wrong feedback,
  explanations, an animated score ring, best-score tracking and XP.
- **Knowledge maps** — animated mind-maps (root → branches → key points) for habits,
  money, fitness, calm, learning and Stoicism.
- **Train** — no-equipment HIIT / core / strength / mobility workouts with a full
  interval timer (work/rest rings, audio cues), plus box-breathing and meditation
  sessions with a breathing orb.
- **Watch** — a workout-video feed seeded with curated YouTube & Instagram creators.
  YouTube clips **play inline**; Instagram/TikTok open on-platform. Paste any video
  link to add it to your feed.
- **You** — level/XP ring, streak, stats, 12 achievements, a saved "stash", and a
  generated app icon you can download.
- **Ambient music** — a generative, royalty-free score engine (calm / focus / epic).
- **PWA** — installable to the home screen and works offline via a service worker.

## Deploy to Cloudflare Pages

This is a static site — no framework, no build.

1. Push this repo to GitHub (already done on the `main` branch).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**,
   and pick this repository.
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Deploy. Cloudflare serves `index.html` directly; `_redirects` provides the
   single-page fallback, and `manifest.webmanifest` + `sw.js` make it installable.

To preview locally, serve the folder with any static server, e.g.:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed URL. (Service worker and the root-absolute asset paths require
`http://` — opening `index.html` via `file://` won't load them.)

## Customize

- **Ideas / articles / stories / quizzes / maps:** edit the `FEED`, `ARTICLES`,
  `STORIES`, `QUIZZES` and `MAPS` arrays near the top of the `<script>` in `index.html`.
- **Workout videos:** edit `SEED_VIDEOS` — paste any YouTube, Instagram, TikTok, Vimeo
  or direct `.mp4` link; the app auto-detects the platform.
- **Icon / theme:** `icon.svg`, `favicon.svg`, and the `--gold` / color tokens at the
  top of the stylesheet.

All content lives in the single `index.html`; the other files are the icons, manifest,
service worker and SPA redirect.
