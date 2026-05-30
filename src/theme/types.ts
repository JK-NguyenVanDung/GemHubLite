import type { colors, radius, spacing, typography } from "@/src/theme/tokens";
import type { theme } from "@/src/theme/theme";

/** AppTheme describes the complete visual contract consumed through ThemeProvider. */
export type AppTheme = typeof theme;

/** ColorToken limits component colors to documented design-system colors. */
export type ColorToken = keyof typeof colors;

/** SpacingToken maps layout gaps to the semantic 4-point spacing scale. */
export type SpacingToken = keyof typeof spacing;

/** RadiusToken keeps corner rounding aligned with shared component roles. */
export type RadiusToken = keyof typeof radius;

/** TypographyVariant selects one approved system-font text treatment. */
export type TypographyVariant = keyof typeof typography;

/** TextTone maps text intent to safe theme colors. */
export type TextTone = "primary" | "secondary" | "tertiary" | "accent" | "danger" | "onAccent";
