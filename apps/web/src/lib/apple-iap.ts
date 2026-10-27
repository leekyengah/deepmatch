/** Decode StoreKit 2 / App Store Server Notifications JWS payload (no crypto verify in MVP). */

export type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  productId?: string;
  bundleId?: string;
  expiresDate?: number;
  purchaseDate?: number;
  type?: string;
  environment?: string;
  appAccountToken?: string;
};

export function decodeJwsPayload<T = Record<string, unknown>>(
  jws: string,
): T | null {
  const parts = jws.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function expectedBundleId() {
  return process.env.APPLE_BUNDLE_ID ?? "com.datingvn.deepmatch";
}

export function premiumProductIds(): Set<string> {
  const raw =
    process.env.APPLE_IAP_PRODUCT_IDS ??
    process.env.APPLE_IAP_PRODUCT_ID ??
    "premium_monthly";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function assertAppleTransaction(
  tx: AppleTransactionPayload,
): { ok: true } | { ok: false; reason: string } {
  const bundle = expectedBundleId();
  if (tx.bundleId && tx.bundleId !== bundle) {
    return { ok: false, reason: `bundle_mismatch:${tx.bundleId}` };
  }
  if (!tx.productId || !premiumProductIds().has(tx.productId)) {
    return { ok: false, reason: `unknown_product:${tx.productId ?? ""}` };
  }
  if (!tx.originalTransactionId && !tx.transactionId) {
    return { ok: false, reason: "missing_transaction_id" };
  }
  return { ok: true };
}
