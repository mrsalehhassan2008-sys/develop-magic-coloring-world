"use client";

import { useMemo, useState } from "react";
import { critter } from "@/lib/art/builders";
import { kidShapes } from "@/lib/art/kid";
import { ell, poly, line, Shape } from "@/lib/art/shapes";
import { PagePreview } from "@/components/Studio";
import { fx } from "@/components/FxLayer";
import { randomPraise, say, sfx } from "@/lib/audio";
import type { BuddyCustom, Progress } from "@/lib/progress";

export function accessoryShapes(kind: BuddyCustom["accessory"]): Shape[] {
  switch (kind) {
    case "crown":
      return [poly([168, 98, 178, 56, 200, 86, 222, 56, 232, 98], "#FFD84D"), ell(200, 62, 8, 8, "#FF6B8B")];
    case "bow":
      return [
        ell(174, 86, 22, 15, "#FF7FB6", { rot: -18 }),
        ell(226, 86, 22, 15, "#FF7FB6", { rot: 18 }),
        ell(200, 90, 11, 11, "#FF4D94"),
      ];
    case "glasses":
      return [
        ell(168, 160, 27, 27, "none", { f: false, sw: 7 }),
        ell(232, 160, 27, 27, "none", { f: false, sw: 7 }),
        line("M195 158 h10", { sw: 7 }),
      ];
    case "party":
      return [poly([176, 98, 224, 98, 200, 36], "#8E7CFF"), ell(200, 34, 11, 11, "#FFD84D")];
    default:
      return [];
  }
}

const SKINS = ["#FFE0C4", "#F6C99A", "#E0A875", "#C68B59", "#9C6B3F", "#7A4E2B"];
const HAIR_COLORS = ["#2E2545", "#5A3A2B", "#8A5A2B", "#C98A5B", "#FFD166", "#FF8A4C", "#C24B2C", "#8E7CFF"];
const SHIRTS = ["#FF5C7A", "#FFB03A", "#FFD84D", "#7ED087", "#38C6D9", "#5AC8FA", "#8E7CFF", "#FF7FB6"];
const HAIR_STYLES: { id: NonNullable<BuddyCustom["hairStyle"]>; emoji: string }[] = [
  { id: "short", emoji: "💇" },
  { id: "long", emoji: "👩" },
  { id: "pony", emoji: "🎀" },
  { id: "curly", emoji: "🌀" },
];
const FURS = ["#FFB86B", "#F2F0FF", "#C98A5B", "#FF8A4C", "#B9C3D6", "#FFAFC8", "#FFC55B", "#A9B7D6", "#7ED087", "#8E7CFF"];
const BELLIES = ["#FFF0D8", "#FFFFFF", "#F3D6B2", "#FFE3EC", "#D9E2F5", "#FFF3B8", "#DFF6E1", "#DDD6FF"];
const EARS: { id: BuddyCustom["ear"]; emoji: string }[] = [
  { id: "round", emoji: "🐻" },
  { id: "pointy", emoji: "🐱" },
  { id: "long", emoji: "🐰" },
  { id: "floppy", emoji: "🐶" },
];
const ACCS: { id: BuddyCustom["accessory"]; emoji: string }[] = [
  { id: "none", emoji: "⛔" },
  { id: "crown", emoji: "👑" },
  { id: "bow", emoji: "🎀" },
  { id: "glasses", emoji: "👓" },
  { id: "party", emoji: "🎉" },
];

