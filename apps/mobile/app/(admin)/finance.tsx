import { useCallback, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  KPIStatCard,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

type Pay = {
  id: string;
  user_id: string;
  amount_cents: number;
  status: string;
  provider: string;
  created_at: string;
};

/** A05 — Finance & payments (bank_hd sandbox; no PAN/secrets) */
export default function AdminFinanceScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Pay[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("payments")
      .select("id, user_id, amount_cents, status, provider, created_at")
      .eq("provider", "bank_hd")
      .order("created_at", { ascending: false })
      .limit(50);
    if (err) setError(err.message);
    else setRows((data as Pay[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const totalVnd = useMemo(
    () =>
      rows
        .filter((r) => r.status === "succeeded" || r.status === "confirmed")
        .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0) / 100,
    [rows],
  );

  if (loading) {
    return (
      <PremiumScreen>
        <SkeletonLoader />
      </PremiumScreen>
    );
  }
  if (error) {
    return (
      <PremiumScreen>
        <ErrorState message={error} onRetry={load} retryLabel={t("mobile.retry")} />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <PremiumHeader title={t("admin.billingFull")} subtitle={t("admin.billingIntro")} />
      <KPIStatCard label="Succeeded (VND)" value={Math.round(totalVnd).toLocaleString("vi-VN")} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<EmptyState title={t("admin.billingEmptyTitle")} />}
        contentContainerStyle={{ paddingBottom: spacing[8], paddingTop: spacing[3] }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <StatusBadge
              label={item.status}
              tone={
                item.status === "succeeded" || item.status === "confirmed"
                  ? "good"
                  : item.status === "refunded"
                    ? "danger"
                    : "neutral"
              }
            />
            <Text style={styles.amount}>
              {(item.amount_cents / 100).toLocaleString("vi-VN")}đ
            </Text>
            <Text style={styles.meta}>
              {item.provider} · user {item.user_id.slice(0, 8)}… · {item.id.slice(0, 8)}…
            </Text>
          </View>
        )}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[3],
    marginBottom: spacing[2],
    gap: 4,
  },
  amount: { color: colors.champagne, fontWeight: "800", fontSize: 16 },
  meta: { color: colors.muted, fontSize: 12 },
});
