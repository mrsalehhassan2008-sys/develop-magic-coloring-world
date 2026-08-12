"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildCatalog, CATEGORIES } from "@/lib/art/catalog";
import { PagePreview } from "@/components/Studio";
import { getStoredUILang, storeUILang, tr, UI_LANGS, type UILang } from "@/lib/i18n";
import { setUILang } from "@/components/LangEffect";

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

const FEAT_KEYS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];
const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6"];
const PAR_KEYS = ["p1", "p2", "p3", "p4", "p5", "p6"];
const CHIPS = ["chip_noads", "chip_coppa", "chip_offline", "chip_lang", "chip_cloud"];

export default function LandingPage() {
  const [lang, setLang] = useState<UILang>("en");
  useEffect(() => setLang(getStoredUILang()), []);
  const t = (k: string) => tr(lang, k);
  const pick = (l: UILang) => {
    setLang(l);
    storeUILang(l);
    setUILang(l);
  };

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
          <nav className="ms-auto hidden items-center gap-5 text-sm font-black text-[#6B5B8A] md:flex">
            <a href="#features">{t("nav_features")}</a>
            <a href="#categories">{t("nav_categories")}</a>
            <a href="#parents">{t("nav_parents")}</a>
            <a href="#faq">{t("nav_faq")}</a>
          </nav>
          <div className="ms-auto flex items-center gap-2 md:ms-3">
            <div className="flex overflow-hidden rounded-full ring-1 ring-[#FFE1EF]">
              {UI_LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => pick(l.code)}
                  className={`px-2.5 py-1.5 text-xs font-black ${lang === l.code ? "bg-[#8E7CFF] text-white" : "bg-white text-[#6B5B8A]"}`}
                  aria-label={l.label}
                >
                  {l.flag} {l.code === "ar" ? "ع" : "EN"}
                </button>
              ))}
            </div>
            <Link href="/play" className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] px-5 py-2 text-sm font-black text-white shadow active:scale-95">
              {t("nav_play")}
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[#FFD1E6]/60 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-0 h-72 w-72 rounded-full bg-[#CFEFFF]/70 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-[#FFF0D2] px-3 py-1 text-xs font-black text-[#B7791F]">{t("hero_badge")}</span>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#3B2E5A] sm:text-5xl">
              {t("hero_t1")} <span className="bg-gradient-to-r from-[#FF4D94] to-[#FFB03A] bg-clip-text text-transparent">{t("hero_t2")}</span>
            </h1>
            <p className="mt-4 text-lg font-bold text-[#6B5B8A]">{t("hero_sub")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/play" className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] px-8 py-4 text-lg font-black text-white shadow-lg active:scale-95">
                {t("hero_play")}
              </Link>
              <span className="rounded-full border-2 border-dashed border-[#B9A7D6] px-6 py-3.5 text-sm font-black text-[#8E7CFF]">{t("hero_soon")}</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-black text-[#6B5B8A]">
              {CHIPS.map((c) => (
                <span key={c} className="rounded-full bg-white px-3 py-1.5 shadow-sm">{t(c)}</span>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="flex snap-x gap-4 overflow-x-auto pb-4">
              {shots.map((p) => (
                <div key={p.slug} className="w-56 shrink-0 snap-center rounded-3xl bg-white p-2 shadow-xl ring-1 ring-[#FFE1EF]">
                  <PagePreview art={p} className="aspect-square w-full rounded-2xl" />
                  <p className="px-1 py-1.5 text-center text-xs font-black text-[#6B5B8A]">{p.emoji} {p.title}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs font-bold text-[#A99CC4]">🎨 {t("shots_hint")}</p>
          </div>
        </div>
      </section>

      {/* stats */}
      <section className="border-y border-[#FFE1EF] bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 text-center sm:grid-cols-4">
          {[
            [`${catalog.length}+`, t("stat_pages")],
            ["15", t("stat_brushes")],
            ["6", t("stat_games")],
            ["9", t("stat_voice")],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="ltr text-3xl font-black text-[#FF4D94]">{n}</div>
              <div className="text-sm font-bold text-[#6B5B8A]">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-3xl font-black text-[#3B2E5A]">{t("feat_title")}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEAT_KEYS.map((k) => (
            <div key={k} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#FFE1EF]">
              <h3 className="font-black text-[#3B2E5A]">{t(`${k}t`)}</h3>
              <p className="mt-1 text-sm font-bold text-[#6B5B8A]">{t(`${k}d`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* categories */}
      <section id="categories" className="bg-gradient-to-b from-white to-[#FFF0F8] py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-black text-[#3B2E5A]">{t("cat_title")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {CATEGORIES.map((c) => (
              <Link key={c.key} href="/play" className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-[#FFE1EF] transition hover:-translate-y-1">
                <div className="text-4xl">{c.emoji}</div>
                <div className="mt-1 text-sm font-black text-[#3B2E5A]">{c.label}</div>
                <div className="text-xs font-bold text-[#A99CC4]">{counts[c.key] ?? 0} {t("cat_pages")}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* parents */}
      <section id="parents" className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid items-center gap-8 rounded-[36px] bg-gradient-to-br from-[#8E7CFF] to-[#5AC8FA] p-8 text-white md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">{t("par_title")}</h2>
            <p className="mt-3 font-bold text-white/90">{t("par_sub")}</p>
            <div className="mt-5 grid gap-2 text-sm font-black">
              {PAR_KEYS.map((k) => <span key={k}>{t(k)}</span>)}
            </div>
            <div className="mt-6 flex gap-3 text-sm font-black">
              <Link href="/privacy" className="rounded-full bg-white/20 px-4 py-2">Privacy</Link>
              <Link href="/terms" className="rounded-full bg-white/20 px-4 py-2">Terms</Link>
              <Link href="/contact" className="rounded-full bg-white px-4 py-2 text-[#5A4FCF]">Contact</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/15 p-6 backdrop-blur">
            <h3 className="font-black">{t("par_try_title")}</h3>
            <p className="mt-1 text-sm font-bold text-white/90">{t("par_try_sub")}</p>
            <Link href="/play" className="mt-4 inline-block rounded-full bg-white px-8 py-4 text-lg font-black text-[#FF4D94] shadow-lg active:scale-95">
              {t("par_open")}
            </Link>
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-center text-3xl font-black text-[#3B2E5A]">{t("faq_title")}</h2>
        <div className="mt-8 space-y-3">
          {FAQ_KEYS.map((k) => (
            <details key={k} className="group rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#FFE1EF]">
              <summary className="cursor-pointer list-none font-black text-[#3B2E5A]">
                <span className="me-2 inline-block text-[#FF4D94] transition group-open:rotate-90">▸</span>{t(`${k}q`)}
              </summary>
              <p className="mt-2 text-sm font-bold text-[#6B5B8A]">{t(`${k}a`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="bg-gradient-to-r from-[#FF6B9D] to-[#FFB03A] py-14 text-center text-white">
        <h2 className="text-3xl font-black sm:text-4xl">{t("cta_t")}</h2>
        <p className="mt-2 font-bold text-white/90">{t("cta_s")}</p>
        <Link href="/play" className="mt-6 inline-block rounded-full bg-white px-10 py-4 text-lg font-black text-[#FF4D94] shadow-xl active:scale-95">
          {t("cta_b")}
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
          <Link href="/play" className="hover:text-white">{t("nav_play")}</Link>
        </div>
        <p className="mt-4 px-4">© {new Date().getFullYear()} Magic Coloring World · {t("footer_rights")}</p>
      </footer>
    </main>
  );
}
