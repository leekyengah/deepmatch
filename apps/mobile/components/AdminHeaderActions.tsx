import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../lib/auth";
import { useT } from "../lib/i18n/I18nProvider";
import { colors } from "../constants/theme";

/** Exit admin shell — visible on every admin tab header. */
export function AdminHeaderActions() {
  const t = useT();
  const { signOut } = useAuth();

  return (
    <View style={styles.row} accessibilityRole="toolbar">
      <Pressable
        onPress={() => router.replace("/(tabs)")}
        accessibilityRole="button"
        accessibilityLabel={t("mobile.adminBackToApp")}
        hitSlop={8}
        style={styles.btn}
      >
        <Text style={styles.link}>{t("mobile.adminBackToApp")}</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          void (async () => {
            await signOut();
            router.replace("/(auth)/welcome");
          })();
        }}
        accessibilityRole="button"
        accessibilityLabel={t("auth.logout")}
        hitSlop={8}
        style={styles.btn}
      >
        <Text style={styles.logout}>{t("auth.logout")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginRight: 4 },
  btn: { paddingVertical: 4, paddingHorizontal: 2 },
  link: { color: colors.primary, fontWeight: "700", fontSize: 13 },
  logout: { color: colors.muted, fontWeight: "600", fontSize: 13 },
});
