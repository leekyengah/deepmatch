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

/** A06 — Support via safety reports (no separate tickets table yet) */
export default function AdminSupportScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      reason: string;
      status: string;
      reporter_id: string;
      target_user_id: string | null;
      created_at: string;
    }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("reports")
      .select("id, reason, status, reporter_id, target_user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
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
      <PremiumHeader title={t("admin.safetyLink")} subtitle={t("admin.safetyIntro")} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id}
        ListEmptyComponent={<EmptyState title={t("admin.safetyEmptyTitle")} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <StatusBadge
              label={item.status}
              tone={item.status === "open" ? "danger" : "good"}
            />
            <Text style={styles.reason}>{item.reason}</Text>
            <Text style={styles.meta}>
              reporter {item.reporter_id.slice(0, 8)}…
              {item.target_user_id
                ? ` · target ${item.target_user_id.slice(0, 8)}…`
                : ""}
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
  reason: { color: colors.ink, fontWeight: "600" },
  meta: { color: colors.muted, fontSize: 12 },
});
