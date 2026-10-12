import { NextResponse } from "next/server";
import {
  apiError,
  httpStatusFor,
  makeRequestId,
  type ApiErrorCode,
} from "@deepmatch/shared";
import { t, type TranslateVars } from "@deepmatch/i18n";
import { getRequestLocale } from "@/lib/i18n/server";

/** Localized API copy (errors.* or other namespaces). */
export async function apiT(key: string, vars?: TranslateVars): Promise<string> {
  const locale = await getRequestLocale();
  const full = key.includes(".") ? key : `errors.${key}`;
  return t(locale, full, vars);
}

/**
 * Unified error envelope. `detailKey` is an `errors.*` key (without prefix OK).
 * Omitting detailKey uses `errors.<CODE>`. Never pass raw DB/driver messages.
 */
export async function jsonError(
  code: ApiErrorCode,
  detailKey?: string | null,
  requestId = makeRequestId(),
  vars?: TranslateVars,
) {
  const locale = await getRequestLocale();
  const key = detailKey
    ? detailKey.includes(".")
      ? detailKey
      : `errors.${detailKey}`
    : `errors.${code}`;
  const message = t(locale, key, vars);
  return NextResponse.json(
    apiError(code, message, requestId, key),
    { status: httpStatusFor(code) },
  );
}

export { makeRequestId };
