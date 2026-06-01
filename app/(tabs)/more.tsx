import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Card, Chip, Icon, Screen, Text } from "@/src/components/ui";
import type { IoniconName } from "@/src/components/ui";
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useTheme } from "@/src/theme";

const sections: { title: string; rows: RowProps[] }[] = [
  {
    title: "Inventory",
    rows: [
      { icon: "diamond-outline", label: "Products", value: "Open", onPress: () => router.push("/(tabs)/products") },
      { icon: "images-outline", label: "Media", value: "Open", onPress: () => router.push("/(tabs)/media") },
    ],
  },
];

type RowProps = {
  icon: IoniconName;
  label: string;
  value: string;
  onPress: () => void;
};

export default function MoreScreen() {
  const theme = useTheme();
  const layout = useResponsiveLayout();

  return (
    <Screen testID="more-screen" contentStyle={{ paddingBottom: layout.tabBarBottomPadding }}>
      <View style={{ gap: theme.spacing.xxs }}>
        <Text variant="screenTitle">More</Text>
        <Text variant="metadata" tone="secondary">Quick links for your product library.</Text>
      </View>

      <Card style={{ gap: layout.contentGap }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View style={{ alignItems: "center", backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.pill, height: 62, justifyContent: "center", width: 62 }}>
            <Icon name="cube" size={28} tone="accent" />
          </View>
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <Text variant="bodyStrong">GemHub Lite</Text>
            <Text variant="metadata" tone="secondary">Your product photos stay on this device.</Text>
          </View>
          <Chip label="Lite" tone="accent" />
        </View>
      </Card>

      {sections.map((section) => (
        <View key={section.title} style={{ gap: layout.fieldGap }}>
          <Text variant="sectionTitle">{section.title}</Text>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {section.rows.map((row, index) => (
              <View key={row.label}>
                <MenuRow {...row} />
                {index < section.rows.length - 1 ? <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: 56 }} /> : null}
              </View>
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}

function MenuRow({ icon, label, onPress, value }: RowProps) {
  const theme = useTheme();
  const layout = useResponsiveLayout();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        gap: theme.spacing.sm,
        opacity: pressed ? 0.7 : 1,
        padding: layout.cardPadding,
      })}
    >
      <Icon name={icon} tone="accent" />
      <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>{label}</Text>
      <Text variant="metadata" tone="secondary" numberOfLines={1}>{value}</Text>
      <Icon name="chevron-forward" tone="tertiary" size={18} />
    </Pressable>
  );
}
