"use client";

import { useCallback, useMemo, useState } from "react";
import { fx } from "@/components/FxLayer";
import { randomPraise, say, sfx } from "@/lib/audio";
import type { Progress } from "@/lib/progress";

type Pt = [number, number];

const rot = (p: Pt, a: number): Pt => [
  200 + (p[0] - 200) * Math.cos(a) - (p[1] - 200) * Math.sin(a),
  200 + (p[0] - 200) * Math.sin(a) + (p[1] - 200) * Math.cos(a),
];

function star(spikes: number, inner: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? 150 * inner : 150;
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push([200 + Math.cos(a) * r, 200 + Math.sin(a) * r]);
  }
  return pts;
}
function petal(n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 3; i++) {
    const t = (i / (n * 3)) * Math.PI * 2;
    const r = 90 + 55 * Math.cos(n * t);
    pts.push([200 + Math.cos(t) * r, 200 + Math.sin(t) * r]);
  }
  return pts;
}
function heart(n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([200 + x * 9, 200 - y * 9]);
  }
  return pts;
}
const FIXED: Record<string, Pt[]> = {
  house: [[80, 210], [200, 90], [320, 210], [290, 210], [290, 330], [230, 330], [230, 250], [170, 250], [170, 330], [110, 330], [110, 210]],
  fish: [[70, 200], [150, 130], [250, 130], [320, 175], [360, 110], [360, 290], [320, 225], [250, 270], [150, 270]],
  boat: [[60, 280], [340, 280], [300, 340], [100, 340], [100, 280], [200, 280], [200, 70], [300, 240], [200, 240]],
  tree: [[200, 60], [270, 160], [235, 160], [300, 250], [230, 250], [230, 340], [170, 340], [170, 250], [100, 250], [165, 160], [130, 160]],
  rocket: [[200, 50], [255, 150], [255, 250], [305, 320], [255, 305], [230, 350], [170, 350], [145, 305], [95, 320], [145, 250], [145, 150]],
  cat: [[110, 150], [140, 60], [190, 120], [210, 120], [260, 60], [290, 150], [300, 230], [250, 300], [150, 300], [100, 230]],
  butterfly: [[200, 110], [280, 50], [345, 130], [300, 200], [345, 275], [270, 345], [200, 280], [130, 345], [55, 275], [100, 200], [55, 130], [120, 50]],
  crown: [[70, 300], [80, 130], [140, 210], [200, 100], [260, 210], [320, 130], [330, 300]],
};

export interface Puzzle {
  id: number;
  name: string;
  emoji: string;
  color: string;
  pts: Pt[];
  difficulty: number;
}

const NAMES: [string, string, string][] = [
  ["star", "Star", "⭐"],
  ["flower", "Flower", "🌸"],
  ["heart", "Heart", "💖"],
  ["house", "House", "🏠"],
  ["fish", "Fish", "🐟"],
  ["boat", "Boat", "⛵"],
  ["tree", "Tree", "🌳"],
  ["rocket", "Rocket", "🚀"],
  ["cat", "Kitty", "🐱"],
  ["butterfly", "Butterfly", "🦋"],
];
const HUES = ["#FF5C7A", "#FFB03A", "#FFD84D", "#7ED087", "#38C6D9", "#5AC8FA", "#8E7CFF", "#FF7FB6", "#FF8A5B", "#4E9D5B"];

/** 100 procedurally varied puzzles (scales to any count). */
export function makePuzzles(count = 100): Puzzle[] {
  const list: Puzzle[] = [];
  for (let i = 0; i < count; i++) {
    const fam = i % 10;
    const v = Math.floor(i / 10);
    const [key, name, emoji] = NAMES[fam];
    let pts: Pt[];
    if (key === "star") pts = star(5 + (v % 4), 0.38 + (v % 3) * 0.08);
    else if (key === "flower") pts = petal(4 + (v % 4));
    else if (key === "heart") pts = heart(10 + v * 2);
    else pts = FIXED[key].map((p) => rot(p, ((v % 4) * Math.PI) / 24));
    if (v > 4) pts = pts.map((p) => rot(p, Math.PI / 12));
    list.push({
      id: i,
      name: `${name} ${v + 1}`,
      emoji,
      color: HUES[(i + v) % HUES.length],
      pts,
      difficulty: pts.length <= 10 ? 1 : pts.length <= 16 ? 2 : 3,
    });
  }
  return list;
}

