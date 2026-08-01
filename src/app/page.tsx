"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Studio, { PagePreview } from "@/components/Studio";
import BalloonPop from "@/components/BalloonPop";
import DotsGame from "@/components/DotsGame";
import { Achievements, DailyReward, Gallery, LearnMode, ParentArea, ProfilePicker, Store, TRACE_SETS, TrophyPopup } from "@/components/Extras";
import ShadowGame from "@/components/ShadowGame";
import AvatarDesigner from "@/components/AvatarDesigner";
import { CATEGORIES } from "@/lib/art/catalog";
import type { PageArt } from "@/lib/art/shapes";
import { phrase, setAudioSetting, setMusicTrack, setVoiceCharacter, sfx, say, saySlow, startMusic, stopMusic, unlockAudio, type VoiceId } from "@/lib/audio";
import { useProgress } from "@/lib/progress";
import { fx } from "@/components/FxLayer";
import Buddy, { buddySpeak } from "@/components/Buddy";
import { timeGreeting } from "@/lib/buddy";
import { ACHIEVEMENTS, newlyUnlocked } from "@/lib/achievements";

type View =
  | "home"
  | "categories"
  | "pages"
  | "studio"
  | "draw"
  | "tracepick"
  | "balloon"
  | "dots"
  | "shadow"
  | "learn"
  | "gallery"
  | "trophies"
  | "store"
  | "buddy"
  | "parent";

interface PageRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  premium: boolean;
  data: { emoji: string; viewBox: string; shapes: PageArt["shapes"] };
}

