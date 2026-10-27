import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { useT } from "../../lib/i18n/I18nProvider";
import { PremiumHeader, PremiumScreen } from "../../components/premium";
import { colors, layout, spacing } from "../../constants/theme";

/** Ops hub — A03 / A04 / A06 entry */
export default function AdminOperationsScreen() {
  const t = useT();
  const items = [
    { href: "/(admin)/moderation", label: t("admin.modTitle"), body: t("admin.modLink") },
    { href: "/(admin)/concierge", label: t("admin.servicesFull"), body: t("admin.servicesIntro") },
    { href: "/(admin)/support", label: t("admin.safetyLink"), body: t("admin.safetyIntro") },
  ];
  return (
    <PremiumScreen>
      <PremiumHeader title={t("admin.servicesLink")} subtitle={t("mobile.adminTitle")} />
      {items.map((item) => (
        <Pressable
          key={item.href}
          style={styles.card}
          onPress={() => router.push(item.href as never)}
          accessibilityRole="button"
        >
          <Text style={styles.title}>{item.label}</Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </Pressable>
      ))}
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusLg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  title: { color: colors.ink, fontWeight: "800", fontSize: 17 },
  body: { color: colors.muted, marginTop: 6, lineHeight: 18 },
});
