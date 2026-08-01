"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageArt, Shape } from "@/lib/art/shapes";
import { PALETTES, STICKER_PACKS, Swatch } from "@/lib/palette";
import { randomPraise, say, sfx } from "@/lib/audio";
import { buddySpeak } from "@/components/Buddy";
import { isBrushPremium, isStickerPackPremium } from "@/lib/premium";
import { fx } from "@/components/FxLayer";
import type { Progress } from "@/lib/progress";

/* ------------------------------- tools ---------------------------------- */

export interface ToolDef {
  id: string;
  label: string;
  emoji: string;
  size: number;
  opacity: number;
  cap: "round" | "butt" | "square";
  dash?: string;
  glow?: boolean;
  blur?: number;
  paint?: "color" | "rainbow" | "glitter";
}

export const TOOLS: ToolDef[] = [
  { id: "bucket", label: "Fill", emoji: "🪣", size: 0, opacity: 1, cap: "round" },
  { id: "brush", label: "Brush", emoji: "🖌️", size: 16, opacity: 1, cap: "round" },
  { id: "crayon", label: "Crayon", emoji: "🖍️", size: 20, opacity: 0.85, cap: "round", dash: "14 3" },
  { id: "marker", label: "Marker", emoji: "🖊️", size: 22, opacity: 0.65, cap: "square" },
  { id: "pencil", label: "Pencil", emoji: "✏️", size: 5, opacity: 0.9, cap: "round" },
  { id: "water", label: "Watercolor", emoji: "💧", size: 40, opacity: 0.3, cap: "round", blur: 6 },
  { id: "air", label: "Air Brush", emoji: "🎐", size: 46, opacity: 0.2, cap: "round", blur: 10 },
  { id: "glitter", label: "Glitter", emoji: "✨", size: 18, opacity: 1, cap: "round", dash: "1 14", paint: "glitter" },
  { id: "rainbow", label: "Rainbow", emoji: "🌈", size: 24, opacity: 1, cap: "round", paint: "rainbow" },
  { id: "neon", label: "Neon", emoji: "💡", size: 14, opacity: 1, cap: "round", glow: true },
  { id: "magic", label: "Magic", emoji: "🪄", size: 20, opacity: 0.95, cap: "round", glow: true, paint: "rainbow" },
  { id: "pattern", label: "Pattern", emoji: "🔵", size: 22, opacity: 1, cap: "round", dash: "1 26" },
  { id: "texture", label: "Texture", emoji: "🧱", size: 24, opacity: 0.8, cap: "butt", dash: "12 7" },
  { id: "sticker", label: "Stickers", emoji: "🌟", size: 0, opacity: 1, cap: "round" },
  { id: "eraser", label: "Eraser", emoji: "🧽", size: 30, opacity: 1, cap: "round" },
];

interface Stroke {
  id: string;
  tool: string;
  color: string;
  size: number;
  opacity: number;
  d: string;
}
interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  s: number;
  r: number;
}
interface Snapshot {
  fills: Record<string, string>;
  strokes: Stroke[];
  stickers: Sticker[];
}

const BASE_FILL = "#FFFFFF";

/* --------------------------- shape renderer ------------------------------ */

export function ShapeEl({
  s,
  fill,
  onPick,
}: {
  s: Shape;
  fill: string;
  onPick?: (id: string, e: React.PointerEvent) => void;
}) {
  const stroke = s.sc ?? "#2E2545";
  const sw = s.sw ?? 5;
  const common = {
    fill: s.k === "line" ? "none" : fill,
    stroke,
    strokeWidth: sw,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
    onPointerDown: onPick ? (e: React.PointerEvent) => onPick(s.id, e) : undefined,
    style: onPick ? { cursor: "pointer" } : undefined,
  };
  if (s.k === "ellipse")
    return (
      <ellipse
        {...common}
        cx={s.cx}
        cy={s.cy}
        rx={s.rx}
        ry={s.ry}
        transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined}
      />
    );
  if (s.k === "rect")
    return (
      <rect
        {...common}
        x={s.x}
        y={s.y}
        width={s.w}
        height={s.h}
        rx={s.r ?? 8}
        transform={s.rot ? `rotate(${s.rot} ${(s.x ?? 0) + (s.w ?? 0) / 2} ${(s.y ?? 0) + (s.h ?? 0) / 2})` : undefined}
      />
    );
  if (s.k === "poly") {
    const pts = (s.pts ?? []).reduce<string[]>((acc, n, i) => {
      if (i % 2 === 0) acc.push(`${n}`);
      else acc[acc.length - 1] += `,${n}`;
      return acc;
    }, []);
    return <polygon {...common} points={pts.join(" ")} transform={s.rot ? `rotate(${s.rot} 200 200)` : undefined} />;
  }
  return <path {...common} d={s.d} transform={s.rot ? `rotate(${s.rot} 200 200)` : undefined} />;
}

export function PagePreview({ art, className }: { art: PageArt; className?: string }) {
  return (
    <svg viewBox={art.viewBox} className={className} aria-hidden>
      {art.shapes.map((s) => (
        <ShapeEl key={s.id} s={s} fill={s.c} />
      ))}
    </svg>
  );
}

/* -------------------------------- studio -------------------------------- */

