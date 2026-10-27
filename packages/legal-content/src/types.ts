export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "ul"; items: string[] };

export type LegalDocId =
  | "terms"
  | "privacy"
  | "community"
  | "child-safety"
  | "couple-data"
  | "subscriptions"
  | "ai"
  | "services"
  | "delete-account"
  | "support";

export type LegalDocument = {
  id: LegalDocId;
  /** Path under /legal or absolute for support */
  path: string;
  title: string;
  navLabel: string;
  /** Roman / section reference in source pack */
  sourcePart: string;
  blocks: LegalBlock[];
};

export type LegalPackMeta = {
  version: string;
  /** Content update date from source — not an effective/launch date */
  contentUpdatedLabel: string;
  contentUpdatedIso: string;
  locale: "vi-VN";
  title: string;
  intro: LegalBlock[];
};
