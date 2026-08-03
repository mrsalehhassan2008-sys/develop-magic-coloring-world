"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildCatalog, CATEGORIES } from "@/lib/art/catalog";
import { PagePreview } from "@/components/Studio";

const SHOT_SLUGS = [
  "scene-flower-garden",
  "animals-bear",
  "space-rocket",
  "princesses-rose",
  "sea-octopus",
  "food-cupcake",
  "scene-house-by-sea",
  "dinosaurs-t-rex",
];

const FEATURES = [
  ["🎨", "122+ Original Pages", "Animals, dinosaurs, cars, princesses, space, sea, farm, birds, flowers, food & big scenes."],
  ["🖌️", "15 Magic Brushes", "Crayon, watercolor, glitter, rainbow, neon, airbrush, patterns and more."],
  ["🔢", "Color by Numbers", "Kids tap the matching number — learning numbers while they color."],
  ["🧸", "A Talking Buddy", "A friendly companion greets your child by name in 9 languages."],
  ["🤝", "Color Together", "Up to 6 kids color the same picture live from different devices."],
  ["🎈", "6 Learning Games", "Balloon Pop, Dot-to-Dot, Shadow Match, Trace, Learn & Say and more."],
  ["🎭", "Design Your Buddy", "Kids create their own companion — animal, boy or girl."],
  ["📖", "PDF Art Book", "Export a printable book of your child's masterpieces."],
  ["☁️", "Cloud Save", "Each child has a secret code — progress follows them to any device."],
  ["👨‍👩‍👧", "Parent Dashboard", "Parental gate, premium control, sleep timer, progress reset."],
  ["📴", "Works Offline", "Full gameplay with no internet — perfect for travel."],
  ["🔒", "100% Kid-Safe", "No ads, no chat, no data collection. COPPA & Families ready."],
] as const;

const FAQ = [
  ["Is Magic Coloring World free?", "Yes! Dozens of pages and all core games are free forever. An optional one-time Premium unlock adds every page, scene and magic brush."],
  ["What ages is it for?", "Designed for children 3–8, with simple one-tap controls, voice guidance and large touch targets."],
  ["Is it safe for my child?", "Absolutely. There are no ads, no chat, no external links for kids, and all settings live behind a parental gate. We never collect personal data."],
  ["Does it work without internet?", "Yes — after the first load the whole game works offline. Progress syncs when you're back online."],
  ["How do I move my child's progress to a new device?", "Every child has a 6-letter code in the Parent Area. Type it on the new device under “Who is playing? → Restore” and everything comes back."],
  ["Where can I get it on Android?", "The web version is fully playable right now. The Google Play release is on its way — press “Play now” to try it instantly in your browser."],
] as const;

