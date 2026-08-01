"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageArt, Shape } from "@/lib/art/shapes";
import { PALETTES, STICKER_PACKS, Swatch } from "@/lib/palette";
import { canCompanionSpeak, companionSpeak, randomPraise, say, sfx } from "@/lib/audio";
import { fx } from "@/components/FxLayer";
import type { Progress } from "@/lib/progress";

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

export default function StudioV2({
  art,
  traceGlyph,
  drawMode,
  onExit,
  progress,
  update,
}: {
  art: PageArt | null;
  traceGlyph?: string;
  drawMode?: "blank" | "grid" | "mirror";
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
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
  const [showRef, setShowRef] = useState(true);
  const [colorByNumbers, setColorByNumbers] = useState(false);
  const [numberedFills, setNumberedFills] = useState<Record<string, number>>({});
  const [companionMsg, setCompanionMsg] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const strokeCountRef = useRef(0);
  const sessionStartRef = useRef(Date.now());
  const lastCelebrateRef = useRef(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const undoStack = useRef<Snapshot[]>([]);
  const redoStack = useRef<Snapshot[]>([]);
  const drawing = useRef<{ pts: number[]; id: string } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);
  const [, force] = useState(0);

  const toolDef = TOOLS.find((t) => t.id === tool) ?? TOOLS[1];
  const fillableCount = useMemo(() => (art ? art.shapes.filter((s) => s.f !== false).length : 0), [art]);

  const snapshot = useCallback((): Snapshot => ({ fills: { ...fills }, strokes: [...strokes], stickers: [...stickers] }), [fills, strokes, stickers]);

  const pushHistory = useCallback(
    (snap: Snapshot) => {
      undoStack.current.push(snap);
      if (undoStack.current.length > 120) undoStack.current.shift();
      redoStack.current = [];
      force((n) => n + 1);
    },
    [],
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
    force((n) => n + 1);
  }, [snapshot]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(snapshot());
    apply(next);
    sfx.undo();
    force((n) => n + 1);
  }, [snapshot]);

  const paintValue = useCallback(() => {
    if (toolDef.paint === "rainbow" || swatch.special === "rainbow") return "url(#g-rainbow)";
    if (toolDef.paint === "glitter" || swatch.special === "glitter") return "url(#g-glitter)";
    if (swatch.special === "metal") return `url(#g-metal-${swatch.id})`;
    if (swatch.special === "gradient") return `url(#g-soft-${swatch.id})`;
    return swatch.color;
  }, [swatch, toolDef]);

  // Calculate progress percentage
  const progressPercent = useMemo(() => {
    if (!art || fillableCount === 0) return 0;
    const filledCount = Object.keys(fills).length;
    return Math.min(100, Math.round((filledCount / fillableCount) * 100));
  }, [art, fills, fillableCount]);

  // Check for milestone celebrations
  useEffect(() => {
    if (!art || progressPercent < 25 || celebrating) return;
    const now = Date.now();
    
    // Prevent multiple celebrations too quickly
    if (now - lastCelebrateRef.current < 5000) return;
    
    // Milestone celebrations
    if (progressPercent === 100 && !done) {
      lastCelebrateRef.current = now;
      setCelebrating(true);
      sfx.celebrate();
      fx.confetti(200);
      fx.shake(16);
      fx.fireworks(window.innerWidth / 2, window.innerHeight / 3);
      
      if (progress.companionMode && progress.voice) {
        companionSpeak("completion", progress.name, progress.lang, true);
        setCompanionMsg(`🏆 ${progress.name} finished!`);
      }
      
      // Show celebration message
      setToast(`🎉 100%! Amazing ${progress.name}!`);
      
      window.setTimeout(() => {
        setCelebrating(false);
        celebrate();
      }, 1500);
    } else if ([25, 50, 75].includes(progressPercent)) {
      lastCelebrateRef.current = now;
      fx.burst(window.innerWidth / 2, 100, 30, ["#FFD84D", "#FF7FB6", "#7ED087"], 300);
      
      if (progress.companionMode && progress.voice && canCompanionSpeak()) {
        const messages = ["25% done!", "Half way there!", "Almost done!"];
        const msg = messages[[25, 50, 75].indexOf(progressPercent)];
        say(`${msg} Great job ${progress.name}!`, progress.lang);
        setCompanionMsg(`📊 ${msg}`);
        window.setTimeout(() => setCompanionMsg(null), 2000);
      }
    }
  }, [progressPercent, art, done, celebrating, progress]);

  const celebrate = useCallback(() => {
    if (done) return;
    setDone(true);
    sfx.celebrate();
    fx.confetti(160);
    fx.shake(14);
    
    // Companion celebration
    if (progress.companionMode && progress.voice) {
      companionSpeak("completion", progress.name, progress.lang, true);
      setCompanionMsg("🏆 Amazing " + progress.name + "!");
      window.setTimeout(() => setCompanionMsg(null), 3000);
    } else {
      say(randomPraise(), progress.lang);
    }
    
    const stars = 3;
    const xpGain = 20; // XP per completed page
    
    update({
      stars: progress.stars + stars,
      coins: progress.coins + 10,
      completed: art && !progress.completed.includes(art.slug) ? [...progress.completed, art.slug] : progress.completed,
      xp: progress.xp + xpGain,
    });
    setToast(`⭐ +${stars} stars   🪙 +10 coins`);
    window.setTimeout(() => setToast(null), 2600);
  }, [art, done, progress, update]);

  const pickShape = (id: string, e: React.PointerEvent) => {
    if (tool !== "bucket" && tool !== "eraser") return;
    e.stopPropagation();
    
    // Track coloring activity
    strokeCountRef.current++;
    
    // Companion encouragement during coloring
    if (progress.companionMode && progress.voice && canCompanionSpeak()) {
      if (strokeCountRef.current === 3) {
        companionSpeak("encouragement", progress.name, progress.lang);
        setCompanionMsg("🎨 " + progress.name + ", you're doing great!");
        window.setTimeout(() => setCompanionMsg(null), 2500);
      } else if (strokeCountRef.current === 8) {
        say(`Keep going ${progress.name}!`, progress.lang);
        setCompanionMsg("✨ Amazing " + progress.name + "!");
        window.setTimeout(() => setCompanionMsg(null), 2500);
      }
    }
    
    // Color by numbers mode - auto fill with correct color
    if (colorByNumbers && numberedFills[id]) {
      const num = numberedFills[id];
      const correctColor = getColorForNumber(num);
      const shape = art?.shapes.find((s) => s.id === id);
      const colorName = getColorName(correctColor);
      
      pushHistory(snapshot());
      setFills((prev) => ({ ...prev, [id]: correctColor }));
      sfx.fill();
      fx.burst(e.clientX, e.clientY, 16, [correctColor, "#FFFFFF", "#FFD84D"], 280);
      fx.ring(e.clientX, e.clientY, correctColor);
      fx.float(e.clientX, e.clientY - 30, `#${num}`, correctColor);
      
      // Announce the color
      say(`${colorName}! Number ${num}!`, progress.lang);
      
      // Check completion
      const remaining = art?.shapes.filter((s) => s.f !== false && !fills[s.id]).length ?? 0;
      if (remaining <= 1) window.setTimeout(celebrate, 220);
      return;
    }
    
    // Normal mode
    pushHistory(snapshot());
    const value = tool === "eraser" ? BASE_FILL : paintValue();
    const next = { ...fills, [id]: value };
    if (tool === "eraser") delete next[id];
    setFills(next);
    sfx.fill();
    fx.burst(e.clientX, e.clientY, 12, [swatch.color, "#FFFFFF"], 220);
    fx.ring(e.clientX, e.clientY, swatch.color);
    if (art && Object.keys(next).length >= fillableCount) window.setTimeout(celebrate, 220);
  };

  const getColorName = (hex: string): string => {
    const names: Record<string, string> = {
      "#FF5C7A": "Red", "#FF8A5B": "Orange", "#FFB03A": "Yellow-Orange",
      "#FFD84D": "Yellow", "#FFE066": "Light Yellow", "#7ED087": "Green",
      "#4E9D5B": "Dark Green", "#5AC8FA": "Blue", "#38C6D9": "Cyan",
      "#8E7CFF": "Purple", "#B49BE0": "Lavender", "#FF7FB6": "Pink",
      "#FF9FC4": "Light Pink", "#C98A5B": "Brown", "#FFFFFF": "White",
      "#2E2545": "Dark", "#E8E8F0": "Light Gray",
    };
    return names[hex] || "Color";
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

  // Companion greeting on mount
  useEffect(() => {
    if (progress.companionMode && progress.voice) {
      const elapsed = Date.now() - sessionStartRef.current;
      if (elapsed < 3000) {
        const hour = new Date().getHours();
        const type = hour < 12 ? "morning" : hour < 18 ? "greeting" : "evening";
        companionSpeak(type, progress.name, progress.lang, true);
        setCompanionMsg("👋 Hi " + progress.name + "!");
        window.setTimeout(() => setCompanionMsg(null), 3000);
      }
    }
  }, []);

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

  const rasterize = useCallback(async (px: number): Promise<string> => {
    const svg = svgRef.current;
    if (!svg) return "";
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("width", `${px}`);
    clone.setAttribute("height", `${px}`);
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
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, px, px);
    ctx.drawImage(img, 0, 0, px, px);
    return canvas.toDataURL("image/png");
  }, []);

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
    sfx.star();
    fx.confetti(60);
  };

  const clearAll = () => {
    pushHistory(snapshot());
    setFills({});
    setStrokes([]);
    setStickers([]);
    setDone(false);
    sfx.whoosh();
  };

  const palette = PALETTES.find((p) => p.key === paletteKey) ?? PALETTES[0];
  const left = progress.leftHanded;

  // Initialize color-by-numbers mapping
  useEffect(() => {
    if (art && colorByNumbers && Object.keys(numberedFills).length === 0) {
      const fillableShapes = art.shapes.filter((s) => s.f !== false);
      const colorMap: Record<string, number> = {};
      const usedColors = new Map<string, number>();
      let num = 1;
      
      fillableShapes.forEach((s) => {
        const colorKey = s.c;
        if (!usedColors.has(colorKey)) {
          usedColors.set(colorKey, num++);
        }
        colorMap[s.id] = usedColors.get(colorKey)!;
      });
      setNumberedFills(colorMap);
    } else if (!colorByNumbers) {
      setNumberedFills({});
    }
  }, [art, colorByNumbers]);

  const getNumberForShape = (id: string) => numberedFills[id] || 0;
  const getColorForNumber = (n: number): string => {
    const shape = art?.shapes.find((s) => numberedFills[s.id] === n);
    return shape ? (shape.c === "#FFFFFF" ? "#E8E8F0" : shape.c) : "#FFFFFF";
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[radial-gradient(circle_at_20%_10%,#fff2fb,transparent_55%),radial-gradient(circle_at_80%_0%,#e8f6ff,transparent_45%)] bg-[#FDF7FF]">
      {/* top bar */}
      <div className={`flex shrink-0 items-center gap-2 p-2 sm:gap-3 sm:p-3 ${left ? "flex-row-reverse" : ""}`}>
        <IconBtn label="Back" emoji="🏠" onClick={onExit} tone="#FF7FB6" />
        <IconBtn label="Undo" emoji="↩️" onClick={undo} disabled={!undoStack.current.length} tone="#8E7CFF" />
        <IconBtn label="Redo" emoji="↪️" onClick={redo} disabled={!redoStack.current.length} tone="#8E7CFF" />
        <div className="mx-auto truncate rounded-full bg-white/80 px-4 py-1.5 text-sm font-black text-[#5B4B7A] shadow-sm sm:text-base">
          {art ? `${art.emoji} ${art.title}` : traceGlyph ? `✍️ Trace "${traceGlyph}"` : "🎨 Free Drawing"}
        </div>
        <IconBtn label="Save" emoji="💾" onClick={saveToGallery} tone="#7ED087" />
        <IconBtn label="Export" emoji="📤" onClick={exportPng} tone="#FFB03A" />
        <button
          onClick={() => setShowRef((s) => !s)}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-md active:scale-90 ${showRef ? "bg-[#B4E7FF]" : "bg-white"}`}
          title="Reference image"
        >
          🖼️
        </button>
        <button
          onClick={() => {
            const newState = !colorByNumbers;
            setColorByNumbers(newState);
            setShowNumbers(true);
            sfx.star();
            say(newState ? "Color by numbers mode! Let's go!" : "Free coloring mode", progress.lang);
            fx.confetti(40);
          }}
          className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl shadow-lg transition active:scale-90 ${colorByNumbers ? "bg-gradient-to-b from-[#FFD84D] to-[#FFB03A] ring-4 ring-[#FFE066] animate-[pulse_1.5s_ease-in-out_infinite]" : "bg-gradient-to-b from-white to-[#FFF9E6] hover:scale-105"}`}
          title="Color by Numbers - Click to enable!"
        >
          🔢
          {!colorByNumbers && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-ping place-items-center justify-center rounded-full bg-[#FF5C7A] text-[8px] font-black text-white">
              !
            </span>
          )}
        </button>
        {colorByNumbers && (
          <button
            onClick={() => {
              setShowNumbers((s) => !s);
              sfx.tap();
            }}
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl shadow-md active:scale-90 ${showNumbers ? "bg-[#B4E7FF]" : "bg-white"}`}
            title={showNumbers ? "Hide numbers" : "Show numbers"}
          >
            {showNumbers ? "👁️" : "🙈"}
          </button>
        )}
        <button
          onClick={() => {
            setShowProgress((s) => !s);
            sfx.tap();
          }}
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl shadow-md active:scale-90 ${showProgress ? "bg-[#B4E7FF]" : "bg-white"}`}
          title={showProgress ? "Hide progress bar" : "Show progress bar"}
        >
          📊
        </button>
      </div>

      {/* main area with sidebar */}
      <div className="flex min-h-0 flex-1 gap-2 px-2 pb-2">
        {/* Left sidebar - tools & colors */}
        <div className={`flex w-20 shrink-0 flex-col gap-2 overflow-y-auto rounded-3xl bg-white/90 p-2 shadow-lg ${left ? "order-2" : ""}`}>
          {/* Tools column */}
          <div className="flex flex-col gap-1">
            {TOOLS.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  setShowStickers(t.id === "sticker");
                  sfx.tap();
                }}
                title={t.label}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-md transition active:scale-90 ${tool === t.id ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-2 ring-[#FFD84D]" : "bg-white"}`}
              >
                {t.emoji}
              </button>
            ))}
          </div>
          {/* Quick colors */}
          <div className="mt-1 flex flex-col gap-1">
            {palette.swatches.slice(0, 10).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSwatch(s);
                  if (tool === "sticker") setTool("brush");
                  sfx.tap();
                }}
                aria-label={s.id}
                className={`h-7 w-7 shrink-0 rounded-full border-2 transition active:scale-90 ${swatch.id === s.id ? "border-[#2E2545] scale-110" : "border-white"}`}
                style={{
                  background:
                    s.special === "rainbow"
                      ? "conic-gradient(#FF5C7A,#FFB03A,#FFE066,#7ED087,#5AC8FA,#8E7CFF,#FF5C7A)"
                      : s.special === "glitter"
                        ? "linear-gradient(135deg,#FFF6C9,#FFD84D,#FFB03A)"
                        : s.special === "metal"
                          ? `linear-gradient(135deg,#fff,${s.color},#fff,${s.color})`
                          : s.color,
                  boxShadow: "0 2px 6px rgba(90,60,130,.15)",
                }}
              />
            ))}
          </div>
          {/* More tools */}
          <div className="mt-1 flex flex-col gap-1">
            {TOOLS.slice(8).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  setShowStickers(t.id === "sticker");
                  sfx.tap();
                }}
                title={t.label}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-md transition active:scale-90 ${tool === t.id ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-2 ring-[#FFD84D]" : "bg-white"}`}
              >
                {t.emoji}
              </button>
            ))}
            <button onClick={() => setMirror((m) => !m)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-md ${mirror ? "bg-[#B4E7FF]" : "bg-white"}`} title="Mirror">🪞</button>
            <button onClick={() => setGrid((g) => !g)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-md ${grid ? "bg-[#DDD6FF]" : "bg-white"}`} title="Grid">▦</button>
            {art && <button onClick={magicFill} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-md" title="Magic colours">🪄</button>}
            <button onClick={clearAll} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-md" title="Clear">🗑️</button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
          <div
            className="relative aspect-square w-full max-w-[min(82vw,68vh)] touch-none rounded-[32px] bg-white shadow-[0_18px_50px_rgba(120,80,160,0.22)] ring-4 ring-white"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rot}deg)`, transition: "transform .18s ease-out" }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 400 400"
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

              <rect x="0" y="0" width="400" height="400" fill={grid ? "url(#p-grid)" : "#FFFFFF"} />

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

              {art?.shapes.map((s) => {
                const num = numberedFills[s.id];
                const isFilled = fills[s.id];
                const showNum = colorByNumbers && showNumbers && s.f !== false && num && !isFilled;
                
                // Calculate better number position - offset from center to edge
                let numX = s.cx ?? s.x ?? 200;
                let numY = s.cy ?? s.y ?? 200;
                
                // For small shapes, position number at top-right edge
                if (s.rx && s.ry && s.rx < 30 && s.ry < 30) {
                  numX = (s.cx ?? 200) + (s.rx ?? 20) * 0.6;
                  numY = (s.cy ?? 200) - (s.ry ?? 20) * 0.6;
                } else if (s.w && s.h && s.w < 40 && s.h < 40) {
                  numX = (s.x ?? 200) + s.w * 0.65;
                  numY = (s.y ?? 200) - s.h * 0.65;
                }
                
                return (
                  <g key={s.id}>
                    <ShapeEl s={s} fill={s.f === false ? s.c : (fills[s.id] ?? BASE_FILL)} onPick={pickShape} />
                    {showNum && (
                      <g className="pointer-events-none">
                        {/* White background circle for better visibility */}
                        <circle
                          cx={numX}
                          cy={numY}
                          r="14"
                          fill="#FFFFFF"
                          opacity="0.95"
                          stroke="#5B4B7A"
                          strokeWidth="2"
                        />
                        {/* Number text - smaller and clearer */}
                        <text
                          x={numX}
                          y={numY}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="13"
                          fontWeight="900"
                          fill="#5B4B7A"
                        >
                          {num}
                        </text>
                      </g>
                    )}
                  </g>
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
                          transform="translate(400,0) scale(-1,1)"
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
          </div>

          {/* Reference image popup */}
          {showRef && art && (
            <div className="absolute bottom-3 right-3 rounded-2xl bg-white/95 p-2 shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-black text-[#5B4B7A]">{art.title}</span>
                <button onClick={() => setShowRef(false)} className="text-sm">❌</button>
              </div>
              <PagePreview art={art} className="h-24 w-24" />
            </div>
          )}

          {/* Color by Numbers legend */}
          {colorByNumbers && art && (
            <div className="absolute top-3 right-3 max-h-64 w-40 overflow-y-auto rounded-2xl bg-white/95 p-2 shadow-xl">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-black text-[#5B4B7A]">🔢 Color Guide</span>
                <button
                  onClick={() => setShowNumbers((s) => !s)}
                  className="text-xs font-black text-[#8E7CFF] hover:underline"
                >
                  {showNumbers ? "🙈 Hide" : "👁️ Show"}
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(numberedFills)
                  .filter(([, n], i, arr) => arr.findIndex(([, v]) => v === n) === i)
                  .sort((a, b) => a[1] - b[1])
                  .map(([, n]) => {
                    const color = getColorForNumber(n);
                    const colorName = getColorName(color);
                    const isDone = Object.values(fills).some((f, i) => numberedFills[Object.keys(numberedFills)[i]] === n && f);
                    return (
                      <div
                        key={n}
                        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${isDone ? "bg-[#E8F4E8] opacity-50" : "bg-[#F7F3FF]"}`}
                      >
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full text-xs font-black text-white ring-1 ring-[#5B4B7A]"
                          style={{ background: color }}
                        >
                          {n}
                        </span>
                        <span className={`text-[10px] font-bold ${isDone ? "text-[#A0B0A0] line-through" : "text-[#5B4B7A]"}`}>
                          {colorName}
                        </span>
                        {isDone && <span className="ml-auto text-xs">✅</span>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {toast && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2E2545]/90 px-5 py-2 text-sm font-black text-white shadow-lg sm:text-base">
              {toast}
            </div>
          )}
          
          {/* Companion message bubble */}
          {companionMsg && progress.companionMode && (
            <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 animate-[popIn_0.3s_ease-out] rounded-3xl bg-gradient-to-r from-[#FFD84D] to-[#FFB03A] px-6 py-3 text-lg font-black text-[#5B4B7A] shadow-2xl">
              <span className="mr-2">💬</span>
              {companionMsg}
            </div>
          )}

          {/* Progress Bar */}
          {showProgress && art && (
            <div className="absolute bottom-0 left-0 right-0 rounded-b-[32px] bg-gradient-to-b from-transparent to-[#00000066] p-3">
              <div className="mx-auto max-w-md rounded-full bg-white/30 p-1 backdrop-blur-sm">
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className="text-xs font-black text-white drop-shadow">📊</span>
                  <div className="flex-1 overflow-hidden rounded-full bg-white/40">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        progressPercent === 100
                          ? "bg-gradient-to-r from-[#FFD84D] via-[#FF7FB6] to-[#7ED087] animate-[pulse_1s_ease-in-out_infinite]"
                          : progressPercent >= 75
                            ? "bg-gradient-to-r from-[#7ED087] to-[#38C6D9]"
                            : progressPercent >= 50
                              ? "bg-gradient-to-r from-[#FFB03A] to-[#FFD84D]"
                              : "bg-gradient-to-r from-[#FF7FB6] to-[#FFB03A]"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="min-w-[45px] text-right text-sm font-black text-white drop-shadow">
                    {progressPercent}%
                  </span>
                  {progressPercent === 100 && (
                    <span className="animate-[bounce_1s_infinite] text-lg">🎉</span>
                  )}
                </div>
              </div>
              {/* Milestone markers */}
              <div className="mx-auto mt-1 flex max-w-md justify-between px-1">
                {[25, 50, 75, 100].map((milestone) => (
                  <span
                    key={milestone}
                    className={`text-[10px] font-black drop-shadow ${progressPercent >= milestone ? "text-[#FFD84D]" : "text-white/50"}`}
                  >
                    {milestone === 100 ? "🏆" : milestone === 75 ? "🌟" : milestone === 50 ? "⭐" : "✨"}
                  </span>
                ))}
              </div>
            </div>
          )}
          {done && (
            <button
              onClick={() => {
                setDone(false);
                onExit();
              }}
              className="absolute bottom-3 rounded-full bg-gradient-to-r from-[#7ED087] to-[#38C6D9] px-7 py-3 text-lg font-black text-white shadow-xl active:scale-95"
            >
              🎉 Finished! Next page →
            </button>
          )}
        </div>

        {/* Right sidebar - full palette & stickers */}
        <div className={`flex w-44 shrink-0 flex-col gap-2 overflow-y-auto rounded-3xl bg-white/90 p-2 shadow-lg ${left ? "order-1" : ""}`}>
          {/* Palette tabs */}
          <div className="flex flex-wrap gap-1">
            {PALETTES.map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setPaletteKey(p.key);
                  sfx.tap();
                }}
                className={`shrink-0 rounded-xl px-2 py-1 text-xs font-black ${paletteKey === p.key ? "bg-[#2E2545] text-white" : "bg-[#F3EFFF] text-[#5B4B7A]"}`}
              >
                {p.emoji}
              </button>
            ))}
          </div>
          {/* Full color grid */}
          <div className="grid grid-cols-4 gap-1">
            {palette.swatches.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSwatch(s);
                  if (tool === "sticker") setTool("brush");
                  sfx.tap();
                }}
                aria-label={s.id}
                className={`h-9 w-9 rounded-full border-2 transition active:scale-90 ${swatch.id === s.id ? "border-[#2E2545] scale-110" : "border-white"}`}
                style={{
                  background:
                    s.special === "rainbow"
                      ? "conic-gradient(#FF5C7A,#FFB03A,#FFE066,#7ED087,#5AC8FA,#8E7CFF,#FF5C7A)"
                      : s.special === "glitter"
                        ? "linear-gradient(135deg,#FFF6C9,#FFD84D,#FFB03A)"
                        : s.special === "metal"
                          ? `linear-gradient(135deg,#fff,${s.color},#fff,${s.color})`
                          : s.color,
                  boxShadow: "0 2px 6px rgba(90,60,130,.15)",
                }}
              />
            ))}
          </div>
          {/* Size & opacity */}
          <div className="rounded-2xl bg-[#F7F3FF] p-2">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-black text-[#5B4B7A]">🖌️</span>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.1}
                value={sizeMul}
                onChange={(e) => setSizeMul(Number(e.target.value))}
                className="flex-1 accent-[#8E7CFF]"
                aria-label="Brush size"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#5B4B7A]">👻</span>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={alphaMul}
                onChange={(e) => setAlphaMul(Number(e.target.value))}
                className="flex-1 accent-[#FF7FB6]"
                aria-label="Opacity"
              />
            </div>
          </div>
          {/* Stickers */}
          <div className="mt-1">
            <div className="mb-1 flex gap-1 overflow-x-auto pb-1">
              {STICKER_PACKS.slice(0, 5).map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => setStickerPack(i)}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-black ${i === stickerPack ? "bg-[#8E7CFF] text-white" : "bg-[#F1ECFF] text-[#5B4B7A]"}`}
                >
                  {p.items[0]}
                </button>
              ))}
            </div>
            <div className="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
              {STICKER_PACKS[stickerPack].items.slice(0, 24).map((emoji, i) => (
                <button
                  key={`${emoji}${i}`}
                  onClick={() => {
                    setActiveSticker(emoji);
                    setTool("sticker");
                    sfx.tap();
                  }}
                  className={`grid h-8 w-8 place-items-center rounded-xl text-lg active:scale-90 ${activeSticker === emoji ? "bg-[#FFE9A8] ring-2 ring-[#FFB03A]" : "bg-[#F7F3FF]"}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          {/* Zoom controls */}
          <div className="rounded-2xl bg-[#F7F3FF] p-2">
            <div className="mb-1 text-xs font-black text-[#5B4B7A]">🔍 Zoom</div>
            <div className="flex gap-1">
              <button onClick={() => setZoom((z) => Math.max(0.6, z - 0.25))} className="flex-1 rounded-xl bg-white py-1 text-sm font-black">➖</button>
              <button onClick={() => setZoom(1)} className="flex-1 rounded-xl bg-white py-1 text-sm font-black">100%</button>
              <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))} className="flex-1 rounded-xl bg-white py-1 text-sm font-black">➕</button>
            </div>
            <button onClick={() => setRot((r) => (r + 90) % 360)} className="mt-1 w-full rounded-xl bg-white py-1 text-sm font-black">🔄 Rotate</button>
          </div>
        </div>
      </div>
    </div>
  );
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
