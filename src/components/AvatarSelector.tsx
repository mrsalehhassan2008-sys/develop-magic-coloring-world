"use client";

import { useState } from "react";
import { AVATARS, type AvatarType, type Progress } from "@/lib/progress";
import { sfx, say } from "@/lib/audio";

export default function AvatarSelector({
  progress,
  update,
  onClose,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<AvatarType>(progress.avatar);

  const save = () => {
    update({ avatar: selected });
    say(`Great choice! ${AVATARS.find(a => a.id === selected)?.label || "New look"}!`, progress.lang);
    sfx.reward();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#2E2545]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#2E2545]">🎭 Choose Your Character</h2>
          <button onClick={onClose} className="text-2xl font-black text-[#A99CC4] hover:text-[#2E2545]">✕</button>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-3">
          {AVATARS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setSelected(a.id);
                sfx.tap();
              }}
              className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition active:scale-95 ${
                selected === a.id
                  ? "bg-gradient-to-b from-[#FFD84D] to-[#FFB03A] ring-4 ring-[#FFE066] shadow-lg"
                  : "bg-[#F7F3FF] hover:bg-[#EDE6FF]"
              }`}
            >
              <span className="text-4xl">{a.emoji}</span>
              <span className="text-[10px] font-black text-[#5B4B7A]">{a.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-[#F7F3FF] px-4 py-2">
            <span className="text-3xl">{AVATARS.find((a) => a.id === selected)?.emoji}</span>
            <span className="font-black text-[#2E2545]">{progress.name}</span>
          </div>
          <button
            onClick={save}
            className="rounded-2xl bg-gradient-to-r from-[#7ED087] to-[#38C6D9] px-8 py-3 text-lg font-black text-white shadow-lg active:scale-95"
          >
            ✓ Save
          </button>
        </div>
      </div>
    </div>
  );
}
