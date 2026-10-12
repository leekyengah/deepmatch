import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";
import { safeNextPath } from "@/lib/safe-next";
import { signupAction } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getServerTranslator();
  const next = safeNextPath(sp.next, "/onboarding");
  const loginHref =
    next.startsWith("/couple/join")
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <Link href="/" className="text-sm opacity-60">
        {t("auth.backHome")}
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        {t("auth.signup")}
      </h1>
      <p className="mt-2 text-sm opacity-70">{t("auth.ageGateAdr")}</p>
      {next.startsWith("/couple/join") ? (
        <p className="mt-2 text-sm text-dm-muted">{t("couple.joinSignupHint")}</p>
      ) : null}
      <form action={signupAction} className="mt-8 space-y-4 rounded-3xl bg-white/80 p-6">
        <input type="hidden" name="next" value={next} />
        <label className="block text-sm">
          {t("auth.displayName")}
          <input
            required
            name="display_name"
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.email")}
          <input
            required
            name="email"
            type="email"
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.passwordMin")}
          <input
            required
            name="password"
            type="password"
            minLength={8}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          {t("auth.birthDate")}
          <input
            required
            name="birth_date"
            type="date"
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input required type="checkbox" name="age_confirm" className="mt-1" />
          {t("auth.ageConfirm")}
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input required type="checkbox" name="tos" className="mt-1" />
          {t("auth.tosConfirm")}
        </label>
        {sp.error && (
          <p className="text-sm text-red-700" role="alert">
            {sp.error}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--dm-primary)] py-2.5 text-sm font-semibold text-white"
        >
          {t("auth.signupShort")}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {t("auth.hasAccount")}{" "}
        <Link href={loginHref} className="font-semibold underline">
          {t("auth.login")}
        </Link>
      </p>
    </main>
  );
}
