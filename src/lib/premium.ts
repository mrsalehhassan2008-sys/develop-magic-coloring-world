/** Which brushes are Premium (free ones stay usable forever). */
export const PREMIUM_BRUSHES = new Set([
  "water",
  "air",
  "glitter",
  "rainbow",
  "neon",
  "magic",
  "pattern",
  "texture",
]);

/** Which sticker packs are Premium (first few packs stay free). */
export const FREE_STICKER_PACKS = new Set(["stars", "animals", "flowers", "emoji"]);

export interface StoreItem {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  price: string;
  kind: "unlock_all" | "pack";
}

/** Storefront — wired to Google Play Billing later; product ids match here.
 *
 * Pricing is based on a real Google Play market scan (2026):
 *   • One-time "unlock all" for kids coloring apps sits at $1.99–$4.99.
 *   • PicoToons unlocks everything for $1.99; Coloring Book Fun similar.
 *   • Over-pricing (e.g. Colorfy at $19.99/mo) tanks ratings to ~3.7 with
 *     angry reviews — the opposite of our 4.8★ goal.
 * Sweet spot for revenue + high rating = $2.99 one-time, with a cheaper
 * single-pack option for price-sensitive parents.
 */
export const STORE_ITEMS: StoreItem[] = [
  {
    id: "premium_unlock_all",
    emoji: "👑",
    title: "Unlock Everything",
    desc: "All pictures, big scenes, magic brushes & sticker packs — forever!",
    price: "$2.99",
    kind: "unlock_all",
  },
  {
    id: "premium_pack_pages",
    emoji: "🎨",
    title: "All Coloring Pages",
    desc: "Unlock every picture & big scene (keep the free brushes).",
    price: "$1.99",
    kind: "pack",
  },
];

/** secret code that unlocks premium for the owner's family only.
 *  Change it to any code you like before publishing. */
export const FAMILY_UNLOCK_CODE = "MCW-FAMILY-2026";

export function isBrushPremium(id: string) {
  return PREMIUM_BRUSHES.has(id);
}
export function isStickerPackPremium(key: string) {
  return !FREE_STICKER_PACKS.has(key);
}
