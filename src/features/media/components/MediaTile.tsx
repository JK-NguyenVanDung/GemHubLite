import { Image } from "expo-image";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { Chip, Icon, Text } from "@/src/components/ui";
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
  const handlePress = useCallback(() => onPress?.(media), [media, onPress]);
  const content = (
    <View style={{ gap: theme.spacing.xxs }} testID={testID}>
      {media.kind === "video" ? (
        <VideoPlaceholder sku={showSkuOverlay ? media.sku : undefined} size={size} />
      ) : (
        <PhotoTile sku={showSkuOverlay ? media.sku : undefined} uri={media.uri} />
      )}
      {showProductTitle ? <Text variant="metadata" tone={title ? "secondary" : "tertiary"} numberOfLines={1}>{title ?? media.sku}</Text> : null}
    </View>
  );

  if (!onPress) return content;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Open ${media.sku}`} onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}>{content}</Pressable>;
}

function PhotoTile({ sku, uri }: { sku?: string; uri: string }) {
  const theme = useTheme();

  return (
    <View style={{ aspectRatio: 1, backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, borderRadius: theme.radius.md, borderWidth: 1, overflow: "hidden", width: "100%" }}>
      <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri }} style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} transition={120} />
      {sku ? (
        <View style={{ left: theme.spacing.xxs, position: "absolute", top: theme.spacing.xxs }}>
          <Chip label={sku} tone="accent" />
        </View>
      ) : null}
    </View>
  );
}

function VideoPlaceholder({ size, sku }: { size: "sm" | "md" | "lg"; sku?: string }) {
  const theme = useTheme();

  return (
    <View style={{ aspectRatio: 1, backgroundColor: theme.colors.black, borderRadius: theme.radius.md, overflow: "hidden", width: "100%" }}>
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
