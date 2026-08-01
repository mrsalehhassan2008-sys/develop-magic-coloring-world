"use client";

import { useCallback, useEffect, useState } from "react";
import { fx } from "@/components/FxLayer";
import { randomPraise, say, sfx } from "@/lib/audio";
import { buddySpeak } from "@/components/Buddy";
import type { Progress } from "@/lib/progress";

const POOL = [
  "🐶", "🐱", "🐰", "🐻", "🦊", "🐼", "🦁", "🐸", "🐵", "🐮", "🐷", "🐔",
  "🦄", "🐧", "🦉", "🐢", "🐙", "🦋", "🐠", "🐬", "🚗", "🚀", "✈️", "⛵",
  "🍎", "🍌", "🍓", "🌸", "🌻", "⭐", "🎈", "🎂", "🍦", "🐝", "🦖", "🐘",
];

/** look-alike groups make higher levels a real discrimination challenge */
const SIMILAR: string[][] = [
  ["🐱", "🦁", "🐼", "🐨", "🐯", "🐺"],
  ["🐶", "🐺", "🦊", "🐵"],
  ["🐟", "🐠", "🐡", "🐬", "🐳", "🐙"],
  ["🚗", "🚕", "🚙", "🚌", "🏎️"],
  ["🍎", "🍅", "🍓", "🎈"],
  ["🌸", "🌺", "🌻", "🌷", "🌼"],
  ["🐦", "🐤", "🦆", "🦉", "🐧"],
  ["🍦", "🍧", "🍨", "🎂", "🧁"],
];

function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const groupOf = (emoji: string) => SIMILAR.find((g) => g.includes(emoji));

export default function ShadowGame({
  onExit,
  progress,
  update,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
}) {
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState("🐶");
  const [options, setOptions] = useState<{ e: string; rot: number }[]>([]);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const level = Math.min(4, 1 + Math.floor(round / 3));
  const count = Math.min(6, 2 + level); // 3 -> 6 shadows

  const newRound = useCallback(
    (r: number) => {
      const lv = Math.min(4, 1 + Math.floor(r / 3));
      const n = Math.min(6, 2 + lv);
      const t = POOL[(Math.random() * POOL.length) | 0];
      // harder levels pull distractors from the target's look-alike family
      let pool: string[];
      const grp = groupOf(t);
      if (lv >= 2 && grp) {
        pool = [...shuffle(grp.filter((g) => g !== t)), ...shuffle(POOL).filter((p) => p !== t && !grp.includes(p))];
      } else {
        pool = shuffle(POOL).filter((p) => p !== t);
      }
      const distract = pool.slice(0, n - 1);
      const opts = shuffle([t, ...distract]).map((e) => ({
        e,
        // top level tilts the shadows to make matching trickier
        rot: lv >= 4 && e !== t ? Math.round((Math.random() - 0.5) * 36) : 0,
      }));
      setTarget(t);
      setOptions(opts);
      setPicked(null);
      setWrong(null);
      say(lv >= 3 ? "Look carefully! Which shadow matches?" : "Find the matching shadow!", progress.lang);
    },
    [progress.lang],
  );

  useEffect(() => {
    newRound(0);
  }, [newRound]);

  const choose = (emoji: string, e: React.PointerEvent) => {
    if (picked) return;
    if (emoji === target) {
      setPicked(emoji);
      const ns = score + 1;
      setScore(ns);
      sfx.star();
      fx.burst(e.clientX, e.clientY, 24, ["#FFD84D", "#7ED087", "#FFFFFF"], 360);
      fx.ring(e.clientX, e.clientY, "#7ED087");
      fx.confetti(40);
      if (ns % 3 === 0 && progress.buddyOn) buddySpeak("praise");
      else say(randomPraise(progress.lang), progress.lang);
      update({ bestShadow: Math.max(progress.bestShadow, ns), stars: progress.stars + 1, coins: progress.coins + 2 });
      window.setTimeout(() => {
        const nr = round + 1;
        setRound(nr);
        newRound(nr);
      }, 1100);
    } else {
      setWrong(emoji);
      sfx.wrong();
      fx.shake(10);
      window.setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(circle_at_50%_0%,#E7F0FF,transparent_60%)] bg-[#F3F7FF]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">🌑 Shadow Match</div>
        <div className="rounded-full bg-[#FFF3CC] px-3 py-1.5 text-sm font-black text-[#8A6A1F] shadow">
          {"⭐".repeat(level)} Level {level}
        </div>
        <div className="ml-auto rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">⭐ {score}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 p-4">
        <p className="text-center text-lg font-black text-[#5B4B7A]">
          {level >= 4 ? "Tricky! The shadows are tilted! 🌀" : level >= 2 ? "Careful - they look alike! 👀" : "Which shadow matches?"}
        </p>
        <div className="grid aspect-square w-40 place-items-center rounded-[36px] bg-white text-8xl shadow-[0_18px_40px_rgba(90,120,200,.25)] ring-4 ring-white sm:w-52 sm:text-9xl">
          {target}
        </div>

        <div className={`grid gap-3 ${count <= 3 ? "grid-cols-3" : count <= 4 ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-6"}`}>
          {options.map((o, i) => {
            const solved = picked === o.e;
            return (
              <button
                key={`${o.e}${i}`}
                onPointerDown={(e) => choose(o.e, e)}
                className={`grid aspect-square w-20 place-items-center rounded-3xl bg-white text-5xl shadow-lg transition active:scale-90 sm:w-24 sm:text-6xl ${
                  wrong === o.e ? "animate-[buddyWave_.4s] ring-4 ring-[#FF5C7A]" : solved ? "ring-4 ring-[#7ED087]" : ""
                }`}
                style={{ filter: solved ? "none" : "brightness(0) opacity(0.82)" }}
                aria-label="shadow"
              >
                <span style={{ display: "inline-block", transform: `rotate(${o.rot}deg)` }}>{o.e}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
