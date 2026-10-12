import "react-native-gesture-handler";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../lib/auth";
import { I18nProvider, useT } from "../lib/i18n/I18nProvider";
import { Loading, Screen } from "../components/ui";
import { colors } from "../constants/theme";

function Gate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) {
      router.replace("/(auth)/login");
    } else if (session && inAuth) {
      router.replace("/(tabs)/discover");
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
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.raspberry,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="chat/[id]"
        options={{ title: t("chat.title"), presentation: "card" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Gate>
          <RootStack />
        </Gate>
      </AuthProvider>
    </I18nProvider>
  );
}
