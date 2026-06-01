import { View } from "react-native";

import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useTheme } from "@/src/theme";

import type { CardProps } from "@/src/components/ui/Card/Card.types";

/** Card provides border + subtle shadow for forms, product groups, and empty states. */
export function Card({ children, style, testID }: CardProps) {
  const theme = useTheme();
  const layout = useResponsiveLayout();

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
          padding: layout.cardPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
