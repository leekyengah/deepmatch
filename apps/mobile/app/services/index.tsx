import { useCallback, useState } from "react";
import { Alert, FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet, apiPost } from "../../lib/api";
import { useT } from "../../lib/i18n/I18nProvider";
import {
  EmptyState,
  ErrorState,
  PremiumHeader,
  PremiumScreen,
  ServiceCard,
  SkeletonLoader,
  StatusBadge,
} from "../../components/premium";

type Offering = {
  id: string;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  price_cents?: number;
};

/** M09 — Concierge services (sandbox booking request) */
export default function ServicesScreen() {
  const t = useT();
  const [items, setItems] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{
        data?: { offerings?: Offering[] };
        offerings?: Offering[];
      }>("/api/v1/services/offerings");
      setItems(res.data?.offerings ?? res.offerings ?? []);
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

  async function requestBooking(offering: Offering) {
    try {
      await apiPost("/api/v1/services/bookings", {
        offering_id: offering.id,
        notes: "Mobile sandbox request",
        consent: true,
      });
      Alert.alert(t("booking.requested") || "Requested", t("booking.requestedBody") || "Staff will review.");
    } catch (e) {
      Alert.alert(t("common.errorGeneric"), e instanceof Error ? e.message : t("errors.unknown"));
    }
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
      <PremiumHeader title={t("mobile.servicesTitle")} subtitle={t("nav.companion")} />
      <StatusBadge label="Sandbox · no LIVE charge" tone="gold" />
      <FlatList
        data={items}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={<EmptyState title={t("booking.empty") || "No offerings"} />}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.title || item.name || item.slug || item.id}
            price={
              item.price_cents != null
                ? `${(item.price_cents / 100).toLocaleString("vi-VN")}đ`
                : undefined
            }
            body={item.description}
            onPress={() => void requestBooking(item)}
          />
        )}
      />
    </PremiumScreen>
  );
}
