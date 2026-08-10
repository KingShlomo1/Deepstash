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
- **You** — level/XP ring, streak, stats, 12 achievements, a saved "stash",
  **settings** (daily-reminder toggle, edit interests, backup & restore), and an
  install button.
- **Personalized onboarding** — a first-run interest picker that tunes the feed order.
- **Share as image** — tap share on any idea or story to generate a branded,
  Instagram-Story-ready image (rendered on a canvas) to download or share.
- **Feed filter & search** — filter the Learn feed by topic or search the text.
- **Backup & restore** — export/import your progress as a JSON file (data is
  device-local by default).
- **Daily reminder** — opt-in notification with a fresh idea to keep your streak.
- **Ambient music** — a generative, royalty-free score engine (calm / focus / epic).
- **PWA** — installable to the home screen (real PNG + maskable icons) and works
  offline via a service worker.

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

### Optional: enable analytics & link previews

- **Cloudflare Web Analytics** (free, cookieless): in the Cloudflare dashboard go to
  **Analytics & Logs → Web Analytics**, add your site, copy the token, then uncomment
  the beacon `<script>` near the top of `index.html` and paste your token in.
- **Link preview image**: `og-image.png` (1200×630) is already referenced via
  Open Graph / Twitter meta. Once you have your custom domain, you can change the
  `og:image` / `twitter:image` paths to the absolute `https://yourdomain/og-image.png`
  for maximum compatibility with scrapers.

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
