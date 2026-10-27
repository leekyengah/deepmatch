import "react-native-gesture-handler";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth";
import { I18nProvider, useT } from "../lib/i18n/I18nProvider";
import { Loading, Screen } from "../components/ui";
import { colors, darkColors } from "../constants/theme";

function Gate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const root = segments[0];
    const inAuth = root === "(auth)";
    if (!session && !inAuth) {
      router.replace("/(auth)/welcome");
    } else if (session && inAuth) {
      // Always land on member tabs after login/signup — never restore admin stack.
      router.replace("/(tabs)");
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }
  return <>{children}</>;
}

function RootStack() {
  const t = useT();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? darkColors : colors;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.canvas },
        headerTintColor: palette.primary,
        contentStyle: { backgroundColor: palette.canvas },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{ title: t("chat.title"), presentation: "card" }}
      />
      <Stack.Screen
        name="profile/[id]"
        options={{ title: t("mobile.profileDetail") }}
      />
      <Stack.Screen
        name="onboarding/goals"
        options={{ title: t("mobile.goalsTitle") }}
      />
      <Stack.Screen name="places/index" options={{ title: t("mobile.placesTitle") }} />
      <Stack.Screen name="lifestyle/index" options={{ title: t("mobile.lifestyleTitle") }} />
      <Stack.Screen name="services/index" options={{ title: t("mobile.servicesTitle") }} />
      <Stack.Screen name="premium/index" options={{ title: t("mobile.premiumTitle") }} />
      <Stack.Screen
        name="notifications"
        options={{ title: t("mobile.notificationsTitle") }}
      />
      <Stack.Screen
        name="me/edit"
        options={{ title: t("profile.title"), presentation: "card" }}
      />
      <Stack.Screen
        name="me/media"
        options={{ title: t("profile.mediaGateTitle"), presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <Gate>
          <RootStack />
        </Gate>
      </AuthProvider>
    </I18nProvider>
  );
}
