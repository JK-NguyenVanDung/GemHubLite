import type { ReactNode } from "react";

/** ButtonVariant matches the four documented action surfaces in DESIGN.md. */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/** ButtonSize controls vertical padding + label scale (md = page CTA, sm = compact toolbar). */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * ButtonProps keeps actions pressable, accessible, and theme-aligned.
 * `loading` swaps the label for an ActivityIndicator so callers do not duplicate logic.
 */
export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  testID?: string;
  accessibilityLabel?: string;
};
