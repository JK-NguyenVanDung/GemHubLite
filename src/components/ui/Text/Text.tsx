import * as ReactNative from "react-native";

import { useTheme } from "@/src/theme";

import type { TextProps } from "@/src/components/ui/Text/Text.types";

const toneColor = {
  primary: "text",
  secondary: "secondaryText",
  tertiary: "tertiaryText",
  accent: "accentDark",
  danger: "danger",
  onAccent: "surface",
} as const;

/** Text renders all copy through theme typography to prevent ad-hoc font styles. */
export function Text({ align, children, maxFontSizeMultiplier = 1.3, style, tone = "primary", variant = "body", ...props }: TextProps) {
  const theme = useTheme();

  return (
    <ReactNative.Text
      style={[
        theme.typography[variant],
        { color: theme.colors[toneColor[tone]], textAlign: align },
        variant === "sectionTitle" ? { textTransform: "uppercase" } : null,
        style,
      ]}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </ReactNative.Text>
  );
}
