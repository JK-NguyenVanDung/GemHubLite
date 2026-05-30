import type * as ReactNative from "react-native";

import type { TextTone, TypographyVariant } from "@/src/theme";

/** Alignment options exposed for paragraph-level layouts. */
export type TextAlign = "auto" | "left" | "center" | "right";

/**
 * TextProps locks rendered text to approved typography + tone tokens.
 * `style` remains as a documented escape hatch for color-free layout tweaks (margins, opacity).
 * Where used: every label, paragraph, or numeric value inside the UI library and feature screens.
 */
export type TextProps = Omit<ReactNative.TextProps, "style"> & {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextAlign;
  numberOfLines?: number;
  style?: ReactNative.StyleProp<ReactNative.TextStyle>;
};