export default function Studio({
  art,
  traceGlyph,
  drawMode,
  onExit,
  progress,
  update,
  onNeedPremium,
  onCoopJoin,
}: {
  art: PageArt | null;
  traceGlyph?: string;
  drawMode?: "blank" | "grid" | "mirror";
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onNeedPremium?: () => void;
  onCoopJoin?: (p: PageArt) => void;
}) {
  const [fills, setFills] = useState<Record<string, string>>({});
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [tool, setTool] = useState("bucket");
  const [swatch, setSwatch] = useState<Swatch>({ id: "#FF5C7A", color: "#FF5C7A" });
  const [paletteKey, setPaletteKey] = useState("classic");
  const [sizeMul, setSizeMul] = useState(1);
  const [alphaMul, setAlphaMul] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rot, setRot] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mirror, setMirror] = useState(drawMode === "mirror");
  const [grid, setGrid] = useState(drawMode === "grid");
  const [stickerPack, setStickerPack] = useState(0);
  const [activeSticker, setActiveSticker] = useState("⭐");
  const [showStickers, setShowStickers] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [refModal, setRefModal] = useState(false);
  const [showHint, setShowHint] = useState(!progress.seenHint && !!art);
  const [compare, setCompare] = useState(false);

  // ---- live co-op coloring ----
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [coopModal, setCoopModal] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [coopNames, setCoopNames] = useState<string[]>([]);
  const fillsRef = useRef<Record<string, string>>({});
  const stickersRef = useRef<Sticker[]>([]);
  const localEditsRef = useRef<Record<string, number>>({});
  const fullSyncRef = useRef(0);
  const lastPullRef = useRef(0);
  const pushTimer = useRef<number | null>(null);
  fillsRef.current = fills;
  stickersRef.current = stickers;
  const [cbn, setCbn] = useState(false); // color-by-number mode
  const [activeNum, setActiveNum] = useState(1);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const undoStack = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  const drawing = useRef<{ pts: number[]; id: string } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const [histLen, setHistLen] = useState(0);
  const [redoLen, setRedoLen] = useState(0);
  const syncHistory = useCallback(() => {
    setHistLen(undoStack.current.length);
    setRedoLen(redoStack.current.length);
  }, []);

  const toolDef = TOOLS.find((t) => t.id === tool) ?? TOOLS[1];
  const fillableCount = useMemo(() => (art ? art.shapes.filter((s) => s.f !== false).length : 0), [art]);

  // progress % of the current coloring page (only counts real fillable regions)
  const filledCount = useMemo(() => {
    if (!art) return 0;
    return art.shapes.filter((s) => s.f !== false && fills[s.id]).length;
  }, [art, fills]);
  const progressPct = fillableCount ? Math.min(100, Math.round((filledCount / fillableCount) * 100)) : 0;

  // canvas dimensions follow the artwork's viewBox (400x400 pages OR 800x600 scenes)
  const [vbW, vbH] = useMemo(() => {
    const parts = (art?.viewBox ?? "0 0 400 400").split(/\s+/).map(Number);
    const w = parts[2] || 400;
    const h = parts[3] || 400;
    return [w, h];
  }, [art]);

  /* -------- Color-by-number: map every suggested colour to a number ------ */
  const { legend, colorToNum } = useMemo(() => {
    const map = new Map<string, number>();
    const leg: { num: number; color: string }[] = [];
    if (art) {
      for (const s of art.shapes) {
        if (s.f === false) continue;
        const c = s.c.toUpperCase();
        if (!map.has(c)) {
          const num = map.size + 1;
          map.set(c, num);
          leg.push({ num, color: s.c });
        }
      }
    }
    return { legend: leg, colorToNum: map };
  }, [art]);

  // centroid of a shape so we can place its number label
  const shapeCenter = useCallback((s: Shape): [number, number] => {
    if (s.cx != null && s.cy != null) return [s.cx, s.cy];
    if (s.x != null && s.y != null) return [s.x + (s.w ?? 0) / 2, s.y + (s.h ?? 0) / 2];
    if (s.pts && s.pts.length >= 2) {
      let sx = 0, sy = 0, n = 0;
      for (let i = 0; i + 1 < s.pts.length; i += 2) { sx += s.pts[i]; sy += s.pts[i + 1]; n++; }
      return [sx / n, sy / n];
    }
    if (s.d) {
      const nums = s.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      let sx = 0, sy = 0, n = 0;
      for (let i = 0; i + 1 < nums.length; i += 2) { sx += nums[i]; sy += nums[i + 1]; n++; }
      if (n) return [sx / n, sy / n];
    }
    return [vbW / 2, vbH / 2];
  }, [vbW, vbH]);

  const legendDone = useCallback(
    (num: number) => {
      if (!art) return false;
      const group = art.shapes.filter((s) => s.f !== false && colorToNum.get(s.c.toUpperCase()) === num);
      return group.length > 0 && group.every((s) => fills[s.id]);
    },
    [art, colorToNum, fills],
  );

  const snapshot = useCallback((): Snapshot => ({ fills: { ...fills }, strokes: [...strokes], stickers: [...stickers] }), [fills, strokes, stickers]);

  const pushHistory = useCallback(
    (snap: Snapshot) => {
      undoStack.current.push(snap);
      if (undoStack.current.length > 120) undoStack.current.shift();
      redoStack.current = [];
      syncHistory();
    },
    [syncHistory],
  );

  const apply = (s: Snapshot) => {
    setFills(s.fills);
    setStrokes(s.strokes);
    setStickers(s.stickers);
  };

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(snapshot());
    apply(prev);
    sfx.undo();
    syncHistory();
  }, [snapshot, syncHistory]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(snapshot());
    apply(next);
    sfx.undo();
    syncHistory();
  }, [snapshot, syncHistory]);

  /* ------------------------------ painting ------------------------------ */

  const paintValue = useCallback(() => {
    if (toolDef.paint === "rainbow" || swatch.special === "rainbow") return "url(#g-rainbow)";
    if (toolDef.paint === "glitter" || swatch.special === "glitter") return "url(#g-glitter)";
    if (swatch.special === "metal") return `url(#g-metal-${swatch.id})`;
    if (swatch.special === "gradient") return `url(#g-soft-${swatch.id})`;
    return swatch.color;
  }, [swatch, toolDef]);

  const celebrate = useCallback(() => {
    if (done) return;
    setDone(true);
    sfx.celebrate();
    fx.confetti(200);
    fx.shake(16);
    // bursts of fireworks + stars from several points across the screen
    const w = typeof window !== "undefined" ? window.innerWidth : 800;
    const h = typeof window !== "undefined" ? window.innerHeight : 600;
    [0.2, 0.5, 0.8].forEach((fxr, i) =>
      window.setTimeout(() => fx.fireworks(w * fxr, h * (0.3 + (i % 2) * 0.15)), i * 260),
    );
    window.setTimeout(() => fx.burst(w / 2, h * 0.4, 50, ["#FFD84D", "#FF7FB6", "#FFFFFF"], 520), 500);
    // buddy celebrates the finished page — by name
    if (progress.buddyOn) buddySpeak("pageDone");
    else say(randomPraise(progress.lang), progress.lang);
    const stars = 3;
    update({
      stars: progress.stars + stars,
      coins: progress.coins + 10,
      completed: art && !progress.completed.includes(art.slug) ? [...progress.completed, art.slug] : progress.completed,
    });
    setToast(`⭐ +${stars} stars   🪙 +10 coins`);
    window.setTimeout(() => setToast(null), 2600);
  }, [art, done, progress, update]);

  const pickShape = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    if (showHint) {
      setShowHint(false);
      if (!progress.seenHint) update({ seenHint: true });
    }

    // ---- Color-by-number mode ----
    if (cbn && art) {
      const shape = art.shapes.find((s) => s.id === id);
      if (!shape || shape.f === false) return;
      const target = colorToNum.get(shape.c.toUpperCase());
      if (fills[id]) return; // already done
      if (target !== activeNum) {
        // wrong number: gentle feedback, don't paint
        sfx.wrong();
        fx.shake(8);
        fx.float(e.clientX, e.clientY - 10, `#${target}`, "#FF5C7A");
        return;
      }
      pushHistory(snapshot());
      const next = { ...fills, [id]: shape.c }; // fill with the exact sample colour
      setFills(next);
      markEdited([id]);
      sfx.fill();
      fx.burst(e.clientX, e.clientY, 14, [shape.c, "#FFFFFF"], 240);
      fx.ring(e.clientX, e.clientY, shape.c);
      const numbered = art.shapes.filter((s) => s.f !== false && colorToNum.get(s.c.toUpperCase()) === activeNum);
      const numberedDone = numbered.every((s) => next[s.id]);
      if (numberedDone) {
        sfx.star();
        // auto-advance to the next unfinished number
        const remaining = legend.find((l) => art.shapes.some((s) => s.f !== false && colorToNum.get(s.c.toUpperCase()) === l.num && !next[s.id]));
        if (remaining) setActiveNum(remaining.num);
      }
      if (countFilledIn(art, next) >= fillableCount) window.setTimeout(celebrate, 220);
      return;
    }

    // ---- Free coloring ----
    if (tool !== "bucket" && tool !== "eraser") return;
    pushHistory(snapshot());
    const value = tool === "eraser" ? BASE_FILL : paintValue();
    const next = { ...fills, [id]: value };
    if (tool === "eraser") delete next[id];
    setFills(next);
    markEdited([id]);
    sfx.fill();
    fx.burst(e.clientX, e.clientY, 12, [swatch.color, "#FFFFFF"], 220);
    fx.ring(e.clientX, e.clientY, swatch.color);
    if (art && countFilledIn(art, next) >= fillableCount) window.setTimeout(celebrate, 220);
  };

  const toLocal = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      drawing.current = null;
      return;
    }
    const { x, y } = toLocal(e);
    if (tool === "sticker") {
      pushHistory(snapshot());
      setStickers((s) => [
        ...s,
        { id: `s${Date.now()}`, emoji: activeSticker, x, y, s: 1 + Math.random() * 0.3, r: (Math.random() - 0.5) * 24 },
      ]);
      schedulePush();
      sfx.star();
      fx.burst(e.clientX, e.clientY, 16, ["#FFD84D", "#FF7FB6", "#FFFFFF"], 260);
      return;
    }
    if (tool === "bucket") return;
    if (tool === "eraser") {
      pushHistory(snapshot());
      drawing.current = { pts: [x, y], id: `k${Date.now()}` };
      return;
    }
    pushHistory(snapshot());
    drawing.current = { pts: [x, y], id: `k${Date.now()}` };
    setStrokes((s) => [
      ...s,
      {
        id: drawing.current!.id,
        tool,
        color: paintValue(),
        size: toolDef.size * sizeMul,
        opacity: toolDef.opacity * alphaMul,
        d: `M${x.toFixed(1)} ${y.toFixed(1)}`,
      },
    ]);
    sfx.brush();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      setZoom(Math.max(0.6, Math.min(4, (pinch.current.zoom * d) / pinch.current.dist)));
      return;
    }
    const cur = drawing.current;
    if (!cur) return;
    const { x, y } = toLocal(e);
    const lx = cur.pts[cur.pts.length - 2];
    const ly = cur.pts[cur.pts.length - 1];
    if (Math.hypot(x - lx, y - ly) < 2.5) return;
    cur.pts.push(x, y);
    if (tool === "eraser") {
      setStrokes((prev) => prev.filter((s) => !nearStroke(s.d, x, y, 22 * sizeMul)));
      return;
    }
    const mx = (lx + x) / 2;
    const my = (ly + y) / 2;
    setStrokes((prev) =>
      prev.map((s) => (s.id === cur.id ? { ...s, d: `${s.d} Q${lx.toFixed(1)} ${ly.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}` } : s)),
    );
    if (cur.pts.length % 8 === 0) sfx.brush();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    drawing.current = null;
  };

  /* ------------------------------ keyboard ------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (e.key === "z") undo();
      else if (e.key === "y") redo();
      else if (e.key === "b") setTool("brush");
      else if (e.key === "f") setTool("bucket");
      else if (e.key === "e") setTool("eraser");
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(4, z + 0.25));
      else if (e.key === "-") setZoom((z) => Math.max(0.6, z - 0.25));
      else if (e.key === "r") setRot((r) => (r + 90) % 360);
      else if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, onExit]);

  // show the sample once when a coloring page opens, then auto-close so it
  // never blocks the drawing
  useEffect(() => {
    if (!art) return;
    const open = window.setTimeout(() => setRefModal(true), 60);
    const close = window.setTimeout(() => setRefModal(false), 2600);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(close);
    };
  }, [art]);

  /* -------- co-op sync helpers -------- */
  const schedulePush = useCallback(() => {
    if (!roomCode) return;
    if (pushTimer.current) window.clearTimeout(pushTimer.current);
    pushTimer.current = window.setTimeout(() => {
      pushTimer.current = null;
      fetch(`/api/rooms/${roomCode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fills: fillsRef.current, stickers: stickersRef.current, name: progress.name }),
      }).catch(() => undefined);
    }, 600);
  }, [roomCode, progress.name]);

  const markEdited = useCallback(
    (ids: string[]) => {
      const now = Date.now();
      ids.forEach((id) => (localEditsRef.current[id] = now));
      schedulePush();
    },
    [schedulePush],
  );

  const fullSyncPush = useCallback(() => {
    fullSyncRef.current = Date.now();
    schedulePush();
  }, [schedulePush]);

  // poll the room and merge friends' colors
  useEffect(() => {
    if (!roomCode || !art) return;
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (!res.ok) return;
        const data = (await res.json()) as { room: { fills: Record<string, string>; stickers: Sticker[]; names: string[] } };
        setCoopNames(data.room.names ?? []);
        const remoteFills = data.room.fills ?? {};
        setFills((prev) => {
          const base = fullSyncRef.current > lastPullRef.current ? { ...prev } : { ...remoteFills };
          const now = Date.now();
          for (const [sid, ts] of Object.entries(localEditsRef.current)) {
            if (ts > lastPullRef.current) {
              if (prev[sid] === undefined) delete base[sid];
              else base[sid] = prev[sid];
            } else if (now - ts > 8000) {
              delete localEditsRef.current[sid];
            }
          }
          lastPullRef.current = now;
          if (Object.keys(base).length >= fillableCount && !done) window.setTimeout(celebrate, 300);
          return base;
        });
        setStickers((prev) => {
          const remote = data.room.stickers ?? [];
          const ids = new Set(prev.map((s) => s.id));
          const merged = [...prev, ...remote.filter((s) => !ids.has(s.id))];
          return merged;
        });
      } catch {
        /* offline / ignore */
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, [roomCode, art, fillableCount, done, celebrate]);

  /* ------------------------------- export ------------------------------- */

  const rasterize = useCallback(
    async (px: number): Promise<string> => {
      const svg = svgRef.current;
      if (!svg) return "";
      const outW = px;
      const outH = Math.round((px * vbH) / vbW);
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("width", `${outW}`);
      clone.setAttribute("height", `${outH}`);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const xml = new XMLSerializer().serializeToString(clone);
      const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outW, outH);
      ctx.drawImage(img, 0, 0, outW, outH);
      return canvas.toDataURL("image/png");
    },
    [vbW, vbH],
  );

  const exportPng = async () => {
    const data = await rasterize(1600);
    if (!data) return;
    const a = document.createElement("a");
    a.href = data;
    a.download = `${art?.slug ?? "my-drawing"}.png`;
    a.click();
    sfx.reward();
    setToast("🖼️ Saved to your device!");
    window.setTimeout(() => setToast(null), 2200);
  };

  const saveToGallery = async () => {
    const thumb = await rasterize(360);
    await fetch("/api/artworks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        pageSlug: art?.slug ?? "free-draw",
        title: art?.title ?? "Free Drawing",
        profile: progress.name,
        fills,
        strokes,
        stickers,
        thumbnail: thumb,
      }),
    });
    sfx.reward();
    fx.confetti(70);
    update({ coins: progress.coins + 3 });
    setToast("💾 Added to your gallery!");
    window.setTimeout(() => setToast(null), 2200);
  };

  const magicFill = () => {
    if (!art) return;
    pushHistory(snapshot());
    const next: Record<string, string> = {};
    art.shapes.forEach((s) => {
      if (s.f !== false) next[s.id] = s.c;
    });
    setFills(next);
    fullSyncPush();
    sfx.star();
    fx.confetti(60);
  };

  const clearAll = () => {
    pushHistory(snapshot());
    setFills({});
    setStrokes([]);
    setStickers([]);
    setDone(false);
    fullSyncPush();
    sfx.whoosh();
  };

  const palette = PALETTES.find((p) => p.key === paletteKey) ?? PALETTES[0];
  const left = progress.leftHanded;

  // gate premium brushes behind the store
  const selectTool = (id: string) => {
    if (isBrushPremium(id) && !progress.premiumUnlocked) {
      sfx.tap();
      onNeedPremium?.();
      return;
    }
    setTool(id);
    setShowStickers(id === "sticker");
    sfx.tap();
  };

  // small render of the child's own colored artwork (for the compare view)
  const myArtworkSvg = () => {
    if (!art) return null;
    return (
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full bg-white">
        {art.shapes.map((s) => (
          <ShapeEl key={s.id} s={s} fill={s.f === false ? s.c : (fills[s.id] ?? BASE_FILL)} />
        ))}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(circle_at_20%_10%,#fff2fb,transparent_55%),radial-gradient(circle_at_80%_0%,#e8f6ff,transparent_45%)] bg-[#FDF7FF]">
      {/* top bar (scrolls horizontally so no button is ever hidden on phones) */}
      <div className={`flex shrink-0 items-center gap-2 overflow-x-auto p-2 sm:gap-3 sm:p-3 ${left ? "flex-row-reverse" : ""}`}>
        <IconBtn label="Back" emoji="🏠" onClick={onExit} tone="#FF7FB6" />
        <IconBtn label="Undo" emoji="↩️" onClick={undo} disabled={histLen === 0} tone="#8E7CFF" />
        <IconBtn label="Redo" emoji="↪️" onClick={redo} disabled={redoLen === 0} tone="#8E7CFF" />
        <div className="mx-auto hidden shrink-0 truncate rounded-full bg-white/80 px-4 py-1.5 text-sm font-black text-[#5B4B7A] shadow-sm sm:block sm:text-base">
          {art ? `${art.emoji} ${art.title}` : traceGlyph ? `✍️ Trace “${traceGlyph}”` : "🎨 Free Drawing"}
        </div>
        <IconBtn label="Zoom out" emoji="🔍" onClick={() => setZoom((z) => Math.max(0.6, z - 0.25))} tone="#5AC8FA" />
        <IconBtn label="Zoom in" emoji="🔎" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} tone="#5AC8FA" />
        <IconBtn label="Rotate" emoji="🔄" onClick={() => setRot((r) => (r + 90) % 360)} tone="#38C6D9" />
        {art && (
          <IconBtn
            label="Show sample"
            emoji="👀"
            onClick={() => {
              setRefModal(true);
              sfx.tap();
            }}
            tone="#FFD84D"
          />
        )}
        {art && (
          <button
            onClick={() => {
              setCoopModal(true);
              sfx.tap();
            }}
            aria-label="Play together"
            title="Play together online"
            className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-md transition active:scale-90 sm:h-14 sm:w-14 ${roomCode ? "bg-gradient-to-b from-[#B8F2E6] to-[#38C6D9] ring-4 ring-[#7ED087]" : "bg-gradient-to-b from-[#EAF7FF] to-[#BFE6FF] ring-2 ring-[#5AC8FA]"}`}
          >
            🤝
          </button>
        )}
        {art && (
          <button
            onClick={() => {
              const on = !cbn;
              setCbn(on);
              sfx.tap();
              if (on) {
                setTool("bucket");
                setFills({});
                setActiveNum(1);
                setToast("🔢 Color by Numbers! Tap regions with the number you picked.");
                say("Color by numbers! Pick a number and fill the matching spots.", progress.lang);
                window.setTimeout(() => setToast(null), 3000);
              }
            }}
            aria-label="Color by numbers"
            title="Color by numbers"
            className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-md transition active:scale-90 sm:h-14 sm:w-14 ${
              cbn ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-4 ring-[#FFD84D]" : "bg-gradient-to-b from-[#EDE7FF] to-[#C9BCFF] ring-2 ring-[#8E7CFF]"
            }`}
          >
            🔢
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#8E7CFF] px-1.5 text-[8px] font-black leading-tight text-white shadow">
              1·2·3
            </span>
          </button>
        )}
        <IconBtn label="Save" emoji="💾" onClick={saveToGallery} tone="#7ED087" />
        <IconBtn label="Export" emoji="📤" onClick={exportPng} tone="#FFB03A" />
      </div>

      {/* work area: canvas + side rail (rail moves to bottom on small screens) */}
      <div className={`flex min-h-0 flex-1 gap-2 overflow-hidden px-2 ${left ? "lg:flex-row-reverse" : ""}`}>
        <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden">
        <div
          className="relative touch-none rounded-[32px] bg-white shadow-[0_18px_50px_rgba(120,80,160,0.22)] ring-4 ring-white"
          style={{
            aspectRatio: `${vbW} / ${vbH}`,
            maxWidth: vbW > vbH ? "min(96%, 150vh)" : "min(96%, 68vh)",
            maxHeight: "calc(100% - 3rem)",
            width: "auto",
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rot}deg)`,
            transition: "transform .18s ease-out",
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${vbW} ${vbH}`}
            className="h-full w-full touch-none select-none rounded-[28px]"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <defs>
              <linearGradient id="g-rainbow" x1="0" y1="0" x2="1" y2="1">
                {["#FF5C7A", "#FFB03A", "#FFE066", "#7ED087", "#5AC8FA", "#8E7CFF"].map((c, i, a) => (
                  <stop key={c} offset={`${(i / (a.length - 1)) * 100}%`} stopColor={c} />
                ))}
              </linearGradient>
              <linearGradient id="g-glitter" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF6C9" />
                <stop offset="45%" stopColor="#FFD84D" />
                <stop offset="100%" stopColor="#FFB03A" />
              </linearGradient>
              {["gold", "silver", "bronze", "rose", "steel", "emerald"].map((k, i) => {
                const base = ["#E7B84B", "#C6CEDA", "#C88450", "#E8A6A6", "#8FA0B8", "#4CB77F"][i];
                return (
                  <linearGradient key={k} id={`g-metal-${k}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor={base} />
                    <stop offset="70%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor={base} />
                  </linearGradient>
                );
              })}
              {[
                ["sunset", "#FFD84D", "#FF5C7A"],
                ["ocean", "#7EF3E8", "#2A6FE8"],
                ["candy", "#FFD1E6", "#FF4D94"],
                ["galaxy", "#8E7CFF", "#2A1E63"],
              ].map(([k, a, b]) => (
                <linearGradient key={k} id={`g-soft-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={a} />
                  <stop offset="100%" stopColor={b} />
                </linearGradient>
              ))}
              <filter id="f-blur"><feGaussianBlur stdDeviation="5" /></filter>
              <filter id="f-glow">
                <feGaussianBlur stdDeviation="5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <pattern id="p-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#E7DFF5" strokeWidth="2" />
              </pattern>
            </defs>

            <rect x="0" y="0" width={vbW} height={vbH} fill={grid ? "url(#p-grid)" : "#FFFFFF"} />

            {traceGlyph && (
              <text
                x="200"
                y="250"
                textAnchor="middle"
                fontSize={traceGlyph.length > 2 ? 90 : 250}
                fontWeight={900}
                fill="#F1E9FF"
                stroke="#CDBEF0"
                strokeWidth={4}
                strokeDasharray="10 10"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                {traceGlyph}
              </text>
            )}

            {art?.shapes.map((s) => (
              <ShapeEl key={s.id} s={s} fill={s.f === false ? s.c : (fills[s.id] ?? BASE_FILL)} onPick={pickShape} />
            ))}

            {/* color-by-number labels on unfilled regions */}
            {cbn &&
              art?.shapes.map((s) => {
                if (s.f === false || fills[s.id]) return null;
                const num = colorToNum.get(s.c.toUpperCase());
                if (!num) return null;
                const [cx, cy] = shapeCenter(s);
                const isActive = num === activeNum;
                return (
                  <text
                    key={`n${s.id}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={vbW > 500 ? 15 : 13}
                    fontWeight={900}
                    fill={isActive ? "#2E2545" : "#8B84A6"}
                    stroke="#FFFFFF"
                    strokeWidth={3}
                    paintOrder="stroke"
                    pointerEvents="none"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {num}
                  </text>
                );
              })}

            <g>
              {strokes.map((s) => {
                const t = TOOLS.find((x) => x.id === s.tool);
                return (
                  <g key={s.id}>
                    <path
                      d={s.d}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={s.size}
                      strokeOpacity={s.opacity}
                      strokeLinecap={t?.cap ?? "round"}
                      strokeLinejoin="round"
                      strokeDasharray={t?.dash}
                      filter={t?.blur ? "url(#f-blur)" : t?.glow ? "url(#f-glow)" : undefined}
                    />
                    {mirror && (
                      <path
                        d={s.d}
                        transform={`translate(${vbW},0) scale(-1,1)`}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={s.size}
                        strokeOpacity={s.opacity}
                        strokeLinecap={t?.cap ?? "round"}
                        strokeLinejoin="round"
                        strokeDasharray={t?.dash}
                        filter={t?.blur ? "url(#f-blur)" : t?.glow ? "url(#f-glow)" : undefined}
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {stickers.map((s) => (
              <text
                key={s.id}
                x={s.x}
                y={s.y}
                fontSize={44 * s.s}
                textAnchor="middle"
                dominantBaseline="central"
                transform={`rotate(${s.r} ${s.x} ${s.y})`}
              >
                {s.emoji}
              </text>
            ))}
          </svg>

          {/* first-time animated tap hint */}
          {showHint && art && !cbn && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="relative">
                <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD84D]/60" style={{ animation: "hintRing 1.4s ease-out infinite" }} />
                <span className="relative block text-5xl" style={{ animation: "tapHint 1.4s ease-in-out infinite" }}>👆</span>
                <span className="mt-1 block rounded-full bg-[#2E2545]/85 px-3 py-1 text-xs font-black text-white">Tap to color!</span>
              </div>
            </div>
          )}
        </div>

        {/* PROGRESS BAR — tracks how much of the picture is coloured */}
        {art && (
          <div
            className="w-full shrink-0"
            style={{ maxWidth: vbW > vbH ? "min(96%, 150vh)" : "min(96%, 68vh)" }}
          >
            <div className="relative h-7 w-full overflow-hidden rounded-full bg-white shadow-inner ring-2 ring-[#EFE7FF]">
              <div
                className="flex h-full items-center justify-end rounded-full bg-gradient-to-r from-[#FF7FB6] via-[#FFB03A] to-[#7ED087] pr-1.5 transition-[width] duration-300 ease-out"
                style={{ width: `${Math.max(progressPct, 6)}%` }}
              >
                <span className="text-sm drop-shadow">{progressPct >= 100 ? "🎉" : progressPct > 8 ? "🖌️" : ""}</span>
              </div>
              {[25, 50, 75].map((m) => (
                <span
                  key={m}
                  className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs transition"
                  style={{ left: `${m}%`, opacity: progressPct >= m ? 1 : 0.35, filter: progressPct >= m ? "none" : "grayscale(1)" }}
                >
                  ⭐
                </span>
              ))}
              <span className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] font-black text-[#2E2545]">
                {progressPct}%
              </span>
            </div>
          </div>
        )}

        {toast && (
          <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2E2545]/90 px-5 py-2 text-sm font-black text-white shadow-lg sm:text-base">
            {toast}
          </div>
        )}
        {done && !compare && (
          <div className="absolute bottom-3 flex gap-2">
            <button
              onClick={() => setCompare(true)}
              className="rounded-full bg-white px-5 py-3 text-lg font-black text-[#5B4B7A] shadow-xl active:scale-95"
            >
              🔍 Compare
            </button>
            <button
              onClick={() => {
                setDone(false);
                onExit();
              }}
              className="rounded-full bg-gradient-to-r from-[#7ED087] to-[#38C6D9] px-7 py-3 text-lg font-black text-white shadow-xl active:scale-95"
            >
              🎉 Next →
            </button>
          </div>
        )}

        {/* Before / After compare */}
        {done && compare && art && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[#2E2545]/60 p-4 backdrop-blur-sm" onPointerDown={() => setCompare(false)}>
            <div className="w-full max-w-lg rounded-[28px] bg-white p-4 shadow-2xl pop-in" onPointerDown={(e) => e.stopPropagation()}>
              <h3 className="mb-2 text-center font-black text-[#2E2545]">🌟 Look what you made!</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <PagePreview art={art} className="w-full rounded-2xl bg-white ring-2 ring-[#F1ECFF]" />
                  <p className="mt-1 text-xs font-black text-[#A99CC4]">Sample</p>
                </div>
                <div className="text-center">
                  <div className="overflow-hidden rounded-2xl ring-2 ring-[#FFE9A8]">{myArtworkSvg()}</div>
                  <p className="mt-1 text-xs font-black text-[#FFB03A]">Yours ⭐</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={exportPng} className="flex-1 rounded-2xl bg-[#FFB03A] py-3 font-black text-white active:scale-95">📤 Save & Share</button>
                <button
                  onClick={() => {
                    setDone(false);
                    setCompare(false);
                    onExit();
                  }}
                  className="flex-1 rounded-2xl bg-[#7ED087] py-3 font-black text-white active:scale-95"
                >
                  🎉 Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CO-OP PLAY TOGETHER */}
        {art && coopModal && (
          <div className="absolute inset-0 z-40 grid place-items-center bg-[#2E2545]/60 p-4 backdrop-blur-sm" onPointerDown={() => setCoopModal(false)}>
            <div className="w-full max-w-sm rounded-[28px] bg-white p-5 text-center shadow-2xl pop-in" onPointerDown={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-black text-[#2E2545]">🤝 Play together</h3>
              {roomCode ? (
                <>
                  <p className="mt-1 text-xs font-bold text-[#7A6C99]">Share this code with your friends:</p>
                  <div className="my-3 rounded-2xl bg-[#F3EFFF] py-3 text-4xl font-black tracking-[0.3em] text-[#8E7CFF]">{roomCode}</div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {coopNames.map((n) => (
                      <span key={n} className="rounded-full bg-[#EAF7FF] px-2 py-0.5 text-xs font-black text-[#2A6FE8]">🎨 {n}</span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] font-bold text-[#A99CC4]">Colors appear on everyone&apos;s screen live!</p>
                  <button
                    onClick={() => {
                      setRoomCode(null);
                      setCoopNames([]);
                      setCoopModal(false);
                    }}
                    className="mt-3 w-full rounded-2xl bg-[#FFE9EF] py-3 font-black text-[#C23B5E] active:scale-95"
                  >
                    Leave room
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/rooms", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ action: "create", pageSlug: art.slug, name: progress.name }),
                        });
                        const data = (await res.json()) as { code: string };
                        setRoomCode(data.code);
                        setCoopNames([progress.name]);
                        sfx.reward();
                        say("Room ready! Share the code with your friends.", progress.lang);
                      } catch {
                        setToast("⚠️ Could not create room");
                        window.setTimeout(() => setToast(null), 2000);
                      }
                    }}
                    className="mt-3 w-full rounded-3xl bg-gradient-to-r from-[#7ED087] to-[#38C6D9] py-4 text-lg font-black text-white shadow-lg active:scale-95"
                  >
                    🎉 Create a room
                  </button>
                  <div className="my-3 text-xs font-black text-[#A99CC4]">— or —</div>
                  <input
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="CODE"
                    className="w-full rounded-2xl border-4 border-[#EDE6FF] px-4 py-3 text-center text-2xl font-black tracking-[0.3em] text-[#2E2545] outline-none focus:border-[#8E7CFF]"
                  />
                  <button
                    onClick={async () => {
                      if (joinInput.length < 4) return;
                      try {
                        const res = await fetch("/api/rooms", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ action: "join", code: joinInput, name: progress.name }),
                        });
                        if (!res.ok) {
                          setToast("❌ Wrong code, try again");
                          window.setTimeout(() => setToast(null), 2000);
                          sfx.wrong();
                          return;
                        }
                        const data = (await res.json()) as { code: string; pageSlug: string };
                        const pg = await fetch(`/api/pages?slug=${data.pageSlug}`).then((r) => r.json());
                        const page = pg.page as PageArt | undefined;
                        if (page && page.slug !== art.slug) onCoopJoin?.(page);
                        setRoomCode(data.code);
                        setCoopModal(false);
                        sfx.reward();
                        say("You joined your friends!", progress.lang);
                      } catch {
                        setToast("⚠️ Could not join");
                        window.setTimeout(() => setToast(null), 2000);
                      }
                    }}
                    className="mt-2 w-full rounded-3xl bg-gradient-to-r from-[#8E7CFF] to-[#5AC8FA] py-4 text-lg font-black text-white shadow-lg active:scale-95"
                  >
                    🚪 Join friends
                  </button>
                </>
              )}
              <button onClick={() => setCoopModal(false)} className="mt-2 w-full rounded-2xl bg-[#F3EFFF] py-2.5 text-sm font-black text-[#5B4B7A]">Close</button>
            </div>
          </div>
        )}

        {/* SAMPLE PICTURE — full popup so it never covers the drawing while coloring */}
        {art && refModal && (
          <div
            className="absolute inset-0 z-30 grid place-items-center bg-[#2E2545]/55 p-4 backdrop-blur-sm"
            onPointerDown={() => setRefModal(false)}
          >
            <div
              className="relative w-full max-w-[min(80%,60vh)] rounded-[28px] bg-white p-3 shadow-2xl pop-in"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="mb-1 flex items-center justify-between px-1">
                <span className="text-sm font-black text-[#8A6A1F]">👀 {art.title}</span>
                <button
                  onClick={() => setRefModal(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-[#FFE9EF] text-lg active:scale-90"
                  aria-label="Close sample"
                >
                  ✖️
                </button>
              </div>
              <PagePreview art={art} className="w-full rounded-2xl bg-white ring-2 ring-[#F1ECFF]" />
              <p className="mt-2 text-center text-xs font-bold text-[#7A6C99]">Look, then tap ✖️ to keep coloring!</p>
            </div>
          </div>
        )}
        </div>

        {/* SIDE RAIL (desktop/tablet landscape) — palette + tools next to canvas */}
        <div className="hidden w-[188px] shrink-0 flex-col gap-2 overflow-y-auto rounded-3xl bg-white/70 p-2 lg:flex">
          {cbn ? (
            <div className="rounded-2xl bg-white p-2">
              <p className="mb-1 text-center text-[11px] font-black text-[#8E7CFF]">🔢 Pick a number</p>
              <div className="grid grid-cols-3 gap-1.5">
                {legend.map((l) => (
                  <NumberChip key={l.num} num={l.num} color={l.color} active={l.num === activeNum} done={legendDone(l.num)} onClick={() => { setActiveNum(l.num); sfx.tap(); }} />
                ))}
              </div>
            </div>
          ) : (
          <div className="flex flex-wrap gap-1.5">
            {palette.swatches.map((s) => (
              <SwatchBtn key={s.id} s={s} active={swatch.id === s.id} onClick={() => { setSwatch(s); if (tool === "sticker") setTool("brush"); sfx.tap(); }} />
            ))}
          </div>
          )}
          {!cbn && (
          <div className="flex flex-wrap gap-1">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                onClick={() => { setPaletteKey(p.key); sfx.tap(); }}
                className={`rounded-full px-2 py-1 text-[10px] font-black ${paletteKey === p.key ? "bg-[#2E2545] text-white" : "bg-white text-[#5B4B7A]"}`}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          )}
          {!cbn && (
          <div className="grid grid-cols-3 gap-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTool(t.id)}
                title={t.label}
                className={`relative grid h-12 place-items-center rounded-2xl text-xl shadow-sm transition active:scale-90 ${tool === t.id ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-2 ring-[#FFD84D]" : "bg-white"}`}
              >
                {t.emoji}
                {isBrushPremium(t.id) && !progress.premiumUnlocked && <span className="absolute -top-1 -right-1 text-[10px]">👑</span>}
              </button>
            ))}
            <button onClick={() => setMirror((m) => !m)} className={`grid h-12 place-items-center rounded-2xl text-xl shadow-sm ${mirror ? "bg-[#B4E7FF]" : "bg-white"}`}>🪞</button>
            <button onClick={() => setGrid((g) => !g)} className={`grid h-12 place-items-center rounded-2xl text-xl shadow-sm ${grid ? "bg-[#DDD6FF]" : "bg-white"}`}>▦</button>
            {art && <button onClick={magicFill} className="grid h-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">🪄</button>}
            <button onClick={clearAll} className="grid h-12 place-items-center rounded-2xl bg-white text-xl shadow-sm">🗑️</button>
          </div>
          )}
          {!cbn && (
          <div className="mt-auto space-y-1 rounded-2xl bg-white px-2 py-2">
            <div className="flex items-center gap-1">
              <span className="text-xs">🖌️</span>
              <input type="range" min={0.3} max={3} step={0.1} value={sizeMul} onChange={(e) => setSizeMul(Number(e.target.value))} className="w-full accent-[#8E7CFF]" aria-label="Brush size" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs">👻</span>
              <input type="range" min={0.1} max={1} step={0.05} value={alphaMul} onChange={(e) => setAlphaMul(Number(e.target.value))} className="w-full accent-[#FF7FB6]" aria-label="Opacity" />
            </div>
          </div>
          )}
        </div>
      </div>

      {/* sticker drawer */}
      {showStickers && (
        <div className="mx-2 mb-1 rounded-3xl bg-white/90 p-2 shadow-lg">
          <div className="mb-1 flex gap-1 overflow-x-auto pb-1">
            {STICKER_PACKS.map((p, i) => {
              const lockedPack = isStickerPackPremium(p.key) && !progress.premiumUnlocked;
              return (
              <button
                key={p.key}
                onClick={() => {
                  if (lockedPack) {
                    onNeedPremium?.();
                    sfx.tap();
                    return;
                  }
                  setStickerPack(i);
                }}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${i === stickerPack ? "bg-[#8E7CFF] text-white" : "bg-[#F1ECFF] text-[#5B4B7A]"}`}
              >
                {p.items[0]} {p.label}{lockedPack ? " 👑" : ""}
              </button>
              );
            })}
          </div>
          <div className="flex max-h-24 flex-wrap gap-1 overflow-y-auto">
            {STICKER_PACKS[stickerPack].items.map((emoji, i) => (
              <button
                key={`${emoji}${i}`}
                onClick={() => {
                  setActiveSticker(emoji);
                  setTool("sticker");
                  sfx.tap();
                }}
                className={`grid h-11 w-11 place-items-center rounded-2xl text-2xl active:scale-90 ${activeSticker === emoji ? "bg-[#FFE9A8] ring-2 ring-[#FFB03A]" : "bg-[#F7F3FF]"}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* color-by-number legend on phones */}
      {cbn && (
        <div className="shrink-0 px-2 pb-1 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white/90 p-2">
            <span className="shrink-0 text-xs font-black text-[#8E7CFF]">🔢</span>
            {legend.map((l) => (
              <NumberChip key={l.num} num={l.num} color={l.color} active={l.num === activeNum} done={legendDone(l.num)} onClick={() => { setActiveNum(l.num); sfx.tap(); }} />
            ))}
          </div>
        </div>
      )}

      {/* bottom toolbars (compact on phones; hidden on large where the side rail is shown) */}
      <div className={`shrink-0 space-y-2 p-2 sm:p-3 lg:hidden ${cbn ? "hidden" : ""} ${left ? "text-right" : ""}`}>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {palette.swatches.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSwatch(s);
                if (tool === "sticker") setTool("brush");
                sfx.tap();
              }}
              aria-label={s.id}
              className={`h-11 w-11 shrink-0 rounded-full border-4 transition active:scale-90 ${swatch.id === s.id ? "border-[#2E2545] scale-110" : "border-white"}`}
              style={{
                background:
                  s.special === "rainbow"
                    ? "conic-gradient(#FF5C7A,#FFB03A,#FFE066,#7ED087,#5AC8FA,#8E7CFF,#FF5C7A)"
                    : s.special === "glitter"
                      ? "linear-gradient(135deg,#FFF6C9,#FFD84D,#FFB03A)"
                      : s.special === "metal"
                        ? `linear-gradient(135deg,#fff,${s.color},#fff,${s.color})`
                        : s.color,
                boxShadow: "0 4px 10px rgba(90,60,130,.18)",
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PALETTES.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setPaletteKey(p.key);
                sfx.tap();
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${paletteKey === p.key ? "bg-[#2E2545] text-white" : "bg-white text-[#5B4B7A]"}`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
          <div className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-1.5">
            <span className="text-xs font-black text-[#5B4B7A]">🖌️</span>
            <input
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              value={sizeMul}
              onChange={(e) => setSizeMul(Number(e.target.value))}
              className="w-20 accent-[#8E7CFF]"
              aria-label="Brush size"
            />
            <span className="text-xs font-black text-[#5B4B7A]">👻</span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={alphaMul}
              onChange={(e) => setAlphaMul(Number(e.target.value))}
              className="w-20 accent-[#FF7FB6]"
              aria-label="Opacity"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {TOOLS.map((t) => {
            const lockedBrush = isBrushPremium(t.id) && !progress.premiumUnlocked;
            return (
            <button
              key={t.id}
              onClick={() => selectTool(t.id)}
              title={t.label}
              className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-md transition active:scale-90 ${tool === t.id ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-4 ring-[#FFD84D]" : "bg-white"}`}
            >
              {t.emoji}
              {lockedBrush && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
            </button>
            );
          })}
          <button onClick={() => setMirror((m) => !m)} className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-md ${mirror ? "bg-[#B4E7FF]" : "bg-white"}`} title="Mirror">🪞</button>
          <button onClick={() => setGrid((g) => !g)} className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl shadow-md ${grid ? "bg-[#DDD6FF]" : "bg-white"}`} title="Grid">▦</button>
          {art && <button onClick={magicFill} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-md" title="Magic colours">🪄</button>}
          <button onClick={clearAll} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-md" title="Clear">🗑️</button>
        </div>
      </div>
    </div>
  );
}

function NumberChip({
  num,
  color,
  active,
  done,
  onClick,
}: {
  num: number;
  color: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Color number ${num}`}
      className={`relative grid h-11 w-11 place-items-center rounded-2xl border-4 text-sm font-black shadow transition active:scale-90 ${
        active ? "border-[#2E2545] scale-110" : "border-white"
      }`}
      style={{ background: color, color: readableText(color) }}
    >
      {done ? "✓" : num}
    </button>
  );
}

/** black or white text depending on background luminance */
function readableText(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#2E2545";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#2E2545" : "#FFFFFF";
}

function SwatchBtn({ s, active, onClick }: { s: Swatch; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={s.id}
      className={`h-10 w-10 shrink-0 rounded-full border-4 transition active:scale-90 ${active ? "border-[#2E2545] scale-110" : "border-white"}`}
      style={{
        background:
          s.special === "rainbow"
            ? "conic-gradient(#FF5C7A,#FFB03A,#FFE066,#7ED087,#5AC8FA,#8E7CFF,#FF5C7A)"
            : s.special === "glitter"
              ? "linear-gradient(135deg,#FFF6C9,#FFD84D,#FFB03A)"
              : s.special === "metal"
                ? `linear-gradient(135deg,#fff,${s.color},#fff,${s.color})`
                : s.color,
        boxShadow: "0 4px 10px rgba(90,60,130,.18)",
      }}
    />
  );
}

/** number of real fillable regions that currently have a colour */
function countFilledIn(art: PageArt, fills: Record<string, string>) {
  return art.shapes.filter((s) => s.f !== false && fills[s.id]).length;
}

function nearStroke(d: string, x: number, y: number, r: number) {
  const nums = d.match(/-?\d+(\.\d+)?/g);
  if (!nums) return false;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (Math.hypot(Number(nums[i]) - x, Number(nums[i + 1]) - y) < r) return true;
  }
  return false;
}

export function IconBtn({
  label,
  emoji,
  onClick,
  disabled,
  tone = "#8E7CFF",
}: {
  label: string;
  emoji: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-md transition active:scale-90 disabled:opacity-35 sm:h-14 sm:w-14"
      style={{ background: `linear-gradient(180deg,#fff, ${tone}33)` }}
    >
      {emoji}
    </button>
  );
}
