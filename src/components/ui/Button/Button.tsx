import { ActivityIndicator, Pressable, View } from "react-native";

import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { ButtonProps, ButtonSize, ButtonVariant } from "@/src/components/ui/Button/Button.types";

/**
 * sizeMap pairs ButtonSize with theme spacing tokens so vertical rhythm stays consistent.
 * minHeight values are intentional touch-target floors per Apple HIG (sm 36, md 44, lg 52).
 */
const sizeMap: Record<ButtonSize, { paddingV: "xs" | "sm" | "md"; minHeight: number }> = {
  sm: { paddingV: "xs", minHeight: 36 },
  md: { paddingV: "sm", minHeight: 44 },
  lg: { paddingV: "md", minHeight: 52 },
};

/** Button renders the primary action surface for screens, cards, and modals. */
export function Button({
  accessibilityLabel,
  disabled = false,
  fullWidth = false,
  label,
  leftIcon,
  loading = false,
  onPress,
  rightIcon,
  size = "md",
  testID,
  variant = "primary",
}: ButtonProps) {
  const theme = useTheme();
  const dims = sizeMap[size];
  const isDisabled = disabled || loading;

  const palette = resolvePalette(variant, theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => ({
        alignItems: "center",
        alignSelf: fullWidth ? "stretch" : "flex-start",
        backgroundColor: palette.background,
        borderColor: palette.border,
        borderRadius: theme.radius.md,
        borderWidth: variant === "ghost" ? 0 : 1,
        flexDirection: "row",
        gap: theme.spacing.xs,
        justifyContent: "center",
        minHeight: dims.minHeight,
        opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing[dims.paddingV],
      })}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text variant="button" tone={palette.tone} style={{ color: palette.foreground }}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </Pressable>
  );
}

function resolvePalette(variant: ButtonVariant, theme: ReturnType<typeof useTheme>) {
  switch (variant) {
    case "secondary":
      return {
        background: theme.colors.accentSoft,
        border: theme.colors.accentSoft,
        foreground: theme.colors.accentDark,
        tone: "accent" as const,
      };
    case "ghost":
      return {
        background: "transparent",
        border: "transparent",
        foreground: theme.colors.accentDark,
        tone: "accent" as const,
      };
    case "danger":
      return {
        background: theme.colors.danger,
        border: theme.colors.danger,
        foreground: theme.colors.surface,
        tone: "onAccent" as const,
      };
    case "primary":
    default:
      return {
        background: theme.colors.accent,
        border: theme.colors.accent,
        foreground: theme.colors.surface,
        tone: "onAccent" as const,
      };
  }
}
