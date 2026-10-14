import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiGet } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  KPIStatCard,
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

type CoupleActive = {
  data?: {
    couple?: { id: string; started_at?: string } | null;
    pins_count?: number;
    memories_count?: number;
  };
  couple?: { id: string; started_at?: string } | null;
};

/** M06 — Native Couple Space hub (no web deep-link shell) */
export default function CoupleScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [pins, setPins] = useState(0);
  const [memories, setMemories] = useState(0);
  const [days, setDays] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<CoupleActive>("/api/v1/couples/active");
      const couple = res.data?.couple ?? res.couple ?? null;
      setCoupleId(couple?.id ?? null);
      setPins(res.data?.pins_count ?? 0);
      setMemories(res.data?.memories_count ?? 0);
      if (couple?.started_at) {
        const ms = Date.now() - new Date(couple.started_at).getTime();
        setDays(Math.max(0, Math.floor(ms / 86400000)));
      } else setDays(0);
    } catch {
      setCoupleId(null);
    } finally {
      setLoading(false);
    }
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

  if (!coupleId) {
    return (
      <PremiumScreen>
        <PremiumHeader title={t("mobile.coupleNativeTitle")} />
        <EmptyState title={t("mobile.coupleNeedPair")} />
        <PremiumButton
          label={t("couple.invite") || "Invite"}
          onPress={() => router.push("/onboarding/goals")}
          variant="outline"
        />
      </PremiumScreen>
    );
  }

  return (
    <PremiumScreen>
      <ScrollView>
        <PremiumHeader title={t("mobile.coupleNativeTitle")} subtitle={coupleId.slice(0, 8)} />
        <StatusBadge label="Private · bilateral consent" tone="good" />
        <View style={styles.row}>
          <KPIStatCard label="Ngày bên nhau" value={days} />
          <KPIStatCard label="Địa điểm" value={pins} />
        </View>
        <View style={styles.row}>
          <KPIStatCard label="Kỷ niệm" value={memories} />
        </View>
        <Text style={styles.note}>{t("nav.coupleNote")}</Text>
        <PremiumButton
          label={t("mobile.hubPlaces")}
          onPress={() => router.push("/places/" as never)}
        />
        <View style={{ height: spacing[2] }} />
        <PremiumButton
          label={t("common.reload") || "Reload"}
          variant="outline"
          onPress={load}
        />
      </ScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing[3] },
  note: { color: colors.muted, marginVertical: spacing[4], lineHeight: 20 },
});
