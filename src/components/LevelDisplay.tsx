"use client";

import { useMemo } from "react";
import { type Progress } from "@/lib/progress";
import { fx } from "@/components/FxLayer";
import { sfx } from "@/lib/audio";

export default function LevelDisplay({
  progress,
  update,
  onLevelUp,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onLevelUp?: (newLevel: number) => void;
}) {
  const percent = useMemo(() => {
    return Math.min(100, Math.round((progress.xp / progress.xpToNext) * 100));
  }, [progress.xp, progress.xpToNext]);

  const addXp = (amount: number) => {
    const oldLevel = progress.level;
    let newXp = progress.xp + amount;
    let newLevel = progress.level;
    let newXpToNext = progress.xpToNext;
    
    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.round(newXpToNext * 1.2);
    }
    
    if (newLevel > oldLevel) {
      // Level up!
      fx.confetti(200);
      fx.fireworks(window.innerWidth / 2, window.innerHeight / 2);
      fx.shake(20);
      sfx.celebrate();
      onLevelUp?.(newLevel);
    }
    
    update({
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      coins: progress.coins + (newLevel > oldLevel ? 50 : 0), // Bonus coins on level up
    });
  };

  return (
    <div className="relative rounded-2xl bg-gradient-to-r from-[#8E7CFF] to-[#B49BE0] p-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⭐</span>
          <div>
            <div className="text-sm font-black text-white">Level {progress.level}</div>
            <div className="text-xs font-bold text-white/80">{progress.xp} / {progress.xpToNext} XP</div>
          </div>
        </div>
        <button
          onClick={() => addXp(10)}
          className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-black text-white transition hover:bg-white/30 active:scale-95"
          title="+10 XP (debug)"
        >
          +XP
        </button>
      </div>
      
      {/* XP Progress Bar */}
      <div className="mt-2 overflow-hidden rounded-full bg-black/20">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#FFD84D] via-[#FF7FB6] to-[#7ED087] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      
      {/* Level badges */}
      <div className="mt-2 flex gap-1">
        {Array.from({ length: Math.min(5, progress.level) }, (_, i) => (
          <span key={i} className="text-sm animate-[bounce_2s_infinite]">🌟</span>
        ))}
        {progress.level > 5 && <span className="text-sm">+{progress.level - 5}</span>}
      </div>
    </div>
  );
}
