import { View } from "react-native";

import { useTheme } from "@/src/theme";

import type { CardProps } from "@/src/components/ui/Card/Card.types";

/** Card provides border + subtle shadow for forms, product groups, and empty states. */
export function Card({ children, style, testID }: CardProps) {
  const theme = useTheme();

  return (
    <View
      testID={testID}
      style={[
        theme.shadows.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          padding: theme.spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
