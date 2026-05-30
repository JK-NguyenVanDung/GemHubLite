import { Pressable, View } from "react-native";

import { Button, Chip, Field, Icon, Text } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

export function InventoryHeader({
  actionLabel,
  filterLabel = "All SKUs",
  onAction,
  onFilterPress,
  onSearchChange,
  searchValue,
  searchPlaceholder,
  subtitle = "SKU-linked local catalog",
  title,
}: {
  title: string;
  actionLabel: string;
  searchPlaceholder: string;
  subtitle?: string;
  filterLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterPress?: () => void;
  onAction: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: theme.spacing.sm }}>
        <View style={{ flex: 1, gap: theme.spacing.xxs }}>
          <Text variant="screenTitle">{title}</Text>
          <Text variant="metadata" tone="secondary">{subtitle}</Text>
        </View>
        <Button label={actionLabel} size="sm" onPress={onAction} />
      </View>
      <View style={{ flexDirection: "row", gap: theme.spacing.sm, alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}>
          <Field label="Search" placeholder={searchPlaceholder} value={searchValue} onChangeText={onSearchChange} autoCapitalize="characters" autoCorrect={false} clearButtonMode="while-editing" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Filter: ${filterLabel}`}
          disabled={!onFilterPress}
          onPress={onFilterPress}
          style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1, paddingBottom: theme.spacing.sm })}
          testID={`${title.toLowerCase()}-filter-button`}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xxs }}>
            <Chip label={filterLabel} tone="accent" />
            {onFilterPress ? <Icon name="chevron-down" size={16} tone="accent" /> : null}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
