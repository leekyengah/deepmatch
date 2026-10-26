import { useEffect, useState, type ReactNode } from "react";
import { router } from "expo-router";
import { fetchIsStaff } from "../lib/staff";
import { useT } from "../lib/i18n/I18nProvider";
import {
  ErrorState,
  PremiumScreen,
  SkeletonLoader,
} from "./premium";

/** Client staff probe — every mutation still enforced by RLS/RPC. */
export function AdminGate({ children }: { children: ReactNode }) {
  const t = useT();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    void fetchIsStaff().then((ok) => setState(ok ? "ok" : "denied"));
  }, []);

  if (state === "loading") {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }
  if (state === "denied") {
    return (
      <PremiumScreen>
        <ErrorState
          message={t("mobile.adminDenied")}
          onRetry={() => router.replace("/(tabs)")}
          retryLabel={t("nav.home")}
        />
      </PremiumScreen>
    );
  }
  return <>{children}</>;
}
