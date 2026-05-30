import { Pressable, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon/Icon";
import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { PickerProps } from "@/src/components/ui/Picker/Picker.types";

/** Picker provides a tappable field shell for parent-controlled menus/action sheets. */
export function Picker({ error, helperText, label, onPress, placeholder, required, testID, value }: PickerProps) {
  const theme = useTheme();
  const hasError = Boolean(error);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="metadata" tone="secondary">
        {label}{required ? " *" : ""}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => ({
          alignItems: "center",
          backgroundColor: theme.colors.surfaceMuted,
          borderColor: hasError ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: theme.spacing.xs,
          justifyContent: "space-between",
          minHeight: 46,
          opacity: pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        })}
      >
        <Text variant="body" tone={value ? "primary" : "tertiary"} numberOfLines={1} style={{ flex: 1 }}>
          {value ?? placeholder ?? "Select"}
        </Text>
        <Icon name="chevron-down" tone="tertiary" />
      </Pressable>
      {hasError ? <Text variant="metadata" tone="danger">{error}</Text> : helperText ? <Text variant="metadata" tone="tertiary">{helperText}</Text> : null}
    </View>
  );
}
