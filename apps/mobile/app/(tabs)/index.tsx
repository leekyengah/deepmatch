import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiGet } from "../../lib/api";
import { fetchIsStaff } from "../../lib/staff";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  PremiumHeader,
  PremiumScreen,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

/** Home hub — entry to M02/M07–M12 modules (mockup nav: Trang chủ) */
export default function HomeHubScreen() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState("dating");
  const [staff, setStaff] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [home, isStaff] = await Promise.all([
        apiGet<{ state?: string }>("/api/v1/me/home-state").catch(() => ({ state: "dating" })),
        fetchIsStaff(),
      ]);
      setState(home.state ?? "dating");
      setStaff(isStaff);
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

  const tiles = [
    { href: "/onboarding/goals", title: t("mobile.hubGoals"), body: t("mobile.goalsTitle") },
    { href: "/(tabs)/discover", title: t("nav.explore"), body: t("home.tileDiscoverBody") },
    { href: "/(tabs)/chat", title: t("nav.messages"), body: t("home.tileChatBody") },
    { href: "/places/", title: t("mobile.hubPlaces"), body: t("nav.places") },
    { href: "/lifestyle/", title: t("mobile.hubLifestyle"), body: "DEMO" },
    { href: "/services/", title: t("mobile.hubServices"), body: t("nav.companion") },
    { href: "/premium/", title: t("mobile.hubPremium"), body: t("mobile.premiumSandboxNote") },
    { href: "/notifications", title: t("mobile.hubNotifications"), body: t("nav.notificationsAria") },
  ];
  if (staff) {
    tiles.push({ href: "/(admin)/", title: t("mobile.hubAdmin"), body: t("mobile.adminTitle") });
  }

  return (
    <PremiumScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing[8] }}>
        <PremiumHeader
          title={t("home.greeting", { name: "bạn" })}
          subtitle={t("home.intro")}
          right={<StatusBadge label={state} tone="gold" />}
        />
        {tiles.map((tile) => (
          <Pressable
            key={tile.href}
            style={styles.tile}
            onPress={() => router.push(tile.href as never)}
            accessibilityRole="button"
            accessibilityLabel={tile.title}
          >
            <Text style={styles.tileTitle}>{tile.title}</Text>
            <Text style={styles.tileBody} numberOfLines={2}>
              {tile.body}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusLg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  tileTitle: { color: colors.ink, fontWeight: "800", fontSize: 17 },
  tileBody: { color: colors.muted, marginTop: 6, lineHeight: 18 },
});