export default function DotsGame({
  onExit,
  progress,
  update,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
}) {
  const puzzles = useMemo(() => makePuzzles(100), []);
  const [index, setIndex] = useState(0);
  const [next, setNext] = useState(0);
  const [done, setDone] = useState(false);
  const [showList, setShowList] = useState(false);
  const puzzle = puzzles[index];

  const load = useCallback((i: number) => {
    setIndex(i);
    setNext(0);
    setDone(false);
    setShowList(false);
    sfx.whoosh();
  }, []);

  const tapDot = (i: number, e: React.PointerEvent) => {
    if (done) return;
    if (i !== next) {
      sfx.wrong();
      fx.shake(10);
      return;
    }
    sfx.pop(Math.min(9, i));
    fx.burst(e.clientX, e.clientY, 10, [puzzle.color, "#FFF"], 220);
    const n = next + 1;
    setNext(n);
    if (n >= puzzle.pts.length) {
      setDone(true);
      sfx.celebrate();
      fx.confetti(140);
      fx.shake(12);
      say(`${randomPraise()} It is a ${puzzle.name.split(" ")[0]}!`, progress.lang);
      update({ stars: progress.stars + 2, coins: progress.coins + 5, bestDots: Math.max(progress.bestDots, index + 1) });
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(circle_at_50%_0%,#FFF6D9,transparent_60%)] bg-[#FFFBF2]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">
          {puzzle.emoji} {puzzle.name} <span className="text-xs text-[#B7A9D4]">#{index + 1}/100</span>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowList((s) => !s)} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Puzzle list">📋</button>
          <button onClick={() => load(index)} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Restart">🔄</button>
          <button onClick={() => load((index + 1) % puzzles.length)} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Next">➡️</button>
        </div>
      </div>

      {showList ? (
        <div className="grid flex-1 grid-cols-4 gap-2 overflow-y-auto p-3 sm:grid-cols-6 md:grid-cols-8">
          {puzzles.map((p, i) => (
            <button
              key={p.id}
              onClick={() => load(i)}
              className="rounded-2xl bg-white p-2 text-center shadow active:scale-95"
            >
              <div className="text-2xl">{p.emoji}</div>
              <div className="text-[10px] font-black text-[#7A6C99]">#{i + 1}</div>
              <div className="text-[10px]">{"⭐".repeat(p.difficulty)}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center p-2">
          <div className="aspect-square w-full max-w-[min(94vw,68vh)] rounded-[32px] bg-white shadow-[0_18px_50px_rgba(160,120,60,0.18)] ring-4 ring-white">
            <svg viewBox="0 0 400 400" className="h-full w-full touch-none select-none">
              {done && (
                <polygon
                  points={puzzle.pts.map((p) => p.join(",")).join(" ")}
                  fill={puzzle.color}
                  opacity={0.85}
                  stroke="#2E2545"
                  strokeWidth={6}
                  strokeLinejoin="round"
                />
              )}
              <polyline
                points={puzzle.pts.slice(0, next).map((p) => p.join(",")).join(" ")}
                fill="none"
                stroke={puzzle.color}
                strokeWidth={8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {done && (
                <line
                  x1={puzzle.pts[puzzle.pts.length - 1][0]}
                  y1={puzzle.pts[puzzle.pts.length - 1][1]}
                  x2={puzzle.pts[0][0]}
                  y2={puzzle.pts[0][1]}
                  stroke={puzzle.color}
                  strokeWidth={8}
                  strokeLinecap="round"
                />
              )}
              {puzzle.pts.map((p, i) => (
                <g key={i} onPointerDown={(e) => tapDot(i, e)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={p[0]}
                    cy={p[1]}
                    r={i === next && !done ? 21 : 15}
                    fill={i < next ? puzzle.color : "#FFFFFF"}
                    stroke={i === next && !done ? "#FF5C7A" : "#2E2545"}
                    strokeWidth={i === next && !done ? 6 : 4}
                  >
                    {i === next && !done && (
                      <animate attributeName="r" values="19;24;19" dur="0.9s" repeatCount="indefinite" />
                    )}
                  </circle>
                  <text
                    x={p[0]}
                    y={p[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={14}
                    fontWeight={900}
                    fill={i < next ? "#FFFFFF" : "#2E2545"}
                    pointerEvents="none"
                  >
                    {i + 1}
                  </text>
                </g>
              ))}
              {done && (
                <text x="200" y="60" textAnchor="middle" fontSize="46">
                  {puzzle.emoji}
                </text>
              )}
            </svg>
          </div>
        </div>
      )}

      {done && !showList && (
        <div className="p-3">
          <button
            onClick={() => load((index + 1) % puzzles.length)}
            className="mx-auto block rounded-3xl bg-gradient-to-r from-[#FFB03A] to-[#FF7FB6] px-8 py-4 text-xl font-black text-white shadow-xl active:scale-95"
          >
            🎉 Next Puzzle →
          </button>
        </div>
      )}
    </div>
  );
}
