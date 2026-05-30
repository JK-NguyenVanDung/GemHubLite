import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Card, Chip, Icon, Screen, Text } from "@/src/components/ui";
import type { IoniconName } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

const sections: { title: string; rows: RowProps[] }[] = [
  {
    title: "Profile",
    rows: [
      { icon: "person-outline", label: "Merchant profile", value: "Local demo", onPress: () => null },
      { icon: "notifications-outline", label: "Notifications", value: "Off", onPress: () => null },
    ],
  },
  {
    title: "Inventory",
    rows: [
      { icon: "diamond-outline", label: "Products", value: "Open", onPress: () => router.push("/(tabs)/products") },
      { icon: "images-outline", label: "Media", value: "Open", onPress: () => router.push("/(tabs)/media") },
      { icon: "albums-outline", label: "Collections", value: "Future", onPress: () => null },
    ],
  },
  {
    title: "Support",
    rows: [
      { icon: "document-text-outline", label: "Take-home checklist", value: "Local-first", onPress: () => null },
      { icon: "shield-checkmark-outline", label: "Privacy", value: "On-device", onPress: () => null },
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

  return (
    <Screen testID="more-screen">
      <View style={{ gap: theme.spacing.xxs }}>
        <Text variant="screenTitle">More</Text>
        <Text variant="metadata" tone="secondary">Profile-style actions from source app, scoped to Lite.</Text>
      </View>

      <Card style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View style={{ alignItems: "center", backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.pill, height: 62, justifyContent: "center", width: 62 }}>
            <Icon name="person" size={28} tone="accent" />
          </View>
          <View style={{ flex: 1, gap: theme.spacing.xxs }}>
            <Text variant="bodyStrong">GemHub merchant</Text>
            <Text variant="metadata" tone="secondary">Local catalog workspace</Text>
          </View>
          <Chip label="Lite" tone="accent" />
        </View>
      </Card>

      {sections.map((section) => (
        <View key={section.title} style={{ gap: theme.spacing.sm }}>
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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        gap: theme.spacing.sm,
        opacity: pressed ? 0.7 : 1,
        padding: theme.spacing.md,
      })}
    >
      <Icon name={icon} tone="accent" />
      <Text variant="bodyStrong" style={{ flex: 1 }}>{label}</Text>
      <Text variant="metadata" tone="secondary">{value}</Text>
      <Icon name="chevron-forward" tone="tertiary" size={18} />
    </Pressable>
  );
}
