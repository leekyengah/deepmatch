export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_ACCESSIBLE"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    /** i18n key (e.g. errors.flagChatOff) for client re-translation */
    key?: string;
    request_id: string;
  };
};

/** Works in Node and Edge/browser — avoid node:crypto in client bundles. */
export function makeRequestId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  requestId = makeRequestId(),
  key?: string,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      request_id: requestId,
      ...(key ? { key } : {}),
    },
  };
}

export function httpStatusFor(code: ApiErrorCode): number {
  switch (code) {
    case "VALIDATION_ERROR":
      return 400;
    case "UNAUTHENTICATED":
      return 401;
    case "FORBIDDEN":
    case "RESOURCE_NOT_ACCESSIBLE":
      return 403;
    case "CONFLICT":
      return 409;
    case "RATE_LIMITED":
      return 429;
    default:
      return 500;
  }
}
