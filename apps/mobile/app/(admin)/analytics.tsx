import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { countExact } from "../../lib/admin-data";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  ErrorState,
  KPIStatCard,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
} from "../../components/premium";
import { spacing } from "../../constants/theme";

/** A07 — Analytics (live aggregates only) */
export default function AdminAnalyticsScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    users: 0,
    pairs: 0,
    msgs: 0,
    bookings: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, msgs, bookings] = await Promise.all([
        countExact("profiles"),
        countExact("messages"),
        countExact("service_bookings"),
      ]);
      const { count: pairs, error: pairErr } = await supabase
        .from("pairs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      if (pairErr) throw pairErr;
      setStats({ users, pairs: pairs ?? 0, msgs, bookings });
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
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }}>
        <PremiumHeader
          title={t("admin.analyticsTitle")}
          subtitle={t("admin.analyticsIntro")}
        />
        <View style={styles.grid}>
          <KPIStatCard label={t("admin.statSignups")} value={stats.users} />
          <KPIStatCard label={t("admin.statActivePairs")} value={stats.pairs} />
          <KPIStatCard label={t("admin.statMessages")} value={stats.msgs} />
          <KPIStatCard label={t("admin.statServiceBookings")} value={stats.bookings} />
        </View>
      </ScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing[2] },
});
