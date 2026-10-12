import { LEGAL_DOCUMENTS, LEGAL_PACK_META } from "./pack";
import type { LegalDocId, LegalDocument } from "./types";

export type {
  LegalBlock,
  LegalDocId,
  LegalDocument,
  LegalPackMeta,
} from "./types";
export { LEGAL_DOCUMENTS, LEGAL_PACK_META };

/** Consent ledger keys for policy pack v1.1 — not auto-granted to existing users. */
export const LEGAL_CONSENT_KEYS = {
  termsAccept: "terms_accept",
  privacyNoticeAck: "privacy_notice_ack",
  ageEligible: "age_eligible",
  version: "v1.1",
} as const;

export function getLegalDocument(id: LegalDocId): LegalDocument | undefined {
  return LEGAL_DOCUMENTS.find((d) => d.id === id);
}

export function getLegalDocumentByPath(
  path: string,
): LegalDocument | undefined {
  const normalized = path.replace(/\/$/, "") || "/";
  return LEGAL_DOCUMENTS.find((d) => d.path === normalized);
}

export function legalNavItems() {
  return LEGAL_DOCUMENTS.map((d) => ({
    id: d.id,
    href: d.path,
    label: d.navLabel,
    title: d.title,
  }));
}
