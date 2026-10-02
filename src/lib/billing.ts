/**
 * Google Play Billing seam (Digital Goods API for TWA).
 *
 * Behaviour:
 *  • On the open web / Vercel preview → SIMULATION (always succeeds).
 *    Premium unlock still goes through the parental gate in the UI.
 *  • Inside a Trusted Web Activity that exposes getDigitalGoodsService
 *    AND NEXT_PUBLIC_BILLING_ENABLED=1 → real Play Billing flow.
 *
 * Products (create these as one-time In-app products in Play Console):
 *   premium_unlock_all  → $2.99
 *   premium_pack_pages  → $1.99
 *
 * Flow for real purchases:
 *  1. Client calls `purchase(productId)`.
 *  2. We try PaymentRequest with the Digital Goods method (supported in
 *     Chrome Custom Tabs / TWA when Bubblewrap enables Play Billing).
 *  3. On success we acknowledge the token so Google marks it consumed/owned.
 *  4. If the API is missing we fall back to simulation so the rest of the
 *     app stays fully testable.
 */

export const BILLING_ENABLED =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_BILLING_ENABLED === "1";

export const PRODUCT_IDS = {
  unlockAll: "premium_unlock_all",
  packPages: "premium_pack_pages",
} as const;

interface DigitalGood {
  itemId: string;
  title?: string;
  description?: string;
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
  if (typeof window === "undefined") return null;
  const w = window as Win;
  if (!w.getDigitalGoodsService) return null;
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
 * Attempt a purchase.
 *
 * Real path (TWA + BILLING_ENABLED):
 *   1. Check if the user already owns the SKU → acknowledge & return success.
 *   2. Otherwise launch PaymentRequest (Digital Goods) so the Play sheet opens.
 *   3. After the user pays, acknowledge the resulting token.
 *
 * Simulation path (web / missing API): always returns { ok: true, mode: "simulation" }.
 */
export async function purchase(productId: string): Promise<PurchaseResult> {
  const service = await getBillingService();
  if (!service) return { ok: true, mode: "simulation" };

  try {
    // Already owned?
    const existing = await service.getPurchases();
    const hit = existing.find((p) => p.itemId === productId);
    if (hit) {
      try {
        await service.acknowledge(hit.purchaseToken);
      } catch {
        /* already acknowledged is fine */
      }
      return { ok: true, mode: "play", productId };
    }

    // Launch the real purchase sheet via Payment Request API
    if (typeof PaymentRequest === "undefined") {
      return { ok: false, reason: "PaymentRequest not available" };
    }

    const details = await service.getDetails([{ itemId: productId }]);
    const item = details[0];
    if (!item) return { ok: false, reason: "unknown product" };

    const request = new PaymentRequest(
      [
        {
          supportedMethods: "https://play.google.com/billing",
          data: { sku: productId },
        },
      ],
      {
        total: {
          label: item.title || productId,
          amount: { currency: item.price.currency, value: item.price.value },
        },
      },
    );

    const can = await request.canMakePayment().catch(() => false);
    if (!can) return { ok: false, reason: "billing unavailable on this device" };

    const response = await request.show();
    // response.details should contain the purchase token from Play
    const token =
      (response.details as { purchaseToken?: string } | undefined)?.purchaseToken ??
      (response.details as { token?: string } | undefined)?.token;

    await response.complete("success");

    if (token) {
      try {
        await service.acknowledge(token);
      } catch {
        /* acknowledge failure is non-fatal for one-time unlocks */
      }
    }

    return { ok: true, mode: "play", productId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "billing error";
    // User cancelled the sheet → treat as soft failure
    if (/abort|cancel/i.test(msg)) return { ok: false, reason: "cancelled" };
    return { ok: false, reason: msg };
  }
}

/** Check which of our known products the user already owns (for restore). */
export async function restorePurchases(): Promise<string[]> {
  const service = await getBillingService();
  if (!service) return [];
  try {
    const list = await service.getPurchases();
    return list.map((p) => p.itemId);
  } catch {
    return [];
  }
}
