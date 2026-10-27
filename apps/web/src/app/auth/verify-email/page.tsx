import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { isEmailVerified } from "@/lib/auth/email-verified";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { resendVerificationAction } from "./actions";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const error = typeof sp.error === "string" ? sp.error : null;
  const sent = sp.sent === "1" || sp.sent === "true";
  const reason = typeof sp.reason === "string" ? sp.reason : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && isEmailVerified(user)) {
    redirect("/onboarding");
  }

  const { t } = await getServerTranslator();
  const reasonCopy =
    reason === "expired"
      ? t("auth.verifyExpired")
      : reason === "invalid"
        ? t("auth.verifyInvalid")
        : null;

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <Link href="/" className="text-sm text-dm-muted">
        {t("auth.backHome")}
      </Link>
      <p className="mt-6 text-xs font-bold tracking-[0.18em] text-dm-champagne">
        {t("auth.verifyEyebrow")}
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-dm-ink">
        {t("auth.verifyTitle")}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-dm-muted">
        {t("auth.verifyBody", {
          email: user?.email ?? t("auth.verifyEmailFallback"),
        })}
      </p>

      {reasonCopy ? (
        <p
          className="mt-4 rounded-dm border border-dm-line bg-dm-blush px-3 py-2 text-sm text-dm-primary"
          role="status"
        >
          {reasonCopy}
        </p>
      ) : null}
      {sent ? (
        <p
          className="mt-4 rounded-dm border border-dm-line bg-dm-surface px-3 py-2 text-sm text-dm-ink"
          role="status"
        >
          {t("auth.verifySent")}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <form action={resendVerificationAction} className="mt-8 space-y-4">
        {!user?.email ? (
          <label className="block text-sm font-semibold text-dm-ink">
            {t("auth.email")}
            <Input
              name="email"
              type="email"
              required
              className="mt-1"
              placeholder={t("auth.emailPlaceholder")}
            />
          </label>
        ) : (
          <input type="hidden" name="email" value={user.email} />
        )}
        <Button type="submit" className="w-full">
          {t("auth.verifyResend")}
        </Button>
      </form>

      <p className="mt-6 text-xs text-dm-muted">{t("auth.verifyHint")}</p>
      <p className="mt-4 text-sm">
        <Link href="/login" className="font-semibold text-dm-primary">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </main>
  );
}
