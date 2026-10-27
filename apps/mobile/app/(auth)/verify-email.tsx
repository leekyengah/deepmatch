import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button, Field, Muted, Screen, Title } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors } from "../../constants/theme";

export default function VerifyEmailScreen() {
  const { resendVerification, user, emailVerified } = useAuth();
  const t = useT();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(
    String(params.email ?? user?.email ?? ""),
  );
  const [busy, setBusy] = useState(false);

  async function onResend() {
    setBusy(true);
    const err = await resendVerification(email);
    setBusy(false);
    if (err) Alert.alert(t("common.errorGeneric"), err);
    else Alert.alert(t("common.confirm"), t("auth.verifySent"));
  }

  return (
    <Screen style={styles.wrap}>
      <Title>{t("auth.verifyTitle")}</Title>
      <Muted>
        {t("auth.verifyBody", {
          email: email || t("auth.verifyEmailFallback"),
        })}
      </Muted>
      {emailVerified ? (
        <Muted>{t("auth.verifyHint")}</Muted>
      ) : (
        <>
          <Field
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t("auth.email")}
            value={email}
            onChangeText={setEmail}
          />
          <Button
            label={busy ? t("auth.sending") : t("auth.verifyResend")}
            onPress={onResend}
            disabled={busy}
          />
        </>
      )}
      <Text style={styles.hint}>{t("auth.verifyHint")}</Text>
      <Link href="/(auth)/login" style={styles.link}>
        {t("auth.backToLogin")}
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12, paddingTop: 24 },
  hint: { marginTop: 8, color: colors.muted, fontSize: 12, lineHeight: 18 },
  link: { marginTop: 16, color: colors.primary, fontWeight: "700" },
});
