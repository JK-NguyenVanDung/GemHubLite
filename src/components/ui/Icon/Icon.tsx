import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme";

import type { IconProps } from "@/src/components/ui/Icon/Icon.types";

const toneColor = {
  primary: "text",
  secondary: "secondaryText",
  tertiary: "tertiaryText",
  accent: "accentDark",
  danger: "danger",
  onAccent: "surface",
} as const;

/** Icon wraps Expo Ionicons so glyphs inherit design-system color tones. */
export function Icon({ name, size = 20, testID, tone = "primary" }: IconProps) {
  const theme = useTheme();

  return <Ionicons name={name} size={size} color={theme.colors[toneColor[tone]]} testID={testID} />;
}
