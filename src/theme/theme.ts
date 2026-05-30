import { colors, radius, shadows, spacing, typography } from "@/src/theme/tokens";

export const theme = {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} as const;

export type AppTheme = typeof theme;
