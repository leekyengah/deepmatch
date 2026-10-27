import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { supabase } from "../../lib/supabase";
import { countExact } from "../../lib/admin-data";
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

/** A03 — Content moderation queue (media + open report count) */
export default function AdminModerationScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openReports, setOpenReports] = useState(0);
  const [media, setMedia] = useState<
    Array<{ id: string; owner_user_id: string; content_type: string | null; created_at: string }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reports = await countExact("reports", { col: "status", val: "open" });
      setOpenReports(reports);
      const { data, error: err } = await supabase
        .from("media_objects")
        .select("id, owner_user_id, content_type, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (err) throw err;
      setMedia(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
      <PremiumHeader
        title={t("admin.modTitle")}
        subtitle={t("admin.modIntro", { n: openReports })}
        right={<StatusBadge label={`${openReports} open`} tone="danger" />}
      />
      <FlatList
        data={media}
        keyExtractor={(m) => m.id}
        ListEmptyComponent={<EmptyState title={t("admin.modEmptyTitle")} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.id}>{item.id.slice(0, 8)}…</Text>
            <Text style={styles.meta}>
              {item.content_type ?? "media"} · owner {item.owner_user_id.slice(0, 8)}…
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
  },
  id: { color: colors.ink, fontWeight: "700" },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12 },
});
