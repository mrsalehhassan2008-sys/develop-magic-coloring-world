"use client";

import { MUSIC_TRACKS, type Progress } from "@/lib/progress";
import { sfx } from "@/lib/audio";

export default function MusicSelector({
  progress,
  update,
  onClose,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#2E2545]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#2E2545]">🎵 Choose Music</h2>
          <button onClick={onClose} className="text-2xl font-black text-[#A99CC4] hover:text-[#2E2545]">✕</button>
        </div>

        <div className="space-y-2">
          {MUSIC_TRACKS.map((track) => (
            <button
              key={track.id}
              onClick={() => {
                update({ musicTrack: track.id });
                sfx.tap();
                onClose();
              }}
              className={`flex w-full items-center gap-3 rounded-2xl p-4 transition active:scale-95 ${
                progress.musicTrack === track.id
                  ? "bg-gradient-to-r from-[#8E7CFF] to-[#B49BE0] text-white shadow-lg"
                  : "bg-[#F7F3FF] text-[#5B4B7A] hover:bg-[#EDE6FF]"
              }`}
            >
              <span className="text-3xl">{track.emoji}</span>
              <span className="font-black">{track.name}</span>
              {progress.musicTrack === track.id && (
                <span className="ml-auto text-xl">🔊</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-[#F7F3FF] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-black text-[#5B4B7A]">🎼 Music Volume</span>
            <span className="text-xs font-bold text-[#8E7CFF]">{Math.round(progress.companionVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={progress.companionVolume}
            onChange={(e) => update({ companionVolume: Number(e.target.value) })}
            className="w-full accent-[#8E7CFF]"
          />
        </div>
      </div>
    </div>
  );
}
