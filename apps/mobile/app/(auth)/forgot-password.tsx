import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n/I18nProvider";
import { Field } from "../../components/ui";
import { PremiumButton, PremiumHeader, PremiumScreen } from "../../components/premium";
import { colors, spacing } from "../../constants/theme";

/** M01 — password recovery (Supabase reset email) */
export default function ForgotPasswordScreen() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (error) {
      Alert.alert(t("common.errorGeneric"), error.message);
      return;
    }
    Alert.alert(t("auth.forgotPasswordTitle"), t("auth.resetSentDetail"));
    router.back();
  }

  return (
    <PremiumScreen>
      <PremiumHeader title={t("auth.forgotPasswordTitle")} subtitle={t("auth.forgotPasswordBody")} />
      <Text style={styles.help}>{t("auth.forgotPasswordBody")}</Text>
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder={t("auth.emailPlaceholder")}
        style={{ marginBottom: spacing[3] }}
      />
      <PremiumButton
        label={t("auth.sendResetLink")}
        onPress={submit}
        disabled={busy || !email}
      />
    </PremiumScreen>
  );
}

const styles = StyleSheet.create({
  help: { color: colors.muted, marginBottom: spacing[4], lineHeight: 20 },
});
