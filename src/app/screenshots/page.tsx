"use client";

import { useState } from "react";

export default function ScreenshotsCapture() {
  const [mode, setMode] = useState<"phone" | "tablet">("phone");

  const screenshots = [
    { id: 1, title: "Home Screen", emoji: "🏠", desc: "Avatar, Level, Daily Challenges" },
    { id: 2, title: "Coloring Studio", emoji: "🎨", desc: "Sidebar tools, Color by Numbers" },
    { id: 3, title: "Progress Bar", emoji: "📊", desc: "Real-time progress with celebration" },
    { id: 4, title: "Balloon Pop Game", emoji: "🎈", desc: "Educational arcade game" },
    { id: 5, title: "Connect the Dots", emoji: "🔢", desc: "100 puzzles with difficulty levels" },
    { id: 6, title: "Learn Mode", emoji: "🎓", desc: "10 topics with voice pronunciation" },
    { id: 7, title: "Daily Challenges", emoji: "📅", desc: "3 daily tasks with rewards" },
    { id: 8, title: "Avatar Selection", emoji: "🎭", desc: "10 characters to choose from" },
  ];

  return (
    <main className="min-h-screen bg-[#1A1A2E] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">📸 Screenshot Capture Tool</h1>
            <p className="text-sm font-bold text-[#A99CC4]">
              Use these frames to capture screenshots for Google Play Store
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("phone")}
              className={`rounded-xl px-4 py-2 font-black ${mode === "phone" ? "bg-[#8E7CFF] text-white" : "bg-[#2A2A4E] text-[#A99CC4]"}`}
            >
              📱 Phone (1080x1920)
            </button>
            <button
              onClick={() => setMode("tablet")}
              className={`rounded-xl px-4 py-2 font-black ${mode === "tablet" ? "bg-[#8E7CFF] text-white" : "bg-[#2A2A4E] text-[#A99CC4]"}`}
            >
              📟 Tablet (1920x1080)
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${mode === "phone" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>
          {screenshots.map((s) => (
            <div
              key={s.id}
              className={`overflow-hidden rounded-[32px] bg-gradient-to-b from-[#FFE8F4] via-[#E7F3FF] to-[#FFF6DE] shadow-2xl ${
                mode === "phone" ? "aspect-[9/19]" : "aspect-[16/9]"
              }`}
            >
              {/* Mock UI Header */}
              <div className="flex items-center gap-2 border-b border-white/50 p-3">
                <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1">
                  <span className="text-xl">
                    {s.id === 1 || s.id === 8 ? "👦" : s.id === 2 ? "🎨" : s.id === 4 ? "🎈" : "🌟"}
                  </span>
                  <span className="text-xs font-black text-[#5B4B7A]">Ahmed</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-[#8E7CFF]/30">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[#FFD84D] to-[#7ED087]" style={{ width: `${s.id * 12}%` }} />
                  </div>
                </div>
                <span className="text-xs font-black text-[#5B4B7A]">⭐ {s.id * 25}</span>
              </div>

              {/* Content Area */}
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                <span className="text-8xl">{s.emoji}</span>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-[#2E2545]">{s.title}</h3>
                  <p className="text-sm font-bold text-[#7A6C99]">{s.desc}</p>
                </div>

                {/* Decorative Elements */}
                <div className="flex gap-2">
                  {["🎨", "⭐", "🪙", "🎁"].map((e, i) => (
                    <span key={i} className="animate-bounce text-3xl" style={{ animationDelay: `${i * 0.1}s` }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mock UI Footer */}
              <div className="flex justify-center gap-2 border-t border-white/50 p-3">
                <span className="rounded-xl bg-white/80 px-3 py-2 text-xl">🏠</span>
                <span className="rounded-xl bg-white/80 px-3 py-2 text-xl">🎨</span>
                <span className="rounded-xl bg-white/80 px-3 py-2 text-xl">🎮</span>
                <span className="rounded-xl bg-[#FFD84D]/80 px-3 py-2 text-xl">📅</span>
              </div>

              {/* Screenshot Label */}
              <div className="absolute bottom-2 right-2 rounded-lg bg-[#2E2545]/80 px-2 py-1 text-xs font-black text-white">
                Screenshot {s.id}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-2xl bg-[#2A2A4E] p-6">
          <h2 className="mb-4 text-xl font-black text-white">📋 How to Capture Screenshots</h2>
          <ol className="list-decimal space-y-2 pl-6 text-[#D9D9F0]">
            <li>Open this page on your device or emulator</li>
            <li>Use device screenshot function (Power + Volume Down)</li>
            <li>Crop to remove browser UI if needed</li>
            <li>Upload to Google Play Console (min 2, max 8)</li>
            <li>Recommended: Use phone AND tablet screenshots</li>
          </ol>

          <div className="mt-4 rounded-xl bg-[#8E7CFF]/20 p-4">
            <p className="font-black text-[#B49BE0]">
              💡 Pro Tip: Use Chrome DevTools Device Mode to capture at exact resolutions:
            </p>
            <ul className="mt-2 list-disc pl-6 text-sm text-[#A99CC4]">
              <li>Phone: 1080 x 1920 pixels</li>
              <li>Tablet: 1920 x 1080 pixels</li>
              <li>Feature Graphic: 1024 x 500 pixels</li>
              <li>App Icon: 512 x 512 pixels</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
