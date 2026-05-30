import { FlatList, View } from "react-native";

import { EmptyStateCard, Text } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { MediaTile } from "@/src/features/media/components";
import { AddPhotoButton } from "@/src/features/product-detail/components/AddPhotoButton";
import { useTheme } from "@/src/theme";

export function MediaGrid({ media, onTilePress, sku }: { sku: string; media: Media[]; onTilePress?: (media: Media) => void }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="sectionTitle">PHOTOS ({media.length})</Text>
      {media.length ? (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ gap: theme.spacing.sm }}
          contentContainerStyle={{ gap: theme.spacing.sm }}
          renderItem={({ item }) => <View style={{ flex: 1 }}><MediaTile media={item} showProductTitle={false} showSkuOverlay={false} size="lg" onPress={onTilePress} /></View>}
        />
      ) : (
        <EmptyStateCard icon="images-outline" title="No photos yet" body="Add photo to start this SKU gallery." />
      )}
      {!media.length ? <AddPhotoButton sku={sku} /> : null}
    </View>
  );
}
