import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <Link href="/" className="text-sm opacity-60">
        {t("auth.backHome")}
      </Link>
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl text-[var(--dm-deep)]">
        {t("auth.login")}
      </h1>
      <form action={loginAction} className="mt-8 space-y-4 rounded-3xl bg-white/80 p-6">
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
          {t("auth.password")}
          <input
            required
            name="password"
            type="password"
            minLength={8}
            className="mt-1 w-full rounded-xl border px-3 py-2"
          />
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
          {t("auth.login")}
        </button>
      </form>
      <p className="mt-3 text-sm">
        <Link href="/forgot-password" className="underline opacity-80">
          {t("auth.forgotPassword")}
        </Link>
      </p>
      <p className="mt-4 text-sm">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-semibold underline">
          {t("auth.signupShort")}
        </Link>
      </p>
    </main>
  );
}
