# 🤝 HANDOVER — Magic Coloring World (read this first!)

> IMPORTANT: If you are a new assistant session, READ THIS WHOLE FILE before doing anything.
> ALSO READ `QA_RITUAL.md` — a mandatory 5-question self-review that prevents the recurring
> bugs the owner kept catching (covers: multi-device, monetization holes, UI blocking, persistence).
> The user speaks **Egyptian Arabic** — reply in Arabic.
> The user is a **beginner** with dev tools — give **ONE step at a time**, wait for "تم" before the next step.
> Do NOT create extra zip files mid-work; produce ONE final zip only when everything is done.
> Always give your opinion + plan BEFORE implementing big new ideas (user explicitly asked for this).

---

## 🎯 What this project is
A commercial-grade kids (3–8) coloring/learning web game, freemium, 100% original assets
(vector art generated in code, Web Audio SFX, speech synthesis). Target: Google Play (4.8★+ goal).

## 🔗 Live infrastructure
- **Live site (Vercel):** https://develop-magic-coloring-world.vercel.app
- **GitHub repo (private):** `mrsalehhassan2008-sys/develop-magic-coloring-world`
- **DB:** Neon Postgres (free tier). Env var on Vercel: `DATABASE_URL` (already set).
- **Sandbox preview** changes only reach the live site when the USER uploads a new zip to the
  repo folder → commits → pushes via GitHub Desktop (Vercel auto-deploys on push).

## 🔄 Deployment workflow (how updates ship)
1. In sandbox: edit code → `npx tsc --noEmit` → `npm run build` → zip:
   `zip -r public/magic-coloring-FINAL<N>.zip . -x "./node_modules/*" -x "./.next/*" -x "./.git/*" -x "./.env" -x "./.env.*" -x "./public/magic-coloring-FINAL<N>.zip"`
   → `build_and_start` → give user the `.../magic-coloring-FINAL<N>.zip` link.
2. User: extract zip → in repo folder DELETE old `src` (and `public`, `package.json`,
   `package-lock.json` if deps changed) → paste new ones → GitHub Desktop: Summary → Commit → Push origin.
3. If DB schema changed: give user SQL to paste in Neon → SQL Editor → Run.
4. After deploy, user must test in a **fresh Incognito** window (old tabs hold stale chunks → 404 freeze).

⚠️ KNOWN TRAP: the repo once contained leftover files from an older different build
(`src/components/AvatarSelector.tsx` importing non-existent `AvatarType`) which broke Vercel's
type-check. If a Vercel build fails with a file we don't have in sandbox → it's a leftover; user must fully replace `src`.

## 🗄️ Database (Neon) — all tables exist & were wiped clean
Tables: `coloring_pages` (auto-seeded on first /api/pages call: 122 pages incl. 12 big scenes;
freemium flags: first 3 per category free, scenes first 2 free), `rooms` (co-op), `high_scores`,
`artworks`, `progress` (has extra `data jsonb` column for cloud save).
Schema source: `src/db/schema.ts`. Apply changes with `npx drizzle-kit push` locally.

## 👨‍👩‍ Family data (user's real kids)
- Kids profiles: **Dana** (code `Q7ZSDG`), **Iten** (`NJJ9DT`), **Nouran** (`6HS9QD`), plus default `Artist` (`KGE2DP`).
- **Family unlock secret code:** `MCW-FAMILY-2026` (in `src/lib/premium.ts` → `FAMILY_UNLOCK_CODE`).
  Entered in Parent Area → grants premium per profile. Parent can also toggle 👑 per kid in
  Parent Area → "Kids & cloud codes" card.
- Cloud save: each profile has a 6-char `syncCode`; auto-POSTs to `/api/progress` (debounced 2s);
  restore via "Who is playing?" → 📥 Restore.

## 🧭 Code map (key files)
- `src/app/page.tsx` — **marketing landing page** (hero, real screenshots carousel via PagePreview, features, categories, parents section, FAQ, SEO/JSON-LD). CTA → /play.
- `src/app/play/page.tsx` — **the game** hub/router: all views, HUD, ProfilePicker wiring, modals (gift/trophy/chest/sleep).
  Every screen uses `key={activeId}` to remount on kid switch (freeze fix).
- `src/app/about|contact|faq/page.tsx` — SEO/marketing pages.
- `src/components/Studio.tsx` — coloring studio: tools, palettes, color-by-numbers, progress bar,
  sample popup (👀), co-op rooms (🤝, polling /api/rooms every 1.5s), hint hand, compare before/after.
