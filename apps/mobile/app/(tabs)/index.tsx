import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { apiGet } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import { Button, Loading, Muted, Screen, Title } from "../../components/ui";
import { colors } from "../../constants/theme";

type HomeState = {
  state?: string;
  redirectTo?: string;
  hasMutualMatch?: boolean;
  coupleActive?: boolean;
};

export default function PersonaHomeScreen() {
  const t = useT();
  const [home, setHome] = useState<HomeState | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<HomeState>("/api/v1/me/home-state");
      setHome(res);
    } catch {
      setHome({ state: "dating", redirectTo: "/discover" });
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
      <Screen>
        <Loading />
      </Screen>
    );
  }

  const state = home?.state ?? "dating";
  const tiles: Array<{ href: string; title: string; body: string }> = [
    {
      href: "/(tabs)/discover",
      title: t("home.tileDiscover"),
      body: t("home.tileDiscoverBody"),
    },
  ];
  if (home?.hasMutualMatch) {
    tiles.push({
      href: "/(tabs)/chat",
      title: t("home.tileChat"),
      body: t("home.tileChatBody"),
    });
  }
  tiles.push({
    href: "/(tabs)/likes",
    title: t("nav.likes"),
    body: t("home.tileDiscoverBody"),
  });
  tiles.push({
    href: "/(tabs)/me",
    title: t("home.tileProfile"),
    body: t("home.tileProfileReady"),
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.eyebrow}>{t("home.eyebrow")}</Text>
        <Title>{t("home.greeting", { name: "bạn" })}</Title>
        <Muted>{t("home.intro")}</Muted>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{state}</Text>
        </View>

        <View style={styles.cta}>
          <Button
            label={t("home.primaryCta")}
            onPress={() => router.push("/(tabs)/discover")}
          />
        </View>

        {tiles.map((tile) => (
          <Pressable
            key={tile.href + tile.title}
            onPress={() => router.push(tile.href as "/")}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>{tile.title}</Text>
            <Text style={styles.cardBody}>{tile.body}</Text>
          </Pressable>
        ))}

        {home?.coupleActive ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t("home.tileCouple")}</Text>
            <Text style={styles.cardBody}>{t("home.tileCoupleActive")}</Text>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingBottom: 32, gap: 10 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.primary,
    textTransform: "uppercase",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, color: colors.raspberry, fontWeight: "600" },
  cta: { marginTop: 12, marginBottom: 8 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: 14,
  },
  cardTitle: { fontWeight: "700", color: colors.raspberry, fontSize: 16 },
  cardBody: { marginTop: 4, color: colors.muted, fontSize: 13 },
});
