"use client";

import type { PageArt } from "@/lib/art/shapes";
import type { Swatch } from "@/lib/palette";

export function NumberChip({
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
export function readableText(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#2E2545";
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#2E2545" : "#FFFFFF";
}

export function SwatchBtn({ s, active, onClick }: { s: Swatch; active: boolean; onClick: () => void }) {
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
export function countFilledIn(art: PageArt, fills: Record<string, string>) {
  return art.shapes.filter((s) => s.f !== false && fills[s.id]).length;
}

export function nearStroke(d: string, x: number, y: number, r: number) {
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
