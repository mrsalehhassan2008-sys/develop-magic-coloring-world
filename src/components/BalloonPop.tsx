"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fx } from "@/components/FxLayer";
import { randomPraise, say, sfx } from "@/lib/audio";
import type { Progress } from "@/lib/progress";

type Mode = "colors" | "letters" | "numbers" | "animals";
type Phase = "ready" | "playing" | "paused" | "over";

interface Balloon {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  color: string;
  label: string;
  key: string;
  match: boolean;
  pop: number;
  squash: number;
}

interface ScoreRow {
  id: number;
  playerName: string;
  score: number;
  combo: number;
}

const COLORS: [string, string][] = [
  ["#FF4D5E", "red"],
  ["#FF8A3D", "orange"],
  ["#FFD31F", "yellow"],
  ["#3FC463", "green"],
  ["#35B8F0", "blue"],
  ["#8E7CFF", "purple"],
  ["#FF7FB6", "pink"],
  ["#8B5E3C", "brown"],
];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBERS = "123456789".split("");
const ANIMALS: [string, string][] = [
  ["🐶", "dog"],
  ["🐱", "cat"],
  ["🐭", "mouse"],
  ["🐰", "rabbit"],
  ["🦊", "fox"],
  ["🐻", "bear"],
  ["🐼", "panda"],
  ["🦁", "lion"],
  ["🐮", "cow"],
  ["🐷", "pig"],
  ["🐸", "frog"],
  ["🐵", "monkey"],
];

const rnd = <T,>(a: T[]): T => a[(Math.random() * a.length) | 0];

