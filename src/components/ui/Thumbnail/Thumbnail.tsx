import { Image, Pressable, View } from "react-native";

import { Chip } from "@/src/components/ui/Chip/Chip";
import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { ThumbnailProps, ThumbnailSize } from "@/src/components/ui/Thumbnail/Thumbnail.types";

/** dimensionMap pairs ThumbnailSize with px values; chosen to match capture filmstrip + product grid. */
const dimensionMap: Record<ThumbnailSize, number> = {
  sm: 54,
  md: 96,
  lg: 140,
};

/** Thumbnail shows captured media with optional SKU overlay and selection highlight. */
export function Thumbnail({
  onPress,
  placeholder,
  radius = "md",
  selected = false,
  size = "md",
  skuLabel,
  source,
  testID,
}: ThumbnailProps) {
  const theme = useTheme();
  const dimension = dimensionMap[size];

  const content = (
    <View
      testID={testID}
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius[radius],
        borderWidth: selected ? 2 : 1,
        height: dimension,
        justifyContent: "flex-end",
        overflow: "hidden",
        padding: theme.spacing.xs,
        width: dimension,
      }}
    >
      {source ? (
        <Image
          source={source}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          resizeMode="cover"
        />
      ) : placeholder ? (
        <Text variant="bodyStrong" tone="tertiary" align="center" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, textAlignVertical: "center" }}>
          {placeholder}
        </Text>
      ) : null}
      {skuLabel ? <Chip label={skuLabel} tone="accent" /> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable accessibilityRole="imagebutton" onPress={onPress} hitSlop={6}>
      {content}
    </Pressable>
  );
}
