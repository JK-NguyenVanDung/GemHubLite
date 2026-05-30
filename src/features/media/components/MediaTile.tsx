import { Pressable, View } from "react-native";

import { Icon, Text, Thumbnail } from "@/src/components/ui";
import type { Media, MediaListItem } from "@/src/domain";
import { useTheme } from "@/src/theme";

export interface MediaTileProps {
  media: MediaListItem | Media;
  showSkuOverlay?: boolean;
  showProductTitle?: boolean;
  onPress?: (media: MediaListItem | Media) => void;
  size?: "sm" | "md" | "lg";
  testID?: string;
}

export function MediaTile({ media, onPress, showProductTitle = true, showSkuOverlay = true, size = "md", testID }: MediaTileProps) {
  const theme = useTheme();
  const title = "productTitle" in media ? media.productTitle : null;
  const content = (
    <View style={{ gap: theme.spacing.xxs }} testID={testID}>
      {media.kind === "video" ? (
        <VideoPlaceholder sku={showSkuOverlay ? media.sku : undefined} size={size} />
      ) : (
        <Thumbnail source={{ uri: media.uri }} placeholder="Photo" size={size} radius="md" skuLabel={showSkuOverlay ? media.sku : undefined} />
      )}
      {showProductTitle ? <Text variant="metadata" tone={title ? "secondary" : "tertiary"} numberOfLines={1}>{title ?? media.sku}</Text> : null}
    </View>
  );

  if (!onPress) return content;
  return <Pressable accessibilityRole="button" onPress={() => onPress(media)} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>{content}</Pressable>;
}

function VideoPlaceholder({ size, sku }: { size: "sm" | "md" | "lg"; sku?: string }) {
  const theme = useTheme();
  const dimension = size === "lg" ? 156 : size === "sm" ? 64 : 108;

  return (
    <View style={{ backgroundColor: theme.colors.black, borderRadius: theme.radius.md, height: dimension, overflow: "hidden", width: "100%" }}>
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <Icon name="play-circle" size={34} tone="onAccent" />
        <Text variant="metadata" tone="onAccent">Video</Text>
      </View>
      {sku ? (
        <View style={{ backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.pill, left: theme.spacing.xxs, paddingHorizontal: theme.spacing.xs, paddingVertical: theme.spacing.xxs, position: "absolute", top: theme.spacing.xxs }}>
          <Text variant="sku" tone="accent" numberOfLines={1}>{sku}</Text>
        </View>
      ) : null}
    </View>
  );
}
