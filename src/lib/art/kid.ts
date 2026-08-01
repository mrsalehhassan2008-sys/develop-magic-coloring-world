import { ell, eye, line, pth, Shape, smile } from "./shapes";

export interface KidLook {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "pony" | "curly";
  shirt: string;
  cheeks: boolean;
  kind: "boy" | "girl";
}

/** a cute human kid drawn in the same 400x400 stage as the critters */
export function kidShapes(k: KidLook): Shape[] {
  const s: Shape[] = [];
  const hy = 168;

  // long hair back layer
  if (k.hairStyle === "long" || k.hairStyle === "pony") {
    s.push(ell(200, hy + 10, 96, 100, k.hair));
  }

  // body / shirt
  s.push(pth("M200 250 q-70 0 -78 78 q0 34 78 34 q78 0 78 -34 q-8 -78 -78 -78 z", k.shirt));
  s.push(ell(146, 300, 18, 16, k.skin), ell(254, 300, 18, 16, k.skin)); // hands

  // head
  s.push(ell(200, hy, 82, 80, k.skin));

  // hair front
  if (k.hairStyle === "short") {
    s.push(pth("M122 160 q6 -78 78 -78 q72 0 78 78 q-26 -40 -78 -40 q-52 0 -78 40 z", k.hair));
  } else if (k.hairStyle === "long") {
    s.push(pth("M120 168 q2 -86 80 -86 q78 0 80 86 q-20 -46 -44 -40 q8 -22 -36 -22 q-44 0 -36 22 q-24 -6 -44 40 z", k.hair));
  } else if (k.hairStyle === "pony") {
    s.push(pth("M124 158 q6 -76 76 -76 q70 0 76 76 q-24 -38 -76 -38 q-52 0 -76 38 z", k.hair));
    s.push(ell(282, 150, 26, 44, k.hair, { rot: 18 }));
    s.push(ell(270, 122, 12, 12, "#FF7FB6"));
  } else {
    // curly
    s.push(
      ell(148, 122, 30, 28, k.hair),
      ell(200, 102, 34, 30, k.hair),
      ell(252, 122, 30, 28, k.hair),
      ell(128, 158, 24, 24, k.hair),
      ell(272, 158, 24, 24, k.hair),
    );
  }

  // face
  s.push(...eye(170, hy - 4, 0.85), ...eye(230, hy - 4, 0.85));
  s.push(smile(200, hy + 28, 18, 14));
  if (k.cheeks) s.push(ell(140, hy + 22, 15, 10, "#FFB4C6"), ell(260, hy + 22, 15, 10, "#FFB4C6"));
  s.push(line(`M${192} ${hy + 12} q8 4 16 0`, { sw: 4 })); // tiny nose

  return s;
}
