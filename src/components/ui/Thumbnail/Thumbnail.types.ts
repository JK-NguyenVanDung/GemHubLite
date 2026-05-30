import type { ImageSourcePropType } from "react-native";

import type { RadiusToken } from "@/src/theme";

/** ThumbnailSize keeps grid + filmstrip variants on a consistent scale. */
export type ThumbnailSize = "sm" | "md" | "lg";

/**
 * ThumbnailProps renders a square media tile.
 * `placeholder` shows when `source` is empty (covers offline + capture-pending states).
 * `selected` draws the teal capture-strip border seen in 03-capture-product-info.png.
 */
export type ThumbnailProps = {
  source?: ImageSourcePropType;
  placeholder?: string;
  size?: ThumbnailSize;
  radius?: RadiusToken;
  skuLabel?: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
};
