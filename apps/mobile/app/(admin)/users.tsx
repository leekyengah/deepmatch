import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { staffSetSuspended } from "../../lib/admin-data";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

type Row = {
  id: string;
  display_name: string | null;
  fuzzy_region: string | null;
  mode: string | null;
  discovery_opt_in: boolean | null;
  suspended: boolean | null;
};

/** A02 — User management */
export default function AdminUsersScreen() {
  const t = useT();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("profiles")
      .select("id, display_name, fuzzy_region, mode, discovery_opt_in, suspended")
      .order("created_at", { ascending: false })
      .limit(50);
    if (err) setError(err.message);
    else setRows((data as Row[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function confirmSuspend(u: Row) {
    const next = !u.suspended;
    Alert.alert(
      next ? "Suspend" : "Unsuspend",
      `${u.display_name ?? u.id.slice(0, 8)} — requires staff RPC`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.confirm") || "OK",
          style: next ? "destructive" : "default",
          onPress: async () => {
            try {
              await staffSetSuspended(u.id, next, "mobile-admin");
              void load();
            } catch (e) {
              Alert.alert(
                t("common.errorGeneric"),
                e instanceof Error ? e.message : t("errors.unknown"),
              );
            }
          },
        },
      ],
    );
  }

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
      <PremiumHeader title={t("admin.usersTitle")} subtitle={t("admin.usersIntro")} />
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<EmptyState title={t("admin.usersEmptyTitle")} />}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.display_name ?? "—"}</Text>
            <Text style={styles.meta}>
              {item.id.slice(0, 8)}… · {item.fuzzy_region ?? "—"} · {item.mode}
            </Text>
            <View style={styles.badges}>
              <StatusBadge
                label={item.discovery_opt_in ? "Discovery" : t("admin.hidden")}
                tone={item.discovery_opt_in ? "good" : "neutral"}
              />
              {item.suspended ? <StatusBadge label="Suspended" tone="danger" /> : null}
            </View>
            <PremiumButton
              label={item.suspended ? "Unsuspend" : "Suspend"}
              variant={item.suspended ? "outline" : "danger"}
              onPress={() => confirmSuspend(item)}
            />
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
  },
  name: { color: colors.ink, fontWeight: "700", fontSize: 16 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 4 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginVertical: spacing[2] },
});
