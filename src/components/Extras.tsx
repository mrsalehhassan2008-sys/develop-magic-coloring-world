"use client";

import { useCallback, useEffect, useState } from "react";
import { fx } from "@/components/FxLayer";
import { say, setAudioSetting, setVoiceType, type VoiceType, sfx } from "@/lib/audio";
import { LANGS, type Progress } from "@/lib/progress";

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
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  reset: () => void;
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
          <Row label="Voice type">
            <select
              value={progress.voiceType}
              onChange={(e) => {
                update({ voiceType: e.target.value as VoiceType });
                setVoiceType(e.target.value as VoiceType);
                say("Hello! I am your friend!", progress.lang);
              }}
              className="rounded-xl border-2 border-[#EDE6FF] px-3 py-2 text-sm font-black text-[#2E2545] outline-none focus:border-[#8E7CFF]"
            >
              <option value="friendly">🌟 Friendly</option>
              <option value="teacher-male">👨‍🏫 Teacher (Male)</option>
              <option value="teacher-female">👩‍🏫 Teacher (Female)</option>
              <option value="kid-boy">👦 Kid Boy</option>
              <option value="kid-girl">👧 Kid Girl</option>
            </select>
          </Row>
          <Row label="🗣️ Talking Companion">
            <Switch
              on={progress.companionMode}
              onChange={(v) => {
                update({ companionMode: v });
                if (v) {
                  say(`Hello ${progress.name}! I'm your art buddy!`, progress.lang);
                }
              }}
            />
          </Row>
          {progress.companionMode && (
            <Row label="Companion volume">
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={progress.companionVolume}
                onChange={(e) => update({ companionVolume: Number(e.target.value) })}
                className="w-32 accent-[#FFB03A]"
                aria-label="Companion volume"
              />
            </Row>
          )}
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
          <Row label="🌙 Dark mode">
            <Switch on={progress.darkMode} onChange={(v) => update({ darkMode: v })} />
          </Row>
        </Card>

        <Card title="🌍 Language">
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  update({ lang: l.code });
                  say("Hello!", l.code);
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
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A] hover:bg-[#E8E0F5]"
            >
              📄 Privacy Policy
            </a>
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A] hover:bg-[#E8E0F5]"
            >
              📜 Terms of Service
            </a>
            <a
              href="mailto:support@magiccoloringworld.com"
              className="rounded-xl bg-[#F3EFFF] px-3 py-2 text-xs font-black text-[#5B4B7A] hover:bg-[#E8E0F5]"
            >
              📧 Contact us
            </a>
            <button
              onClick={() => {
                sfx.star();
                say("Thank you for rating us!", progress.lang);
                window.open("https://play.google.com/store/apps", "_blank");
              }}
              className="rounded-xl bg-[#FFF2CC] px-3 py-2 text-xs font-black text-[#8A6A1F] hover:bg-[#FFE9A8]"
            >
              ⭐ Rate the app
            </button>
            <button
              onClick={() => {
                if (window.confirm("Reset all progress, stars and coins?")) reset();
              }}
              className="rounded-xl bg-[#FFE9EF] px-3 py-2 text-xs font-black text-[#C23B5E] hover:bg-[#FFD9E4]"
            >
              🗑️ Reset progress
            </button>
          </div>
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

/* ============================== TRACE PICKER ============================ */

export const TRACE_SETS: { key: string; label: string; emoji: string; items: string[] }[] = [
  { key: "alphabet", label: "Letters", emoji: "🔤", items: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
  { key: "lower", label: "small abc", emoji: "🔡", items: "abcdefghijklmnopqrstuvwxyz".split("") },
  { key: "numbers", label: "Numbers", emoji: "🔢", items: "0123456789".split("") },
  { key: "shapes", label: "Shapes", emoji: "🔷", items: ["○", "□", "△", "☆", "♡", "◇", "▽", "⬡"] },
  { key: "animals", label: "Animals", emoji: "🐾", items: ["🐶", "🐱", "🐰", "🐻", "🦊", "🐼", "🦁", "🐸"] },
  { key: "words", label: "Words", emoji: "📚", items: ["CAT", "DOG", "SUN", "BUS", "STAR", "MOON", "FISH", "BIRD", "TREE", "MILK"] },
];
