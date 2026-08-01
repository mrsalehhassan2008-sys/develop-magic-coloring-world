"use client";

import { useState } from "react";
import { type Progress } from "@/lib/progress";
import { FREE_CATEGORIES, PREMIUM_CATEGORIES } from "@/lib/art/catalog";
import { sfx, say } from "@/lib/audio";
import { fx } from "@/components/FxLayer";

interface PurchasePack {
  id: string;
  title: string;
  emoji: string;
  description: string;
  price: number; // in coins
  realMoneyPrice?: string; // e.g., "$2.99"
  categories: string[];
  pages: number;
  popular?: boolean;
}

const PURCHASE_PACKS: PurchasePack[] = [
  {
    id: "dino-pack",
    title: "Dinosaur Pack",
    emoji: "🦕",
    description: "10 amazing dinosaur pages!",
    price: 100,
    realMoneyPrice: "$2.99",
    categories: ["dinosaurs"],
    pages: 10,
  },
  {
    id: "princess-pack",
    title: "Princess Pack",
    emoji: "👑",
    description: "10 magical princess pages!",
    price: 100,
    realMoneyPrice: "$2.99",
    categories: ["princesses"],
    pages: 10,
  },
  {
    id: "space-pack",
    title: "Space Pack",
    emoji: "🚀",
    description: "10 cosmic space pages!",
    price: 100,
    realMoneyPrice: "$2.99",
    categories: ["space"],
    pages: 10,
  },
  {
    id: "mega-pack",
    title: "MEGA PACK",
    emoji: "🎁",
    description: "ALL premium categories! (Save 30%)",
    price: 250,
    realMoneyPrice: "$6.99",
    categories: ["dinosaurs", "princesses", "space", "birds", "scenes"],
    pages: 58,
    popular: true,
  },
  {
    id: "all-access",
    title: "ALL ACCESS",
    emoji: "⭐",
    description: "Everything unlocked forever! (Best Value)",
    price: 500,
    realMoneyPrice: "$9.99",
    categories: ["all"],
    pages: 148,
  },
];

