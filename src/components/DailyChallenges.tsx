"use client";

import { useMemo } from "react";
import { type Progress, type DailyChallenge, refreshChallengesIfNeeded } from "@/lib/progress";
import { sfx, say } from "@/lib/audio";
import { fx } from "@/components/FxLayer";

const CHALLENGE_ICONS: Record<string, string> = {
  color: "🎨",
  numbers: "🔢",
  game: "🎮",
  learn: "🎓",
};

const CHALLENGE_LABELS: Record<string, string> = {
  color: "Color pages",
  numbers: "Color by Numbers",
  game: "Balloon Pop score",
  learn: "Learn cards",
};

export default function DailyChallenges({
  progress,
  update,
  onClose,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onClose: () => void;
}) {
  const challenges = useMemo(() => {
    const refreshed = refreshChallengesIfNeeded(progress);
    if (refreshed.dailyChallenges[0]?.date !== progress.dailyChallenges[0]?.date) {
      update({ dailyChallenges: refreshed.dailyChallenges });
    }
    return refreshed.dailyChallenges;
  }, [progress.dailyChallenges]);

  const completeChallenge = (challenge: DailyChallenge) => {
    if (challenge.completed) return;
    
    update({
      dailyChallenges: challenges.map((c) =>
        c.id === challenge.id ? { ...c, completed: true, current: c.target } : c
      ),
      stars: progress.stars + challenge.reward.stars,
      coins: progress.coins + challenge.reward.coins,
    });
    
    fx.burst(window.innerWidth / 2, 100, 40, ["#FFD84D", "#FF7FB6", "#7ED087"], 400);
    sfx.reward();
    say(`Challenge complete! +${challenge.reward.stars} stars!`, progress.lang);
  };

  const allComplete = challenges.every((c) => c.completed);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#2E2545]/80 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#FFF6DC] to-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#2E2545]">📅 Daily Challenges</h2>
            <p className="text-sm font-bold text-[#7A6C99]">Complete all for a bonus! 🎁</p>
          </div>
          <button onClick={onClose} className="text-2xl font-black text-[#A99CC4] hover:text-[#2E2545]">✕</button>
        </div>

        <div className="space-y-3">
          {challenges.map((c) => {
            const icon = CHALLENGE_ICONS[c.type];
            const label = CHALLENGE_LABELS[c.type];
            const percent = Math.min(100, Math.round((c.current / c.target) * 100));
            
            return (
              <div
                key={c.id}
                className={`rounded-2xl p-4 transition ${
                  c.completed
                    ? "bg-gradient-to-r from-[#E8F4E8] to-[#D4F0D4] ring-2 ring-[#7ED087]"
                    : "bg-[#F7F3FF] hover:bg-[#EDE6FF]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <div className="font-black text-[#2E2545]">{label}</div>
                      <div className="text-sm font-bold text-[#7A6C99]">
                        {c.current} / {c.target}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <div className="h-3 overflow-hidden rounded-full bg-white/50">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.completed
                              ? "bg-gradient-to-r from-[#7ED087] to-[#38C6D9]"
                              : "bg-gradient-to-r from-[#FFB03A] to-[#FFD84D]"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    
                    {c.completed ? (
                      <span className="text-2xl">✅</span>
                    ) : (
                      <button
                        onClick={() => completeChallenge(c)}
                        className="rounded-xl bg-[#8E7CFF] px-4 py-2 text-sm font-black text-white transition hover:bg-[#7A6CE8] active:scale-95"
                      >
                        +{c.reward.stars}⭐
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allComplete && (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#FFD84D] to-[#FFB03A] p-4 text-center">
            <div className="text-2xl font-black text-[#5B4B7A]">🎉 All Challenges Complete!</div>
            <div className="text-sm font-bold text-[#8A6A1F]">+50 bonus coins! 🪙</div>
          </div>
        )}

        <div className="mt-4 text-center text-xs font-bold text-[#A99CC4]">
          Challenges reset daily at midnight 🌙
        </div>
      </div>
    </div>
  );
}
