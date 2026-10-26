import type { AdapterManifest } from "../types.js";

/**
 * Future project placeholders. Config/manifest only — do NOT register
 * executable adapters or run tests against these environments in V1.
 */
export const FUTURE_PROJECT_STUBS: AdapterManifest[] = [
  {
    projectId: "elenaza",
    enabled: false,
    allowExecution: false,
    notes: "ELENAZA reserved — adapter not implemented; do not run",
  },
  {
    projectId: "kiennghiviet",
    enabled: false,
    allowExecution: false,
    notes:
      "Kiến Nghị Việt exists in TradingBase apps/kiennghiviet-web — adapter deferred",
  },
  {
    projectId: "vdea",
    enabled: false,
    allowExecution: false,
    notes: "VDEA reserved — adapter not implemented; do not run",
  },
  {
    projectId: "elenanguyen",
    enabled: false,
    allowExecution: false,
    notes: "ElenaNguyen.com reserved — adapter not implemented; do not run",
  },
];
