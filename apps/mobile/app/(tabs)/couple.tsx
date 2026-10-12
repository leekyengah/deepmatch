import { Linking, StyleSheet, Text, View } from "react-native";
import { useT } from "../../lib/i18n/I18nProvider";
import { Button, Muted, Screen, Title } from "../../components/ui";
import { colors } from "../../constants/theme";

const WEB = (process.env.EXPO_PUBLIC_API_URL ?? "https://datingvn.com").replace(
  /\/$/,
  "",
);

export default function CoupleTabScreen() {
  const t = useT();
  return (
    <Screen>
      <Text style={styles.eyebrow}>{t("nav.memories")}</Text>
      <Title>{t("couple.spaceHeading")}</Title>
      <Muted>{t("couple.spaceIntro")}</Muted>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("couple.navMap")}</Text>
        <Text style={styles.cardBody}>{t("couple.mapIntro")}</Text>
      </View>
      <View style={styles.cta}>
        <Button
          label={t("couple.openInvite")}
          onPress={() => void Linking.openURL(`${WEB}/couple`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: colors.champagne,
    textTransform: "uppercase",
  },
  card: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    padding: 14,
  },
  cardTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  cardBody: { marginTop: 6, color: colors.muted, fontSize: 13, lineHeight: 20 },
  cta: { marginTop: 20 },
});
