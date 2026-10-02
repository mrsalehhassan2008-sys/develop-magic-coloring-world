"use client";

import type { PageArt, Shape } from "@/lib/art/shapes";

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
