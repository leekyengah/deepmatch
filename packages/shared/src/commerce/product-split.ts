import { classifyCommerceProduct, type ProductKind } from "./lifecycle";

/**
 * Store compliance split: digital entitlements vs offline IRL services.
 * Used to keep Apple/Google IAP only on digital SKUs.
 */
export type CommerceSkuClass = {
  code: string;
  kind: ProductKind;
  storeBilling: "iap_required" | "iap_forbidden" | "hybrid_review";
  note: string;
};

/** Seven Premium/Companion service packages + digital premium entitlement. */
export const COMMERCE_SKU_CLASSES: CommerceSkuClass[] = [
  {
    code: "premium_subscription",
    kind: "digital_entitlement",
    storeBilling: "iap_required",
    note: "In-app digital premium — ASC/Play IAP when store billing goes live",
  },
  {
    code: "CMP-01",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Listening session — fulfilled offline; no IAP",
  },
  {
    code: "CMP-02",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Experience companion — offline",
  },
  {
    code: "CMP-03",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Goals coaching — offline",
  },
  {
    code: "CMP-04",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Private date curation — offline",
  },
  {
    code: "MAT-01",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Matchmaking tier 1 — offline",
  },
  {
    code: "MAT-02",
    kind: "offline_service",
    storeBilling: "iap_forbidden",
    note: "Matchmaking tier 2 — offline",
  },
  {
    code: "MAT-03",
    kind: "hybrid",
    storeBilling: "hybrid_review",
    note: "Exclusive matchmaking — review before any digital unlock bundling",
  },
];

export function storeBillingForSku(code: string): CommerceSkuClass {
  const hit = COMMERCE_SKU_CLASSES.find((s) => s.code === code);
  if (hit) return hit;
  const kind = classifyCommerceProduct({ sku: code, packageCode: code });
  return {
    code,
    kind,
    storeBilling:
      kind === "digital_entitlement"
        ? "iap_required"
        : kind === "offline_service"
          ? "iap_forbidden"
          : "hybrid_review",
    note: "Inferred from sku heuristics",
  };
}
