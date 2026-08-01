"use client";

import { useCallback, useEffect, useState } from "react";
import { fx } from "@/components/FxLayer";
import { availableVoiceCount, MUSIC_TRACKS, phrase, say, setAudioSetting, setMusicTrack, setVoiceCharacter, sfx, VOICES, type VoiceId } from "@/lib/audio";
import { BUDDY_FACES, buddyLine } from "@/lib/buddy";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AVATARS, LANGS, type Profile, type Progress } from "@/lib/progress";

/* ============================== LEARN MODE ============================== */

const LEARN: { key: string; label: string; emoji: string; items: [string, string][] }[] = [
  {
    key: "animals",
    label: "Animals",
    emoji: "🐾",
    items: [["🐶", "Dog"], ["🐱", "Cat"], ["🐭", "Mouse"], ["🐰", "Rabbit"], ["🦊", "Fox"], ["🐻", "Bear"], ["🐼", "Panda"], ["🦁", "Lion"], ["🐮", "Cow"], ["🐷", "Pig"], ["🐸", "Frog"], ["🐵", "Monkey"], ["🐘", "Elephant"], ["🦒", "Giraffe"], ["🐴", "Horse"], ["🐔", "Chicken"]],
  },
  {
    key: "colors",
    label: "Colors",
    emoji: "🎨",
    items: [["🔴", "Red"], ["🟠", "Orange"], ["🟡", "Yellow"], ["🟢", "Green"], ["🔵", "Blue"], ["🟣", "Purple"], ["🟤", "Brown"], ["⚫", "Black"], ["⚪", "White"], ["🩷", "Pink"]],
  },
  {
    key: "shapes",
    label: "Shapes",
    emoji: "🔷",
    items: [["⭕", "Circle"], ["🔲", "Square"], ["🔺", "Triangle"], ["⭐", "Star"], ["💖", "Heart"], ["🔷", "Diamond"], ["📏", "Line"], ["🥚", "Oval"], ["⬡", "Hexagon"], ["➕", "Cross"]],
  },
  {
    key: "alphabet",
    label: "Alphabet",
    emoji: "🔤",
    items: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => [l, `Letter ${l}`] as [string, string]),
  },
  {
    key: "numbers",
    label: "Numbers",
    emoji: "🔢",
    items: Array.from({ length: 20 }, (_, i) => [`${i + 1}`, `${i + 1}`] as [string, string]),
  },
  {
    key: "vehicles",
    label: "Vehicles",
    emoji: "🚗",
    items: [["🚗", "Car"], ["🚌", "Bus"], ["🚒", "Fire Truck"], ["🚓", "Police Car"], ["🚑", "Ambulance"], ["🚜", "Tractor"], ["🚲", "Bicycle"], ["✈️", "Airplane"], ["🚀", "Rocket"], ["⛵", "Boat"], ["🚂", "Train"], ["🚁", "Helicopter"]],
  },
  {
    key: "fruits",
    label: "Fruits",
    emoji: "🍎",
    items: [["🍎", "Apple"], ["🍌", "Banana"], ["🍇", "Grapes"], ["🍓", "Strawberry"], ["🍉", "Watermelon"], ["🍊", "Orange"], ["🍍", "Pineapple"], ["🥝", "Kiwi"], ["🍒", "Cherry"], ["🥭", "Mango"]],
  },
  {
    key: "veg",
    label: "Vegetables",
    emoji: "🥕",
    items: [["🥕", "Carrot"], ["🥦", "Broccoli"], ["🌽", "Corn"], ["🥔", "Potato"], ["🍅", "Tomato"], ["🥬", "Lettuce"], ["🧅", "Onion"], ["🥒", "Cucumber"], ["🫑", "Pepper"], ["🍆", "Eggplant"]],
  },
  {
    key: "jobs",
    label: "Jobs",
    emoji: "👩‍🚒",
    items: [["👩‍⚕️", "Doctor"], ["👨‍🚒", "Firefighter"], ["👮", "Police Officer"], ["👩‍🏫", "Teacher"], ["👨‍🍳", "Chef"], ["👩‍🚀", "Astronaut"], ["👨‍🌾", "Farmer"], ["👩‍🎨", "Artist"], ["👷", "Builder"], ["🧑‍🔬", "Scientist"]],
  },
  {
    key: "weather",
    label: "Weather",
    emoji: "🌦️",
    items: [["☀️", "Sunny"], ["🌤️", "Cloudy"], ["🌧️", "Rain"], ["⛈️", "Storm"], ["❄️", "Snow"], ["🌈", "Rainbow"], ["🌪️", "Tornado"], ["💨", "Wind"], ["🌫️", "Fog"], ["🌙", "Night"]],
  },
];

