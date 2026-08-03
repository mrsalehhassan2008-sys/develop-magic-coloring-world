# 🛡️ QA Ritual — MUST run before saying "done" on ANY feature

> Read this before implementing, and again before declaring any feature finished.
> The project owner (a parent, beginner in dev) repeatedly caught bugs that this
> ritual would have prevented. Future assistants: this is a hard requirement, not a suggestion.

## Why this exists
Past misses this ritual prevents:
- Reference thumbnail covering the drawing (blocked kids from coloring).
- "Family unlock" button free for everyone (monetization hole).
- Child sync codes too small to read / not in parent area.
- Progress wiped when changing device (no cloud save).
- Frozen screen after switching kid (stuck modal / stale state).
- Missing PDF book that was promised.
- 404 pages and inconsistent numbers on the marketing site.

## The 5 questions — answer ALL before "done"
1. **كل الأجهزة والملفات؟** Does it work for 3 kids on 3 separate devices + parent dashboard?
   Does state persist across refresh, browser change and device change (cloud)?
2. **ينفع يتلطش أو يبوظ؟** Can a kid bypass it? Can a stranger get premium free? Can it cover,
   block or hide the drawing/tools? Does it break when the user switches profile mid-game?
3. **الطفل الصغير؟** Big enough targets? No reading required? Voice feedback? No dead-ends,
   no scary errors, gentle wrong-answer feedback?
4. **الأهل؟** Is anything money/safety-related behind the parental gate? Is there a parent
   override (codes, toggles, reset, delete)?
5. **التوثيق والرجوع؟** Did I update HANDOVER.md? Did I keep numbers truthful everywhere
   (home, landing, store listing)? Any new SQL schema → documented for Neon? Any new file
   the user must upload (src/public/package.json) → told clearly?

## Self-review loop (do it yourself, don't wait for the owner)
- After coding: run `npx tsc --noEmit`, `npm run build`, and curl-test new API routes.
- Then mentally play: a 4-year-old, a 8-year-old, the mom on a second phone, a stranger.
- Grep for leftovers/contradictions (old numbers, dead links, duplicate slugs).
- If a feature touches the Store/money: re-read "monetization" rules (family code backdoor
  must stay; no free public unlock; no fake stats/testimonials/ratings anywhere).

## Session hygiene
- Keep chats short; move to a new chat with HANDOVER.md when the session gets heavy.
- ONE zip only when a full batch is done (never mid-work).
- One step at a time for the owner; wait for "تم".
- Give opinion + plan before big features; implement after approval.
