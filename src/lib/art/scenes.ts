import { ell, eye, line, PageArt, pth, poly, rrect, Shape, smile } from "./shapes";

/**
 * SCENE ENGINE
 * ------------------------------------------------------------------
 * A "scene" is a full illustrated picture (a garden, a house by the sea…)
 * made of many independently-colourable regions on a large 800x600 canvas.
 * Every helper below returns absolute-positioned Shape[] so scenes compose
 * like stickers on a stage. New scenes = new data, no engine changes.
 */

const VB = "0 0 800 600";

/* ------------------------------ props ---------------------------------- */

function sky(a: string): Shape[] {
  return [rrect(0, 0, 800, 600, 0, a, { sw: 0 })];
}
function ground(y: number, a: string): Shape[] {
  return [pth(`M0 ${y} Q200 ${y - 34} 400 ${y} T800 ${y} V600 H0 Z`, a, { sw: 0 })];
}
function seaWater(y: number, a: string): Shape[] {
  const s: Shape[] = [rrect(0, y, 800, 600 - y, 0, a, { sw: 0 })];
  for (let i = 0; i < 3; i++)
    s.push(line(`M0 ${y + 34 + i * 44} q60 -18 120 0 t120 0 t120 0 t120 0 t120 0 t120 0`, { sw: 4, sc: "#FFFFFF" }));
  return s;
}
function sun(cx: number, cy: number, a: string, face = true): Shape[] {
  const s: Shape[] = [];
  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    s.push(poly([cx + Math.cos(ang) * 58, cy + Math.sin(ang) * 58, cx + Math.cos(ang + 0.13) * 96, cy + Math.sin(ang + 0.13) * 96, cx + Math.cos(ang - 0.13) * 96, cy + Math.sin(ang - 0.13) * 96], a));
  }
  s.push(ell(cx, cy, 56, 56, a));
  if (face) s.push(...eye(cx - 18, cy - 6, 0.55), ...eye(cx + 18, cy - 6, 0.55), smile(cx, cy + 16, 16, 12));
  return s;
}
function cloud(cx: number, cy: number, sc = 1, a = "#FFFFFF"): Shape[] {
  return [
    ell(cx - 34 * sc, cy, 30 * sc, 26 * sc, a),
    ell(cx, cy - 16 * sc, 38 * sc, 34 * sc, a),
    ell(cx + 36 * sc, cy, 32 * sc, 28 * sc, a),
    rrect(cx - 60 * sc, cy, 120 * sc, 26 * sc, 20 * sc, a),
  ];
}
function tree(x: number, y: number, leaf: string, trunk: string): Shape[] {
  return [
    rrect(x - 12, y - 60, 24, 90, 8, trunk),
    ell(x, y - 96, 56, 52, leaf),
    ell(x - 40, y - 70, 40, 38, leaf),
    ell(x + 40, y - 70, 40, 38, leaf),
  ];
}
function bush(x: number, y: number, a: string): Shape[] {
  return [ell(x - 26, y, 30, 26, a), ell(x + 26, y, 30, 26, a), ell(x, y - 12, 40, 36, a)];
}
function flowerSmall(x: number, y: number, petal: string, center: string): Shape[] {
  const s: Shape[] = [line(`M${x} ${y + 46} V${y + 14}`, { sw: 6, sc: "#4E9D5B" })];
  s.push(ell(x - 22, y + 30, 16, 9, "#7ED087", { rot: -24 }));
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    s.push(ell(x + Math.cos(ang) * 20, y + Math.sin(ang) * 20, 15, 12, petal, { rot: (ang * 180) / Math.PI }));
  }
  s.push(ell(x, y, 15, 15, center));
  return s;
}
function tulip(x: number, y: number, a: string): Shape[] {
  return [
    line(`M${x} ${y + 60} V${y + 6}`, { sw: 6, sc: "#4E9D5B" }),
    ell(x - 20, y + 40, 16, 9, "#7ED087", { rot: -22 }),
    ell(x + 20, y + 44, 16, 9, "#7ED087", { rot: 22 }),
    pth(`M${x - 20} ${y} q-6 -34 20 -40 q26 6 20 40 q-20 16 -40 0 z`, a),
    pth(`M${x - 20} ${y} q10 -22 20 -22 q10 0 20 22`, "none", { f: false, sw: 4 }),
  ];
}
function house(x: number, y: number, wall: string, roof: string, door: string): Shape[] {
  return [
    rrect(x - 80, y - 120, 160, 120, 12, wall),
    poly([x - 96, y - 118, x, y - 200, x + 96, y - 118], roof),
    rrect(x - 26, y - 66, 52, 66, 8, door),
    ell(x + 14, y - 34, 5, 5, "#4A3C63", { f: false }),
    rrect(x - 64, y - 96, 40, 40, 6, "#BFEAFF"),
    rrect(x + 24, y - 96, 40, 40, 6, "#BFEAFF"),
    line(`M${x - 44} ${y - 96} v40 M${x - 64} ${y - 76} h40`, { sw: 3 }),
    line(`M${x + 44} ${y - 96} v40 M${x + 24} ${y - 76} h40`, { sw: 3 }),
    rrect(x + 40, y - 190, 22, 40, 4, "#C98A5B"),
  ];
}
function butterfly(x: number, y: number, a: string, b: string): Shape[] {
  return [
    ell(x - 22, y - 14, 20, 24, a, { rot: -18 }),
    ell(x + 22, y - 14, 20, 24, a, { rot: 18 }),
    ell(x - 20, y + 16, 16, 18, b, { rot: -16 }),
    ell(x + 20, y + 16, 16, 18, b, { rot: 16 }),
    rrect(x - 4, y - 22, 8, 46, 4, "#5A4A6E"),
    line(`M${x - 3} ${y - 22} q-10 -16 -18 -12`, { sw: 3 }),
    line(`M${x + 3} ${y - 22} q10 -16 18 -12`, { sw: 3 }),
  ];
}

