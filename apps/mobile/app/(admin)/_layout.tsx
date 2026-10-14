import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdminGate } from "../../components/AdminGate";
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

/** Admin nav: Dashboard · Users · Ops · Finance · System */
export default function AdminLayout() {
  const t = useT();
  const insets = useSafeAreaInsets();
  return (
    <AdminGate>
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
          name="index"
          options={{
            title: t("admin.dashboard"),
            tabBarIcon: ({ focused }) => <TabIcon label="⌂" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: t("admin.users"),
            tabBarIcon: ({ focused }) => <TabIcon label="◎" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="operations"
          options={{
            title: t("admin.servicesLink") || "Ops",
            tabBarIcon: ({ focused }) => <TabIcon label="◇" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="finance"
          options={{
            title: t("admin.billing"),
            tabBarIcon: ({ focused }) => <TabIcon label="₫" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="system"
          options={{
            title: t("admin.flagsLink") || "System",
            tabBarIcon: ({ focused }) => <TabIcon label="⚙" focused={focused} />,
          }}
        />
        <Tabs.Screen name="moderation" options={{ href: null, title: t("admin.modTitle") }} />
        <Tabs.Screen name="support" options={{ href: null, title: "Support" }} />
        <Tabs.Screen name="analytics" options={{ href: null, title: t("admin.analyticsTitle") }} />
        <Tabs.Screen name="concierge" options={{ href: null, title: t("admin.servicesFull") }} />
      </Tabs>
    </AdminGate>
  );
}
