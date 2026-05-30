import { View, Pressable } from "react-native";

import { Card, Chip, Icon, Text, Thumbnail } from "@/src/components/ui";
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

  return (
    <Pressable accessibilityRole="button" onPress={() => onPress(product.sku)} testID={testID} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.82 : 1 })}>
      <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.xs }}>
        {product.coverKind === "video" ? <VideoCover /> : <Thumbnail source={product.coverUri ? { uri: product.coverUri } : undefined} placeholder="Photo" size="lg" radius="lg" />}
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

function VideoCover() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", aspectRatio: 1, backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, justifyContent: "center", overflow: "hidden", width: "100%" }}>
      <Icon name="play-circle" size={42} tone="onAccent" />
      <Text variant="metadata" tone="onAccent">Video</Text>
    </View>
  );
}
