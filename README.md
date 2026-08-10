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

### v2 — the "scroll to get smarter" social app

- **11 subjects, 200+ ideas** — Geography, Physics, Math, History, Biology,
  Economy, Astronomy, Animals, Philosophy, Psychology, Science and more, plus the
  original mind/body/money tracks.
- **Real photos** — every card and hero pulls a real photo (deterministic per item,
  free-license via Lorem Picsum) with a **graceful gradient fallback** if a photo
  can't load, and the **service worker caches photos** so they work offline after
  first view. Swap `imgURL()` for your own curated Unsplash/Wikimedia set anytime.
- **Explore by subject** — an image tile grid on Home that filters the infinite feed
  to any subject.
- **Global search** — one search across ideas, deep reads, quizzes, maps, stories
  and videos.
- **AI Overview (bring-your-own Gemini key)** — tap ✨ on any idea/article to get an
  "Explain simply / Go deeper / Why it matters / Give an example" AI take. Add a free
  key from aistudio.google.com/apikey in Settings; it's stored only on the device.
  (For a public launch, move the key behind a Cloudflare Worker so it stays secret.)
- **Profile, history & collections** — editable name + avatar, an auto **history** of
  what you read/watched, and custom **collections** to organize saved items.
- **Claude-style polish** — gradient-mesh backdrops, spring taps, photo fade-ins.

### v3 — endless, smart & social

- **AI-infinite feed** — with AI connected, the feed quietly generates fresh on-topic
  ideas as you scroll, so it never runs out.
- **Quiz me** — turn any idea into an instant AI-generated quiz.
- **Smart ranking** — the feed learns from what you like, save and skip.
- **Swipe gestures** — swipe a card right to save, left to skip (TikTok-style).
- **Listen / read-aloud** — text-to-speech on any idea or article, plus an
  auto-read-aloud mode for hands-free scrolling.
- **Difficulty filter** — filter the feed by Quick / Core / Deep.
- **Themes** — light & dark, plus five accent colors.
- **Daily brief** — idea of the day, word of the day, a daily challenge, and
  "on this day in history" on the Home screen.
- **Bigger feed** — 250+ curated ideas across 20 subjects.
- **Optional backend (`/worker`)** — a one-file Cloudflare Worker that adds keyless AI
  (secret Gemini key), **shared comments**, and a **global leaderboard**. Deploy it in
  ~5 min (see `worker/README.md`) and paste the URL into Settings → "Connect your
  server". Everything works without it too; the Worker just adds the shared pieces.

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
