import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { useT } from "../../lib/i18n/I18nProvider";
import { PremiumButton, PremiumScreen } from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

/** M01 — Authentication & Onboarding splash */
export default function WelcomeScreen() {
  const t = useT();
  return (
    <PremiumScreen style={{ paddingHorizontal: 0 }}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80",
        }}
        style={styles.hero}
        imageStyle={{ opacity: 0.55 }}
      >
        <View style={styles.overlay}>
          <Text style={styles.brand}>{t("mobile.welcomeTitle")}</Text>
          <Text style={styles.sub}>{t("mobile.welcomeSubtitle")}</Text>
          <PremiumButton
            label={t("mobile.welcomeCta")}
            onPress={() => router.push("/(auth)/signup")}
          />
          <View style={{ height: spacing[3] }} />
          <PremiumButton
            label={t("mobile.welcomeLogin")}
            variant="outline"
            onPress={() => router.push("/(auth)/login")}
          />
          <Link href="/(auth)/forgot-password" style={styles.link}>
            {t("auth.forgotPassword") || "Forgot password?"}
          </Link>
        </View>
      </ImageBackground>
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, justifyContent: "flex-end" },
  overlay: {
    backgroundColor: "rgba(36,26,28,0.72)",
    padding: spacing[5],
    paddingBottom: spacing[8],
  },
  brand: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "700",
    marginBottom: spacing[2],
  },
  sub: { color: colors.blush, fontSize: 16, marginBottom: spacing[5], lineHeight: 22 },
  link: { color: colors.champagne, marginTop: spacing[4], textAlign: "center" },
});
