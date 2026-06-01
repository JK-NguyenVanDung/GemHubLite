import { View } from "react-native";

import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { ChipProps } from "@/src/components/ui/Chip/Chip.types";

/** Chip renders small SKU/filter metadata with pill geometry. */
export function Chip({ label, testID, tone = "neutral" }: ChipProps) {
  const theme = useTheme();
  const accent = tone === "accent";
  const danger = tone === "danger";

  return (
    <View
      testID={testID}
      style={{
        alignSelf: "flex-start",
        backgroundColor: accent ? theme.colors.accentSoft : theme.colors.surfaceMuted,
        borderRadius: theme.radius.pill,
        maxWidth: "100%",
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxs,
      }}
    >
      <Text variant="sku" tone={danger ? "danger" : accent ? "accent" : "secondary"} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
