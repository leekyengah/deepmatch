import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

/** A04 — Concierge operations */
export default function AdminConciergeScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      status: string;
      requester_id: string;
      advisor_id: string | null;
      created_at: string;
    }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("service_bookings")
      .select("id, status, requester_id, advisor_id, created_at")
      .in("status", ["requested", "assigned"])
      .order("created_at", { ascending: false })
      .limit(40);
    if (err) setError(err.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
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
      <PremiumHeader title={t("admin.servicesFull")} subtitle={t("admin.servicesIntro")} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<EmptyState title={t("admin.servicesEmptyTitle")} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <StatusBadge
              label={item.status}
              tone={item.status === "assigned" ? "good" : "gold"}
            />
            <Text style={styles.meta}>
              {item.id.slice(0, 8)}… · requester {item.requester_id.slice(0, 8)}…
            </Text>
            <Text style={styles.meta}>
              advisor {item.advisor_id ? `${item.advisor_id.slice(0, 8)}…` : "—"}
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
    gap: 6,
  },
  meta: { color: colors.muted, fontSize: 12 },
});
