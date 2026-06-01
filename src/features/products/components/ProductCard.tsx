import { Image } from "expo-image";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

import { Card, Chip, Icon, Text } from "@/src/components/ui";
import type { ProductListItem } from "@/src/domain";
import { productTypeLabel } from "@/src/domain";
import { useTheme } from "@/src/theme";

export interface ProductCardProps {
  product: ProductListItem;
  onPress: (sku: string) => void;
  testID?: string;
}

export function ProductCard({ onPress, product, testID }: ProductCardProps) {
  const theme = useTheme();
  const mediaLabel = `${product.mediaCount} media item${product.mediaCount === 1 ? "" : "s"}`;
  const typeLabel = product.type ? productTypeLabel(product.type) : "Uncategorized";
  const handlePress = useCallback(() => onPress(product.sku), [onPress, product.sku]);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open product ${product.sku}. ${product.title ?? "No title"}. ${mediaLabel}. ${typeLabel}.`} onPress={handlePress} testID={testID} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.82 : 1 })}>
      <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.xs }}>
        {product.coverKind === "video" ? <VideoCover /> : <PhotoCover uri={product.coverUri} />}
        <View style={{ gap: theme.spacing.xs, paddingHorizontal: theme.spacing.xs, paddingBottom: theme.spacing.xs }}>
          <Chip label={product.sku} tone="accent" />
          <Text variant="bodyStrong" tone={product.title ? "primary" : "tertiary"} numberOfLines={1}>{product.title ?? "No title"}</Text>
          <View style={{ alignItems: "center", flexDirection: "row", gap: theme.spacing.xs }}>
            <Icon name="albums-outline" size={14} tone="secondary" />
            <Text variant="metadata" tone="secondary">{mediaLabel}</Text>
          </View>
          <Text variant="metadata" tone="tertiary" numberOfLines={1}>{typeLabel}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

function PhotoCover({ uri }: { uri: string | null }) {
  const theme = useTheme();

  return (
    <View style={{ aspectRatio: 1, backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, borderRadius: theme.radius.lg, borderWidth: 1, justifyContent: "center", overflow: "hidden", width: "100%" }}>
      {uri ? <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri }} style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} transition={120} /> : <Text variant="bodyStrong" tone="tertiary" align="center">Photo</Text>}
    </View>
  );
}

function VideoCover() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", aspectRatio: 1, backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, justifyContent: "center", overflow: "hidden", width: "100%" }}>
      <Icon name="play-circle" size={42} tone="onAccent" />
      <Text variant="metadata" tone="onAccent">Video</Text>
    </View>
  );
}
