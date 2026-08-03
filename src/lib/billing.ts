/**
 * Google Play Billing seam.
 *
 * Today the Store runs in SIMULATION mode (free unlock behind the parental
 * gate) so the app is fully testable on the web. When the app is shipped as a
 * TWA with Bubblewrap's Play Billing feature and the products are created in
 * Play Console, set NEXT_PUBLIC_BILLING_ENABLED=1 and purchases below will go
 * through the real Digital Goods API.
 *
 * Products (must exist as In-app products in Play Console, status Active):
 *   premium_unlock_all  → $2.99 one-time
 *   premium_pack_pages  → $1.99 one-time
 */

export const BILLING_ENABLED =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_BILLING_ENABLED === "1";

interface DigitalGood {
  itemId: string;
  price: { currency: string; value: string };
}
interface DigitalPurchase {
  itemId: string;
  purchaseToken: string;
}
interface DigitalGoodsService {
  getDetails(items: { itemId: string }[]): Promise<DigitalGood[]>;
  getPurchases(): Promise<DigitalPurchase[]>;
  acknowledge(purchaseToken: string): Promise<void>;
}

type Win = Window & {
  getDigitalGoodsService?: (provider: string) => Promise<DigitalGoodsService | null>;
};

/** true only inside a TWA that exposes the Play Billing Digital Goods API */
export async function getBillingService(): Promise<DigitalGoodsService | null> {
  if (!BILLING_ENABLED) return null;
  const w = (typeof window !== "undefined" ? window : null) as Win | null;
  if (!w?.getDigitalGoodsService) return null;
  try {
    return await w.getDigitalGoodsService("https://play.google.com/billing");
  } catch {
    return null;
  }
}

export type PurchaseResult =
  | { ok: true; mode: "simulation" }
  | { ok: true; mode: "play"; productId: string }
  | { ok: false; reason: string };

/**
 * Attempt a real purchase; falls back to simulation when billing is not
 * available (web/dev). The native TWA shell launches the actual BillingFlow;
 * here we verify + acknowledge the resulting purchase via the Digital Goods API.
 */
export async function purchase(productId: string): Promise<PurchaseResult> {
  const service = await getBillingService();
  if (!service) return { ok: true, mode: "simulation" };
  try {
    const purchases = await service.getPurchases();
    const hit = purchases.find((p) => p.itemId === productId);
    if (!hit) return { ok: false, reason: "no purchase found" };
    await service.acknowledge(hit.purchaseToken);
    return { ok: true, mode: "play", productId };
  } catch {
    return { ok: false, reason: "billing error" };
  }
}
