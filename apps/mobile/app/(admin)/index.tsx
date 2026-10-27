import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { countExact } from "../../lib/admin-data";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  ErrorState,
  KPIStatCard,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

/** A01 — Executive dashboard (live Supabase counts, same source as Web Admin) */
export default function AdminDashboardScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 0,
    matches: 0,
    reports: 0,
    bookings: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, matches, reports, bookings] = await Promise.all([
        countExact("profiles"),
        countExact("mutual_matches"),
        countExact("reports", { col: "status", val: "open" }),
        countExact("service_bookings", { col: "status", val: "requested" }),
      ]);
      setStats({ users, matches, reports, bookings });
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

  const links = [
    { href: "/(admin)/moderation", label: t("admin.modLink") },
    { href: "/(admin)/concierge", label: t("admin.servicesLink") },
    { href: "/(admin)/support", label: t("admin.safetyLink") },
    { href: "/(admin)/analytics", label: t("admin.analytics") },
  ];

  return (
    <PremiumScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }}>
        <PremiumHeader title={t("admin.dashboard")} subtitle={t("admin.homeIntro")} />
        <MutedExitRow />
        <View style={styles.grid}>
          <KPIStatCard label={t("admin.statUsers")} value={stats.users} />
          <KPIStatCard label={t("admin.statMatches")} value={stats.matches} />
          <KPIStatCard label={t("admin.statReports")} value={stats.reports} />
          <KPIStatCard label={t("admin.statBookings")} value={stats.bookings} />
        </View>
        {links.map((l) => (
          <Pressable
            key={l.href}
            style={styles.link}
            onPress={() => router.push(l.href as never)}
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>{l.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </PremiumScreen>
  );
}

function MutedExitRow() {
  const t = useT();
  return (
    <Text style={styles.exitHint} accessibilityRole="text">
      {t("mobile.adminExitHint")}
    </Text>
  );
}

const styles = StyleSheet.create({
  exitHint: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: spacing[3],
    lineHeight: 18,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2], marginBottom: spacing[4] },
  link: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[4],
    marginBottom: spacing[2],
  },
  linkText: { color: colors.primary, fontWeight: "700" },
});
