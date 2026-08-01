import { ell, eye, line, PageArt, pth, poly, rrect, Shape, smile } from "./shapes";

/* ------------------------------------------------------------------ */
/* CRITTERS – land + farm animals                                      */
/* ------------------------------------------------------------------ */

export type Ear = "round" | "pointy" | "long" | "floppy" | "tuft" | "none";

export interface CritterOpts {
  fur: string;
  belly?: string;
  ear?: Ear;
  earIn?: string;
  snout?: "none" | "oval" | "pig" | "long" | "beak";
  snoutColor?: string;
  cheeks?: string;
  mane?: string;
  fluff?: boolean;
  horns?: boolean;
  spots?: string;
  stripes?: number;
  whiskers?: boolean;
  tail?: "none" | "puff" | "long" | "curl";
  tailColor?: string;
  headY?: number;
}

export function critter(o: CritterOpts): Shape[] {
  const s: Shape[] = [];
  const hy = o.headY ?? 172;
  const fur = o.fur;
  const dark = o.earIn ?? "#F7B4C6";

  // tail (behind everything)
  if (o.tail === "puff") s.push(ell(312, 306, 30, 30, o.tailColor ?? fur));
  if (o.tail === "long")
    s.push(pth("M300 316 q66 6 56 -66 q-4 -26 -26 -20 q-16 6 -8 26", o.tailColor ?? fur));
  if (o.tail === "curl") s.push(pth("M298 300 q40 -6 26 -34 q-10 -18 -24 -6", o.tailColor ?? fur));

  if (o.mane) s.push(ell(200, hy, 116, 106, o.mane));
  if (o.fluff) {
    const c: number[][] = [
      [124, 132],
      [200, 92],
      [276, 132],
      [300, 200],
      [110, 200],
    ];
    c.forEach(([x, y]) => s.push(ell(x, y, 44, 42, o.mane ?? "#FFF6E4")));
  }

  // body
  s.push(ell(200, 296, 84, 68, fur));
  if (o.belly) s.push(ell(200, 308, 52, 48, o.belly));
  s.push(ell(156, 350, 27, 21, fur), ell(244, 350, 27, 21, fur));

  // ears
  const ear = o.ear ?? "round";
  if (ear === "round") {
    s.push(ell(139, 108, 36, 36, fur), ell(261, 108, 36, 36, fur));
    s.push(ell(141, 112, 18, 18, dark), ell(259, 112, 18, 18, dark));
  } else if (ear === "pointy") {
    s.push(poly([128, 128, 146, 34, 200, 96], fur), poly([272, 128, 254, 34, 200, 96], fur));
    s.push(poly([144, 116, 152, 66, 180, 100], dark), poly([256, 116, 248, 66, 220, 100], dark));
  } else if (ear === "long") {
    s.push(
      ell(158, 62, 23, 62, fur, { rot: -10 }),
      ell(242, 62, 23, 62, fur, { rot: 10 }),
      ell(158, 66, 11, 42, dark, { rot: -10 }),
      ell(242, 66, 11, 42, dark, { rot: 10 }),
    );
  } else if (ear === "floppy") {
    s.push(ell(112, 186, 30, 58, fur, { rot: 14 }), ell(288, 186, 30, 58, fur, { rot: -14 }));
  } else if (ear === "tuft") {
    s.push(
      poly([150, 110, 132, 44, 190, 88], fur),
      poly([250, 110, 268, 44, 210, 88], fur),
      ell(139, 118, 20, 20, fur),
      ell(261, 118, 20, 20, fur),
    );
  }

  if (o.horns) {
    s.push(
      pth("M140 108 q-34 -14 -30 -44 q22 -4 40 26", "#F3E2C0"),
      pth("M260 108 q34 -14 30 -44 q-22 -4 -40 26", "#F3E2C0"),
    );
  }

  // head
  s.push(ell(200, hy, 92, 84, fur));
  if (o.spots) {
    s.push(ell(150, 140, 24, 18, o.spots, { rot: -18 }), ell(246, 296, 26, 20, o.spots, { rot: 12 }));
  }
  if (o.stripes) {
    for (let i = 0; i < o.stripes; i++) {
      const x = 160 + i * 28;
      s.push(pth(`M${x} 104 q8 22 0 42`, "#3A3050", { f: false, sw: 8 }));
    }
  }

  // snout
  if (o.snout === "oval") {
    s.push(ell(200, 208, 38, 28, o.snoutColor ?? "#FFF3E2"));
    s.push(ell(200, 194, 14, 10, "#4A3C63", { f: false }));
  } else if (o.snout === "pig") {
    s.push(ell(200, 206, 34, 26, o.snoutColor ?? "#FFC2D4"));
    s.push(ell(190, 206, 6, 9, "#4A3C63", { f: false, sw: 0 }), ell(210, 206, 6, 9, "#4A3C63", { f: false, sw: 0 }));
  } else if (o.snout === "long") {
    s.push(ell(200, 216, 46, 34, o.snoutColor ?? "#FFF0DA"));
    s.push(ell(200, 198, 15, 11, "#4A3C63", { f: false }));
  } else if (o.snout === "beak") {
    s.push(poly([200, 196, 176, 224, 224, 224], o.snoutColor ?? "#FFC24D"));
  } else {
    s.push(ell(200, 200, 13, 10, "#4A3C63", { f: false }));
  }

  s.push(smile(200, o.snout === "long" ? 226 : 216, 20, 14));
  s.push(...eye(168, hy - 12), ...eye(232, hy - 12));
  if (o.cheeks) s.push(ell(136, 200, 17, 12, o.cheeks), ell(264, 200, 17, 12, o.cheeks));
  if (o.whiskers) {
    s.push(
      line("M120 206 h-42", { sw: 5 }),
      line("M120 222 l-40 12", { sw: 5 }),
      line("M280 206 h42", { sw: 5 }),
      line("M280 222 l40 12", { sw: 5 }),
    );
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* DINOSAURS                                                           */
/* ------------------------------------------------------------------ */

export interface DinoOpts {
  body: string;
  belly?: string;
  back?: "spikes" | "plates" | "dome" | "frill" | "none";
  backColor?: string;
  neck?: "short" | "long";
  horns?: number;
  spots?: string;
  wings?: boolean;
}

export function dino(o: DinoOpts): Shape[] {
  const s: Shape[] = [];
  const long = o.neck === "long";
  const hx = long ? 306 : 268;
  const hy = long ? 110 : 158;

  s.push(pth("M120 276 q-92 8 -96 -56 q26 -20 50 8 q18 22 46 16", o.body)); // tail
  if (o.wings) s.push(pth("M186 226 q-40 -86 46 -96 q-6 54 22 92", o.backColor ?? "#FFD9A0"));
  s.push(ell(190, 268, 108, 76, o.body)); // body
  if (o.belly) s.push(ell(196, 292, 66, 46, o.belly));
  s.push(
    pth("M148 320 q-8 44 20 44 q26 0 18 -44", o.body),
    pth("M240 320 q-8 44 20 44 q26 0 18 -44", o.body),
  );
  // neck
  s.push(
    long
      ? pth("M236 236 q22 -122 74 -128 q34 -4 26 30 q-40 4 -50 116", o.body)
      : pth("M236 254 q4 -74 58 -74 q30 4 22 34 q-38 6 -44 62", o.body),
  );
  s.push(ell(hx, hy, 54, 44, o.body));
  s.push(ell(hx + 26, hy + 14, 26, 20, o.belly ?? o.body)); // muzzle
  s.push(ell(hx + 40, hy + 8, 6, 5, "#4A3C63", { f: false, sw: 0 }));
  s.push(...eye(hx + 4, hy - 10, 0.8));
  s.push(line(`M${hx + 18} ${hy + 26} q14 8 26 -2`, { sw: 5 }));

  if (o.back === "spikes" || o.back === "plates") {
    const pts: number[][] = [
      [128, 216],
      [166, 194],
      [206, 190],
      [244, 204],
    ];
    pts.forEach(([x, y], i) => {
      const h = o.back === "plates" ? 40 : 32;
      s.push(
        o.back === "plates"
          ? pth(`M${x - 22} ${y} q22 -${h} 44 0 z`, o.backColor ?? "#FFB25E")
          : poly([x - 18, y, x, y - h, x + 18, y], o.backColor ?? "#FFB25E"),
      );
      void i;
    });
  }
  if (o.back === "frill") s.push(ell(hx - 16, hy, 52, 58, o.backColor ?? "#FFB25E"));
  if (o.back === "dome") s.push(ell(hx, hy - 30, 40, 26, o.backColor ?? "#FFB25E"));
  for (let i = 0; i < (o.horns ?? 0); i++)
    s.push(poly([hx - 10 + i * 26, hy - 34, hx - 2 + i * 26, hy - 66, hx + 8 + i * 26, hy - 34], "#FFF0D2"));
  if (o.spots)
    s.push(
      ell(160, 250, 18, 14, o.spots),
      ell(210, 236, 15, 12, o.spots),
      ell(186, 288, 16, 13, o.spots),
    );
  return s;
}

/* ------------------------------------------------------------------ */
/* VEHICLES                                                            */
/* ------------------------------------------------------------------ */

export interface CarOpts {
  body: string;
  cabin?: string;
  style: "sedan" | "truck" | "bus" | "race" | "tractor" | "digger" | "fire" | "police" | "taxi" | "monster";
  accent?: string;
}

export function car(o: CarOpts): Shape[] {
  const s: Shape[] = [];
  const glass = o.cabin ?? "#BFEAFF";
  const big = o.style === "monster" || o.style === "tractor" || o.style === "digger";
  const wheelR = big ? 54 : 38;
  const wy = big ? 296 : 300;

  if (o.style === "bus" || o.style === "fire" || o.style === "police") {
    s.push(rrect(56, 152, 292, 128, 32, o.body));
    s.push(rrect(80, 176, 68, 54, 12, glass), rrect(166, 176, 68, 54, 12, glass), rrect(252, 176, 68, 54, 12, glass));
  } else if (o.style === "race") {
    s.push(pth("M40 268 q10 -46 74 -50 q30 -56 92 -56 q54 0 74 56 q64 4 76 50 z", o.body));
    s.push(pth("M136 214 q22 -34 62 -34 q40 0 56 34 z", glass));
    s.push(rrect(24, 216, 44, 22, 10, o.accent ?? "#FF6B8B"), rrect(332, 216, 44, 22, 10, o.accent ?? "#FF6B8B"));
  } else if (o.style === "truck") {
    s.push(rrect(40, 172, 176, 108, 20, o.accent ?? "#FFD46B"));
    s.push(pth("M226 280 v-84 q0 -20 22 -20 h48 q18 0 26 18 l26 46 v40 z", o.body));
    s.push(rrect(248, 190, 62, 46, 10, glass));
  } else if (o.style === "tractor" || o.style === "digger") {
    s.push(rrect(96, 190, 168, 96, 22, o.body));
    s.push(rrect(126, 150, 92, 56, 14, glass));
    if (o.style === "digger") s.push(pth("M264 216 q76 -18 96 40 q-16 22 -40 6 q-20 -16 -56 -18 z", o.accent ?? "#FFC33C"));
    else s.push(rrect(258, 214, 60, 30, 10, o.accent ?? "#FF8A5B"));
  } else {
    s.push(pth("M44 282 q4 -60 70 -66 q34 -52 90 -52 q56 0 86 52 q62 8 66 66 z", o.body));
    s.push(pth("M126 214 q22 -38 76 -38 q52 0 68 38 z", glass));
    s.push(line("M200 176 v38", { sw: 6 }));
  }

  if (o.style === "police") s.push(rrect(168, 122, 64, 30, 12, o.accent ?? "#FF5C7A"));
  if (o.style === "fire") s.push(pth("M64 156 l248 -50", "none", { f: false, sw: 12, sc: "#E4E9FF" }));
  if (o.style === "taxi") s.push(rrect(166, 118, 68, 32, 10, o.accent ?? "#FFD84D"));

  // wheels
  [big ? 116 : 128, big ? 288 : 276].forEach((x) => {
    s.push(ell(x, wy, wheelR, wheelR, "#4C4667"), ell(x, wy, wheelR * 0.45, wheelR * 0.45, "#E9ECFF"));
  });
  s.push(ell(58, 252, 15, 12, "#FFF2A8"));
  return s;
}

/* ------------------------------------------------------------------ */
/* PRINCESS                                                            */
/* ------------------------------------------------------------------ */

export interface PrincessOpts {
  dress: string;
  dress2?: string;
  hair: string;
  style?: "long" | "bun" | "braid" | "curly" | "ponytail";
  skin?: string;
  crown?: boolean;
  wand?: boolean;
}

export function princess(o: PrincessOpts): Shape[] {
  const s: Shape[] = [];
  const skin = o.skin ?? "#FFE0C4";
  const st = o.style ?? "long";

  if (st === "long" || st === "curly") s.push(ell(200, 172, 92, 104, o.hair));
  if (st === "ponytail") s.push(ell(288, 176, 30, 58, o.hair, { rot: 16 }));
  if (st === "braid") s.push(ell(120, 214, 24, 66, o.hair, { rot: -12 }), ell(280, 214, 24, 66, o.hair, { rot: 12 }));

  // dress
  s.push(pth("M200 214 l-104 152 q104 30 208 0 z", o.dress));
  if (o.dress2) s.push(pth("M200 288 l-58 78 q58 18 116 0 z", o.dress2));
  s.push(pth("M160 220 q40 26 80 0 l-14 -40 h-52 z", o.dress2 ?? o.dress));
  s.push(ell(134, 268, 18, 16, skin), ell(266, 268, 18, 16, skin)); // hands
  s.push(pth("M162 224 q-30 24 -32 44", "none", { f: false, sw: 10, sc: "#2E2545" }));
  s.push(pth("M238 224 q30 24 32 44", "none", { f: false, sw: 10, sc: "#2E2545" }));

  // head
  s.push(ell(200, 160, 62, 66, skin));
  s.push(pth("M140 146 q10 -66 60 -66 q52 0 60 66 q-30 -30 -60 -22 q-32 8 -60 22 z", o.hair));
  if (st === "bun") s.push(ell(200, 74, 34, 30, o.hair));
  if (o.crown)
    s.push(poly([164, 96, 176, 58, 200, 88, 224, 58, 236, 96], "#FFD84D"), ell(200, 62, 9, 9, "#FF6B8B"));
  s.push(...eye(180, 158, 0.85), ...eye(220, 158, 0.85));
  s.push(smile(200, 186, 16, 12));
  s.push(ell(166, 182, 13, 9, "#FFB4C6"), ell(234, 182, 13, 9, "#FFB4C6"));
  if (o.wand) {
    s.push(pth("M282 272 l44 -70", "none", { f: false, sw: 9, sc: "#C9A227" }));
    s.push(poly([330, 148, 342, 182, 376, 190, 344, 208, 348, 244, 322, 218, 292, 234, 302, 198, 282, 172, 318, 176], "#FFE066"));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* SPACE                                                               */
/* ------------------------------------------------------------------ */

export function space(kind: string, a: string, b: string): Shape[] {
  const s: Shape[] = [];
  const stars = () => {
    [
      [58, 78],
      [340, 96],
      [72, 320],
      [330, 318],
    ].forEach(([x, y]) =>
      s.push(poly([x, y - 18, x + 6, y - 5, x + 19, y, x + 6, y + 6, x, y + 19, x - 6, y + 6, x - 19, y, x - 6, y - 5], "#FFE066")),
    );
  };
  switch (kind) {
    case "rocket":
      s.push(pth("M200 40 q60 60 60 160 v58 h-120 v-58 q0 -100 60 -160 z", a));
      s.push(pth("M140 214 q-52 20 -46 82 l46 -26 z", b), pth("M260 214 q52 20 46 82 l-46 -26 z", b));
      s.push(ell(200, 150, 34, 34, "#BFEAFF"), ell(200, 150, 20, 20, "#FFFFFF", { f: false }));
      s.push(pth("M164 296 q36 74 72 0 q-36 22 -72 0 z", "#FF9E4D"));
      stars();
      break;
    case "planet":
      s.push(ell(200, 196, 116, 116, a));
      s.push(ell(150, 160, 28, 22, b), ell(238, 226, 34, 26, b), ell(188, 258, 20, 16, b));
      s.push(pth("M52 214 q148 76 296 0 q-148 44 -296 0 z", "#FFD2A6", { rot: -14 }));
      stars();
      break;
    case "star":
      s.push(poly([200, 44, 240, 148, 352, 156, 266, 226, 294, 336, 200, 276, 106, 336, 134, 226, 48, 156, 160, 148], a));
      s.push(...eye(172, 190, 0.9), ...eye(228, 190, 0.9));
      s.push(smile(200, 222, 22, 16), ell(146, 216, 15, 10, b), ell(254, 216, 15, 10, b));
      break;
    case "astronaut":
      s.push(ell(200, 262, 84, 78, a));
      s.push(ell(118, 258, 26, 40, a, { rot: 18 }), ell(282, 258, 26, 40, a, { rot: -18 }));
      s.push(ell(200, 152, 88, 84, "#EDF1FF"), ell(200, 156, 62, 58, "#4E7BE8"));
      s.push(ell(180, 142, 20, 16, "#BFEAFF", { f: false }));
      s.push(rrect(150, 316, 40, 42, 12, a), rrect(210, 316, 40, 42, 12, a));
      stars();
      break;
    case "ufo":
      s.push(pth("M120 226 q-8 -70 80 -70 q88 0 80 70 z", "#BFEAFF"));
      s.push(pth("M44 232 q156 -46 312 0 q-156 62 -312 0 z", a));
      s.push(ell(110, 244, 14, 12, b), ell(200, 254, 14, 12, b), ell(290, 244, 14, 12, b));
      stars();
      break;
    case "moon":
      s.push(pth("M258 40 q-140 40 -140 160 q0 120 140 160 q-190 -20 -190 -160 q0 -140 190 -160 z", a));
      s.push(ell(120, 150, 24, 22, b), ell(96, 240, 18, 16, b), ell(168, 288, 15, 13, b));
      stars();
      break;
    case "comet":
      s.push(pth("M44 320 q120 -40 190 -140", "none", { f: false, sw: 14, sc: "#9FB3FF" }));
      s.push(ell(276, 136, 56, 56, a));
      s.push(pth("M232 180 q-90 66 -150 132 q86 -22 176 -96 z", b));
      stars();
      break;
    case "satellite":
      s.push(rrect(160, 156, 80, 100, 18, a));
      s.push(rrect(48, 176, 96, 60, 12, b), rrect(256, 176, 96, 60, 12, b));
      s.push(ell(200, 300, 40, 40, "#FFE066"), line("M200 256 v14", { sw: 8 }));
      stars();
      break;
    case "sun":
      s.push(ell(200, 200, 108, 108, a));
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        const x = 200 + Math.cos(ang) * 150;
        const y = 200 + Math.sin(ang) * 150;
        s.push(ell(x, y, 22, 22, b));
      }
      s.push(...eye(172, 190, 0.9), ...eye(228, 190, 0.9), smile(200, 226, 24, 18));
      break;
    default: // alien
      s.push(ell(200, 300, 66, 52, a));
      s.push(ell(200, 190, 96, 88, a));
      s.push(ell(170, 186, 22, 28, "#2E2545", { f: false }), ell(230, 186, 22, 28, "#2E2545", { f: false }));
      s.push(ell(164, 178, 8, 9, "#FFFFFF", { f: false, sw: 0 }), ell(224, 178, 8, 9, "#FFFFFF", { f: false, sw: 0 }));
      s.push(smile(200, 226, 20, 14));
      s.push(line("M154 112 l-16 -46", { sw: 8 }), line("M246 112 l16 -46", { sw: 8 }));
      s.push(ell(138, 60, 14, 14, b), ell(262, 60, 14, 14, b));
      stars();
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* SEA                                                                 */
/* ------------------------------------------------------------------ */

export function sea(kind: string, a: string, b: string): Shape[] {
  const s: Shape[] = [];
  const bubbles = () => {
    s.push(ell(66, 92, 18, 18, "#CFF0FF"), ell(104, 56, 12, 12, "#CFF0FF"), ell(340, 300, 15, 15, "#CFF0FF"));
  };
  switch (kind) {
    case "fish":
      s.push(pth("M300 200 q60 -60 74 0 q-14 60 -74 0 z", b));
      s.push(ell(190, 200, 112, 80, a));
      s.push(pth("M186 122 q30 -46 58 -6 z", b), pth("M170 272 q28 42 56 4 z", b));
      s.push(ell(148, 208, 30, 30, b), ell(226, 214, 22, 22, b));
      s.push(...eye(122, 178, 0.9), smile(120, 214, 16, 12));
      bubbles();
      break;
    case "whale":
      s.push(ell(190, 226, 132, 92, a));
      s.push(ell(196, 254, 96, 58, b));
      s.push(pth("M312 200 q66 -46 62 30 q-6 62 -62 6 z", a));
      s.push(pth("M198 134 q-8 -70 24 -84 q-4 44 22 70", "#CFF0FF"));
      s.push(...eye(120, 202, 0.85), smile(128, 246, 22, 16));
      bubbles();
      break;
    case "octopus":
      s.push(ell(200, 174, 106, 96, a));
      for (let i = 0; i < 5; i++) {
        const x = 116 + i * 42;
        s.push(pth(`M${x} 250 q-18 60 12 96 q26 -34 8 -96 z`, i % 2 ? b : a));
      }
      s.push(...eye(170, 164), ...eye(232, 164), smile(200, 208, 22, 16));
      s.push(ell(136, 196, 17, 12, b), ell(264, 196, 17, 12, b));
      break;
    case "crab":
      s.push(ell(200, 230, 118, 82, a));
      s.push(pth("M96 200 q-64 -20 -60 -70 q40 -8 52 34 q6 20 24 22 z", a));
      s.push(pth("M304 200 q64 -20 60 -70 q-40 -8 -52 34 q-6 20 -24 22 z", a));
      [130, 200, 270].forEach((x) => s.push(pth(`M${x} 300 q-6 40 -30 46`, "none", { f: false, sw: 9, sc: "#2E2545" })));
      s.push(...eye(168, 200), ...eye(232, 200), smile(200, 246, 24, 18));
      s.push(ell(140, 240, 16, 11, b), ell(260, 240, 16, 11, b));
      break;
    case "seahorse":
      s.push(pth("M214 78 q78 6 74 92 q-6 78 -66 96 q-42 16 -34 60 q6 34 44 32 q-96 24 -104 -54 q-6 -60 58 -84 q44 -18 42 -62 q-2 -40 -46 -44 z", a));
      s.push(pth("M204 66 q42 -22 62 12 q-30 12 -62 -12 z", b));
      s.push(...eye(214, 120, 0.75));
      bubbles();
      break;
    case "turtle":
      s.push(ell(200, 240, 118, 86, a));
      s.push(ell(200, 240, 78, 56, b));
      [[164, 224], [236, 224], [200, 266]].forEach(([x, y]) => s.push(ell(x, y, 22, 18, a)));
      s.push(ell(320, 216, 40, 34, "#9CE0A8"));
      s.push(ell(96, 316, 30, 20, "#9CE0A8"), ell(304, 316, 30, 20, "#9CE0A8"));
      s.push(...eye(330, 208, 0.62), smile(326, 230, 12, 8));
      break;
    case "starfish":
      s.push(poly([200, 48, 250, 168, 372, 176, 274, 250, 308, 366, 200, 300, 92, 366, 126, 250, 28, 176, 150, 168], a));
      s.push(...eye(174, 200, 0.85), ...eye(228, 200, 0.85), smile(200, 234, 20, 14));
      [[200, 130], [150, 236], [252, 236]].forEach(([x, y]) => s.push(ell(x, y, 12, 12, b)));
      break;
    case "jellyfish":
      s.push(pth("M84 208 q0 -128 116 -128 q116 0 116 128 z", a));
      [110, 158, 200, 242, 290].forEach((x, i) =>
        s.push(pth(`M${x} 210 q${i % 2 ? 22 : -22} 52 0 108`, "none", { f: false, sw: 9, sc: "#2E2545" })),
      );
      s.push(...eye(172, 164), ...eye(230, 164), smile(200, 192, 18, 12));
      s.push(ell(140, 190, 15, 11, b), ell(262, 190, 15, 11, b));
      break;
    case "dolphin":
      s.push(pth("M60 246 q46 -128 176 -126 q90 2 108 62 q-28 -14 -60 4 q52 44 8 104 q-118 46 -232 -44 z", a));
      s.push(pth("M150 138 q22 -66 62 -30 q-32 8 -44 44 z", b));
      s.push(pth("M330 196 q54 -44 56 24 q-4 62 -56 12 z", a));
      s.push(...eye(266, 200, 0.7), smile(320, 216, 12, 8));
      bubbles();
      break;
    default: // shell
      s.push(pth("M200 320 q-140 0 -140 -122 q0 -130 140 -130 q140 0 140 130 q0 122 -140 122 z", a));
      for (let i = -2; i <= 2; i++)
        s.push(pth(`M200 316 q${i * 54} -120 ${i * 34} -244`, "none", { f: false, sw: 7, sc: "#2E2545" }));
      s.push(ell(200, 330, 46, 18, b));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* BIRDS                                                               */
/* ------------------------------------------------------------------ */

export interface BirdOpts {
  body: string;
  wing: string;
  beak?: string;
  crest?: boolean;
  longNeck?: boolean;
  longLegs?: boolean;
  tail?: "fan" | "long" | "short";
}

export function bird(o: BirdOpts): Shape[] {
  const s: Shape[] = [];
  if (o.tail === "fan") {
    for (let i = -2; i <= 2; i++)
      s.push(ell(300 + i * 4, 200 + i * 34, 40, 20, i % 2 ? o.wing : o.body, { rot: i * 12 }));
  } else if (o.tail === "long") {
    s.push(pth("M280 280 q80 30 92 96 q-70 -20 -104 -62 z", o.wing));
  } else {
    s.push(ell(292, 286, 42, 28, o.wing, { rot: -18 }));
  }

  if (o.longLegs) s.push(line("M180 330 v56", { sw: 9 }), line("M226 330 v56", { sw: 9 }));
  s.push(ell(196, 256, 96, 92, o.body));
  s.push(ell(196, 272, 58, 62, "#FFF6E6"));
  if (o.longNeck) s.push(pth("M180 176 q-14 -84 34 -100 q40 -12 44 22 q-40 6 -42 84 z", o.body));

  const hx = o.longNeck ? 252 : 196;
  const hy = o.longNeck ? 96 : 152;
  s.push(ell(hx, hy, 62, 58, o.body));
  if (o.crest) s.push(pth(`M${hx - 26} ${hy - 44} q26 -60 54 -6 q-26 -14 -54 6 z`, o.wing));
  s.push(poly([hx + 44, hy - 4, hx + 92, hy + 12, hx + 44, hy + 26], o.beak ?? "#FFB03A"));
  s.push(...eye(hx + 14, hy - 6, 0.85));
  s.push(ell(140, 262, 44, 52, o.wing, { rot: 18 }));
  if (!o.longLegs) s.push(line("M176 342 v26", { sw: 9 }), line("M222 342 v26", { sw: 9 }));
  s.push(poly([176, 368, 152, 382, 200, 382], o.beak ?? "#FFB03A"));
  s.push(poly([222, 368, 198, 382, 246, 382], o.beak ?? "#FFB03A"));
  return s;
}

/* ------------------------------------------------------------------ */
/* FLOWERS                                                             */
/* ------------------------------------------------------------------ */

export interface FlowerOpts {
  petal: string;
  petal2?: string;
  center: string;
  count?: number;
  shape?: "round" | "point" | "heart";
  pot?: string;
  leaves?: number;
  face?: boolean;
}

export function flower(o: FlowerOpts): Shape[] {
  const s: Shape[] = [];
  const n = o.count ?? 8;
  const cy = o.pot ? 148 : 176;
  s.push(pth(`M200 ${cy + 60} q-16 90 0 ${o.pot ? 110 : 150}`, "none", { f: false, sw: 12, sc: "#4E9D5B" }));
  for (let i = 0; i < (o.leaves ?? 2); i++) {
    const dir = i % 2 ? 1 : -1;
    s.push(ell(200 + dir * 46, cy + 130 + i * 26, 44, 22, "#7ED087", { rot: dir * 22 }));
  }
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2;
    const px = 200 + Math.cos(ang) * 72;
    const py = cy + Math.sin(ang) * 72;
    const col = o.petal2 && i % 2 ? o.petal2 : o.petal;
    if (o.shape === "point") {
      const nx = -Math.sin(ang) * 30;
      const ny = Math.cos(ang) * 30;
      s.push(
        poly(
          [200 + Math.cos(ang) * 128, cy + Math.sin(ang) * 128, px - nx, py - ny, px + nx, py + ny],
          col,
        ),
      );
    }
    else if (o.shape === "heart")
      s.push(
        pth(
          `M${px} ${py + 34} q-52 -30 -34 -60 q14 -22 34 -2 q20 -20 34 2 q18 30 -34 60 z`,
          col,
        ),
      );
    else s.push(ell(px, py, 40, 34, col, { rot: (ang * 180) / Math.PI }));
  }
  s.push(ell(200, cy, 46, 46, o.center));
  if (o.face) {
    s.push(...eye(184, cy - 6, 0.6), ...eye(216, cy - 6, 0.6), smile(200, cy + 14, 12, 9));
  }
  if (o.pot) {
    s.push(pth("M124 296 h152 l-20 92 h-112 z", o.pot));
    s.push(pth("M112 268 h176 v34 h-176 z", o.pot));
  }
  return s;
}

/* ------------------------------------------------------------------ */
/* FOOD                                                                */
/* ------------------------------------------------------------------ */

export function food(kind: string, a: string, b: string): Shape[] {
  const s: Shape[] = [];
  const face = (cx: number, cy: number, sc = 1) => {
    s.push(...eye(cx - 24 * sc, cy, 0.8 * sc), ...eye(cx + 24 * sc, cy, 0.8 * sc), smile(cx, cy + 28 * sc, 20 * sc, 14 * sc));
  };
  switch (kind) {
    case "cupcake":
      s.push(pth("M112 216 q-4 -100 88 -100 q92 0 88 100 z", a));
      s.push(pth("M110 226 h180 l-26 148 h-128 z", b));
      [140, 176, 212, 248].forEach((x) => s.push(pth(`M${x} 232 v138`, "none", { f: false, sw: 6, sc: "#2E2545" })));
      s.push(ell(200, 96, 20, 20, "#FF6B8B"));
      face(200, 280, 0.9);
      break;
    case "icecream":
      s.push(pth("M144 208 h112 l-56 168 z", "#E7B980"));
      s.push(ell(200, 154, 78, 70, a), ell(150, 118, 52, 48, b), ell(252, 118, 52, 48, a));
      s.push(ell(200, 78, 56, 50, b), ell(200, 34, 16, 16, "#FF6B8B"));
      face(200, 168, 0.85);
      break;
    case "apple":
      s.push(pth("M200 106 q-116 -30 -116 106 q0 148 116 158 q116 -10 116 -158 q0 -136 -116 -106 z", a));
      s.push(pth("M200 108 q6 -56 46 -62 q4 46 -46 62 z", "#7ED087"));
      s.push(line("M200 106 v-46", { sw: 10, sc: "#8A5A2B" }));
      face(200, 214);
      break;
    case "donut":
      s.push(ell(200, 214, 138, 130, "#E7B980"));
      s.push(pth("M200 84 q140 0 140 130 q0 130 -140 130 q-140 0 -140 -130 q0 -130 140 -130 z M200 160 q-52 0 -52 54 q0 54 52 54 q52 0 52 -54 q0 -54 -52 -54 z", a));
      [[130, 160], [258, 148], [292, 244], [140, 268], [200, 306]].forEach(([x, y], i) =>
        s.push(rrect(x, y, 30, 12, 6, i % 2 ? b : "#7ED9FF", { rot: i * 34 })),
      );
      break;
    case "pizza":
      s.push(pth("M200 48 l142 288 q-142 44 -284 0 z", "#FFD98A"));
      s.push(pth("M200 96 l112 226 q-112 32 -224 0 z", a));
      [[200, 178], [156, 262], [250, 258], [200, 300]].forEach(([x, y]) => s.push(ell(x, y, 22, 20, b)));
      break;
    case "burger":
      s.push(pth("M78 190 q0 -110 122 -110 q122 0 122 110 z", "#F0B463"));
      s.push(rrect(70, 196, 260, 30, 14, "#7ED087"));
      s.push(rrect(76, 226, 248, 42, 16, a));
      s.push(rrect(70, 268, 260, 26, 12, b));
      s.push(pth("M78 296 q0 68 122 68 q122 0 122 -68 z", "#F0B463"));
      [[130, 140], [200, 120], [268, 142]].forEach(([x, y]) => s.push(ell(x, y, 10, 7, "#FFF6E6", { f: false })));
      break;
    case "watermelon":
      s.push(pth("M40 130 q160 -46 320 0 q-40 240 -160 244 q-120 -4 -160 -244 z", "#7ED087"));
      s.push(pth("M76 156 q124 -34 248 0 q-34 202 -124 206 q-90 -4 -124 -206 z", a));
      [[160, 210], [240, 210], [200, 268], [130, 262], [268, 258]].forEach(([x, y]) =>
        s.push(ell(x, y, 9, 14, "#3B3050", { f: false })),
      );
      break;
    case "cherry":
      s.push(pth("M200 96 q-60 34 -78 92", "none", { f: false, sw: 10, sc: "#5FA36A" }));
      s.push(pth("M200 96 q60 34 78 92", "none", { f: false, sw: 10, sc: "#5FA36A" }));
      s.push(ell(122, 254, 76, 74, a), ell(278, 254, 76, 74, a));
      s.push(pth("M198 92 q46 -46 78 -22 q-30 34 -78 22 z", "#7ED087"));
      s.push(ell(100, 232, 16, 12, "#FFFFFF", { f: false }), ell(256, 232, 16, 12, "#FFFFFF", { f: false }));
      face(122, 250, 0.7);
      break;
    case "cake":
      s.push(rrect(70, 214, 260, 130, 22, a));
      s.push(pth("M70 226 q34 40 66 0 q34 40 66 0 q34 40 66 0 q34 40 62 0 v-34 h-260 z", b));
      [140, 200, 260].forEach((x) => {
        s.push(rrect(x - 9, 150, 18, 64, 8, "#FFF1F5"));
        s.push(pth(`M${x} 150 q-16 -22 0 -38 q16 16 0 38 z`, "#FFB03A"));
      });
      break;
    default: // candy
      s.push(ell(200, 200, 92, 92, a));
      s.push(pth("M118 168 q-72 -46 -84 6 q26 40 84 42 z", b));
      s.push(pth("M282 168 q72 -46 84 6 q-26 40 -84 42 z", b));
      s.push(pth("M200 118 q-46 82 0 164", "none", { f: false, sw: 9, sc: "#2E2545" }));
      face(200, 196);
  }
  return s;
}

/* ------------------------------------------------------------------ */

export function makePage(
  slug: string,
  title: string,
  category: string,
  emoji: string,
  difficulty: number,
  shapes: Shape[],
): PageArt {
  return { slug, title, category, emoji, difficulty, viewBox: "0 0 400 400", shapes };
}
