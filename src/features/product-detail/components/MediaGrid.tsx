import { FlatList, View } from "react-native";

import { EmptyStateCard, Text } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { MediaTile } from "@/src/features/media/components";
import { AddPhotoButton } from "@/src/features/product-detail/components/AddPhotoButton";
import { useResponsiveColumns, useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
export function MediaGrid({ media, onTilePress, sku }: { sku: string; media: Media[]; onTilePress?: (media: Media) => void }) {
  const columns = useResponsiveColumns({ compact: 2, medium: 3, expanded: 4 });
  const layout = useResponsiveLayout();
  return (
    <View style={{ gap: layout.contentGap }}>
      <Text variant="sectionTitle">PHOTOS ({media.length})</Text>
      {media.length ? (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          key={columns}
          numColumns={columns}
          scrollEnabled={false}
          columnWrapperStyle={columns > 1 ? { gap: layout.gridGap } : undefined}
          contentContainerStyle={{ gap: layout.gridGap }}
          renderItem={({ item }) => <View style={{ flex: 1 }}><MediaTile media={item} showProductTitle={false} showSkuOverlay={false} size="lg" onPress={onTilePress} /></View>}
        />
      ) : (
        <EmptyStateCard icon="images-outline" title="No photos yet" body="Add a photo for this product." />
      )}
      <AddPhotoButton sku={sku} />
    </View>
  );
}