export default function PremiumShop({
  progress,
  update,
  onClose,
}: {
  progress: Progress;
  update: (p: Partial<Progress>) => void;
  onClose: () => void;
}) {
  const [parentGate, setParentGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState("");
  const [gateQuestion] = useState(() => {
    const a = 3 + Math.floor(Math.random() * 7);
    const b = 4 + Math.floor(Math.random() * 8);
    return { a, b, answer: a * b };
  });
  const [selectedPack, setSelectedPack] = useState<PurchasePack | null>(null);

  const isUnlocked = (packId: string) => {
    return progress.purchases.includes(packId) || progress.purchases.includes("all-access");
  };

  const initiatePurchase = (pack: PurchasePack) => {
    if (isUnlocked(pack.id)) {
      say("You already own this!", progress.lang);
      return;
    }
    setSelectedPack(pack);
    setParentGate(true);
    sfx.tap();
  };

  const completePurchase = () => {
    if (!selectedPack) return;
    
    if (progress.coins < selectedPack.price) {
      say("Not enough coins! Keep coloring to earn more!", progress.lang);
      sfx.wrong();
      fx.shake(10);
      return;
    }

    // Deduct coins and add purchase
    update({
      coins: progress.coins - selectedPack.price,
      purchases: [...progress.purchases, selectedPack.id],
    });

    sfx.celebrate();
    fx.confetti(200);
    fx.fireworks(window.innerWidth / 2, window.innerHeight / 2);
    say(`Purchase complete! Enjoy ${selectedPack.title}!`, progress.lang);
    
    window.setTimeout(() => {
      onClose();
    }, 2000);
  };

  const verifyGate = () => {
    if (Number(gateAnswer) === gateQuestion.answer) {
      setParentGate(false);
      completePurchase();
    } else {
      sfx.wrong();
      fx.shake(10);
      setGateAnswer("");
      say("Incorrect! Only parents can make purchases.", progress.lang);
    }
  };

  if (parentGate && selectedPack) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-[#2E2545]/90 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-[32px] bg-white p-6 text-center shadow-2xl">
          <div className="text-5xl">🔒</div>
          <h2 className="mt-3 text-xl font-black text-[#2E2545]">Parental Gate</h2>
          <p className="mt-1 text-sm font-bold text-[#7A6C99]">
            What is {gateQuestion.a} × {gateQuestion.b}?
          </p>
          <input
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className="mt-3 w-full rounded-2xl border-4 border-[#EDE6FF] px-4 py-3 text-center text-2xl font-black text-[#2E2545] outline-none focus:border-[#8E7CFF]"
            placeholder="?"
            autoFocus
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => {
                setParentGate(false);
                setSelectedPack(null);
                setGateAnswer("");
              }}
              className="flex-1 rounded-2xl bg-[#F3EFFF] py-3 font-black text-[#5B4B7A]"
            >
              Cancel
            </button>
            <button
              onClick={verifyGate}
              className="flex-1 rounded-2xl bg-[#8E7CFF] py-3 font-black text-white"
            >
              Purchase
            </button>
          </div>
          <p className="mt-3 text-[11px] font-bold text-[#A99CC4]">
            This prevents children from making unauthorized purchases.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-b from-[#FFE8F4] via-[#E7F3FF] to-[#FFF6DE] p-4">
      <div className="mx-auto max-w-3xl pb-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#2E2545]">🛒 Premium Shop</h2>
            <p className="text-sm font-bold text-[#7A6C99]">Unlock more coloring pages!</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl shadow-md active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Coins Display */}
        <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-white/80 p-4 shadow-lg">
          <span className="text-3xl">🪙</span>
          <span className="text-2xl font-black text-[#5B4B7A]">{progress.coins} coins</span>
          <span className="text-sm font-bold text-[#A99CC4]">
            (Earn by coloring & daily challenges)
          </span>
        </div>

        {/* Free Categories Info */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#7ED087] to-[#38C6D9] p-4 text-white shadow-lg">
          <h3 className="mb-2 text-lg font-black">✅ Free Categories ({FREE_CATEGORIES.length})</h3>
          <div className="flex flex-wrap gap-2">
            {FREE_CATEGORIES.map((c) => (
              <span key={c.key} className="rounded-full bg-white/20 px-3 py-1 text-sm font-black">
                {c.emoji} {c.label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-sm font-bold">
            {FREE_CATEGORIES.length * 10}+ pages available for FREE!
          </p>
        </div>

        {/* Purchase Packs */}
        <div className="grid gap-4 sm:grid-cols-2">
          {PURCHASE_PACKS.map((pack) => {
            const unlocked = isUnlocked(pack.id);
            const canAfford = progress.coins >= pack.price;

            return (
              <div
                key={pack.id}
                className={`relative overflow-hidden rounded-[28px] p-5 shadow-xl transition hover:-translate-y-1 ${
                  unlocked
                    ? "bg-gradient-to-b from-[#7ED087] to-[#38C6D9]"
                    : pack.popular
                      ? "bg-gradient-to-b from-[#FFD84D] to-[#FFB03A] ring-4 ring-[#FFE066]"
                      : "bg-gradient-to-b from-white to-[#F7F3FF]"
                }`}
              >
                {pack.popular && !unlocked && (
                  <div className="absolute top-2 right-2 rounded-full bg-[#FF5C7A] px-3 py-1 text-xs font-black text-white">
                    ⭐ POPULAR
                  </div>
                )}

                <div className="mb-3 flex items-center gap-3">
                  <span className="text-5xl">{pack.emoji}</span>
                  <div>
                    <h3 className={`text-xl font-black ${unlocked ? "text-white" : "text-[#2E2545]"}`}>
                      {pack.title}
                    </h3>
                    <p className={`text-sm font-bold ${unlocked ? "text-white/90" : "text-[#7A6C99]"}`}>
                      {pack.pages} pages
                    </p>
                  </div>
                </div>

                <p className={`mb-4 text-sm ${unlocked ? "text-white/90" : "text-[#5B4B7A]"}`}>
                  {pack.description}
                </p>

                {unlocked ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl bg-white/30 py-3 font-black text-white">
                    <span>✅</span>
                    <span>UNLOCKED</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => initiatePurchase(pack)}
                      disabled={!canAfford}
                      className={`w-full rounded-2xl py-3 font-black transition active:scale-95 ${
                        canAfford
                          ? "bg-white text-[#2E2545] hover:bg-[#F7F3FF]"
                          : "bg-white/50 text-[#A99CC4] cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? (
                        <span className="flex items-center justify-center gap-2">
                          <span>🪙</span>
                          <span>{pack.price} coins</span>
                        </span>
                      ) : (
                        <span>Need {pack.price - progress.coins} more coins</span>
                      )}
                    </button>
                    {pack.realMoneyPrice && (
                      <div className="text-center">
                        <span className="text-xs font-bold text-[#7A6C99]">or </span>
                        <span className="text-sm font-black text-[#8E7CFF]">{pack.realMoneyPrice}</span>
                        <span className="text-xs font-bold text-[#7A6C99]"> one-time</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories included */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {pack.categories.slice(0, 3).map((cat) => {
                    const category = PREMIUM_CATEGORIES.find((c) => c.key === cat);
                    return category ? (
                      <span
                        key={cat}
                        className={`rounded-lg px-2 py-0.5 text-xs font-black ${
                          unlocked ? "bg-white/20 text-white" : "bg-[#EDE6FF] text-[#5B4B7A]"
                        }`}
                      >
                        {category.emoji}
                      </span>
                    ) : null;
                  })}
                  {pack.categories.length > 3 && (
                    <span className={`rounded-lg px-2 py-0.5 text-xs font-black ${unlocked ? "bg-white/20 text-white" : "bg-[#EDE6FF] text-[#5B4B7A]"}`}>
                      +{pack.categories.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* How to earn coins */}
        <div className="mt-6 rounded-2xl bg-white/80 p-4 shadow-lg">
          <h3 className="mb-2 text-lg font-black text-[#2E2545]">💰 How to Earn Coins</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#F7F3FF] p-3">
              <span className="text-2xl">🎨</span>
              <div>
                <div className="text-sm font-black text-[#2E2545]">Complete a page</div>
                <div className="text-xs font-bold text-[#7A6C99]">+10 coins</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#F7F3FF] p-3">
              <span className="text-2xl">⭐</span>
              <div>
                <div className="text-sm font-black text-[#2E2545]">Daily challenge</div>
                <div className="text-xs font-bold text-[#7A6C99]">+15-25 coins</div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#F7F3FF] p-3">
              <span className="text-2xl">🎁</span>
              <div>
                <div className="text-sm font-black text-[#2E2545]">Daily reward</div>
                <div className="text-xs font-bold text-[#7A6C99]">+10-70 coins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Restore purchases */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              sfx.tap();
              say("No purchases to restore yet!", progress.lang);
            }}
            className="text-sm font-black text-[#8E7CFF] hover:underline"
          >
            🔄 Restore Purchases
          </button>
        </div>
      </div>
    </div>
  );
}