- `src/components/Buddy.tsx` — floating draggable companion (pos saved in profile.buddyPos), talks by name.
- `src/components/AvatarDesigner.tsx` — custom buddy (animals via critter() OR human kids via kidShapes()).
- `src/components/Extras.tsx` — ProfilePicker, ParentArea (math gate; kids & codes card w/ copy/premium toggle/reset/delete; family code input), Store, Achievements, Gallery (+ 📖 PDF via jspdf), DailyReward, LearnMode, TraceSets.
- `src/components/ShadowGame.tsx` — 4 progressive levels (look-alike groups + tilted shadows at L4).
- `src/components/BalloonPop.tsx`, `DotsGame.tsx` — arcade games with high scores.
- `src/lib/art/*` — vector art engine (builders.ts critter/dino/car/princess/space/sea/bird/flower/food;
  scenes.ts big scenes; kid.ts human avatars; catalog.ts builds the 122-page catalog + freemium flags).
- `src/lib/progress.ts` — multi-profile local store (base64 obfuscated) + cloud auto-save + syncCode.
- `src/lib/premium.ts` — premium brushes/packs sets, FAMILY_UNLOCK_CODE, store items.
- `src/lib/audio.ts` — Web Audio SFX/music (3 tracks), 4 voice characters, localized praise (9 langs).
- `src/lib/buddy.ts` — localized buddy phrases with {name}.
- `src/lib/achievements.ts` — 16 trophies.
- `src/app/api/` — pages (seed+read), rooms (co-op), progress (cloud save/restore), artworks, scores, health.
- `store/` — Google Play publishing docs (PUBLISHING_GUIDE, DATA_SAFETY, CONTENT_RATING, STORE_LISTING, SCREENSHOTS, TESTING_CHECKLIST).
- `public/` — icon.png, feature-graphic.png, manifest.webmanifest, sw.js (offline), .well-known/assetlinks.json (placeholder fingerprint).

## ✅ Everything shipped & working on live (as of FINAL5)
Coloring + color-by-numbers + sample ref + progress bar w/ stars + 15 brushes (freemium locks) +
stickers (freemium packs) + undo/redo/zoom/rotate/mirror/grid + stickers; Free Draw; Trace;
Balloon Pop (4 modes, DB high scores); Dot-to-Dot (100); Shadow Match (progressive); Learn & Say;
Gallery + PDF book; Trophies; Store (free-until-Billing-wired, behind parent gate); My Buddy designer
(animal + boy/girl, accessory, draggable floating buddy); co-op rooms; cloud save/restore per kid;
parent dashboard (codes+copy, premium toggle, reset, delete); family secret code; daily chest;
treasure chest every 5 pictures; sleep timer; left-handed/big-UI/colorblind; 9 languages; 4 voices;
offline SW; privacy/terms/about/contact/faq pages; achievements.
- **Marketing landing** at `/` (game moved to `/play`): hero + CTAs + real page screenshots + features +
  categories w/ counts + parents safety section + FAQ; full SEO (OG/Twitter/JSON-LD MobileApplication);
  numbers truthful (122+). Last shipped zip: FINAL6.

## 🐛 Recently fixed (don't regress)
- Stuck dim overlay: ProfilePicker card not centering → rebuilt modal (overflow-auto + inner grid +
  backdrop click + Escape + auto-close on view change).
- Switch-kid freeze → `key={activeId}` remount on all screens.
- Vercel 404 freeze after deploy = stale tab; always test fresh Incognito.
- Leftover `AvatarSelector.tsx` broke a build → always fully replace `src` on upload.

## 📌 NEXT STEPS (pending, in priority order)
1. User tests the 3 kids on their own devices via restore codes + family code.
2. Google Play publishing (follow `store/PUBLISHING_GUIDE.md`): account $25, build AAB via Bubblewrap/PWABuilder,
   put real SHA-256 in `public/.well-known/assetlinks.json`, fill Data Safety/Content Rating from `store/`.
3. Connect real Google Play Billing (product ids in `src/lib/premium.ts`; Store.buy() is currently a free simulation).
4. Optional enhancements user liked: recorded voice clips instead of TTS; seasonal content;
   rewarded ads (Families-safe); ASO; "weekly family book" email; pass-and-play party mode on one device.

## 💡 Pricing decision (researched)
One-time unlock $2.99 (market sweet spot $1.99–$4.99); $1.99 pages-only pack. Do NOT price $9.99+
(Colorfy's $19.99/mo tanked its rating to 3.7).
