import { getServerTranslator } from "@/lib/i18n/server";
import { loginAction } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { t } = await getServerTranslator();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold text-dm-raspberry">{t("admin.loginTitle")}</h1>
      <p className="mt-2 text-sm text-dm-muted">{t("admin.loginHint")}</p>
      {sp.error ? (
        <p
          className="mt-4 rounded-dm bg-[#fff7f9] px-3 py-2 text-sm text-dm-danger"
          role="alert"
        >
          {sp.error === "invalid" ? t("admin.loginInvalid") : t("admin.loginFailed")}
        </p>
      ) : null}
      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={sp.next ?? "/"} />
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("auth.email")}
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-dm border border-[#EDD8E1] bg-white px-3 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-semibold text-dm-raspberry">
          {t("auth.password")}
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-dm border border-[#EDD8E1] bg-white px-3 py-3 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-dm bg-dm-primary px-4 py-3 text-sm font-semibold text-white"
        >
          {t("admin.enterDashboard")}
        </button>
      </form>
    </main>
  );
}
