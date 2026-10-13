import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../lib/i18n/I18nProvider";
import { colors, layout } from "../../constants/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: focused ? "800" : "500",
        color: focused ? colors.primary : colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

/** ADR-11: Khám phá · Sánh đôi · Đồng hành · Tin nhắn · Cá nhân */
export default function TabsLayout() {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.ink,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.line,
          height: layout.tabBarH + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: t("nav.explore"),
          tabBarIcon: ({ focused }) => <TabIcon label="◇" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="couple"
        options={{
          title: t("nav.memories"),
          tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: t("nav.companion"),
          tabBarIcon: ({ focused }) => <TabIcon label="✦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t("nav.messages"),
          tabBarIcon: ({ focused }) => <TabIcon label="✉" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: t("nav.me"),
          tabBarIcon: ({ focused }) => <TabIcon label="●" focused={focused} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="likes" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
