"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StudioV2, { PagePreview } from "@/components/StudioV2";
import BalloonPop from "@/components/BalloonPop";
import DotsGame from "@/components/DotsGame";
import { DailyReward, Gallery as OldGallery, LearnMode, ParentArea, TRACE_SETS } from "@/components/Extras";
import AvatarSelector from "@/components/AvatarSelector";
import LevelDisplay from "@/components/LevelDisplay";
import DailyChallenges from "@/components/DailyChallenges";
import Gallery from "@/components/Gallery";
import MusicSelector from "@/components/MusicSelector";
import PremiumShop from "@/components/PremiumShop";
import { addXP } from "@/lib/progress";
import { CATEGORIES } from "@/lib/art/catalog";
import type { PageArt } from "@/lib/art/shapes";
import { canCompanionSpeak, companionSpeak, setAudioSetting, setVoiceType, sfx, say, startMusic, stopMusic, unlockAudio } from "@/lib/audio";
import { useProgress } from "@/lib/progress";
import { fx } from "@/components/FxLayer";

type View =
  | "home"
  | "categories"
  | "pages"
  | "studio"
  | "draw"
  | "tracepick"
  | "balloon"
  | "dots"
  | "learn"
  | "gallery"
  | "parent";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  data: { emoji: string; viewBox: string; shapes: PageArt["shapes"] };
}

