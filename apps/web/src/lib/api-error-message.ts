import type { ApiErrorBody, ApiErrorCode } from "@deepmatch/shared";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/** Prefer i18n key from API envelope; fall back to localized code then raw message. */
export function resolveApiErrorMessage(
  body: unknown,
  t: TFn,
  fallbackKey = "errors.unknown",
): string {
  const err = (body as ApiErrorBody | null | undefined)?.error;
  if (!err) return t(fallbackKey);

  if (err.key) {
    const viaKey = t(err.key);
    if (viaKey && !viaKey.startsWith("[missing:")) return viaKey;
  }

  const code = err.code as ApiErrorCode | undefined;
  if (code) {
    const viaCode = t(`errors.${code}`);
    if (viaCode && !viaCode.startsWith("[missing:")) return viaCode;
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }
  return t(fallbackKey);
}