export default function AvatarDesigner({
  onExit,
  progress,
  update,
}: {
  onExit: () => void;
  progress: Progress;
  update: (p: Partial<Progress>) => void;
}) {
  const [cfg, setCfg] = useState<BuddyCustom>(
    progress.buddyCustom ?? { kind: "animal", ear: "round", fur: "#FFB86B", belly: "#FFF0D8", cheeks: true, accessory: "none" },
  );
  const isHuman = cfg.kind === "boy" || cfg.kind === "girl";

  const shapes = useMemo(() => {
    const acc = accessoryShapes(cfg.accessory);
    if (cfg.kind === "boy" || cfg.kind === "girl") {
      return [
        ...kidShapes({
          skin: cfg.skin ?? SKINS[0],
          hair: cfg.hair ?? HAIR_COLORS[0],
          hairStyle: cfg.hairStyle ?? "short",
          shirt: cfg.shirt ?? SHIRTS[0],
          cheeks: cfg.cheeks,
          kind: cfg.kind,
        }),
        ...acc,
      ];
    }
    return [
      ...critter({
        fur: cfg.fur,
        belly: cfg.belly,
        ear: cfg.ear,
        snout: "oval",
        cheeks: cfg.cheeks ? "#FFB4C6" : undefined,
      }),
      ...acc,
    ];
  }, [cfg]);

  const preview = useMemo(
    () => ({ slug: "buddy", title: "Buddy", category: "buddy", difficulty: 1, emoji: "🎭", viewBox: "0 0 400 400", shapes }),
    [shapes],
  );

  const save = () => {
    update({ buddyCustom: cfg });
    sfx.reward();
    fx.confetti(120);
    fx.shake(10);
    say(`${randomPraise(progress.lang)} Your buddy is ready!`, progress.lang);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,#FFF0F8,transparent_60%)] bg-[#FDF7FF]">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">🎭 Design your buddy</div>
      </div>

      <div className="mx-auto w-full max-w-md px-3 pb-8">
        <div className="mx-auto w-56 rounded-[32px] bg-white p-2 shadow-xl ring-4 ring-white">
          <PagePreview art={preview} className="w-full" />
        </div>

        <Section label=" Who is your buddy?">
          <Choice active={cfg.kind === "animal" || !cfg.kind} onClick={() => { setCfg({ ...cfg, kind: "animal" }); sfx.tap(); }}>🐾</Choice>
          <Choice active={cfg.kind === "boy"} onClick={() => { setCfg({ ...cfg, kind: "boy" }); sfx.tap(); }}>👦</Choice>
          <Choice active={cfg.kind === "girl"} onClick={() => { setCfg({ ...cfg, kind: "girl" }); sfx.tap(); }}>👧</Choice>
        </Section>

        {!isHuman && (
          <Section label="🐾 Ears">
            {EARS.map((e) => (
              <Choice key={e.id} active={cfg.ear === e.id} onClick={() => { setCfg({ ...cfg, ear: e.id }); sfx.tap(); }}>{e.emoji}</Choice>
            ))}
          </Section>
        )}

        {isHuman && (
          <>
            <Section label="🖐️ Skin">
              {SKINS.map((c) => <Dot key={c} color={c} active={(cfg.skin ?? SKINS[0]) === c} onClick={() => { setCfg({ ...cfg, skin: c }); sfx.tap(); }} />)}
            </Section>
            <Section label="💇 Hair style">
              {HAIR_STYLES.map((h) => (
                <Choice key={h.id} active={(cfg.hairStyle ?? "short") === h.id} onClick={() => { setCfg({ ...cfg, hairStyle: h.id }); sfx.tap(); }}>{h.emoji}</Choice>
              ))}
            </Section>
            <Section label="🎨 Hair color">
              {HAIR_COLORS.map((c) => <Dot key={c} color={c} active={(cfg.hair ?? HAIR_COLORS[0]) === c} onClick={() => { setCfg({ ...cfg, hair: c }); sfx.tap(); }} />)}
            </Section>
            <Section label="👕 Shirt color">
              {SHIRTS.map((c) => <Dot key={c} color={c} active={(cfg.shirt ?? SHIRTS[0]) === c} onClick={() => { setCfg({ ...cfg, shirt: c }); sfx.tap(); }} />)}
            </Section>
          </>
        )}

        {!isHuman && (
          <>
            <Section label="🎨 Body color">
              {FURS.map((c) => <Dot key={c} color={c} active={cfg.fur === c} onClick={() => { setCfg({ ...cfg, fur: c }); sfx.tap(); }} />)}
            </Section>

            <Section label="🤍 Belly color">
              {BELLIES.map((c) => <Dot key={c} color={c} active={cfg.belly === c} onClick={() => { setCfg({ ...cfg, belly: c }); sfx.tap(); }} />)}
            </Section>
          </>
        )}

        <Section label="😊 Cheeks">
          <Choice active={cfg.cheeks} onClick={() => { setCfg({ ...cfg, cheeks: !cfg.cheeks }); sfx.tap(); }}>{cfg.cheeks ? "✅" : "⛔"}</Choice>
        </Section>

        <Section label="✨ Accessory">
          {ACCS.map((a) => (
            <Choice key={a.id} active={cfg.accessory === a.id} onClick={() => { setCfg({ ...cfg, accessory: a.id }); sfx.tap(); }}>{a.emoji}</Choice>
          ))}
        </Section>

        <button
          onClick={save}
          className="mt-4 w-full rounded-3xl bg-gradient-to-r from-[#FF7FB6] to-[#FFB03A] py-4 text-xl font-black text-white shadow-lg active:scale-95"
        >
          💾 This is my buddy!
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-3xl bg-white/80 p-3 shadow">
      <p className="mb-2 text-sm font-black text-[#5B4B7A]">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow transition active:scale-90 ${active ? "bg-gradient-to-b from-[#FFE9A8] to-[#FFB03A] ring-4 ring-[#FFD84D]" : "bg-white"}`}
    >
      {children}
    </button>
  );
}
function Dot({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={color}
      className={`h-11 w-11 rounded-full border-4 shadow transition active:scale-90 ${active ? "scale-110 border-[#2E2545]" : "border-white"}`}
      style={{ background: color }}
    />
  );
}
