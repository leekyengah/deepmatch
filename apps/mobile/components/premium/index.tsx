import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, layout, spacing, useThemeColors } from "../../constants/theme";

export function PremiumScreen({ children, style, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  const palette = useThemeColors();
  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: palette.canvas,
          paddingTop: Math.max(insets.top, spacing[3]),
          paddingBottom: insets.bottom,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function PremiumHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.brandEyebrow}>DeepMatch</Text>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function PremiumButton({
  label,
  onPress,
  variant = "primary",
  disabled,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        variant === "outline" && styles.btnOutline,
        variant === "ghost" && styles.btnGhost,
        variant === "danger" && styles.btnDanger,
        (disabled || pressed) && { opacity: 0.65 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          (variant === "outline" || variant === "ghost") && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MatchScore({ score }: { score: number }) {
  const pct = Math.round(Math.max(0, Math.min(100, score <= 1 ? score * 100 : score)));
  return (
    <View style={styles.scorePill} accessibilityLabel={`${pct}%`}>
      <Text style={styles.scoreText}>{pct}%</Text>
    </View>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "danger" | "gold";
}) {
  const bg =
    tone === "good"
      ? "#E5F4EA"
      : tone === "danger"
        ? "#F8E4E8"
        : tone === "gold"
          ? "#F4ECDC"
          : colors.softBlush;
  const fg =
    tone === "good"
      ? colors.good
      : tone === "danger"
        ? colors.danger
        : tone === "gold"
          ? colors.gold
          : colors.ink;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ServiceCard({
  title,
  price,
  body,
  onPress,
}: {
  title: string;
  price?: string;
  body?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card} accessibilityRole="button">
      <Text style={styles.cardTitle}>{title}</Text>
      {price ? <Text style={styles.cardPrice}>{price}</Text> : null}
      {body ? <Text style={styles.cardBody}>{body}</Text> : null}
    </Pressable>
  );
}

export function KPIStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

export function SkeletonLoader() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.cardBody}>{body}</Text> : null}
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = "Retry",
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <View style={styles.center}>
      <Text style={[styles.emptyTitle, { color: colors.danger }]}>{message}</Text>
      {onRetry ? (
        <View style={{ marginTop: spacing[3], width: "100%" }}>
          <PremiumButton label={retryLabel} onPress={onRetry} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing[4],
  },
  headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing[4] },
  brandEyebrow: {
    color: colors.champagne,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: "700",
    marginTop: 4,
  },
  headerSub: { color: colors.muted, marginTop: 4, fontSize: 14, lineHeight: 20 },
  btn: {
    backgroundColor: colors.primary,
    minHeight: layout.touch,
    borderRadius: layout.radiusLg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[4],
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.line,
  },
  btnGhost: { backgroundColor: colors.softBlush },
  btnDanger: { backgroundColor: colors.danger },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  scorePill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  scoreText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: colors.panel,
    borderRadius: layout.radiusLg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  cardTitle: { color: colors.ink, fontWeight: "700", fontSize: 17 },
  cardPrice: { color: colors.champagne, fontWeight: "800", marginTop: 6 },
  cardBody: { color: colors.muted, marginTop: 6, lineHeight: 20, fontSize: 14 },
  kpi: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.panel,
    borderRadius: layout.radiusMd,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  kpiValue: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  kpiLabel: { color: colors.muted, marginTop: 4, fontSize: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[4] },
  emptyTitle: { color: colors.ink, fontWeight: "700", fontSize: 16, textAlign: "center" },
});
