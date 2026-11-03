# SuggestScout – Google Autocomplete Keyword Extractor

A production-ready Node.js/Express + Tailwind web app that extracts Google Autocomplete keywords in real time
(A–Z, prefix, questions, prepositions, numbers, or everything), with language/country selection, live progress,
Stop button, filtering, copy and CSV export. Built to be published and monetised with Google AdSense.

## Quick start

```bash
npm install
npm run build        # compiles Tailwind -> public/styles.css (already included in this zip)
npm start            # http://localhost:3000
npm test             # 30 automated tests (mock Google, no internet needed)
```

Needs Node 20 or newer.

## Configuration (environment variables)

Copy `.env.example` and set these on your host. Everything is optional except `SITE_URL` in production.

| Variable | Purpose |
|---|---|
| `SITE_URL` | Your public URL, e.g. `https://yourdomain.com` (used for canonical links, sitemap, robots.txt) |
| `SITE_NAME` | Brand name shown in the header, titles and policies (default `SuggestScout`) |
| `CONTACT_EMAIL` | Shown on the Contact/Privacy/Terms pages. **Use a real address.** |
| `TRUST_PROXY` | Set to `1` when behind a host/proxy (Render, Railway, Fly, Nginx, Cloudflare). Required for correct per-visitor rate limiting. |
| `FORCE_HTTPS` | `1` to redirect http → https (needs `TRUST_PROXY=1`) |
| `ADSENSE_CLIENT` | e.g. `ca-pub-1234567890123456` – turns ads on, serves `/ads.txt`, widens the CSP for Google ads |
| `AD_SLOT_TOP`, `AD_SLOT_MID` | Ad unit IDs (digits) for the two placements |
| `GA_MEASUREMENT_ID` | Optional Google Analytics 4 ID, e.g. `G-XXXXXXXXXX` |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Extractions per visitor per window (default 20 per 10 min) |
| `MAX_PER_IP` / `MAX_GLOBAL` | Simultaneous extractions per visitor / in total (default 2 / 25) |
| `UPSTREAM_DELAY_MS` | Pause between Google requests (default 150) |

## What protects the site

- Strict Content-Security-Policy, HSTS, nosniff, referrer and permissions policies (via Helmet).
- Input validation on every parameter; no user text is ever rendered unescaped.
- Per-visitor rate limit + concurrent-extraction caps + global cap + 90 s run limit.
- Same-origin API only; request cancelled server-side the moment the visitor stops or leaves.
- Upstream protection: 150 ms pacing, 15-minute cache (repeat searches cost Google nothing), retry/backoff,
  gives up early (with partial results) if Google starts blocking.
- Keywords and IPs are never logged or stored.
- Graceful shutdown, health check at `/healthz`.

## Getting approved by AdSense and earning

1. **Deploy** on your own domain over HTTPS (see below). AdSense does not approve free sub-domains reliably; buy a domain.
2. Set `SITE_URL`, `SITE_NAME` and a real `CONTACT_EMAIL`. Read and adjust `views/privacy.html`, `views/terms.html`,
   `views/about.html` for your situation (they are solid templates, not legal advice).
3. Apply at <https://adsense.google.com>. Add your site and verify it. Google will show the code snippet; you only
   need the publisher ID (`ca-pub-…`). Wait for approval (days to weeks). Sites with real content and policy pages
   (this one has them) are approved far more often than bare tools.
4. After approval: create two **display ad units** (responsive), copy their numeric slot IDs, and set
   `ADSENSE_CLIENT`, `AD_SLOT_TOP`, `AD_SLOT_MID`. Redeploy. `/ads.txt` is generated automatically.
5. **Consent (important for EU/UK/Switzerland traffic):** in AdSense go to *Privacy & messaging* and enable
   Google's free certified consent message (Funding Choices). The CSP already allows it.
6. Open the site with your browser console open and confirm no CSP errors and that ads load (new ad units can take
   up to a few hours to start filling).

Policy reminders: never click your own ads, never ask others to click, keep ads away from the action buttons
(the layout already does), and keep original content on the page.

## Growing traffic

The home page already contains explanatory content, an FAQ with structured data, a sitemap and robots.txt.
Submit `https://yourdomain.com/sitemap.xml` in Google Search Console. More pages (for example "People also ask
extractor", niche guides, a blog about keyword research) bring more search traffic and more ad revenue.

## Deploying

**Docker (any host):** `docker build -t suggestscout . && docker run -p 3000:3000 --env-file .env suggestscout`

**Render / Railway / Fly.io:** create a Node web service from this folder.
Build command `npm install && npm run build`, start command `npm start`, set the environment variables above
(`TRUST_PROXY=1`, `FORCE_HTTPS=1`). Put it behind Cloudflare if you want extra DDoS protection.

## Important operational notes

- **Google may block cloud/datacenter IPs** from the autocomplete endpoint (HTTP 429 or captcha pages). The app
  handles this gracefully, but if it happens often on your host, try another hosting region or a host with
  cleaner IPs. Routing requests through a proxy service is possible but is not built in (it needs a small change
  in `fetchTerm` in `src/engine.js`).
- The autocomplete endpoint is unofficial and may change. The tests mock Google, so a quick manual search after
  each deploy is a good smoke test.
- If you enable AdSense, the CSP allows `'unsafe-inline'`/`'unsafe-eval'` for scripts, as Google's ad code requires.
  With ads off, the CSP has no unsafe directives.

## Project layout

```
server.js            entry point
src/app.js           Express app, security, API routes
src/engine.js        extraction engine (cache, pacing, retries, cancellation)
src/terms.js         extraction methods + input validation
src/limits.js        concurrency limiter
src/pages.js         page rendering, sitemap, robots, ads.txt
views/               HTML templates (home, about, privacy, terms, contact, 404)
public/              main.js (UI), theme.js, ads.js, styles.css (compiled)
src/input.css        Tailwind source  ->  npm run build
test/                automated tests
```
