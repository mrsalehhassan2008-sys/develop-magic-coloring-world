export type ShapeKind = "ellipse" | "poly" | "path" | "line" | "rect";

export interface Shape {
  id: string;
  k: ShapeKind;
  /** suggested colour (used for previews / "magic fill") */
  c: string;
  /** false => detail line-work that children cannot recolour (eyes, mouths) */
  f?: boolean;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  r?: number;
  rot?: number;
  pts?: number[];
  d?: string;
  /** stroke width override */
  sw?: number;
  /** stroke colour override */
  sc?: string;
}

export interface PageArt {
  slug: string;
  title: string;
  category: string;
  difficulty: number;
  emoji: string;
  viewBox: string;
  shapes: Shape[];
  premium?: boolean;
}

let uid = 0;
export const nid = (p: string) => `${p}${(uid++).toString(36)}`;
export const resetIds = () => {
  uid = 0;
};

export const ell = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  c: string,
  extra: Partial<Shape> = {},
): Shape => ({ id: nid("e"), k: "ellipse", cx, cy, rx, ry, c, ...extra });

export const pth = (d: string, c: string, extra: Partial<Shape> = {}): Shape => ({
  id: nid("p"),
  k: "path",
  d,
  c,
  ...extra,
});

export const line = (d: string, extra: Partial<Shape> = {}): Shape => ({
  id: nid("l"),
  k: "line",
  d,
  c: "none",
  f: false,
  ...extra,
});

export const poly = (pts: number[], c: string, extra: Partial<Shape> = {}): Shape => ({
  id: nid("g"),
  k: "poly",
  pts,
  c,
  ...extra,
});

export const rrect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  c: string,
  extra: Partial<Shape> = {},
): Shape => ({ id: nid("r"), k: "rect", x, y, w, h, r, c, ...extra });

/** cute cartoon eye: white + pupil + sparkle (never recolourable) */
export function eye(cx: number, cy: number, s = 1): Shape[] {
  return [
    ell(cx, cy, 16 * s, 18 * s, "#FFFFFF", { f: false }),
    ell(cx + 1.5 * s, cy + 2 * s, 8.5 * s, 9.5 * s, "#2E2545", { f: false, sw: 0 }),
    ell(cx - 3 * s, cy - 4 * s, 4 * s, 4.5 * s, "#FFFFFF", { f: false, sw: 0 }),
  ];
}

export function smile(cx: number, cy: number, w = 22, depth = 16): Shape {
  return line(`M${cx - w} ${cy} Q${cx} ${cy + depth} ${cx + w} ${cy}`, { sw: 6 });
}
