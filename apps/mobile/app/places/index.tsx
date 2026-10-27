import { useCallback, useState } from "react";
import { FlatList, Linking, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  PremiumButton,
  PremiumHeader,
  PremiumScreen,
  ServiceCard,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

type Place = {
  id: string;
  name?: string;
  title?: string;
  city?: string;
  rating?: number;
};

/** M07 — DateMap (list + honest map-key BLOCKED state) */
export default function PlacesScreen() {
  const t = useT();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapConfigured = Boolean(process.env.EXPO_PUBLIC_MAPBOX_TOKEN);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data?: { places?: Place[] }; places?: Place[] }>(
        "/api/v1/places?limit=30",
      );
      const list = res.data?.places ?? res.places ?? [];
      setPlaces(list);
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
      <PremiumHeader title={t("mobile.placesTitle")} subtitle={t("nav.places")} />
      {!mapConfigured ? (
        <StatusBadge label={t("mobile.placesBlocked")} tone="gold" />
      ) : (
        <StatusBadge label={t("mobile.placesTitle")} tone="good" />
      )}
      <Text style={styles.note}>{t("mobile.placesBlocked")}</Text>
      <FlatList
        data={places}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<EmptyState title={t("places.empty") || "No places"} />}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.name || item.title || item.id}
            body={[item.city, item.rating != null ? `★ ${item.rating}` : null]
              .filter(Boolean)
              .join(" · ")}
            onPress={() => {
              const q = encodeURIComponent(item.name || item.title || "");
              void Linking.openURL(`https://www.openstreetmap.org/search?query=${q}`);
            }}
          />
        )}
        ListFooterComponent={
          <PremiumButton label={t("common.reload") || "Reload"} variant="outline" onPress={load} />
        }
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  note: { color: colors.muted, marginVertical: spacing[3], lineHeight: 20 },
});
