import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/** CardProps wraps related content on the white elevated surface used across GemHub Lite. */
export type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  testID?: string;
}>;
