import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";
import { Button, Field, Muted, Screen, Title } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors, LEGAL_URLS } from "../../constants/theme";
import * as WebBrowser from "expo-web-browser";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("1998-01-01");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    const err = await signUp(email, password, birthDate);
    setBusy(false);
    if (err) Alert.alert(t("auth.signupFailed"), err);
    else Alert.alert(t("common.confirm"), t("auth.signupSuccess"));
  }

  return (
    <Screen style={styles.wrap}>
      <Title>{t("auth.signup")}</Title>
      <Muted>{t("auth.ageGate")}</Muted>
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
      />
      <Field
        secureTextEntry
        placeholder={t("auth.passwordMin")}
        value={password}
        onChangeText={setPassword}
      />
      <Field
        placeholder={t("auth.birthDatePlaceholder")}
        value={birthDate}
        onChangeText={setBirthDate}
      />
      <Button
        label={busy ? t("auth.creatingAccount") : t("auth.signup")}
        onPress={onSubmit}
        disabled={busy}
      />
      <Text
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.terms)}
      >
        {t("marketing.terms")}
      </Text>
      <Text
        style={styles.link}
        onPress={() => WebBrowser.openBrowserAsync(LEGAL_URLS.privacy)}
      >
        {t("marketing.privacy")}
      </Text>
      <Link href="/(auth)/login" style={{ marginTop: 12 }}>
        <Text style={styles.link}>{t("auth.hasAccountLogin")}</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center", gap: 4 },
  link: {
    color: colors.primary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
});
