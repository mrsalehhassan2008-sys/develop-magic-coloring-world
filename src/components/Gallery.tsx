"use client";

import { useCallback, useEffect, useState } from "react";
import { fx } from "@/components/FxLayer";
import { sfx } from "@/lib/audio";

interface Art {
  id: number;
  title: string;
  pageSlug: string;
  thumbnail: string | null;
  createdAt: string;
}

export default function Gallery({ onExit }: { onExit: () => void }) {
  const [items, setItems] = useState<Art[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Art | null>(null);
  const [filter, setFilter] = useState<"all" | "recent" | "favorites">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/artworks");
      const data = (await res.json()) as { artworks: Art[] };
      setItems(data.artworks ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredItems = items.filter((item) => {
    if (filter === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.createdAt) > weekAgo;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#FDF7FF]">
      {/* Header */}
      <div className="flex items-center gap-2 p-3">
        <button onClick={onExit} className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90" aria-label="Home">🏠</button>
        <div className="rounded-full bg-white px-4 py-1.5 font-black text-[#5B4B7A] shadow">🖼️ My Masterpieces</div>
        <div className="ml-auto flex gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              sfx.tap();
            }}
            className="rounded-xl border-2 border-[#EDE6FF] px-3 py-2 text-sm font-black text-[#2E2545]"
          >
            <option value="all">All ({items.length})</option>
            <option value="recent">This Week</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <p className="p-6 text-center font-black text-[#B7A9D4]">Loading your art…</p>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <span className="text-8xl">🎨</span>
          <p className="text-center font-black text-[#B7A9D4]">No artwork yet!</p>
          <p className="text-sm font-bold text-[#A99CC4]">Color a page and press 💾 to save</p>
          <button onClick={onExit} className="rounded-2xl bg-[#8E7CFF] px-6 py-3 font-black text-white">
            Start Coloring →
          </button>
        </div>
      ) : (
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((a) => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              {a.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.thumbnail} alt={a.title} className="aspect-square w-full object-cover transition group-hover:scale-110" />
              ) : (
                <div className="grid aspect-square place-items-center text-4xl">🎨</div>
              )}
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs font-black text-[#5B4B7A]">{a.title}</span>
                <span className="text-xs">📅</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#2E2545]/90 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] overflow-auto rounded-[32px] bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-black text-[#2E2545]">{selected.title}</h3>
              <button onClick={() => setSelected(null)} className="text-2xl font-black text-[#A99CC4]">✕</button>
            </div>
            {selected.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.thumbnail} alt={selected.title} className="max-h-[60vh] w-full rounded-2xl object-contain" />
            ) : (
              <div className="grid aspect-square w-full max-w-md place-items-center text-8xl">🎨</div>
            )}
            <div className="mt-4 flex gap-2">
              {selected.thumbnail && (
                <a
                  href={selected.thumbnail}
                  download={`${selected.pageSlug}.png`}
                  className="flex-1 rounded-2xl bg-[#7ED087] py-3 font-black text-white text-center"
                >
                  📤 Download
                </a>
              )}
              <button
                onClick={async () => {
                  await fetch(`/api/artworks?id=${selected.id}`, { method: "DELETE" });
                  sfx.whoosh();
                  void load();
                  setSelected(null);
                }}
                className="flex-1 rounded-2xl bg-[#FF5C7A] py-3 font-black text-white"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
