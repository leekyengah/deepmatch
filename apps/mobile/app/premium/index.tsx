import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost } from "../../lib/api";
import { purchasePremium } from "../../lib/iap";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

/** M10 — Payment & subscription (sandbox + IAP stub; LIVE blocked) */
export default function PremiumScreenRoute() {
  const t = useT();
  const [entitled, setEntitled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data?: { premium?: boolean }; premium?: boolean }>(
        "/api/v1/entitlements",
      );
      setEntitled(Boolean(res.data?.premium ?? res.premium));
    } catch {
      setEntitled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function sandboxCheckout() {
    try {
      await apiPost("/api/v1/checkout/orders", {
        sku: "premium_monthly",
        channel: "sandbox",
      });
      Alert.alert(t("commerce.orderCreated") || "Order created", t("mobile.premiumSandboxNote"));
      void load();
    } catch (e) {
      Alert.alert(t("common.errorGeneric"), e instanceof Error ? e.message : t("errors.unknown"));
    }
  }

  async function tryIap() {
    const result = await purchasePremium();
    Alert.alert(
      t("mobile.premiumTitle"),
      result.ok
        ? t("commerce.statusLabel", { status: result.status })
        : result.error || t("mobile.premiumSandboxNote"),
    );
  }

  if (loading) {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <PremiumHeader title={t("mobile.premiumTitle")} />
      <StatusBadge
        label={entitled ? t("commerce.premiumActive") || "Premium" : t("mobile.servicesPreviewBadge")}
        tone={entitled ? "good" : "gold"}
      />
      <Text style={styles.price}>499.000đ / tháng</Text>
      <Text style={styles.body}>{t("mobile.premiumSandboxNote")}</Text>
      <View style={{ height: spacing[3] }} />
      <PremiumButton label={t("mobile.premiumCheckoutCta")} onPress={sandboxCheckout} />
      <View style={{ height: spacing[2] }} />
      <PremiumButton
        label={t("commerce.restorePurchases") || "Restore purchases"}
        variant="outline"
        onPress={tryIap}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  price: { color: colors.champagne, fontSize: 28, fontWeight: "800", marginTop: spacing[4] },
  body: { color: colors.muted, marginTop: spacing[2], lineHeight: 20 },
});