export default function BalloonPop({
  onExit,
  progress,
  update,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
}) {
  const [mode, setMode] = useState<Mode>("colors");
  const [phase, setPhase] = useState<Phase>("ready");
  const [hud, setHud] = useState({ score: 0, combo: 1, lives: 3, best: 0, level: 1 });
  const [target, setTarget] = useState<{ label: string; spoken: string; color: string }>({
    label: "🎈",
    spoken: "red",
    color: "#FF4D5E",
  });
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const game = useRef({
    balloons: [] as Balloon[],
    score: 0,
    combo: 1,
    lives: 3,
    level: 1,
    hits: 0,
    shots: 0,
    spawn: 0,
    t: 0,
    cursor: { x: 0.5, y: 0.7 },
    target: { kind: "", label: "", spoken: "", color: "#FF4D5E" },
    phase: "ready" as Phase,
    mode: "colors" as Mode,
    w: 0,
    h: 0,
  });

  const loadScores = useCallback(async () => {
    try {
      const res = await fetch("/api/scores?mode=balloon");
      const data = (await res.json()) as { scores: ScoreRow[] };
      setScores(data.scores ?? []);
    } catch {
      /* offline: local best only */
    }
  }, []);

  useEffect(() => {
    void loadScores();
    setHud((h) => ({ ...h, best: progress.bestBalloon }));
  }, [loadScores, progress.bestBalloon]);

  const newTarget = useCallback((speak = true) => {
    const g = game.current;
    if (g.mode === "colors") {
      const [color, name] = rnd(COLORS);
      g.target = { kind: "color", label: "🎈", spoken: name, color };
    } else if (g.mode === "letters") {
      const l = rnd(LETTERS);
      g.target = { kind: "letter", label: l, spoken: `the letter ${l}`, color: "#8E7CFF" };
    } else if (g.mode === "numbers") {
      const n = rnd(NUMBERS);
      g.target = { kind: "number", label: n, spoken: `number ${n}`, color: "#35B8F0" };
    } else {
      const [emoji, name] = rnd(ANIMALS);
      g.target = { kind: "animal", label: emoji, spoken: name, color: "#3FC463" };
    }
    setTarget({ label: g.target.label, spoken: g.target.spoken, color: g.target.color });
    if (speak) say(`Pop ${g.target.spoken}!`, progress.lang);
  }, [progress.lang]);

  const spawn = useCallback(() => {
    const g = game.current;
    const wantMatch = Math.random() < 0.42;
    let color = rnd(COLORS)[0];
    let label = "";
    let match = false;
    if (g.target.kind === "color") {
      if (wantMatch) {
        color = g.target.color;
        match = true;
      } else {
        const other = COLORS.filter((c) => c[0] !== g.target.color);
        color = rnd(other)[0];
      }
    } else {
      const pool = g.mode === "letters" ? LETTERS : g.mode === "numbers" ? NUMBERS : ANIMALS.map((a) => a[0]);
      label = wantMatch ? g.target.label : rnd(pool.filter((p) => p !== g.target.label));
      match = label === g.target.label;
      color = rnd(COLORS)[0];
    }
    const r = 34 + Math.random() * 14;
    g.balloons.push({
      x: r + 20 + Math.random() * Math.max(40, g.w - 2 * r - 40),
      y: g.h + r + 20,
      r,
      vy: (52 + Math.random() * 26) * (1 + g.level * 0.09),
      sway: 18 + Math.random() * 28,
      phase: Math.random() * 6.28,
      color,
      label,
      key: `${Date.now()}${Math.random()}`,
      match,
      pop: 0,
      squash: 0,
    });
  }, []);

  const start = useCallback(
    (m: Mode) => {
      const g = game.current;
      g.mode = m;
      g.balloons = [];
      g.score = 0;
      g.combo = 1;
      g.lives = 3;
      g.level = 1;
      g.hits = 0;
      g.shots = 0;
      g.spawn = 0;
      g.phase = "playing";
      setMode(m);
      setPhase("playing");
      setHud({ score: 0, combo: 1, lives: 3, best: progress.bestBalloon, level: 1 });
      newTarget();
      sfx.star();
    },
    [newTarget, progress.bestBalloon],
  );

  const syncHud = () => {
    const g = game.current;
    setHud((h) => ({ ...h, score: g.score, combo: g.combo, lives: g.lives, level: g.level }));
  };

  const endGame = useCallback(async () => {
    const g = game.current;
    g.phase = "over";
    setPhase("over");
    sfx.wrong();
    fx.shake(22);
    const best = Math.max(progress.bestBalloon, g.score);
    update({ bestBalloon: best, coins: progress.coins + Math.floor(g.score / 200), stars: progress.stars + (g.score > 1500 ? 2 : 1) });
    setHud((h) => ({ ...h, best }));
    say(g.score > 1000 ? "Wow! Great score!" : "Good try! Play again!", progress.lang);
    setSaving(true);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "balloon",
          playerName: progress.name,
          score: g.score,
          combo: g.combo,
          accuracy: g.shots ? Math.round((g.hits / g.shots) * 100) : 0,
        }),
      });
      const data = (await res.json()) as { scores: ScoreRow[] };
      setScores(data.scores ?? []);
    } catch {
      /* offline */
    }
    setSaving(false);
  }, [progress, update]);

  const popAt = useCallback(
    (cx: number, cy: number, clientX: number, clientY: number) => {
      const g = game.current;
      if (g.phase !== "playing") return;
      const hit = g.balloons.find((b) => b.pop === 0 && Math.hypot(b.x - cx, b.y - cy) < b.r * 1.25);
      if (!hit) return;
      g.shots++;
      hit.pop = 0.001;
      if (hit.match) {
        g.hits++;
        g.combo = Math.min(9, g.combo + 1);
        const gain = 100 * g.combo;
        g.score += gain;
        sfx.pop(g.combo);
        fx.burst(clientX, clientY, 22, [hit.color, "#FFFFFF", "#FFD84D"], 380);
        fx.ring(clientX, clientY, hit.color);
        fx.float(clientX, clientY - 20, `+${gain}`, "#FFF");
        fx.shake(5 + g.combo);
        if (g.combo >= 4 && g.combo % 3 === 1) {
          fx.confetti(40);
          say(randomPraise(), progress.lang);
        }
        if (g.hits % 5 === 0) {
          g.level++;
          newTarget();
        }
      } else {
        g.combo = 1;
        g.lives--;
        sfx.wrong();
        fx.burst(clientX, clientY, 10, ["#B4B0C8"], 200);
        fx.shake(16);
        if (g.lives <= 0) void endGame();
      }
      syncHud();
    },
    [endGame, newTarget, progress.lang],
  );

  /* --------------------------- render + loop ---------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      game.current.w = rect.width;
      game.current.h = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const clouds = Array.from({ length: 7 }, () => ({
      x: Math.random(),
      y: Math.random() * 0.6,
      s: 0.5 + Math.random(),
      v: 0.004 + Math.random() * 0.01,
    }));

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = game.current;
      const { w, h } = g;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#BFE9FF");
      sky.addColorStop(0.55, "#DFF3FF");
      sky.addColorStop(1, "#FFF0F8");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      clouds.forEach((c) => {
        c.x += c.v * dt;
        if (c.x > 1.2) c.x = -0.2;
        const cx = c.x * w;
        const cy = c.y * h * 0.9 + 30;
        const s = 26 * c.s;
        [[-s, 0, s], [0, -s * 0.5, s * 1.25], [s, 0, s * 0.9]].forEach(([ox, oy, r]) => {
          ctx.beginPath();
          ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      // hills
      ctx.fillStyle = "#B8ECC0";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.quadraticCurveTo(w * 0.25, h - 90, w * 0.5, h - 40);
      ctx.quadraticCurveTo(w * 0.8, h + 10, w, h - 70);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      if (g.phase === "playing") {
        g.t += dt;
        g.spawn -= dt;
        if (g.spawn <= 0) {
          spawn();
          g.spawn = Math.max(0.34, 1.05 - g.level * 0.05);
        }
      }

      for (let i = g.balloons.length - 1; i >= 0; i--) {
        const b = g.balloons[i];
        if (b.pop > 0) {
          b.pop += dt * 5;
          if (b.pop > 1) {
            g.balloons.splice(i, 1);
            continue;
          }
        } else if (g.phase === "playing") {
          b.y -= b.vy * dt;
          b.phase += dt * 2;
          b.x += Math.sin(b.phase) * b.sway * dt;
          if (b.y < -b.r * 2.4) {
            g.balloons.splice(i, 1);
            if (b.match) {
              g.combo = 1;
              g.lives--;
              sfx.wrong();
              fx.shake(10);
              syncHud();
              if (g.lives <= 0) void endGame();
            }
            continue;
          }
        }

        const scale = b.pop > 0 ? 1 + b.pop * 0.7 : 1 + Math.sin(b.phase * 2) * 0.03;
        const alpha = b.pop > 0 ? Math.max(0, 1 - b.pop) : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(b.x, b.y);
        ctx.scale(scale, scale * (b.pop > 0 ? 0.85 : 1));
        // string
        ctx.strokeStyle = "rgba(70,60,100,.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, b.r * 1.15);
        ctx.quadraticCurveTo(10, b.r * 1.6, 0, b.r * 2.1);
        ctx.stroke();
        // body
        const grad = ctx.createRadialGradient(-b.r * 0.35, -b.r * 0.45, b.r * 0.1, 0, 0, b.r * 1.25);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(0.28, b.color);
        grad.addColorStop(1, shade(b.color, -28));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.r, b.r * 1.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "rgba(46,37,69,.32)";
        ctx.stroke();
        // knot
        ctx.fillStyle = shade(b.color, -30);
        ctx.beginPath();
        ctx.moveTo(-6, b.r * 1.1);
        ctx.lineTo(6, b.r * 1.1);
        ctx.lineTo(0, b.r * 1.28);
        ctx.closePath();
        ctx.fill();
        // shine
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.beginPath();
        ctx.ellipse(-b.r * 0.34, -b.r * 0.44, b.r * 0.19, b.r * 0.3, -0.5, 0, Math.PI * 2);
        ctx.fill();
        if (b.label) {
          ctx.font = `900 ${b.r * 0.95}px system-ui, "Apple Color Emoji", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "rgba(46,37,69,.5)";
          ctx.lineWidth = 4;
          ctx.strokeText(b.label, 0, 2);
          ctx.fillText(b.label, 0, 2);
        }
        ctx.restore();
      }

      // keyboard reticle
      if (g.phase === "playing") {
        const cx = g.cursor.x * w;
        const cy = g.cursor.y * h;
        ctx.strokeStyle = "rgba(46,37,69,.35)";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, 26 + Math.sin(g.t * 6) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [endGame, spawn]);

  /* ------------------------------ controls ------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const g = game.current;
      if (e.key === "Escape") {
        if (g.phase === "playing") {
          g.phase = "paused";
          setPhase("paused");
        } else onExit();
        return;
      }
      if (e.key === "p" || e.key === "P") {
        if (g.phase === "playing") {
          g.phase = "paused";
          setPhase("paused");
        } else if (g.phase === "paused") {
          g.phase = "playing";
          setPhase("playing");
        }
        return;
      }
      if (g.phase === "ready" || g.phase === "over") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          start(g.mode);
        }
        return;
      }
      if (g.phase !== "playing") return;
      const step = 0.06;
      if (e.key === "ArrowLeft") g.cursor.x = Math.max(0.03, g.cursor.x - step);
      else if (e.key === "ArrowRight") g.cursor.x = Math.min(0.97, g.cursor.x + step);
      else if (e.key === "ArrowUp") g.cursor.y = Math.max(0.05, g.cursor.y - step);
      else if (e.key === "ArrowDown") g.cursor.y = Math.min(0.95, g.cursor.y + step);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        const cx = g.cursor.x * g.w;
        const cy = g.cursor.y * g.h;
        popAt(cx, cy, (rect?.left ?? 0) + cx, (rect?.top ?? 0) + cy);
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        const want = e.key.toUpperCase();
        const b = g.balloons.filter((x) => x.pop === 0 && x.label === want).sort((a, c) => a.y - c.y)[0];
        if (b) {
          const rect = canvasRef.current?.getBoundingClientRect();
          popAt(b.x, b.y, (rect?.left ?? 0) + b.x, (rect?.top ?? 0) + b.y);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit, popAt, start]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    popAt(e.clientX - rect.left, e.clientY - rect.top, e.clientX, e.clientY);
  };

  const MODES: { id: Mode; label: string; emoji: string }[] = [
    { id: "colors", label: "Colors", emoji: "🎨" },
    { id: "letters", label: "Letters", emoji: "🔤" },
    { id: "numbers", label: "Numbers", emoji: "🔢" },
    { id: "animals", label: "Animals", emoji: "🐾" },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#DFF3FF]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="flex items-center gap-2 rounded-full bg-white/85 px-4 py-1.5 shadow">
          <span className="text-xl font-black text-[#2E2545]">{hud.score}</span>
          <span className="text-xs font-black text-[#8E7CFF]">x{hud.combo}</span>
        </div>
        <div className="rounded-full bg-white/85 px-3 py-1.5 text-lg shadow">{"❤️".repeat(Math.max(0, hud.lives))}{"🤍".repeat(Math.max(0, 3 - hud.lives))}</div>
        <div className="ml-auto flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black text-white shadow" style={{ background: target.color }}>
          <span className="text-xl">{target.label}</span>
          <span>POP {target.spoken.toUpperCase()}</span>
        </div>
        <button
          onClick={() => {
            const g = game.current;
            if (g.phase === "playing") {
              g.phase = "paused";
              setPhase("paused");
            } else if (g.phase === "paused") {
              g.phase = "playing";
              setPhase("playing");
            }
          }}
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90"
          aria-label="Pause"
        >
          {phase === "paused" ? "▶️" : "⏸️"}
        </button>
      </div>

      <div className="relative min-h-0 flex-1 px-2 pb-2">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointer}
          className="h-full w-full touch-none rounded-3xl shadow-inner"
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center rounded-3xl bg-[#2E2545]/45 p-3 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[32px] bg-white p-5 text-center shadow-2xl">
              {phase === "ready" && (
                <>
                  <div className="text-5xl">🎈</div>
                  <h2 className="mt-1 text-2xl font-black text-[#2E2545]">Balloon Pop</h2>
                  <p className="text-sm font-bold text-[#7A6C99]">Pop only the balloons the game asks for!</p>
                </>
              )}
              {phase === "paused" && <h2 className="text-2xl font-black text-[#2E2545]">⏸️ Paused</h2>}
              {phase === "over" && (
                <>
                  <div className="text-5xl">🏁</div>
                  <h2 className="text-2xl font-black text-[#2E2545]">Score {hud.score}</h2>
                  <p className="text-sm font-black text-[#FF7FB6]">Best {hud.best}</p>
                </>
              )}

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      game.current.mode = m.id;
                      sfx.tap();
                    }}
                    className={`rounded-2xl px-3 py-2 text-sm font-black shadow ${mode === m.id ? "bg-[#8E7CFF] text-white" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>

              {phase === "paused" ? (
                <button
                  onClick={() => {
                    game.current.phase = "playing";
                    setPhase("playing");
                  }}
                  className="mt-4 w-full rounded-3xl bg-gradient-to-r from-[#7ED087] to-[#38C6D9] py-4 text-xl font-black text-white shadow-lg active:scale-95"
                >
                  ▶️ Keep Playing
                </button>
              ) : (
                <button
                  onClick={() => start(mode)}
                  className="mt-4 w-full rounded-3xl bg-gradient-to-r from-[#FF7FB6] to-[#FFB03A] py-4 text-xl font-black text-white shadow-lg active:scale-95"
                >
                  {phase === "over" ? "🔁 Play Again" : "▶️ Start"} <span className="text-xs opacity-80">(Space)</span>
                </button>
              )}

              <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl bg-[#FBF7FF] p-2 text-left">
                <p className="mb-1 text-center text-xs font-black uppercase tracking-wide text-[#8E7CFF]">
                  🏆 Top Poppers {saving ? "…" : ""}
                </p>
                {scores.length === 0 && <p className="text-center text-xs font-bold text-[#A99CC4]">Be the first!</p>}
                {scores.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between px-2 py-0.5 text-sm font-black text-[#5B4B7A]">
                    <span>{["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`} {s.playerName}</span>
                    <span>{s.score}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#A99CC4]">Tap balloons · Arrows + Space · Type letters/numbers · P to pause</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `rgb(${r},${g},${b})`;
}