export default function Home() {
  const { progress, update, reset, ready, profiles, activeId, addProfile, switchProfile, deleteProfile, importProfile, updateProfile } = useProgress();
  const [view, setView] = useState<View>("home");
  const [started, setStarted] = useState(false);
  const [category, setCategory] = useState<string>("scenes");
  const [pages, setPages] = useState<Record<string, PageArt[]>>({});
  const [loading, setLoading] = useState(false);
  const [art, setArt] = useState<PageArt | null>(null);
  const [traceGlyph, setTraceGlyph] = useState<string | undefined>();
  const [drawMode, setDrawMode] = useState<"blank" | "grid" | "mirror">("blank");
  const [totals, setTotals] = useState<{ total: number }>({ total: 0 });
  const [gift, setGift] = useState(false);
  const [traceSet, setTraceSet] = useState(0);
  const [showProfiles, setShowProfiles] = useState(false);
  const [trophy, setTrophy] = useState<{ emoji: string; title: string } | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const [chest, setChest] = useState(false);
  const chestSeen = useMemo(() => Math.floor(progress.completed.length / 5), [progress.completed.length]);

  useEffect(() => {
    setAudioSetting("sound", progress.sound);
    setAudioSetting("music", progress.music);
    setAudioSetting("voice", progress.voice);
    setVoiceCharacter((progress.voiceChar || "teacher_f") as VoiceId);
    setMusicTrack(progress.musicTrack || "lullaby");
  }, [progress.sound, progress.music, progress.voice, progress.voiceChar, progress.musicTrack]);

  // watch for newly unlocked achievements
  useEffect(() => {
    if (!ready) return;
    const fresh = newlyUnlocked(progress);
    if (fresh.length) {
      const a = fresh[0];
      update({ achievements: [...progress.achievements, ...fresh.map((f) => f.id)] });
      window.setTimeout(() => {
        setTrophy({ emoji: a.emoji, title: a.title });
        sfx.reward();
        fx.confetti(90);
      }, 700);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.completed.length, progress.stars, progress.coins, progress.streak, progress.bestBalloon, progress.bestDots, progress.bestShadow, ready]);

  // treasure chest every 5 finished pictures
  useEffect(() => {
    if (!ready) return;
    if (chestSeen > progress.chestProgress) {
      window.setTimeout(() => setChest(true), 900);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chestSeen, ready]);

  // sleep timer (parent-controlled): gently ends the session
  useEffect(() => {
    if (!started || !progress.sleepMinutes) return;
    const t = window.setTimeout(() => {
      stopMusic();
      setSleeping(true);
      if (progress.buddyOn) buddySpeak("goodbye");
    }, progress.sleepMinutes * 60000);
    return () => window.clearTimeout(t);
  }, [started, progress.sleepMinutes, progress.buddyOn]);

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
    // buddy greets the child by name — returning visitor vs. first-timer vs. time of day
    window.setTimeout(() => {
      if (!progress.buddyOn) {
        say(phrase("welcome", progress.lang), progress.lang);
        return;
      }
      const returning = progress.completed.length > 0 || progress.streak > 0;
      buddySpeak(returning ? "welcomeBack" : "welcome");
      window.setTimeout(() => buddySpeak(timeGreeting()), 4200);
    }, 500);
    if (progress.lastReward !== today) window.setTimeout(() => setGift(true), 1400);
  };

  useEffect(() => () => stopMusic(), []);

  // never let the profile picker stay open across screens (prevents stuck dim overlay)
  useEffect(() => {
    setShowProfiles(false);
  }, [view]);

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
          premium: p.premium,
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

  const buddyEl = (
    <Buddy
      name={progress.name}
      lang={progress.lang}
      face={progress.buddyFace}
      enabled={progress.buddyOn}
      voice={progress.voice}
      custom={progress.buddyCustom}
      pos={progress.buddyPos}
      onPos={(np) => update({ buddyPos: np })}
    />
  );

  if (view === "studio" || view === "draw")
    return (
      <>
        <Studio
          key={activeId}
          art={view === "studio" ? art : null}
          traceGlyph={view === "draw" ? traceGlyph : undefined}
          drawMode={drawMode}
          progress={progress}
          update={update}
          onNeedPremium={() => setView("store")}
          onCoopJoin={(p) => setArt(p)}
          onExit={() => {
            setTraceGlyph(undefined);
            setView(view === "studio" ? "pages" : "home");
          }}
        />
        {buddyEl}
      </>
    );
  if (view === "balloon") return <BalloonPop key={activeId} onExit={() => setView("home")} progress={progress} update={update} />;
  if (view === "dots")
    return (
      <>
        <DotsGame key={activeId} onExit={() => setView("home")} progress={progress} update={update} />
        {buddyEl}
      </>
    );
  if (view === "learn")
    return (
      <>
        <LearnMode key={activeId} onExit={() => setView("home")} lang={progress.lang} />
        {buddyEl}
      </>
    );
  if (view === "gallery")
    return (
      <>
        <Gallery key={activeId} onExit={() => setView("home")} progress={progress} />
        {buddyEl}
      </>
    );
  if (view === "shadow")
    return (
      <>
        <ShadowGame key={activeId} onExit={() => setView("home")} progress={progress} update={update} />
        {buddyEl}
      </>
    );
  if (view === "trophies")
    return (
      <>
        <Achievements key={activeId} onExit={() => setView("home")} progress={progress} />
        {buddyEl}
      </>
    );
  if (view === "buddy")
    return (
      <>
        <AvatarDesigner key={activeId} onExit={() => setView("home")} progress={progress} update={update} />
        {buddyEl}
      </>
    );
  if (view === "store")
    return <Store key={activeId} onExit={() => setView("home")} progress={progress} update={update} />;
  if (view === "parent")
    return (
      <ParentArea
        onExit={() => setView("home")}
        progress={progress}
        update={update}
        reset={reset}
        onManageProfiles={() => setShowProfiles(true)}
        profiles={profiles}
        onUpdateProfile={updateProfile}
        onDeleteProfile={deleteProfile}
      />
    );

  return (
    <main key={activeId} className="relative min-h-[100dvh] overflow-x-hidden bg-[linear-gradient(160deg,#FFF0F8,#EAF5FF_50%,#FFF8E6)] pb-8">
      <Bubbles />
      {gift && <DailyReward progress={progress} update={update} onClose={() => setGift(false)} />}

      {/* HUD */}
      <header className="relative z-10 flex items-center gap-2 overflow-x-auto p-3">
        <button
          onClick={() => {
            setShowProfiles(true);
            sfx.tap();
          }}
          className="flex shrink-0 items-center gap-1 rounded-full bg-white/85 px-2 py-1 font-black text-[#5B4B7A] shadow active:scale-95"
          aria-label="Switch kid"
        >
          <span className="text-xl">{progress.avatar}</span>
          <span className="max-w-[64px] truncate text-sm">{progress.name}</span>
        </button>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 font-black text-[#5B4B7A] shadow">
          ⭐ {progress.stars}
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 font-black text-[#5B4B7A] shadow">
          🪙 {progress.coins}
        </div>
        <div className="ml-auto flex shrink-0 gap-2">
          {!progress.premiumUnlocked && (
            <button
              onClick={() => {
                setView("store");
                sfx.tap();
              }}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] text-2xl shadow ring-2 ring-[#FFD84D] active:scale-90"
              aria-label="Premium store"
            >
              👑
            </button>
          )}
          <button
            onClick={() => {
              setView("trophies");
              sfx.tap();
            }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Trophies"
          >
            🏆
          </button>
          <button
            onClick={() => {
              setGift(true);
              sfx.tap();
            }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Daily gift"
          >
            🎁
          </button>
          <button
            onClick={() => {
              update({ music: !progress.music });
              if (progress.music) stopMusic();
              else startMusic();
            }}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-2xl shadow active:scale-90"
            aria-label="Music"
          >
            {progress.music ? "🎵" : "🔇"}
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

      {view === "home" && (
        <div className="relative z-10 mx-auto max-w-4xl px-3">
          <h1 className="text-center text-3xl font-black text-[#4B3B6E] drop-shadow-sm sm:text-4xl">
            Hi {progress.name}! What shall we play? 🌈
          </h1>
          <div className={`mt-4 grid gap-3 ${big ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            <Tile emoji="🎨" label="Coloring" tone="#FF7FB6" onClick={() => { setView("categories"); buddySpeak("pickColor"); }} big />
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
            <Tile emoji="🌑" label="Shadow Match" tone="#6C7BD6" onClick={() => setView("shadow")} />
            <Tile emoji="🏆" label="Trophies" tone="#FFD84D" onClick={() => setView("trophies")} />
            <Tile emoji="🎭" label="My Buddy" tone="#FF9FC4" onClick={() => setView("buddy")} />
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
        </div>
      )}

      {view === "categories" && (
        <div className="relative z-10 mx-auto max-w-4xl px-3">
          <TopBar title="🎨 Pick a picture book" onBack={() => setView("home")} />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => void loadCategory(c.key)}
                className="rounded-[28px] bg-white p-4 shadow-lg transition hover:-translate-y-1 active:scale-95"
                style={{ boxShadow: `0 10px 24px ${c.color}44` }}
              >
                <div className="text-5xl">{c.emoji}</div>
                <div className="mt-1 text-sm font-black text-[#5B4B7A]">{c.label}</div>
              </button>
            ))}
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
            {(pages[category] ?? []).map((p) => {
              const locked = !!p.premium && !progress.premiumUnlocked;
              return (
                <button
                  key={p.slug}
                  onClick={() => {
                    if (locked) {
                      setView("store");
                      sfx.tap();
                      return;
                    }
                    setArt(p);
                    setView("studio");
                    sfx.tap();
                    saySlow(p.title, progress.lang);
                    window.setTimeout(() => buddySpeak("encourage"), 1600);
                  }}
                  className="relative overflow-hidden rounded-[26px] bg-white p-2 shadow-lg transition hover:-translate-y-1 active:scale-95"
                >
                  <div className={locked ? "opacity-60" : ""}>
                    <PagePreview
                      art={p}
                      className={category === "scenes" ? "aspect-[4/3] w-full rounded-2xl bg-white" : "aspect-square w-full"}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-black text-[#5B4B7A]">{p.title}</span>
                    <span className="shrink-0 text-[10px]">{"⭐".repeat(p.difficulty)}</span>
                  </div>
                  {locked && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FFD84D] text-2xl shadow-lg ring-4 ring-white">
                        🔒
                      </span>
                    </span>
                  )}
                  {locked && (
                    <span className="absolute top-2 right-2 rounded-full bg-[#FFB03A] px-2 py-0.5 text-[9px] font-black text-white shadow">
                      👑 PRO
                    </span>
                  )}
                  {!locked && progress.completed.includes(p.slug) && (
                    <span className="absolute top-2 right-2 text-xl drop-shadow">✅</span>
                  )}
                </button>
              );
            })}
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

      {showProfiles && (
        <ProfilePicker
          profiles={profiles}
          activeId={activeId}
          onSwitch={(id) => {
            switchProfile(id);
            setShowProfiles(false);
          }}
          onAdd={addProfile}
          onDelete={deleteProfile}
          onRestore={importProfile}
          onClose={() => setShowProfiles(false)}
        />
      )}

      {trophy && <TrophyPopup emoji={trophy.emoji} title={trophy.title} onClose={() => setTrophy(null)} />}

      {chest && (
        <div className="fixed inset-0 z-[68] grid place-items-center bg-[#2E2545]/70 p-4">
          <div className="w-full max-w-xs rounded-[32px] bg-gradient-to-b from-[#FFF6DC] to-white p-6 text-center shadow-2xl pop-in">
            <p className="text-xs font-black uppercase tracking-widest text-[#FFB03A]">Treasure chest!</p>
            <button
              onClick={() => {
                const coins = 25;
                const stars = 3;
                update({ coins: progress.coins + coins, stars: progress.stars + stars, chestProgress: chestSeen });
                sfx.reward();
                fx.confetti(160);
                fx.shake(10);
                if (progress.buddyOn) buddySpeak("praise");
                setChest(false);
              }}
              className="my-2 text-8xl transition active:scale-90"
              aria-label="Open chest"
            >
              🧰
            </button>
            <p className="text-sm font-black text-[#7A6C99]">Tap to open your reward!</p>
            <p className="mt-1 text-xs font-bold text-[#A99CC4]">🪙 25 coins · ⭐ 3 stars</p>
          </div>
        </div>
      )}

      {sleeping && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-[#1A1330]/90 p-6 text-center backdrop-blur-md">
          <div>
            <div className="text-7xl">🌙</div>
            <h2 className="mt-3 text-2xl font-black text-white">Time to rest, {progress.name}!</h2>
            <p className="mt-1 text-sm font-bold text-[#C7BEE8]">Great coloring today. See you soon! 💤</p>
            <button
              onClick={() => {
                setSleeping(false);
                if (progress.music) startMusic();
              }}
              className="mt-6 rounded-full bg-white/20 px-8 py-3 font-black text-white active:scale-95"
            >
              Keep playing (5 min)
            </button>
          </div>
        </div>
      )}
      {buddyEl}
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