/* small friendly critters that stand inside a scene ---------------------- */
function sceneRabbit(x: number, y: number, a: string): Shape[] {
  return [
    ell(x - 12, y - 74, 12, 34, a, { rot: -12 }),
    ell(x + 12, y - 74, 12, 34, a, { rot: 12 }),
    ell(x, y - 30, 40, 36, a),
    ell(x, y + 26, 44, 34, a),
    ell(x, y - 22, 12, 8, "#FFB4C6"),
    ...eye(x - 15, y - 34, 0.5),
    ...eye(x + 15, y - 34, 0.5),
    smile(x, y - 12, 8, 6),
  ];
}
function sceneCat(x: number, y: number, a: string): Shape[] {
  return [
    poly([x - 30, y - 40, x - 40, y - 78, x - 8, y - 54], a),
    poly([x + 30, y - 40, x + 40, y - 78, x + 8, y - 54], a),
    ell(x, y - 30, 40, 36, a),
    ell(x, y + 30, 46, 34, a),
    pth(`M${x + 44} ${y + 30} q40 -10 30 -50`, a),
    ...eye(x - 15, y - 34, 0.5),
    ...eye(x + 15, y - 34, 0.5),
    ell(x, y - 20, 6, 5, "#FFB4C6"),
    line(`M${x - 40} ${y - 24} h-24 M${x + 40} ${y - 24} h24`, { sw: 3 }),
    smile(x, y - 12, 8, 6),
  ];
}
function sceneDuck(x: number, y: number, a: string): Shape[] {
  return [
    ell(x, y + 20, 40, 32, a),
    ell(x - 26, y - 18, 26, 24, a),
    poly([x - 44, y - 20, x - 72, y - 12, x - 44, y - 4], "#FFB03A"),
    ...eye(x - 30, y - 24, 0.45),
    pth(`M${x + 26} ${y + 10} q34 -6 26 26`, a),
  ];
}
function fishInWater(x: number, y: number, a: string): Shape[] {
  return [
    ell(x, y, 34, 24, a),
    poly([x + 30, y, x + 54, y - 16, x + 54, y + 16], a),
    ...eye(x - 12, y - 6, 0.42),
    smile(x - 16, y + 4, 6, 4),
  ];
}
function boat(x: number, y: number, hull: string, sail: string): Shape[] {
  return [
    pth(`M${x - 80} ${y} h160 l-24 40 h-112 z`, hull),
    line(`M${x} ${y - 96} V${y}`, { sw: 6, sc: "#8A5A2B" }),
    poly([x + 6, y - 92, x + 6, y - 8, x + 70, y - 20], sail),
    poly([x - 6, y - 92, x - 6, y - 20, x - 60, y - 30], sail),
  ];
}
function starfishOnSand(x: number, y: number, a: string): Shape[] {
  const pts: number[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 10 : 26;
    const ang = (i / 10) * Math.PI * 2 - Math.PI / 2;
    pts.push(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
  }
  return [poly(pts, a)];
}
function palm(x: number, y: number): Shape[] {
  const s: Shape[] = [pth(`M${x} ${y} q-16 -80 8 -150`, "none", { f: false, sw: 14, sc: "#B07C4F" })];
  const leaf = "#7ED087";
  [-1, -0.4, 0.4, 1].forEach((d) => s.push(pth(`M${x + 6} ${y - 150} q${d * 90} ${-20} ${d * 120} 30 q${-d * 60} ${-40} ${-d * 118} -14 z`, leaf)));
  s.push(ell(x - 6, y - 150, 10, 10, "#8A5A2B"), ell(x + 10, y - 158, 9, 9, "#8A5A2B"));
  return s;
}

function rainbow(cx: number, cy: number): Shape[] {
  const cols = ["#FF5C7A", "#FF9F68", "#FFD84D", "#7ED087", "#5AC8FA", "#8E7CFF"];
  return cols.map((c, i) => {
    const r = 150 - i * 20;
    // arcs are decorative (not fillable) but each band keeps its rainbow colour
    return pth(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`, c, { f: false, sw: 18, sc: c });
  });
}
function mountain(x: number, base: number, w: number, h: number, a: string, cap = "#FFFFFF"): Shape[] {
  return [
    poly([x - w, base, x, base - h, x + w, base], a),
    poly([x - w * 0.34, base - h * 0.66, x, base - h, x + w * 0.34, base - h * 0.66], cap),
  ];
}
function plane(x: number, y: number, a: string): Shape[] {
  return [
    rrect(x - 60, y - 14, 130, 30, 15, a),
    poly([x + 60, y - 10, x + 92, y - 26, x + 74, y + 2], a),
    poly([x - 10, y, x + 6, y - 40, x + 30, y], "#FFD84D"),
    poly([x - 10, y, x + 6, y + 40, x + 30, y], "#FFD84D"),
    rrect(x - 44, y - 6, 12, 12, 3, "#BFEAFF"),
    rrect(x - 24, y - 6, 12, 12, 3, "#BFEAFF"),
    rrect(x - 4, y - 6, 12, 12, 3, "#BFEAFF"),
  ];
}
function rocket(x: number, y: number, a: string, b: string): Shape[] {
  return [
    pth(`M${x} ${y - 120} q40 40 40 110 v40 h-80 v-40 q0 -70 40 -110 z`, a),
    pth(`M${x - 40} ${y + 20} q-34 14 -30 54 l30 -18 z`, b),
    pth(`M${x + 40} ${y + 20} q34 14 30 54 l-30 -18 z`, b),
    ell(x, y - 50, 22, 22, "#BFEAFF"),
    pth(`M${x - 24} ${y + 60} q24 50 48 0 q-24 16 -48 0 z`, "#FF9E4D"),
  ];
}
function penguin(x: number, y: number, a: string): Shape[] {
  return [
    ell(x, y, 40, 50, a),
    ell(x, y + 6, 26, 38, "#FFFFFF"),
    ell(x - 30, y + 6, 14, 26, a, { rot: 20 }),
    ell(x + 30, y + 6, 14, 26, a, { rot: -20 }),
    ...eye(x - 12, y - 20, 0.5),
    ...eye(x + 12, y - 20, 0.5),
    poly([x - 8, y - 8, x + 8, y - 8, x, y + 2], "#FFB03A"),
    poly([x - 12, y + 50, x - 30, y + 60, x - 2, y + 60], "#FFB03A"),
    poly([x + 12, y + 50, x + 2, y + 60, x + 30, y + 60], "#FFB03A"),
  ];
}
function snowman(x: number, y: number): Shape[] {
  return [
    ell(x, y, 46, 42, "#FFFFFF"),
    ell(x, y - 60, 32, 30, "#FFFFFF"),
    ell(x, y - 96, 22, 21, "#FFFFFF"),
    ...eye(x - 8, y - 100, 0.4),
    ...eye(x + 8, y - 100, 0.4),
    poly([x, y - 94, x + 24, y - 90, x, y - 86], "#FF9F68"),
    rrect(x - 22, y - 128, 44, 12, 2, "#5A4A6E"),
    rrect(x - 14, y - 150, 28, 24, 4, "#5A4A6E"),
    ell(x, y - 58, 5, 5, "#2E2545", { f: false }),
    ell(x, y - 44, 5, 5, "#2E2545", { f: false }),
  ];
}
function cake(x: number, y: number, a: string, b: string): Shape[] {
  return [
    rrect(x - 70, y - 60, 140, 70, 14, a),
    pth(`M${x - 70} ${y - 52} q18 22 36 0 q18 22 36 0 q18 22 34 0 v-16 h-106 z`, b),
    ...[-40, 0, 40].map((dx) => rrect(x + dx - 5, y - 108, 10, 42, 4, "#FFF1F5")),
    ...[-40, 0, 40].map((dx) => pth(`M${x + dx} ${y - 108} q-10 -14 0 -26 q10 12 0 26 z`, "#FFB03A")),
  ];
}
function balloon(x: number, y: number, a: string): Shape[] {
  return [
    line(`M${x} ${y + 42} q8 20 0 60`, { sw: 3 }),
    ell(x, y, 30, 36, a),
    poly([x - 6, y + 34, x + 6, y + 34, x, y + 44], a),
    ell(x - 10, y - 12, 6, 9, "#FFFFFF", { f: false }),
  ];
}
function city(x: number, base: number): Shape[] {
  const s: Shape[] = [];
  const cols = ["#8E7CFF", "#5AC8FA", "#FF9F68", "#7ED087", "#FF7FB6"];
  const hs = [180, 240, 150, 210, 170];
  for (let i = 0; i < 5; i++) {
    const bx = x + i * 74;
    s.push(rrect(bx, base - hs[i], 62, hs[i], 8, cols[i]));
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 2; c++) s.push(rrect(bx + 10 + c * 28, base - hs[i] + 20 + r * 40, 16, 20, 3, "#FFF3B8"));
  }
  return s;
}

/* ------------------------------ scenes --------------------------------- */

export interface SceneDef {
  slug: string;
  title: string;
  emoji: string;
  difficulty: number; // 1 easy · 2 medium · 3 hard
  build: () => Shape[];
}

const SCENES: SceneDef[] = [
  {
    slug: "scene-flower-garden",
    title: "Flower Garden",
    emoji: "🌷",
    difficulty: 1,
    build: () => [
      ...sky("#CFEBFF"),
      ...sun(120, 110, "#FFD84D"),
      ...cloud(560, 110, 1),
      ...cloud(680, 180, 0.7),
      ...ground(430, "#9CE0A8"),
      ...tree(110, 470, "#7ED087", "#B07C4F"),
      ...tree(700, 470, "#8FD98A", "#A9723F"),
      ...bush(400, 470, "#7ED087"),
      ...butterfly(300, 250, "#FF7FB6", "#FFD84D"),
      ...butterfly(520, 300, "#8E7CFF", "#5AC8FA"),
      ...flowerSmall(150, 500, "#FF5C7A", "#FFD84D"),
      ...flowerSmall(250, 520, "#FFB03A", "#FF7FB6"),
      ...tulip(360, 520, "#FF7FB6"),
      ...tulip(440, 520, "#FFD84D"),
      ...flowerSmall(540, 520, "#8E7CFF", "#FFE066"),
      ...flowerSmall(650, 500, "#38C6D9", "#FFD84D"),
      ...sceneRabbit(400, 430, "#F2F0FF"),
    ],
  },
  {
    slug: "scene-house-by-sea",
    title: "House by the Sea",
    emoji: "🏖️",
    difficulty: 2,
    build: () => [
      ...sky("#BFE9FF"),
      ...sun(680, 110, "#FFD84D"),
      ...cloud(180, 120, 0.9),
      ...seaWater(380, "#5AC8FA"),
      ...ground(500, "#FFE3A8"),
      ...house(250, 500, "#FFF0D8", "#FF7FB6", "#C98A5B"),
      ...palm(560, 500),
      ...boat(560, 430, "#FF8A5B", "#FFFFFF"),
      ...fishInWater(220, 470, "#FF9F68"),
      ...fishInWater(360, 500, "#8E7CFF"),
      ...starfishOnSand(430, 540, "#FFB03A"),
      ...starfishOnSand(660, 550, "#FF7FB6"),
      ...cloud(430, 90, 0.7),
    ],
  },
  {
    slug: "scene-happy-farm",
    title: "Happy Farm",
    emoji: "🚜",
    difficulty: 2,
    build: () => [
      ...sky("#CFEBFF"),
      ...sun(110, 100, "#FFD84D"),
      ...cloud(500, 110, 1),
      ...cloud(660, 90, 0.7),
      ...ground(420, "#9CE0A8"),
      // barn
      rrect(90, 250, 220, 170, 10, "#FF6B6B"),
      poly([74, 250, 200, 170, 326, 250], "#C24B2C"),
      rrect(160, 320, 80, 100, 6, "#8A5A2B"),
      line("M200 320 v100 M160 370 h80", { sw: 4 }),
      rrect(140, 268, 120, 40, 6, "#FFF0D8"),
      ...tree(700, 460, "#7ED087", "#B07C4F"),
      ...bush(500, 470, "#8FD98A"),
      ...sceneDuck(420, 470, "#FFD84D"),
      ...sceneCat(560, 460, "#FFB86B"),
      ...flowerSmall(360, 520, "#FF7FB6", "#FFD84D"),
      ...flowerSmall(640, 520, "#FF5C7A", "#FFE066"),
    ],
  },
  {
    slug: "scene-under-the-sea",
    title: "Under the Sea",
    emoji: "🐠",
    difficulty: 3,
    build: () => [
      ...sky("#7ED9FF"),
      rrect(0, 0, 800, 600, 0, "#38C6D9", { sw: 0 }),
      // seabed
      pth("M0 500 Q200 460 400 500 T800 500 V600 H0 Z", "#FFE3A8", { sw: 0 }),
      // sun rays
      poly([120, 0, 220, 0, 160, 260, 120, 260], "#8FE6FF"),
      poly([300, 0, 380, 0, 320, 280, 280, 280], "#8FE6FF"),
      ...fishInWater(240, 220, "#FF9F68"),
      ...fishInWater(520, 180, "#FFD84D"),
      ...fishInWater(600, 340, "#FF7FB6"),
      // seaweed
      pth("M120 500 q-20 -80 8 -160 q-24 80 -8 160 z", "#7ED087"),
      pth("M160 500 q22 -70 -6 -150 q24 70 6 150 z", "#5FA36A"),
      pth("M680 500 q-22 -80 6 -160 q-22 80 -6 160 z", "#7ED087"),
      // starfish + shell + bubbles
      ...starfishOnSand(300, 520, "#FFB03A"),
      ...starfishOnSand(500, 540, "#8E7CFF"),
      pth("M400 540 q-40 0 -40 -34 q0 -40 40 -40 q40 0 40 40 q0 34 -40 34 z", "#FFC2DE"),
      ell(160, 120, 16, 16, "#CFF6FF"),
      ell(120, 80, 10, 10, "#CFF6FF"),
      ell(600, 140, 14, 14, "#CFF6FF"),
    ],
  },
  {
    slug: "scene-sunny-park",
    title: "Sunny Park",
    emoji: "🌳",
    difficulty: 2,
    build: () => [
      ...sky("#CFEBFF"),
      ...sun(690, 100, "#FFD84D"),
      ...cloud(160, 110, 1),
      ...cloud(400, 80, 0.7),
      ...ground(440, "#9CE0A8"),
      // pond
      ell(560, 500, 130, 46, "#5AC8FA"),
      ...fishInWater(560, 496, "#FF9F68"),
      ...tree(150, 470, "#7ED087", "#B07C4F"),
      ...tree(360, 480, "#8FD98A", "#A9723F"),
      // bench
      rrect(230, 470, 110, 14, 4, "#C98A5B"),
      rrect(238, 484, 10, 34, 3, "#B07C4F"),
      rrect(322, 484, 10, 34, 3, "#B07C4F"),
      ...butterfly(300, 260, "#FF7FB6", "#FFE066"),
      ...sceneDuck(500, 494, "#FFD84D"),
      ...flowerSmall(120, 520, "#FF5C7A", "#FFD84D"),
      ...flowerSmall(430, 530, "#8E7CFF", "#FFE066"),
      ...tulip(680, 520, "#FF7FB6"),
    ],
  },
  {
    slug: "scene-cozy-home",
    title: "Cozy Home",
    emoji: "🏡",
    difficulty: 3,
    build: () => [
      ...sky("#FFE6C7"),
      ...sun(120, 110, "#FF9F68"),
      ...cloud(560, 100, 0.8, "#FFF3E0"),
      ...ground(450, "#9CE0A8"),
      ...house(400, 500, "#FFF0D8", "#8E7CFF", "#C98A5B"),
      ...tree(120, 480, "#7ED087", "#B07C4F"),
      ...tree(680, 480, "#8FD98A", "#A9723F"),
      // path
      pth("M374 500 q26 60 -80 100 h212 q-106 -40 -80 -100 z", "#E7D3A8", { sw: 0 }),
      ...bush(560, 490, "#7ED087"),
      ...bush(240, 490, "#8FD98A"),
      ...flowerSmall(200, 540, "#FF5C7A", "#FFD84D"),
      ...flowerSmall(600, 540, "#8E7CFF", "#FFE066"),
      ...sceneCat(300, 500, "#FFB86B"),
    ],
  },
  {
    slug: "scene-rainbow-hill",
    title: "Rainbow Hill",
    emoji: "🌈",
    difficulty: 1,
    build: () => [
      ...sky("#EAF6FF"),
      ...sun(120, 110, "#FFD84D"),
      ...rainbow(400, 320),
      ...ground(400, "#9CE0A8"),
      ...cloud(220, 320, 0.8),
      ...cloud(560, 320, 0.8),
      ...flowerSmall(180, 500, "#FF5C7A", "#FFD84D"),
      ...flowerSmall(300, 520, "#8E7CFF", "#FFE066"),
      ...flowerSmall(500, 520, "#FFB03A", "#FF7FB6"),
      ...flowerSmall(620, 500, "#38C6D9", "#FFD84D"),
      ...sceneRabbit(400, 470, "#F2F0FF"),
    ],
  },
  {
    slug: "scene-birthday-party",
    title: "Birthday Party",
    emoji: "🎂",
    difficulty: 2,
    build: () => [
      ...sky("#FFF0F6"),
      ...cloud(120, 100, 0.7, "#FFF"),
      // bunting
      line("M40 90 Q400 150 760 90", { sw: 3 }),
      ...[100, 200, 300, 400, 500, 600, 700].map((bx, i) =>
        poly([bx - 16, 100, bx + 16, 100, bx, 140], ["#FF5C7A", "#FFD84D", "#7ED087", "#5AC8FA", "#8E7CFF", "#FF9F68", "#FF7FB6"][i]),
      ),
      ...ground(460, "#DCCBF5"),
      ...cake(400, 470, "#FFD1E6", "#FF9FC4"),
      ...balloon(150, 260, "#FF5C7A"),
      ...balloon(210, 220, "#5AC8FA"),
      ...balloon(650, 250, "#7ED087"),
      ...balloon(590, 210, "#FFD84D"),
      // gift boxes
      rrect(120, 500, 90, 80, 8, "#8E7CFF"),
      rrect(158, 500, 14, 80, 2, "#FFD84D"),
      rrect(120, 532, 90, 14, 2, "#FFD84D"),
      rrect(600, 500, 90, 80, 8, "#FF9F68"),
      rrect(638, 500, 14, 80, 2, "#FFF"),
    ],
  },
  {
    slug: "scene-airport",
    title: "At the Airport",
    emoji: "✈️",
    difficulty: 2,
    build: () => [
      ...sky("#CFEBFF"),
      ...sun(700, 100, "#FFD84D"),
      ...cloud(180, 130, 1),
      ...cloud(430, 90, 0.7),
      ...plane(360, 220, "#FFFFFF"),
      ...ground(460, "#C7D3B8"),
      // runway
      rrect(120, 480, 560, 60, 8, "#6D6A86"),
      ...[180, 300, 420, 540].map((rx) => rrect(rx, 505, 44, 8, 2, "#FFF3B8")),
      // tower
      rrect(90, 360, 60, 120, 8, "#FF9F68"),
      rrect(80, 330, 80, 40, 8, "#BFEAFF"),
      ...plane(560, 500, "#FFB4C6"),
    ],
  },
  {
    slug: "scene-winter-fun",
    title: "Winter Fun",
    emoji: "⛄",
    difficulty: 2,
    build: () => [
      ...sky("#DCEEFF"),
      ...cloud(180, 110, 1, "#FFFFFF"),
      ...cloud(620, 130, 0.8, "#FFFFFF"),
      ...ground(440, "#FFFFFF"),
      ...mountain(200, 440, 160, 210, "#CFE0F5"),
      ...mountain(560, 440, 190, 250, "#BFD3EE"),
      ...snowman(400, 470),
      ...tree(120, 470, "#7ED087", "#B07C4F"),
      ...tree(680, 470, "#8FD98A", "#A9723F"),
      ...penguin(240, 520, "#3B3050"),
      // snowflakes
      ...[[120, 200], [300, 160], [500, 190], [650, 220]].map(([sx, sy]) => ell(sx, sy, 8, 8, "#FFFFFF")),
    ],
  },
  {
    slug: "scene-space-adventure",
    title: "Space Adventure",
    emoji: "🚀",
    difficulty: 3,
    build: () => [
      rrect(0, 0, 800, 600, 0, "#2A1E63", { sw: 0 }),
      ...rocket(400, 300, "#FF5C7A", "#5AC8FA"),
      // planet with ring
      ell(150, 160, 70, 70, "#FFB03A"),
      pth("M60 160 q90 44 180 0 q-90 30 -180 0 z", "#FFD84D", { rot: -16 }),
      ell(650, 460, 56, 56, "#7ED087"),
      // stars
      ...[[100, 380], [250, 480], [680, 120], [560, 220], [300, 90], [720, 300]].map(([sx, sy]) =>
        poly([sx, sy - 14, sx + 4, sy - 4, sx + 15, sy, sx + 4, sy + 5, sx, sy + 15, sx - 4, sy + 5, sx - 15, sy, sx - 4, sy - 4], "#FFE066"),
      ),
      // moon bottom
      pth("M0 560 q400 -60 800 0 v40 h-800 z", "#C7D3F5", { sw: 0 }),
      ...[[120, 560], [400, 545], [640, 560]].map(([mx, my]) => ell(mx, my, 22, 14, "#AEBCE0")),
    ],
  },
  {
    slug: "scene-busy-city",
    title: "Busy City",
    emoji: "🏙️",
    difficulty: 3,
    build: () => [
      ...sky("#FFE6C7"),
      ...sun(700, 110, "#FF9F68"),
      ...cloud(160, 110, 0.8, "#FFF3E0"),
      ...city(90, 480),
      ...ground(480, "#8A8AA6"),
      // road
      rrect(0, 500, 800, 100, 0, "#5B5872"),
      ...[60, 200, 340, 480, 620, 760].map((rx) => rrect(rx, 545, 60, 8, 2, "#FFF3B8")),
      // little cars
      rrect(140, 520, 90, 36, 12, "#FF5C7A"),
      rrect(160, 506, 46, 20, 8, "#BFEAFF"),
      ell(160, 558, 12, 12, "#2E2545"),
      ell(212, 558, 12, 12, "#2E2545"),
      rrect(520, 520, 90, 36, 12, "#38C6D9"),
      rrect(540, 506, 46, 20, 8, "#BFEAFF"),
      ell(540, 558, 12, 12, "#2E2545"),
      ell(592, 558, 12, 12, "#2E2545"),
    ],
  },
  {
    slug: "scene-playground", title: "Playground", emoji: "🛝", difficulty: 2,
    build: () => [...sky("#CFEBFF"), ...sun(110,100,"#FFD84D"), ...cloud(600,110,0.9), ...ground(430,"#9CE0A8"),
      ...tree(90,470,"#7ED087","#B07C4F"), ...tree(710,470,"#8FD98A","#A9723F"),
      rrect(300,300,26,140,6,"#FF8A5B"), rrect(470,300,26,140,6,"#FF8A5B"), rrect(290,290,220,22,8,"#FFD84D"),
      pth("M316 320 q60 40 154 0","none",{f:false,sw:6}),
      ...sceneRabbit(400,470,"#F2F0FF"), ...sceneDuck(200,480,"#FFD84D"), ...butterfly(560,300,"#FF7FB6","#FFD84D"),
      ...flowerSmall(150,520,"#FF5C7A","#FFD84D"), ...flowerSmall(640,520,"#8E7CFF","#FFE066")],
  },
  {
    slug: "scene-aquarium", title: "Aquarium", emoji: "🐠", difficulty: 2,
    build: () => [rrect(0,0,800,600,0,"#7ED9FF",{sw:0}),
      pth("M120 600 q-20 -120 10 -220 q-26 120 -10 220 z","#7ED087"), pth("M680 600 q22 -110 -8 -210 q26 110 8 210 z","#5FA36A"),
      ...fishInWater(240,200,"#FF9F68"), ...fishInWater(480,300,"#8E7CFF"), ...fishInWater(600,160,"#FFD84D"), ...fishInWater(340,420,"#FF7FB6"),
      ...starfishOnSand(180,540,"#FFB03A"), ...starfishOnSand(560,550,"#FF7FB6"),
      ell(140,120,14,14,"#CFF6FF"), ell(640,90,12,12,"#CFF6FF"), ell(420,80,10,10,"#CFF6FF")],
  },
  {
    slug: "scene-jungle", title: "Jungle", emoji: "🌴", difficulty: 3,
    build: () => [...sky("#DFF6E1"), ...sun(690,90,"#FFD84D"), ...ground(450,"#7ED087"),
      ...palm(120,480), ...palm(680,480), ...tree(400,470,"#5FA36A","#8A5A2B"), ...bush(260,490,"#7ED087"), ...bush(540,490,"#8FD98A"),
      ...sceneCat(400,440,"#FFB86B"), ...butterfly(240,260,"#8E7CFF","#FFD84D"), ...butterfly(560,240,"#FF7FB6","#FFE066"),
      ...flowerSmall(180,530,"#FF5C7A","#FFD84D"), ...flowerSmall(620,530,"#FFB03A","#FF7FB6")],
  },
  {
    slug: "scene-castle", title: "Castle", emoji: "🏰", difficulty: 3,
    build: () => [...sky("#EAF0FF"), ...sun(110,100,"#FFD84D"), ...cloud(620,100,0.9), ...ground(460,"#9CE0A8"),
      rrect(280,260,240,200,10,"#E9ECFF"), rrect(240,200,70,260,8,"#D9DEF5"), rrect(490,200,70,260,8,"#D9DEF5"),
      poly([232,200,275,130,318,200],"#8E7CFF"), poly([482,200,525,130,568,200],"#8E7CFF"), poly([330,260,400,180,470,260],"#FF7FB6"),
      rrect(370,360,60,100,30,"#8A5A2B"), rrect(300,300,40,50,6,"#BFEAFF"), rrect(460,300,40,50,6,"#BFEAFF"),
      ...flowerSmall(180,520,"#FF5C7A","#FFD84D"), ...flowerSmall(620,520,"#FFB03A","#FF7FB6"), ...sceneRabbit(200,470,"#F2F0FF")],
  },
  {
    slug: "scene-picnic", title: "Picnic", emoji: "🧺", difficulty: 2,
    build: () => [...sky("#CFEBFF"), ...sun(690,100,"#FFD84D"), ...cloud(160,110,0.9), ...ground(440,"#9CE0A8"),
      ...tree(90,470,"#7ED087","#B07C4F"), ...tree(710,470,"#8FD98A","#A9723F"),
      rrect(300,470,200,60,16,"#FF7FB6"), rrect(300,470,200,12,4,"#FFFFFF"),
      ell(350,470,24,18,"#FFD84D"), ell(450,470,24,18,"#FF5C7A"), ell(400,460,20,14,"#7ED087"),
      ...sceneRabbit(220,470,"#F2F0FF"), ...sceneCat(580,470,"#FFB86B"), ...butterfly(400,300,"#8E7CFF","#FFD84D"),
      ...flowerSmall(140,530,"#FFB03A","#FF7FB6"), ...flowerSmall(660,530,"#38C6D9","#FFD84D")],
  },
  {
    slug: "scene-zoo", title: "Zoo Day", emoji: "🦁", difficulty: 3,
    build: () => [...sky("#CFEBFF"), ...sun(110,100,"#FFD84D"), ...ground(450,"#9CE0A8"),
      ...tree(80,470,"#7ED087","#B07C4F"), ...tree(720,470,"#8FD98A","#A9723F"),
      ...sceneRabbit(200,470,"#F2F0FF"), ...sceneDuck(400,480,"#FFD84D"), ...sceneCat(600,470,"#FFB86B"),
      line("M120 520 h560",{sw:6}), line("M160 520 v40",{sw:6}), line("M280 520 v40",{sw:6}), line("M400 520 v40",{sw:6}), line("M520 520 v40",{sw:6}), line("M640 520 v40",{sw:6}),
      ...cloud(560,100,0.8), ...butterfly(300,260,"#FF7FB6","#FFD84D")],
  },
  {
    slug: "scene-desert", title: "Desert", emoji: "🏜️", difficulty: 2,
    build: () => [...sky("#FFE6C7"), ...sun(400,110,"#FF9F68"), ...ground(450,"#F0D9A8"),
      rrect(180,330,34,130,14,"#7ED087"), rrect(150,360,30,16,8,"#7ED087"), rrect(214,340,30,16,8,"#7ED087"),
      rrect(600,360,28,100,12,"#7ED087"), rrect(576,384,24,14,7,"#7ED087"),
      ...sceneCat(420,470,"#E0BE93"), ...starfishOnSand(300,540,"#C98A5B"), ...starfishOnSand(540,550,"#B07C4F"),
      ...cloud(160,110,0.7,"#FFF3E0"), ...cloud(640,120,0.7,"#FFF3E0")],
  },
  {
    slug: "scene-arctic", title: "Arctic", emoji: "❄️", difficulty: 2,
    build: () => [...sky("#DCEEFF"), ...cloud(160,100,0.9,"#FFFFFF"), ...cloud(620,120,0.7,"#FFFFFF"), ...ground(450,"#FFFFFF"),
      ...mountain(200,450,170,220,"#CFE0F5"), ...mountain(580,450,200,260,"#BFD3EE"),
      ...snowman(360,470), ...penguin(520,490,"#3B3050"), ...penguin(240,500,"#5B6180"),
      ell(120,160,8,8,"#FFFFFF"), ell(680,200,8,8,"#FFFFFF"), ell(420,120,7,7,"#FFFFFF")],
  },
];

let cache: PageArt[] | null = null;

export function buildScenes(): PageArt[] {
  if (cache) return cache;
  cache = [...SCENES]
    .sort((a, b) => a.difficulty - b.difficulty) // easy → hard progression
    .map((sc) => ({
      slug: sc.slug,
      title: sc.title,
      category: "scenes",
      difficulty: sc.difficulty,
      emoji: sc.emoji,
      viewBox: VB,
      shapes: sc.build(),
    }));
  return cache;
}
