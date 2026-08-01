# 🎨 Magic Coloring World

A premium, kid-safe **coloring, drawing, learning and arcade playground** for children 3–8, built as a
fullstack web game with **Next.js (App Router) + PostgreSQL (Drizzle ORM)**. Runs at 60 fps on desktop
and mobile, works with touch, mouse and keyboard.

> All artwork, sound and characters are **original**: the coloring pages are generated from a
> parametric vector-art engine written for this project, and every sound is synthesised at runtime
> with the Web Audio API. No copyrighted assets are used — Google Play Families / COPPA friendly.

---

## ✨ Feature Tour

| Area | What you get |
| --- | --- |
| **Coloring** | 110 original vector pages in 10 books (Animals 20, Farm 10, Dinosaurs 10, Cars 10, Princesses 10, Space 10, Sea 10, Birds 10, Flowers 10, Food 10). Tap-to-fill regions, magic auto-colour, completion celebration. |
| **Tools** | Bucket fill, brush, crayon, marker, pencil, watercolor, airbrush, glitter, rainbow, neon, magic, pattern, texture, stickers, eraser + unlimited undo/redo, zoom, pinch-zoom, pan, rotate canvas, size & opacity sliders. |
| **Draw modes** | Blank canvas, grid mode, mirror (symmetry) drawing, free drawing, trace mode. |
| **Trace** | Uppercase & lowercase letters, numbers, shapes, animals and simple words with dashed handwriting guides. |
| **Dot-to-Dot** | 100 procedurally varied puzzles across 3 difficulty tiers with animated completion + voice praise. |
| **Balloon Pop** | Arcade mini-game: 4 educational modes (colors / letters / numbers / animals), combo multiplier, 3 lives, difficulty ramp, particles, screen shake, pause, instant restart and a **server-backed high-score table**. |
| **Learn & Say** | 10 topics (animals, colors, shapes, alphabet, numbers, vehicles, fruits, vegetables, jobs, weather) with image, name, speech pronunciation and bounce animation. |
| **Stickers** | 500+ decorations in 13 packs (stars, animals, flowers, space, princess, dinos, cars, food, emoji, letters, numbers, party, frames). |
| **Colors** | 64 classic + pastel + neon + metallic + glitter + rainbow + gradient paints. |
| **Rewards** | Daily treasure chest with 7-day calendar, stars, coins, completion tracking, best scores. |
| **Gallery** | Auto-thumbnail save to PostgreSQL, re-download, delete, 1600×1600 PNG high-resolution export. |
| **Parent Area** | Math parental gate → sound/music/voice, left-handed mode, large UI, colour-blind palette, 9 languages, profile, purchases/ads placeholders, backup, reset, privacy policy & terms, contact, rate. |

### Juice & feel
Full-screen particle engine (confetti, bursts, rings, floating score text), screen shake, squash & stretch
balloons, spring-y button presses, synthesised pops/chimes/applause, and a soft non-repeating pentatonic
music generator.

### Controls
* **Touch** – tap to fill/pop, drag to paint, pinch to zoom.
* **Mouse** – identical, plus hover states.
* **Keyboard** – `F` fill · `B` brush · `E` eraser · `Z`/`Y` undo/redo · `+`/`-` zoom · `R` rotate · `Esc` back.
  Balloon Pop: arrows move the reticle, `Space`/`Enter` pops, typing a letter/number pops that balloon,
  `P` pauses, `Space` restarts instantly.

---

## 🏗 Architecture

```
src/
  app/
    layout.tsx           app shell + global FX layer
    page.tsx             hub / router (start, categories, pages, trace picker)
    api/health           liveness probe
    api/pages            catalogue read + idempotent seed (scales to 5,000+ rows)
    api/artworks         gallery CRUD
    api/scores           high-score table
  components/
    Studio.tsx           coloring & drawing studio (tools, palette, stickers, export)
    BalloonPop.tsx       canvas arcade game (60 fps loop, pooling-friendly)
    DotsGame.tsx         connect-the-dots (100 generated puzzles)
    Extras.tsx           learn mode, gallery, parent area, daily reward, trace sets
    FxLayer.tsx          particle + screen-shake singleton (`fx.burst/confetti/shake`)
  lib/
    art/shapes.ts        declarative shape primitives (JSON-serialisable)
    art/builders.ts      parametric illustrators: critter, dino, car, princess, space, sea, bird, flower, food
    art/catalog.ts       data-driven page catalogue
    palette.ts           colour systems + sticker packs
    audio.ts             Web Audio SFX/music + speech synthesis
    progress.ts          obfuscated local save (stars, coins, unlocks, settings)
  db/
    schema.ts            coloring_pages, artworks, high_scores, progress
```

**Scaling to 5,000+ pages needs no code change**: a page is a row in `coloring_pages` whose `data`
column holds `{ emoji, viewBox, shapes[] }`. Insert rows (from the generator, an art pipeline, or a CMS)
and they appear in the app automatically, filtered by `category` and ordered by `order_index`.

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env         # DATABASE_URL=postgresql://...
npx drizzle-kit push         # create tables
npm run dev                  # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

The catalogue seeds itself on the first `GET /api/pages` call (idempotent, `onConflictDoNothing`).

---

## ✅ Testing checklist

- [ ] Start screen → Play unlocks audio, music fades in, daily chest appears once per day.
- [ ] Every category loads and every thumbnail renders with visible outlines.
- [ ] Bucket fill, all 13 brushes, eraser, undo/redo (50+ steps), zoom, rotate, mirror, grid.
- [ ] Completing a page triggers confetti, praise voice and star/coin award.
- [ ] Save adds a thumbnail to the gallery; export downloads a 1600×1600 PNG.
- [ ] Balloon Pop: pointer, arrow+space and keyboard letter input all pop; wrong pop costs a life;
      pause/resume; game over saves and lists high scores; `Space` restarts instantly.
- [ ] Dot-to-dot: wrong dot shakes, correct sequence completes and fills the shape.
- [ ] Learn mode speaks every card; parent gate rejects wrong answers.
- [ ] 60 fps on a mid-range phone; no layout shift in landscape or portrait.

## 📦 Publishing checklist (store wrapper)

- [ ] Original assets only — verified (all art generated in `src/lib/art`).
- [ ] Privacy Policy + Terms links published (templates in Parent Area).
- [ ] Families policy: parental gate on every external link/purchase, no personalised ads.
- [ ] Icon (`public/icon.png`, 512×512), feature graphic 1024×500, 4+ screenshots per form factor.
- [ ] Data-safety form: nickname + artwork stored, no ad IDs, no location.
- [ ] Tested on 5"–12" screens, low-end device profile, offline first-run.
