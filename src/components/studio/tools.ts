/** Drawing tools available in the Studio. */

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

export interface Stroke {
  id: string;
  tool: string;
  color: string;
  size: number;
  opacity: number;
  d: string;
}

export interface Sticker {
  id: string;
  emoji: string;
  x: number;
  y: number;
  s: number;
  r: number;
}

export interface Snapshot {
  fills: Record<string, string>;
  strokes: Stroke[];
  stickers: Sticker[];
}

export const BASE_FILL = "#FFFFFF";
