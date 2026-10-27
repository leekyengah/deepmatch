"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useT } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const t = useT();
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("auth.passwordMinError"));
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setNote(t("auth.passwordUpdated"));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link href="/" aria-label={t("common.brand")}>
        <BrandLogo variant="full" className="h-9 w-auto" />
      </Link>
      <h1 className="mt-10 font-display text-3xl font-medium text-dm-raspberry">
        {t("auth.resetPassword")}
      </h1>
      <p className="mt-2 text-sm text-dm-muted">{t("auth.resetPasswordBody")}</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input
          type="password"
          required
          minLength={8}
          placeholder={t("auth.newPassword")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {note ? (
          <p className="text-sm text-dm-raspberry" role="status">
            {note}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("auth.savingPassword") : t("auth.savePassword")}
        </Button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/login" className="underline text-dm-muted">
          {t("auth.login")}
        </Link>
      </p>
    </main>
  );
}
