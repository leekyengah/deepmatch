import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
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

/** A08 — System administration (flags read-only on mobile; no destructive toggles) */
export default function AdminSystemScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<
    Array<{ name: string; enabled: boolean; updated_at: string | null }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("feature_flags")
      .select("name, enabled, updated_at")
      .order("name");
    if (err) setError(err.message);
    else setFlags(data ?? []);
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
      <PremiumHeader title={t("admin.flagsLink")} subtitle={t("admin.flagsIntro")} />
      <Pressable
        style={styles.link}
        onPress={() => router.push("/(admin)/analytics")}
        accessibilityRole="button"
      >
        <Text style={styles.linkText}>{t("admin.analyticsTitle")}</Text>
      </Pressable>
      <Text style={styles.note}>
        Flag toggles restricted on Mobile — use Web Admin for kill switches.
      </Text>
      <FlatList
        data={flags}
        keyExtractor={(f) => f.name}
        ListEmptyComponent={<EmptyState title="No flags" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <StatusBadge
              label={item.enabled ? "ON" : "OFF"}
              tone={item.enabled ? "good" : "neutral"}
            />
          </View>
        )}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  link: {
    backgroundColor: colors.softBlush,
    borderRadius: layout.radiusMd,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  linkText: { color: colors.primary, fontWeight: "700" },
  note: { color: colors.muted, fontSize: 12, marginBottom: spacing[3], lineHeight: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.panel,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  name: { color: colors.ink, fontWeight: "600", flex: 1, marginRight: 8 },
});