export default function Home() {
  const { progress, update, reset, ready } = useProgress();
  const [view, setView] = useState<View>("home");
  const [started, setStarted] = useState(false);
  const [category, setCategory] = useState<string>("animals");
  const [pages, setPages] = useState<Record<string, PageArt[]>>({});
  const [loading, setLoading] = useState(false);
  const [art, setArt] = useState<PageArt | null>(null);
  const [traceGlyph, setTraceGlyph] = useState<string | undefined>();
  const [drawMode, setDrawMode] = useState<"blank" | "grid" | "mirror">("blank");
  const [totals, setTotals] = useState<{ total: number }>({ total: 0 });
  const [gift, setGift] = useState(false);
  const [traceSet, setTraceSet] = useState(0);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [levelUpMsg, setLevelUpMsg] = useState("");

  useEffect(() => {
    setAudioSetting("sound", progress.sound);
    setAudioSetting("music", progress.music);
    setAudioSetting("voice", progress.voice);
    setVoiceType(progress.voiceType);
  }, [progress.sound, progress.music, progress.voice, progress.voiceType]);

  useEffect(() => {
    fetch("/api/pages")
      .then((r) => r.json())
      .then((d: { total: number }) => setTotals({ total: d.total ?? 0 }))
      .catch(() => undefined);
  }, []);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const begin = () => {
    unlockAudio();
    startMusic();
    setStarted(true);
    sfx.star();
    fx.confetti(60);
    
    // Companion greeting
    if (progress.companionMode && progress.voice) {
      const hour = new Date().getHours();
      const type = hour < 12 ? "morning" : hour < 18 ? "greeting" : "evening";
      companionSpeak(type, progress.name, progress.lang, true);
    } else {
      say("Welcome to Magic Coloring World!", progress.lang);
    }
    
    // Check for level up
    if (progress.level > 1) {
      setLevelUpMsg(`Welcome back Level ${progress.level} ${progress.name}!`);
      setShowLevelUp(true);
      window.setTimeout(() => setShowLevelUp(false), 3000);
    }
    
    // Update daily challenges if needed
    const todayStr = new Date().toISOString().slice(0, 10);
    if (progress.dailyChallenges[0]?.date !== todayStr) {
      // Challenges will be refreshed when opened
    }
    
    if (progress.lastReward !== today) window.setTimeout(() => setGift(true), 900);
  };

  useEffect(() => () => stopMusic(), []);

  const loadCategory = useCallback(
    async (key: string) => {
      setCategory(key);
      setView("pages");
      sfx.whoosh();
      if (pages[key]) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/pages?category=${key}`);
        const data = (await res.json()) as { pages: PageRow[] };
        const arts: PageArt[] = (data.pages ?? []).map((p) => ({
          slug: p.slug,
          title: p.title,
          category: p.category,
          difficulty: p.difficulty,
          emoji: p.data.emoji,
          viewBox: p.data.viewBox,
          shapes: p.data.shapes,
        }));
        setPages((prev) => ({ ...prev, [key]: arts }));
      } catch {
        setPages((prev) => ({ ...prev, [key]: [] }));
      }
      setLoading(false);
    },
    [pages],
  );

  const big = progress.bigUi;

  if (!ready) return <div className="grid min-h-screen place-items-center text-4xl">🎨</div>;

  if (!started) {
    return (
      <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[linear-gradient(160deg,#FFE8F4,#E7F3FF_45%,#FFF6DE)] p-6 text-center">
        <Bubbles />
        <div className="relative z-10">
          <div className="animate-[floaty_3s_ease-in-out_infinite] text-[86px] leading-none drop-shadow-lg">🎨</div>
          <h1 className="mt-2 bg-gradient-to-r from-[#FF5C7A] via-[#8E7CFF] to-[#38C6D9] bg-clip-text text-4xl font-black text-transparent sm:text-6xl">
            Magic Coloring World
          </h1>
          <p className="mt-2 text-base font-black text-[#7A6C99]">
            {totals.total || 110}+ coloring pages · games · stickers · learning
          </p>
          <button
            onClick={begin}
            className="mt-7 rounded-full bg-gradient-to-r from-[#FF7FB6] to-[#FFB03A] px-12 py-5 text-2xl font-black text-white shadow-[0_14px_30px_rgba(255,127,182,.5)] transition active:scale-95"
          >
            ▶️ Play
          </button>
          <p className="mt-4 text-xs font-bold text-[#A99CC4]">Best played with sound on 🔊</p>
        </div>
      </main>
    );
  }

  if (view === "studio" || view === "draw")
    return (
      <StudioV2
        art={view === "studio" ? art : null}
        traceGlyph={view === "draw" ? traceGlyph : undefined}
        drawMode={drawMode}
        progress={progress}
        update={update}
        onExit={() => {
          setTraceGlyph(undefined);
          setView(view === "studio" ? "pages" : "home");
        }}
      />
    );
  if (view === "balloon") return <BalloonPop onExit={() => setView("home")} progress={progress} update={update} />;
  if (view === "dots") return <DotsGame onExit={() => setView("home")} progress={progress} update={update} />;
  if (view === "learn") return <LearnMode onExit={() => setView("home")} lang={progress.lang} />;
  if (view === "gallery") return <Gallery onExit={() => setShowGallery(false)} />;
  if (view === "parent")
    return <ParentArea onExit={() => setView("home")} progress={progress} update={update} reset={reset} />;

  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(160deg,#FFF0F8,#EAF5FF_50%,#FFF8E6)] pb-8">
      <Bubbles />
      {gift && <DailyReward progress={progress} update={update} onClose={() => setGift(false)} />}
      {showAvatar && <AvatarSelector progress={progress} update={update} onClose={() => setShowAvatar(false)} />}
      {showChallenges && <DailyChallenges progress={progress} update={update} onClose={() => setShowChallenges(false)} />}
      {showMusic && <MusicSelector progress={progress} update={update} onClose={() => setShowMusic(false)} />}
      {showGallery && <Gallery onExit={() => setShowGallery(false)} />}
      {showShop && <PremiumShop progress={progress} update={update} onClose={() => setShowShop(false)} />}

      {/* HUD */}
      <header className="relative z-10 flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <button
            onClick={() => setShowAvatar(true)}
            className="flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 shadow active:scale-95"
          >
            <span className="text-2xl">{progress.avatar === "boy1" ? "👦" : progress.avatar === "girl1" ? "👧" : progress.avatar === "fox" ? "🦊" : progress.avatar === "rabbit" ? "🐰" : progress.avatar === "lion" ? "🦁" : progress.avatar === "panda" ? "🐼" : progress.avatar === "unicorn" ? "🦄" : progress.avatar === "bear" ? "🐻" : "👨"}</span>
            <span className="font-black text-[#5B4B7A]">{progress.name}</span>
          </button>
          
          {/* Level Display */}
          <div className="flex-1">
            <LevelDisplay
              progress={progress}
              update={(p) => {
                update(p);
              }}
              onLevelUp={(newLevel) => {
                setLevelUpMsg(`🎉 Level ${newLevel}!`);
                setShowLevelUp(true);
                window.setTimeout(() => setShowLevelUp(false), 3000);
              }}
            />
          </div>
          
          <div className="flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 font-black text-[#5B4B7A] shadow">
            ⭐ {progress.stars}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 font-black text-[#5B4B7A] shadow">
            🪙 {progress.coins}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShop(true)}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8E7CFF] to-[#B49BE0] px-4 py-1.5 font-black text-white shadow active:scale-95"
          >
            🛒 Shop
          </button>
          <button
            onClick={() => setShowChallenges(true)}
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFD84D] to-[#FFB03A] px-3 py-1.5 font-black text-white shadow active:scale-95"
          >
            📅 Challenges
          </button>
          <button
            onClick={() => setShowMusic(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Music"
          >
            🎵
          </button>
          <button
            onClick={() => setShowGallery(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Gallery"
          >
            🖼️
          </button>
          <button
            onClick={() => setGift(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Daily gift"
          >
            🎁
          </button>
          <button
            onClick={() => setView("parent")}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Parent area"
          >
            👨‍👩‍👧
          </button>
        </div>
      </header>
      
      {/* Level Up Celebration */}
      {showLevelUp && (
        <div className="pointer-events-none fixed top-20 left-1/2 z-[80] -translate-x-1/2 animate-[popIn_0.5s_ease-out] rounded-3xl bg-gradient-to-r from-[#FFD84D] via-[#FF7FB6] to-[#7ED087] px-8 py-4 text-2xl font-black text-white shadow-2xl">
          {levelUpMsg} 🎉
        </div>
      )}

      {view === "home" && (
        <div className="relative z-10 mx-auto max-w-4xl px-3">
          <h1 className="text-center text-3xl font-black text-[#4B3B6E] drop-shadow-sm sm:text-4xl">
            Hi {progress.name}! What shall we play? 🌈
          </h1>
          <div className={`mt-4 grid gap-3 ${big ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            <Tile emoji="🎨" label="Coloring" tone="#FF7FB6" onClick={() => setView("categories")} big />
            <Tile
              emoji="✏️"
              label="Free Draw"
              tone="#5AC8FA"
              onClick={() => {
                setDrawMode("blank");
                setTraceGlyph(undefined);
                setView("draw");
              }}
              big
            />
            <Tile emoji="✍️" label="Trace" tone="#8E7CFF" onClick={() => setView("tracepick")} />
            <Tile emoji="🎈" label="Balloon Pop" tone="#FF5C7A" onClick={() => setView("balloon")} />
            <Tile emoji="🔢" label="Dot to Dot" tone="#FFB03A" onClick={() => setView("dots")} />
            <Tile emoji="🎓" label="Learn" tone="#7ED087" onClick={() => setView("learn")} />
            <Tile emoji="🖼️" label="My Gallery" tone="#38C6D9" onClick={() => setView("gallery")} />
            <Tile
              emoji="🪞"
              label="Mirror Draw"
              tone="#B49BE0"
              onClick={() => {
                setDrawMode("mirror");
                setTraceGlyph(undefined);
                setView("draw");
              }}
            />
            <Tile
              emoji="▦"
              label="Grid Draw"
              tone="#FFC94D"
              onClick={() => {
                setDrawMode("grid");
                setTraceGlyph(undefined);
                setView("draw");
              }}
            />
          </div>
          <p className="mt-5 text-center text-xs font-bold text-[#A99CC4]">
            {progress.completed.length} pages finished · Balloon best {progress.bestBalloon} · Dots reached #{progress.bestDots}
          </p>
          
          {/* Companion check-in after completing pages */}
          {progress.completed.length > 0 && progress.completed.length % 5 === 0 && progress.companionMode && (
            <div className="mt-4 rounded-3xl bg-gradient-to-r from-[#FFD84D] to-[#FFB03A] p-4 text-center shadow-lg">
              <p className="text-lg font-black text-[#5B4B7A]">
                🌟 Wow {progress.name}! You finished {progress.completed.length} pages!
              </p>
              <p className="text-sm font-bold text-[#8A6A1F]">
                You're an amazing artist! Keep creating! 🎨
              </p>
            </div>
          )}
        </div>
      )}

      {view === "categories" && (
        <div className="relative z-10 mx-auto max-w-4xl px-3">
          <TopBar title="🎨 Pick a picture book" onBack={() => setView("home")} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((c) => {
              const isPremium = c.premium ?? false;
              const isUnlocked = isPremium ? progress.purchases.some(p => 
                p === `${c.key}-pack` || p === "mega-pack" || p === "all-access"
              ) : true;
              
              return (
                <button
                  key={c.key}
                  onClick={() => {
                    if (!isUnlocked) {
                      sfx.wrong();
                      fx.shake(10);
                      setShowShop(true);
                      return;
                    }
                    void loadCategory(c.key);
                  }}
                  className={`relative rounded-[28px] p-4 shadow-lg transition hover:-translate-y-1 active:scale-95 ${
                    isUnlocked ? "bg-white" : "bg-[#F7F3FF] opacity-70"
                  }`}
                  style={{ boxShadow: isUnlocked ? `0 10px 24px ${c.color}44` : undefined }}
                >
                  <div className="text-5xl">{c.emoji}</div>
                  <div className="mt-1 text-sm font-black text-[#5B4B7A]">{c.label}</div>
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] bg-[#2E2545]/60 backdrop-blur-sm">
                      <span className="text-4xl">🔒</span>
                      <span className="mt-1 text-xs font-black text-white">Premium</span>
                    </div>
                  )}
                  {isPremium && isUnlocked && (
                    <span className="absolute top-2 right-2 text-sm">⭐</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "pages" && (
        <div className="relative z-10 mx-auto max-w-5xl px-3">
          <TopBar
            title={`${CATEGORIES.find((c) => c.key === category)?.emoji ?? "🎨"} ${CATEGORIES.find((c) => c.key === category)?.label ?? ""}`}
            onBack={() => setView("categories")}
          />
          {loading && <p className="mt-6 text-center font-black text-[#B7A9D4]">Loading pictures…</p>}
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {(pages[category] ?? []).map((p) => (
              <button
                key={p.slug}
                onClick={() => {
                  setArt(p);
                  setView("studio");
                  sfx.tap();
                  say(p.title, progress.lang);
                }}
                className="relative overflow-hidden rounded-[26px] bg-white p-2 shadow-lg transition hover:-translate-y-1 active:scale-95"
              >
                <PagePreview art={p} className="aspect-square w-full" />
                <div className="mt-1 truncate text-xs font-black text-[#5B4B7A]">{p.title}</div>
                {progress.completed.includes(p.slug) && (
                  <span className="absolute top-2 right-2 text-xl drop-shadow">⭐</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "tracepick" && (
        <div className="relative z-10 mx-auto max-w-4xl px-3">
          <TopBar title="✍️ Trace &amp; Write" onBack={() => setView("home")} />
          <div className="mt-3 flex flex-wrap gap-2">
            {TRACE_SETS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => {
                  setTraceSet(i);
                  sfx.tap();
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-black shadow ${i === traceSet ? "bg-[#8E7CFF] text-white" : "bg-white text-[#5B4B7A]"}`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {TRACE_SETS[traceSet].items.map((g) => (
              <button
                key={g}
                onClick={() => {
                  setTraceGlyph(g);
                  setDrawMode("blank");
                  setView("draw");
                  say(g.length > 1 ? g : `Trace ${g}`, progress.lang);
                }}
                className="grid aspect-square place-items-center rounded-3xl bg-white text-3xl font-black text-[#5B4B7A] shadow-lg active:scale-90"
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={onBack} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90" aria-label="Back">
        ⬅️
      </button>
      <h2 className="rounded-full bg-white/85 px-4 py-2 text-lg font-black text-[#5B4B7A] shadow">{title}</h2>
    </div>
  );
}

function Tile({
  emoji,
  label,
  tone,
  onClick,
  big,
}: {
  emoji: string;
  label: string;
  tone: string;
  onClick: () => void;
  big?: boolean;
}) {
  return (
    <button
      onClick={() => {
        sfx.tap();
        onClick();
      }}
      className={`group relative overflow-hidden rounded-[30px] bg-white shadow-xl transition hover:-translate-y-1 active:scale-95 ${big ? "py-8" : "py-6"}`}
      style={{ boxShadow: `0 12px 26px ${tone}55` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: `linear-gradient(90deg, ${tone}, #fff0)` }}
      />
      <div className={`${big ? "text-6xl" : "text-5xl"} transition group-active:scale-90`}>{emoji}</div>
      <div className="mt-1 text-base font-black text-[#5B4B7A]">{label}</div>
    </button>
  );
}

function Bubbles() {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 37) % 100,
        size: 30 + ((i * 17) % 70),
        delay: (i % 7) * 0.8,
        dur: 9 + (i % 5) * 2,
        emoji: ["🎈", "⭐", "✨", "🌸", "🫧", "🌟", "🍭"][i % 7],
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-[-80px] opacity-60"
          style={{
            left: `${b.left}%`,
            fontSize: b.size,
            animation: `rise ${b.dur}s linear ${b.delay}s infinite`,
          }}
        >
          {b.emoji}
        </span>
      ))}
    </div>
  );
}
