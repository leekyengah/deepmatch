/**
 * Payment adapter abstraction for Concierge services.
 * LIVE payment remains OFF — sandbox / future providers only.
 *
 * Env flags (default false):
 * - SERVICES_PAYMENT_LIVE
 * - SERVICES_BOOKING_LIVE
 * - SERVICES_PROVIDER_ASSIGNMENT_LIVE
 */

export type PaymentSessionInput = {
  orderId: string;
  amountVnd: number;
  currency: "VND";
  returnUrl: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
};

export type PaymentSessionResult = {
  provider: string;
  sessionId: string;
  paymentUrl: string | null;
  status: "created" | "unavailable" | "sandbox_stub";
};

export type PaymentAdapter = {
  createSession(input: PaymentSessionInput): Promise<PaymentSessionResult>;
  verifyWebhook(rawBody: string, signature: string | null): Promise<boolean>;
};

export function servicesPaymentLive(): boolean {
  return process.env.SERVICES_PAYMENT_LIVE === "true";
}

export function servicesBookingLive(): boolean {
  return process.env.SERVICES_BOOKING_LIVE === "true";
}

export function servicesProviderAssignmentLive(): boolean {
  return process.env.SERVICES_PROVIDER_ASSIGNMENT_LIVE === "true";
}

/** Default stub — never charges. Wire real provider behind LIVE gate + dual approval. */
export const sandboxPaymentAdapter: PaymentAdapter = {
  async createSession(input) {
    if (servicesPaymentLive()) {
      throw new Error(
        "SERVICES_PAYMENT_LIVE is true but no production adapter is registered",
      );
    }
    return {
      provider: "sandbox_stub",
      sessionId: `stub_${input.orderId}_${input.idempotencyKey.slice(0, 8)}`,
      paymentUrl: null,
      status: "sandbox_stub",
    };
  },
  async verifyWebhook() {
    return false;
  },
};

export function getServicesPaymentAdapter(): PaymentAdapter {
  return sandboxPaymentAdapter;
}
