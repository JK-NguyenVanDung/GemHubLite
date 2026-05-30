import type { ComponentProps } from "react";

import type { Ionicons } from "@expo/vector-icons";
import type { TextTone } from "@/src/theme";

/** IoniconName mirrors Expo Ionicons glyph names for type-safe icon selection. */
export type IoniconName = ComponentProps<typeof Ionicons>["name"];

/** IconProps keeps icon color semantic and leaves size as explicit visual intent. */
export type IconProps = {
  name: IoniconName;
  size?: number;
  tone?: TextTone;
  testID?: string;
};