export function LearnMode({ onExit, lang }: { onExit: () => void; lang: string }) {
  const [cat, setCat] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const group = LEARN[cat];

  const tap = (emoji: string, name: string, e: React.PointerEvent) => {
    setActive(emoji);
    say(name, lang);
    sfx.star();
    fx.burst(e.clientX, e.clientY, 14, ["#FFD84D", "#FF7FB6", "#8E7CFF"], 260);
    window.setTimeout(() => setActive(null), 650);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#F6F1FF]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">🎓 Learn &amp; Say</div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 pb-2">
        {LEARN.map((g, i) => (
          <button
            key={g.key}
            onClick={() => {
              setCat(i);
              sfx.tap();
            }}
            className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-black shadow ${i === cat ? "bg-[#8E7CFF] text-white" : "bg-white text-[#5B4B7A]"}`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-3 content-start gap-3 overflow-y-auto p-3 sm:grid-cols-4 md:grid-cols-6">
        {group.items.map(([emoji, name]) => (
          <button
            key={emoji + name}
            onPointerDown={(e) => tap(emoji, name, e)}
            className={`rounded-3xl bg-white p-3 shadow-lg transition active:scale-90 ${active === emoji ? "scale-110 ring-4 ring-[#FFD84D]" : ""}`}
          >
            <div className={`text-5xl ${active === emoji ? "animate-bounce" : ""}`}>{emoji}</div>
            <div className="mt-1 text-xs font-black text-[#5B4B7A]">{name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ================================ GALLERY =============================== */

interface Art {
  id: number;
  title: string;
  pageSlug: string;
  thumbnail: string | null;
  createdAt: string;
}

export function Gallery({ onExit }: { onExit: () => void }) {
  const [items, setItems] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/artworks");
      const data = (await res.json()) as { artworks: Art[] };
      setItems(data.artworks ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#FFF7FB]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">🖼️ My Gallery</div>
      </div>
      {loading ? (
        <p className="p-6 text-center font-black text-[#B7A9D4]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="p-6 text-center font-black text-[#B7A9D4]">No artwork yet — colour a page and press 💾</p>
      ) : (
        <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-5">
          {items.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-3xl bg-white shadow-lg">
              {a.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.thumbnail} alt={a.title} className="aspect-square w-full object-cover" />
              ) : (
                <div className="grid aspect-square place-items-center text-4xl">🎨</div>
              )}
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs font-black text-[#5B4B7A]">{a.title}</span>
                <div className="flex gap-1">
                  {a.thumbnail && (
                    <a href={a.thumbnail} download={`${a.pageSlug}.png`} className="grid h-8 w-8 place-items-center rounded-xl bg-[#F1ECFF] text-sm" aria-label="Download">📤</a>
                  )}
                  <button
                    onClick={async () => {
                      await fetch(`/api/artworks?id=${a.id}`, { method: "DELETE" });
                      sfx.whoosh();
                      void load();
                    }}
                    className="grid h-8 w-8 place-items-center rounded-xl bg-[#FFE9EF] text-sm"
                    aria-label="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== PARENT AREA ============================= */

export function ParentArea({
  onExit,
  progress,
  update,
  reset,
  onManageProfiles,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  reset: () => void;
  onManageProfiles: () => void;
}) {
  const [challenge] = useState(() => ({ a: 3 + Math.floor(Math.random() * 7), b: 4 + Math.floor(Math.random() * 8) }));
  const [answer, setAnswer] = useState("");
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState<"privacy" | "terms" | null>(null);

  const toggle = (key: keyof Progress, value: boolean) => {
    update({ [key]: value } as Partial<Progress>);
    if (key === "sound" || key === "music" || key === "voice") setAudioSetting(key, value);
  };

  if (!open) {
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-[#2E2545]/70 p-4">
        <div className="w-full max-w-sm rounded-[32px] bg-white p-6 text-center shadow-2xl">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-black text-[#2E2545]">Grown-ups only</h2>
          <p className="mt-1 text-sm font-bold text-[#7A6C99]">
            What is {challenge.a} × {challenge.b}?
          </p>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="mt-3 w-full rounded-2xl border-4 border-[#EDE6FF] px-4 py-3 text-center text-2xl font-black text-[#2E2545] outline-none focus:border-[#8E7CFF]"
            placeholder="?"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={onExit} className="flex-1 rounded-2xl bg-[#F3EFFF] py-3 font-black text-[#5B4B7A]">Back</button>
            <button
              onClick={() => {
                if (Number(answer) === challenge.a * challenge.b) {
                  setOpen(true);
                  sfx.reward();
                } else {
                  sfx.wrong();
                  fx.shake(12);
                  setAnswer("");
                }
              }}
              className="flex-1 rounded-2xl bg-[#8E7CFF] py-3 font-black text-white"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#F6F1FF] p-3">
      <div className="mx-auto max-w-2xl space-y-3 pb-10">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md" aria-label="Home">🏠</button>
          <h2 className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">👨‍👩‍👧 Parent Area</h2>
        </div>

        <Card title="🔊 Sound & Voice">
          {([
            ["sound", "Sound effects"],
            ["music", "Background music"],
            ["voice", "Voice assistance"],
          ] as const).map(([k, label]) => (
            <Row key={k} label={label}>
              <Switch on={progress[k]} onChange={(v) => toggle(k, v)} />
            </Row>
          ))}
        </Card>

        <Card title="🗣️ Choose a voice">
          <p className="mb-1 text-xs font-bold text-[#7A6C99]">Pick who talks to your child. Tap to hear it.</p>
          {availableVoiceCount(progress.lang) === 0 && (
            <p className="mb-2 rounded-xl bg-[#FFF3CC] px-3 py-2 text-[11px] font-bold text-[#8A6A1F]">
              ⚠️ Your device has no speech voice for this language. The characters still sound different (pitch),
              but for real voices install a text-to-speech voice pack for this language in your device settings.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {VOICES.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  update({ voiceChar: v.id });
                  setVoiceCharacter(v.id as VoiceId);
                  say(phrase("hello", progress.lang), progress.lang, v.id as VoiceId);
                  sfx.tap();
                }}
                className={`rounded-2xl p-3 text-center shadow transition active:scale-95 ${
                  progress.voiceChar === v.id ? "bg-[#8E7CFF] text-white ring-4 ring-[#FFD84D]" : "bg-[#F3EFFF] text-[#5B4B7A]"
                }`}
              >
                <div className="text-4xl">{v.emoji}</div>
                <div className="mt-1 text-xs font-black">{v.label}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="🧸 Talking buddy">
          <p className="mb-1 text-xs font-bold text-[#7A6C99]">
            A friendly companion that talks to {progress.name || "your child"} by name and encourages them.
          </p>
          <Row label="Enable buddy">
            <Switch on={progress.buddyOn} onChange={(v) => update({ buddyOn: v })} />
          </Row>
          <div className="mt-1 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {BUDDY_FACES.map((f) => (
              <button
                key={f}
                onClick={() => {
                  update({ buddyFace: f });
                  say(buddyLine("praise", progress.name, progress.lang), progress.lang);
                  sfx.tap();
                }}
                className={`grid h-12 place-items-center rounded-2xl text-3xl shadow transition active:scale-90 ${
                  progress.buddyFace === f ? "bg-[#8E7CFF] ring-4 ring-[#FFD84D]" : "bg-[#F3EFFF]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Card>

        <Card title="♿ Accessibility">
          <Row label="Left-handed mode">
            <Switch on={progress.leftHanded} onChange={(v) => update({ leftHanded: v })} />
          </Row>
          <Row label="Extra large buttons">
            <Switch on={progress.bigUi} onChange={(v) => update({ bigUi: v })} />
          </Row>
          <Row label="Colour-blind friendly palette">
            <Switch on={progress.colorblind} onChange={(v) => update({ colorblind: v })} />
          </Row>
        </Card>

        <Card title="🎵 Background music">
          <div className="flex flex-wrap gap-2">
            {MUSIC_TRACKS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  update({ musicTrack: t.key });
                  setMusicTrack(t.key);
                  sfx.tap();
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-black shadow ${progress.musicTrack === t.key ? "bg-[#8E7CFF] text-white" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="😴 Sleep timer">
          <p className="mb-1 text-xs font-bold text-[#7A6C99]">Gently ends play after a set time.</p>
          <div className="flex flex-wrap gap-2">
            {[
              [0, "Off"],
              [10, "10 min"],
              [20, "20 min"],
              [30, "30 min"],
            ].map(([m, label]) => (
              <button
                key={m}
                onClick={() => {
                  update({ sleepMinutes: m as number });
                  sfx.tap();
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-black shadow ${progress.sleepMinutes === m ? "bg-[#8E7CFF] text-white" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="👶 Kid profiles">
          <p className="mb-1 text-xs font-bold text-[#7A6C99]">Each child keeps their own stars, art and trophies.</p>
          <button
            onClick={onManageProfiles}
            className="w-full rounded-2xl bg-[#7ED087] py-3 font-black text-white active:scale-95"
          >
            Manage kid profiles
          </button>
        </Card>

        <Card title="🌍 Language">
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  update({ lang: l.code });
                  say(phrase("hello", l.code), l.code);
                }}
                className={`rounded-2xl px-3 py-2 text-sm font-black ${progress.lang === l.code ? "bg-[#8E7CFF] text-white" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </Card>

        <Card title="🧒 Child profile">
          <Row label="Name">
            <input
              value={progress.name}
              onChange={(e) => update({ name: e.target.value.slice(0, 18) })}
              className="w-40 rounded-xl border-2 border-[#EDE6FF] px-3 py-2 text-right font-black text-[#2E2545] outline-none"
            />
          </Row>
          <Row label="Stars collected"><b className="font-black text-[#FFB03A]">⭐ {progress.stars}</b></Row>
          <Row label="Coins"><b className="font-black text-[#FFB03A]">🪙 {progress.coins}</b></Row>
          <Row label="Pages finished"><b className="font-black text-[#8E7CFF]">{progress.completed.length}</b></Row>
        </Card>

        <Card title="💳 Purchases & Ads">
          <Row label="Ads (kid-safe, non-personalised)"><span className="text-xs font-black text-[#7A6C99]">Disabled in this build</span></Row>
          <Row label="Remove ads / Premium packs"><button className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A]">Restore purchase</button></Row>
          <Row label="🔓 Family unlock (free for your kids)">
            <button
              onClick={() => {
                update({ premiumUnlocked: true });
                sfx.reward();
                fx.confetti(140);
                fx.shake(10);
                say("Premium unlocked for the whole family!", progress.lang);
              }}
              className={`rounded-xl px-3 py-2 text-xs font-black text-white ${progress.premiumUnlocked ? "bg-[#7ED087]" : "bg-gradient-to-r from-[#FFB03A] to-[#FF7FB6]"}`}
            >
              {progress.premiumUnlocked ? "✅ Unlocked" : "Unlock for my family"}
            </button>
          </Row>
          <Row label="Backup progress">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "magic-coloring-backup.json";
                a.click();
              }}
              className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A]"
            >
              Download backup
            </button>
          </Row>
        </Card>

        <Card title="📄 Legal & Support">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setDoc("privacy")} className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A]">Privacy Policy</button>
            <button onClick={() => setDoc("terms")} className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A]">Terms of Service</button>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#EAF7FF] px-3 py-2 text-xs font-black text-[#2A6FE8]">Privacy (web) ↗</a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#EAF7FF] px-3 py-2 text-xs font-black text-[#2A6FE8]">Terms (web) ↗</a>
            <a href="mailto:support@magiccoloringworld.example" className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A]">Contact us</a>
            <button onClick={() => sfx.star()} className="rounded-xl bg-[#FFF2CC] px-3 py-2 text-xs font-black text-[#8A6A1F]">⭐ Rate the app</button>
            <button
              onClick={() => {
                if (window.confirm("Reset all progress, stars and coins?")) reset();
              }}
              className="rounded-xl bg-[#FFE9EF] px-3 py-2 text-xs font-black text-[#C23B5E]"
            >
              Reset progress
            </button>
          </div>
          {doc && (
            <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl bg-[#FBF7FF] p-3 text-xs leading-relaxed font-medium text-[#5B4B7A]">
              {doc === "privacy" ? PRIVACY : TERMS}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-lg">
      <h3 className="mb-2 font-black text-[#2E2545]">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#FBF7FF] px-3 py-2">
      <span className="text-sm font-bold text-[#5B4B7A]">{label}</span>
      {children}
    </div>
  );
}
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => {
        onChange(!on);
        sfx.tap();
      }}
      className={`h-8 w-14 rounded-full p-1 transition ${on ? "bg-[#7ED087]" : "bg-[#DCD5EC]"}`}
      role="switch"
      aria-checked={on}
    >
      <span className={`block h-6 w-6 rounded-full bg-white shadow transition ${on ? "translate-x-6" : ""}`} />
    </button>
  );
}

const PRIVACY = `Magic Coloring World — Privacy Policy (template)

We are committed to the Google Play Families Policy, COPPA and GDPR-K.

1. We do not collect personal information from children. No account, e-mail, phone number or location is requested.
2. Artwork and high scores are stored with a nickname chosen inside the app on the game server; no advertising identifiers are attached.
3. There is no third-party analytics or behavioural advertising SDK in this build. If advertising is enabled in future releases it will be non-personalised and served through a Families-compliant ad partner.
4. All purchases and external links are placed behind a parental gate (a maths challenge).
5. Parents may delete all saved artwork and reset progress at any time from the Parent Area.
6. Contact: support@magiccoloringworld.example`;

const TERMS = `Magic Coloring World — Terms of Service (template)

1. Magic Coloring World is provided for entertainment and educational use by children with parental supervision.
2. All artwork, illustrations, characters, sounds and music in the app are original works created for this product. No third-party or copyrighted characters are included.
3. Artwork created by a child inside the app belongs to the child and their family; you may export and share it freely.
4. Purchases, if enabled, are handled by the platform store and follow its refund rules.
5. The service is provided "as is" without warranty. Continued use means acceptance of these terms.`;

/* ============================ DAILY REWARD ============================== */

export function DailyReward({
  progress,
  update,
  onClose,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onClose: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const day = (progress.streak % 7) + 1;

  const claim = () => {
    setOpened(true);
    const coins = 10 * day;
    const stars = day >= 7 ? 5 : 1;
    update({ coins: progress.coins + coins, stars: progress.stars + stars, lastReward: today, streak: progress.streak + 1 });
    sfx.reward();
    fx.confetti(150);
    fx.shake(10);
    say("Daily treasure!", progress.lang);
    window.setTimeout(onClose, 2200);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#2E2545]/70 p-4">
      <div className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#FFF6DC] to-white p-6 text-center shadow-2xl">
        <h2 className="text-xl font-black text-[#2E2545]">🎁 Daily Treasure</h2>
        <div className="my-2 flex justify-center gap-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-black ${i + 1 < day ? "bg-[#7ED087] text-white" : i + 1 === day ? "bg-[#FFD84D] text-[#5B4B7A] ring-4 ring-[#FFB03A]" : "bg-[#F1ECFF] text-[#B7A9D4]"}`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <button onClick={claim} disabled={opened} className="mx-auto block text-7xl transition active:scale-90 disabled:opacity-70">
          {opened ? "🎉" : "🧰"}
        </button>
        <p className="mt-2 text-sm font-black text-[#7A6C99]">
          {opened ? `You got 🪙 ${10 * day} coins!` : "Tap the chest to open!"}
        </p>
        <button onClick={onClose} className="mt-3 w-full rounded-2xl bg-[#F3EFFF] py-3 font-black text-[#5B4B7A]">Close</button>
      </div>
    </div>
  );
}

/* ============================== STORE ================================== */

import { STORE_ITEMS } from "@/lib/premium";

export function Store({
  onExit,
  progress,
  update,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
}) {
  const [gate, setGate] = useState(!progress.premiumUnlocked); // gate before buying
  const [challenge] = useState(() => ({ a: 2 + Math.floor(Math.random() * 8), b: 3 + Math.floor(Math.random() * 7) }));
  const [answer, setAnswer] = useState("");
  const [passed, setPassed] = useState(false);

  const buy = (productId: string) => {
    // NOTE: wire this to Google Play Billing using this exact productId.
    // For now it grants the unlock so the flow is fully testable.
    // (Both products unlock content here; pages-only vs all differ once
    //  Billing is connected — the flag model already supports it.)
    void productId;
    update({ premiumUnlocked: true });
    sfx.reward();
    fx.confetti(180);
    fx.shake(12);
    say("Everything is unlocked! Enjoy!", progress.lang);
  };

  if (progress.premiumUnlocked) {
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-[#2E2545]/70 p-4">
        <div className="w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#FFF6DC] to-white p-6 text-center shadow-2xl">
          <div className="text-6xl">👑</div>
          <h2 className="mt-2 text-2xl font-black text-[#2E2545]">Premium Active!</h2>
          <p className="mt-1 text-sm font-bold text-[#7A6C99]">All pictures, brushes and stickers are unlocked. Thank you!</p>
          <button onClick={onExit} className="mt-5 w-full rounded-2xl bg-[#7ED087] py-3 font-black text-white active:scale-95">Back to fun 🎨</button>
        </div>
      </div>
    );
  }

  // parental gate first (Google Play Families requirement for purchases)
  if (gate && !passed) {
    return (
      <div className="fixed inset-0 z-40 grid place-items-center bg-[#2E2545]/70 p-4">
        <div className="w-full max-w-sm rounded-[32px] bg-white p-6 text-center shadow-2xl">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-black text-[#2E2545]">Grown-ups only</h2>
          <p className="mt-1 text-sm font-bold text-[#7A6C99]">What is {challenge.a} × {challenge.b}?</p>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="mt-3 w-full rounded-2xl border-4 border-[#EDE6FF] px-4 py-3 text-center text-2xl font-black text-[#2E2545] outline-none focus:border-[#8E7CFF]"
            placeholder="?"
          />
          <div className="mt-3 flex gap-2">
            <button onClick={onExit} className="flex-1 rounded-2xl bg-[#F3EFFF] py-3 font-black text-[#5B4B7A]">Back</button>
            <button
              onClick={() => {
                if (Number(answer) === challenge.a * challenge.b) {
                  setPassed(true);
                  setGate(false);
                  sfx.tap();
                } else {
                  sfx.wrong();
                  fx.shake(12);
                  setAnswer("");
                }
              }}
              className="flex-1 rounded-2xl bg-[#8E7CFF] py-3 font-black text-white"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,#FFF3D9,transparent_60%)] bg-[#FFFBF2] p-3">
      <div className="mx-auto max-w-lg space-y-3 pb-10">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md" aria-label="Back">🏠</button>
          <h2 className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">👑 Premium Store</h2>
        </div>

        <div className="rounded-3xl bg-white p-5 text-center shadow-lg">
          <div className="text-6xl">👑</div>
          <h3 className="mt-2 text-xl font-black text-[#2E2545]">Unlock Everything</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-left text-sm font-bold text-[#5B4B7A]">
            <div className="rounded-2xl bg-[#FFF6DC] p-3">🎨 All 120+ pictures</div>
            <div className="rounded-2xl bg-[#EAF7FF] p-3">🏞️ All big scenes</div>
            <div className="rounded-2xl bg-[#F3FFE3] p-3">🖌️ All magic brushes</div>
            <div className="rounded-2xl bg-[#FFF0F6] p-3">🌟 All sticker packs</div>
          </div>
          <div className="mt-4 space-y-2">
            {STORE_ITEMS.map((it) => {
              const isMain = it.kind === "unlock_all";
              return (
                <button
                  key={it.id}
                  onClick={() => buy(it.id)}
                  className={`w-full rounded-3xl py-4 font-black text-white shadow-lg active:scale-95 ${
                    isMain
                      ? "bg-gradient-to-r from-[#FFB03A] to-[#FF7FB6] text-xl"
                      : "bg-gradient-to-r from-[#8E7CFF] to-[#5AC8FA] text-base"
                  }`}
                >
                  {isMain && <span className="mr-1">👑 Best value ·</span>}
                  {it.emoji} {it.title} — {it.price}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              // restore purchase placeholder (Google Play restores automatically)
              say("Checking your purchases…", progress.lang);
              sfx.tap();
            }}
            className="mt-2 w-full rounded-2xl bg-[#F3EFFF] py-3 text-sm font-black text-[#5B4B7A]"
          >
            Restore purchase
          </button>
          <p className="mt-3 text-[11px] font-bold text-[#A99CC4]">
            One-time payment · No ads · No subscription · Family safe
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================ ACHIEVEMENTS ============================== */

export function Achievements({ onExit, progress }: { onExit: () => void; progress: Progress }) {
  const unlocked = progress.achievements;
  const got = ACHIEVEMENTS.filter((a) => unlocked.includes(a.id)).length;
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(circle_at_50%_0%,#FFF3D9,transparent_60%)] bg-[#FFFBF2]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">
          🏆 Trophies <span className="text-xs text-[#B7A9D4]">{got}/{ACHIEVEMENTS.length}</span>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-3xl p-4 text-center shadow-lg transition ${on ? "bg-gradient-to-b from-[#FFF6DC] to-white ring-4 ring-[#FFD84D]" : "bg-white/70"}`}
            >
              <div className={`text-5xl ${on ? "" : "opacity-25 grayscale"}`}>{on ? a.emoji : "🔒"}</div>
              <div className="mt-1 text-sm font-black text-[#5B4B7A]">{a.title}</div>
              <div className="text-[11px] font-bold text-[#A99CC4]">{a.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* popup shown when a trophy is unlocked */
export function TrophyPopup({ emoji, title, onClose }: { emoji: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[75] grid place-items-center bg-[#2E2545]/60 p-4" onPointerDown={onClose}>
      <div className="w-full max-w-xs rounded-[32px] bg-gradient-to-b from-[#FFF6DC] to-white p-6 text-center shadow-2xl pop-in">
        <p className="text-xs font-black uppercase tracking-widest text-[#FFB03A]">Trophy unlocked!</p>
        <div className="my-2 text-7xl">{emoji}</div>
        <h2 className="text-xl font-black text-[#2E2545]">{title}</h2>
        <button onClick={onClose} className="mt-4 w-full rounded-2xl bg-[#FFB03A] py-3 font-black text-white active:scale-95">Yay! 🎉</button>
      </div>
    </div>
  );
}

/* ============================ PROFILE PICKER =========================== */

export function ProfilePicker({
  profiles,
  activeId,
  onSwitch,
  onAdd,
  onDelete,
  onRestore,
  onClose,
}: {
  profiles: Profile[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string, avatar: string) => void;
  onDelete: (id: string) => void;
  onRestore: (data: Progress) => void;
  onClose: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [restoreCode, setRestoreCode] = useState("");
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-[#2E2545]/70 p-4">
      <div className="w-full max-w-md rounded-[32px] bg-white p-5 shadow-2xl">
        <h2 className="text-center text-xl font-black text-[#2E2545]">👶 Who is playing?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {profiles.map((p) => (
            <div key={p.id} className="relative">
              <button
                onClick={() => {
                  onSwitch(p.id);
                  sfx.star();
                  onClose();
                }}
                className={`w-full rounded-3xl p-3 text-center shadow transition active:scale-95 ${p.id === activeId ? "bg-[#8E7CFF] text-white ring-4 ring-[#FFD84D]" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
              >
                <div className="text-4xl">{p.data.avatar}</div>
                <div className="mt-1 truncate text-xs font-black">{p.data.name}</div>
                <div className="text-[10px]">⭐{p.data.stars}</div>
                {p.data.syncCode && (
                  <div className="mt-0.5 rounded-full bg-white/70 px-1 text-[9px] font-black tracking-widest text-[#8E7CFF]">🔑 {p.data.syncCode}</div>
                )}
              </button>
              {profiles.length > 1 && (
                <button
                  onClick={() => onDelete(p.id)}
                  className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-[#FFE9EF] text-xs shadow"
                  aria-label="Delete profile"
                >
                  ✖️
                </button>
              )}
            </div>
          ))}
          {profiles.length < 4 && !adding && (
            <button onClick={() => setAdding(true)} className="rounded-3xl bg-[#F3FFE3] p-3 text-center shadow active:scale-95">
              <div className="text-4xl">➕</div>
              <div className="mt-1 text-xs font-black text-[#5B4B7A]">Add kid</div>
            </button>
          )}
        </div>

        {adding && (
          <div className="mt-4 rounded-2xl bg-[#FBF7FF] p-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 14))}
              placeholder="Name"
              className="w-full rounded-xl border-2 border-[#EDE6FF] px-3 py-2 text-center font-black text-[#2E2545] outline-none"
            />
            <div className="mt-2 grid grid-cols-6 gap-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`grid h-10 place-items-center rounded-xl text-2xl ${avatar === a ? "bg-[#8E7CFF] ring-2 ring-[#FFD84D]" : "bg-white"}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                onAdd(name, avatar);
                setAdding(false);
                setName("");
                sfx.reward();
              }}
              className="mt-2 w-full rounded-2xl bg-[#7ED087] py-3 font-black text-white active:scale-95"
            >
              Create ✨
            </button>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-[#EAF7FF] p-3">
          <p className="text-xs font-black text-[#2A6FE8]">📥 Restore on this device (from another phone/tablet)</p>
          <div className="mt-2 flex gap-2">
            <input
              value={restoreCode}
              onChange={(e) => setRestoreCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="🔑 CODE"
              className="w-full rounded-xl border-2 border-white bg-white px-3 py-2 text-center font-black tracking-widest text-[#2E2545] outline-none"
            />
            <button
              onClick={async () => {
                if (restoreCode.length < 6) return;
                try {
                  const res = await fetch(`/api/progress?code=${restoreCode}`);
                  if (!res.ok) {
                    setRestoreMsg("❌ Code not found");
                    sfx.wrong();
                    return;
                  }
                  const d = (await res.json()) as { data: Progress };
                  onRestore(d.data);
                  setRestoreMsg(`✅ Welcome back, ${d.data.name}!`);
                  sfx.reward();
                  window.setTimeout(onClose, 1200);
                } catch {
                  setRestoreMsg("⚠️ No internet");
                }
              }}
              className="shrink-0 rounded-xl bg-[#2A6FE8] px-4 py-2 font-black text-white active:scale-95"
            >
              Restore
            </button>
          </div>
          {restoreMsg && <p className="mt-1 text-xs font-black text-[#2A6FE8]">{restoreMsg}</p>}
        </div>

        <button onClick={onClose} className="mt-3 w-full rounded-2xl bg-[#F3EFFF] py-3 font-black text-[#5B4B7A]">Close</button>
      </div>
    </div>
  );
}

/* ============================== TRACE PICKER ============================ */

export const TRACE_SETS: { key: string; label: string; emoji: string; items: string[] }[] = [
  { key: "alphabet", label: "Letters", emoji: "🔤", items: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
  { key: "lower", label: "small abc", emoji: "🔡", items: "abcdefghijklmnopqrstuvwxyz".split("") },
  { key: "numbers", label: "Numbers", emoji: "🔢", items: "0123456789".split("") },
  { key: "shapes", label: "Shapes", emoji: "🔷", items: ["○", "□", "△", "☆", "♡", "◇", "▽", "⬡"] },
  { key: "animals", label: "Animals", emoji: "🐾", items: ["🐶", "🐱", "🐰", "🐻", "🦊", "🐼", "🦁", "🐸"] },
  { key: "words", label: "Words", emoji: "📚", items: ["CAT", "DOG", "SUN", "BUS", "STAR", "MOON", "FISH", "BIRD", "TREE", "MILK"] },
];
