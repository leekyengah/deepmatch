import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect } from "expo-router";
import { apiGet } from "../../lib/api";
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

type Product = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  price_cents?: number;
};

/** M08 — Lifestyle DEMO catalog */
export default function LifestyleScreen() {
  const t = useT();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ data?: { products?: Product[] }; products?: Product[] }>(
        "/api/v1/catalog/products?limit=40",
      );
      setItems(res.data?.products ?? res.products ?? []);
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
      <PremiumHeader title={t("mobile.lifestyleTitle")} />
      <StatusBadge label="DEMO / sandbox" tone="gold" />
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={<EmptyState title={t("mobile.lifestyleEmpty")} />}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.name || item.title || item.id}
            price={
              item.price_cents != null
                ? `${(item.price_cents / 100).toLocaleString("vi-VN")}đ`
                : undefined
            }
            body={item.description}
          />
        )}
      />
    </PremiumScreen>
  );
}
