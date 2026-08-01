# 🚀 Magic Coloring World — Complete Google Play Publishing Guide

This turns the web app into a published Android app on Google Play. Follow top to bottom.

---

## PHASE 1 — Deploy the web app to a public HTTPS domain
Google's TWA loads your live website, so it must be online first.

1. Push the project to GitHub.
2. Deploy on **Vercel** (recommended) — import the repo, add env var `DATABASE_URL`
   (use Vercel Postgres / Neon / Supabase), Deploy.
3. After deploy, run schema push once: `npx drizzle-kit push` (locally, pointing DATABASE_URL to prod).
4. You now have a domain, e.g. `https://magic-coloring.vercel.app`.
5. Confirm these all load:
   - `/`  (the app)
   - `/manifest.webmanifest`
   - `/privacy` and `/terms`
   - `/.well-known/assetlinks.json`
6. Replace every `REPLACE_WITH_YOUR_DEPLOYED_DOMAIN.com` in `twa-manifest.json`
   and every `REPLACE_WITH_YOUR_DOMAIN.com` in `store/STORE_LISTING.md`.

---

## PHASE 2 — Create the Google Play Developer account (one-time, ~$25)
1. Go to https://play.google.com/console → pay the $25 one-time fee.
2. Complete **identity & address verification** (Google now requires this — can take a few days).
3. For a personal account you may need 12 testers for 14 days before production; an
   **organization** account skips this. Plan accordingly.

---

## PHASE 3 — Build the Android app (TWA via Bubblewrap)
Requires Node 18+ and Java JDK 17.

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest="https://YOUR_DOMAIN/manifest.webmanifest"
# accept prompts; it reads package id com.magiccoloringworld.app
bubblewrap build
```

This produces:
- `app-release-signed.aab`  ← upload this to Play
- a signing key (`android.keystore`) — **BACK IT UP, never lose it**

Get your signing SHA-256 fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias android
```
Copy the SHA-256 into `public/.well-known/assetlinks.json`, redeploy the website,
then verify at:
`https://developers.google.com/digital-asset-links/tools/generator`

> Alternative (no build tools): use **PWABuilder.com** → enter your URL →
> "Package for Android" → download the signed `.aab` + `assetlinks.json`.

> Alternative (native shell / need plugins later): **Capacitor**
> `npm i @capacitor/core @capacitor/android && npx cap init && npx cap add android`.

---

## PHASE 4 — Play Console setup
Create app → then complete each section:

1. **App content**
   - Privacy policy URL → `https://YOUR_DOMAIN/privacy`
   - Ads → **No ads**
   - Content rating → answer per `store/CONTENT_RATING.md`
   - Target audience → Ages 5 & under + 6–8 → enrols in **Designed for Families**
   - Data safety → per `store/DATA_SAFETY.md`
   - Government apps / financial → No
2. **Main store listing** → paste `store/STORE_LISTING.md`
   - App icon 512×512 → `public/icon.png`
   - Feature graphic 1024×500 → `public/feature-graphic.png`
   - Screenshots (2–8) → capture from the live app (guide: `store/SCREENSHOTS.md`)
3. **Production release** → upload the `.aab` → add release notes → Review → Roll out.

---

## PHASE 5 — Pre-launch technical checklist
- [ ] Target API level meets current Google minimum (Bubblewrap handles this; keep the CLI updated).
- [ ] 64-bit — TWA/AAB is compliant by default.
- [ ] App loads offline (service worker installed — test airplane mode).
- [ ] Parental gate blocks all settings/links.
- [ ] No crashes on a low-end device / small screen.
- [ ] assetlinks.json verified (no browser URL bar shows inside the app = success).

See `store/TESTING_CHECKLIST.md` for full QA.
