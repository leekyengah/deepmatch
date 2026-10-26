import { Link } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, Field, Screen, Title } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors } from "../../constants/theme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) Alert.alert(t("auth.loginFailed"), err);
  }

  return (
    <Screen style={styles.wrap}>
      <Text style={styles.brand}>{t("common.brand")}</Text>
      <Title>{t("auth.login")}</Title>
      <Field
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
      />
      <Field
        secureTextEntry
        placeholder={t("auth.password")}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        label={busy ? t("auth.signingIn") : t("auth.login")}
        onPress={onSubmit}
        disabled={busy}
      />
      <View style={{ height: 16 }} />
      <Link href="/(auth)/signup">
        <Text style={styles.link}>{t("auth.createAccountAge")}</Text>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { justifyContent: "center" },
  brand: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.primary,
    marginBottom: 8,
  },
  link: { color: colors.primary, fontWeight: "600", textAlign: "center" },
});