export default function LandingPage() {
  const catalog = useMemo(() => buildCatalog(), []);
  const shots = useMemo(() => {
    const picked = SHOT_SLUGS.map((s) => catalog.find((p) => p.slug === s)).filter(Boolean);
    return (picked.length ? picked : catalog.slice(0, 8)) as typeof catalog;
  }, [catalog]);
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    catalog.forEach((p) => (m[p.category] = (m[p.category] ?? 0) + 1));
    return m;
  }, [catalog]);

  return (
    <main className="min-h-[100dvh] bg-[#FFF8FC] text-[#2D3748]">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-[#FFE1EF] bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FFB03A] text-2xl shadow">🎨</span>
            <span className="text-lg font-black text-[#FF4D94]">Magic Coloring World</span>
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-sm font-black text-[#6B5B8A] md:flex">
            <a href="#features">Features</a>
            <a href="#categories">Categories</a>
            <a href="#parents">For Parents</a>
            <a href="#faq">FAQ</a>
          </nav>
          <Link href="/play" className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] px-5 py-2 text-sm font-black text-white shadow active:scale-95">
            ▶ Play
          </Link>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#FFD1E6]/60 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-[#CFEFFF]/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[#FFF0D2] px-3 py-1 text-xs font-black text-[#B7791F]">✨ For ages 3–8 · 100% original art</span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#3B2E5A] sm:text-5xl">
              A magical world of <span className="bg-gradient-to-r from-[#FF4D94] to-[#FFB03A] bg-clip-text text-transparent">coloring & learning</span>
            </h1>
            <p className="mt-4 text-lg font-bold text-[#6B5B8A]">
              {catalog.length}+ original coloring pages, 6 educational games, 500+ stickers and a talking buddy —
              safe, ad-free and playable right now in your browser.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/play" className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] px-8 py-4 text-lg font-black text-white shadow-lg active:scale-95">
                ▶ Play now — free
              </Link>
              <span className="rounded-full border-2 border-dashed border-[#B9A7D6] px-6 py-3.5 text-sm font-black text-[#8E7CFF]">
                🤖 Google Play — coming soon
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-black text-[#6B5B8A]">
              {["🚫 No ads", "🔒 COPPA-safe", "📴 Offline play", "🌍 9 languages", "☁️ Cloud save"].map((t) => (
                <span key={t} className="rounded-full bg-white px-3 py-1.5 shadow-sm">{t}</span>
              ))}
            </div>
          </div>
          {/* live screenshots carousel */}
          <div className="relative">
            <div className="flex snap-x gap-4 overflow-x-auto pb-4">
              {shots.map((p) => (
                <div key={p.slug} className="w-56 shrink-0 snap-center rounded-3xl bg-white p-2 shadow-xl ring-1 ring-[#FFE1EF]">
                  <PagePreview art={p} className="aspect-square w-full rounded-2xl" />
                  <p className="px-1 py-1.5 text-center text-xs font-black text-[#6B5B8A]">{p.emoji} {p.title}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs font-bold text-[#A99CC4]">← real pages from the game →</p>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="border-y border-[#FFE1EF] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 text-center sm:grid-cols-4">
          {[
            [`${catalog.length}+`, "coloring pages"],
            ["15", "magic brushes"],
            ["6", "learning games"],
            ["9", "languages"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-black text-[#FF4D94]">{n}</div>
              <div className="text-sm font-bold text-[#6B5B8A]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-3xl font-black text-[#3B2E5A]">Everything your little artist needs</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([e, t, d]) => (
            <div key={t} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#FFE1EF]">
              <div className="text-4xl">{e}</div>
              <h3 className="mt-2 font-black text-[#3B2E5A]">{t}</h3>
              <p className="mt-1 text-sm font-bold text-[#6B5B8A]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* categories */}
      <section id="categories" className="bg-gradient-to-b from-white to-[#FFF0F8] py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black text-[#3B2E5A]">10 worlds to explore</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CATEGORIES.map((c) => (
              <Link key={c.key} href="/play" className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-[#FFE1EF] transition hover:-translate-y-1">
                <div className="text-4xl">{c.emoji}</div>
                <div className="mt-1 text-sm font-black text-[#3B2E5A]">{c.label}</div>
                <div className="text-xs font-bold text-[#A99CC4]">{counts[c.key] ?? 0} pages</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* parents */}
      <section id="parents" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid items-center gap-8 rounded-[36px] bg-gradient-to-br from-[#8E7CFF] to-[#5AC8FA] p-8 text-white md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">Built with parents in mind</h2>
            <p className="mt-3 font-bold text-white/90">
              Every design decision follows the Google Play Families Policy. Your child plays in a walled garden —
              you hold the keys.
            </p>
            <div className="mt-5 grid gap-2 text-sm font-black">
              {["🚫 No third-party ads, ever", "💬 No chat or social features", "🔐 All settings behind a parental gate", "🗑️ One-tap data deletion", "😴 Built-in sleep timer", "👨‍👩‍👧 Up to 4 child profiles with cloud backup"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="mt-6 flex gap-3 text-sm font-black">
              <Link href="/privacy" className="rounded-full bg-white/20 px-4 py-2">Privacy Policy</Link>
              <Link href="/terms" className="rounded-full bg-white/20 px-4 py-2">Terms</Link>
              <Link href="/contact" className="rounded-full bg-white px-4 py-2 text-[#5A4FCF]">Contact us</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
            <h3 className="font-black">Try it together right now</h3>
            <p className="mt-1 text-sm font-bold text-white/90">The full game runs in your browser — no install needed.</p>
            <Link href="/play" className="mt-4 inline-block rounded-full bg-white px-8 py-4 text-lg font-black text-[#FF4D94] shadow-lg active:scale-95">
              ▶ Open the game
            </Link>
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-center text-3xl font-black text-[#3B2E5A]">Questions parents ask</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#FFE1EF]">
              <summary className="cursor-pointer list-none font-black text-[#3B2E5A]">
                <span className="mr-2 inline-block text-[#FF4D94] transition group-open:rotate-90">▸</span>{q}
              </summary>
              <p className="mt-2 text-sm font-bold text-[#6B5B8A]">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] py-14 text-center text-white">
        <h2 className="text-3xl font-black sm:text-4xl">Ready to make some magic? 🌈</h2>
        <p className="mt-2 font-bold text-white/90">Free, safe and playable in seconds.</p>
        <Link href="/play" className="mt-6 inline-block rounded-full bg-white px-10 py-4 text-lg font-black text-[#FF4D94] shadow-xl active:scale-95">
          ▶ Play now
        </Link>
      </section>

      {/* footer */}
      <footer className="bg-[#2D2440] py-10 text-center text-sm font-bold text-[#C7BEE8]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-5 px-4">
          <span className="text-base font-black text-white">🎨 Magic Coloring World</span>
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
          <Link href="/faq" className="hover:text-white">FAQ</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/play" className="hover:text-white">Play</Link>
        </div>
        <p className="mt-4 px-4">© {new Date().getFullYear()} Magic Coloring World · All artwork, sounds & characters are original.</p>
      </footer>
    </main>
  );
}
