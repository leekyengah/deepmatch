# PROVIDER ADAPTER CONTRACTS (EXT-018)

Sandbox-only contracts. LIVE activation requires Founder gate (EXT-040) — NO_GO by default.

## Interface (TypeScript conceptual)

```ts
type ProviderStatus = "DEMO" | "TEST" | "VERIFIED" | "LIVE";

interface ProviderAdapter {
  id: string;
  status: ProviderStatus;
  quote(input: QuoteInput): Promise<SandboxQuote>;
  reserve(input: ReserveInput): Promise<SandboxReservation>;
  confirm(id: string): Promise<SandboxReservation>;
  cancel(id: string): Promise<SandboxReservation>;
  reconcile(id: string): Promise<ReconcileResult>;
  handleWebhook?(raw: unknown): Promise<WebhookAck>;
}
```

## Rules

1. DEMO/TEST adapters never return `LIVE` availability.
2. Receipts must include `demo: true` and non-commercial banner.
3. Webhooks ignored unless provider status is LIVE **and** Founder checklist signed.
4. Cancel/reconcile must be idempotent.
5. No real card capture in sandbox PSP mock.

## Current implementation

- Catalog bookings: `POST/PATCH /api/v1/catalog/bookings`
- Cart sandbox: `POST /api/v1/catalog/cart/checkout` → creates `commerce_demo_bookings` only
- Fulfillment filter: `SANDBOX_ONLY`
