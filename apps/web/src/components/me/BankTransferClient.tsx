"use client";

import { resolveApiErrorMessage } from "@/lib/api-error-message";
import { useI18n, useT } from "@/components/i18n/I18nProvider";
import { formatDateTime } from "@deepmatch/i18n";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatVnd } from "@/lib/billing";

type Bank = {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  priceVnd: number;
};

type Payment = {
  id: string;
  amount_cents: number;
  status: string;
  metadata?: { transfer_code?: string };
  created_at: string;
};

export function BankTransferClient() {
  const t = useT();
  const { locale } = useI18n();
  const [bank, setBank] = useState<Bank | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sub, setSub] = useState<{
    status: string;
    current_period_end: string | null;
  } | null>(null);
  const [instruction, setInstruction] = useState<{
    transfer_code: string;
    transfer_content: string;
    amount_vnd: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/payments/bank-transfer");
    if (!res.ok) return;
    const json = (await res.json()) as {
      data?: {
        bank?: Bank;
        payments?: Payment[];
        subscription?: { status: string; current_period_end: string | null };
      };
    };
    setBank(json.data?.bank ?? null);
    setPayments(json.data?.payments ?? []);
    setSub(json.data?.subscription ?? null);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createOrder() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/bank-transfer", {
        method: "POST",
      });
      const json = (await res.json()) as {
        error?: { message?: string };
        data?: {
          transfer_code: string;
          transfer_content: string;
          amount_vnd: number;
        };
      };
      if (!res.ok || !json.data) {
        setError(resolveApiErrorMessage(json, t, "commerce.bankCreateFailed"));
        return;
      }
      setInstruction(json.data);
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {sub?.status === "active" ? (
        <Card>
          <p className="font-semibold text-dm-raspberry">{t("commerce.premiumActive")}</p>
          <p className="mt-1 text-sm text-dm-muted">
            {t("commerce.expiresAt", {
              when: sub.current_period_end
                ? formatDateTime(sub.current_period_end, locale)
                : "—",
            })}
          </p>
        </Card>
      ) : null}

      {bank ? (
        <Card className="space-y-2 text-sm">
          <p className="font-semibold text-dm-raspberry">{t("commerce.bankHdTitle")}</p>
          <p>
            {t("commerce.bankName", { name: bank.bankName })}
          </p>
          <p>
            {t("commerce.bankAccount", { number: bank.accountNumber })}
          </p>
          <p>
            {t("commerce.bankHolder", { name: bank.accountHolder })}
          </p>
          <p>
            {t("commerce.bankAmount", { amount: formatVnd(bank.priceVnd) })}
          </p>
          <p className="text-dm-muted">
            {t("commerce.bankContentHint")}
          </p>
        </Card>
      ) : null}

      <Button type="button" disabled={busy} onClick={() => void createOrder()}>
        {busy ? t("commerce.bankCreating") : t("commerce.bankCreateCta")}
      </Button>

      {instruction ? (
        <Card className="space-y-2 border-dm-primary/40 text-sm" role="status">
          <p className="font-semibold text-dm-raspberry">{t("commerce.bankInfoTitle")}</p>
          <p>
            {t("commerce.bankAmountLine", { amount: formatVnd(instruction.amount_vnd) })}
          </p>
          <p>
            {t("commerce.bankContentLine", { content: instruction.transfer_content })}
          </p>
          <p className="text-dm-muted">
            {t("commerce.bankAfterTransfer")}
          </p>
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {payments.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {payments.map((p) => (
            <li
              key={p.id}
              className="rounded-dm border border-dm-line px-3 py-2"
            >
              {formatVnd(p.amount_cents)} · {p.status}
              {p.metadata?.transfer_code
                ? ` · ${p.metadata.transfer_code}`
                : ""}{" "}
              · {new Date(p.created_at).toLocaleString("vi-VN")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
