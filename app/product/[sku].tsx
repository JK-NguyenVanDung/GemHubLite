import { router, useLocalSearchParams } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { FlatList, View } from "react-native";

import { EmptyStateCard, Screen, Spinner, Text } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { MediaTile } from "@/src/features/media/components";
import { AddPhotoButton, ProductFormSection, ProductHeader, useProductDetail } from "@/src/features/product-detail";
import { useResponsiveColumns, useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";

const MemoMediaTile = memo(MediaTile);

export default function ProductDetailScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const detailSku = Array.isArray(sku) ? sku[0] : sku;
  const { error, loading, media, mutate, product, saveError, saving } = useProductDetail(detailSku ?? "");
  const columns = useResponsiveColumns({ compact: 2, medium: 3, expanded: 4 });
  const layout = useResponsiveLayout();

  const renderMedia = useCallback(({ item }: { item: Media }) => (
    <View style={{ flex: 1 / columns }}>
      <MemoMediaTile media={item} showProductTitle={false} showSkuOverlay={false} size="lg" />
    </View>
  ), [columns]);

  const listHeader = useMemo(() => {
    if (!product) return null;

    return (
      <View style={{ gap: layout.contentGap }}>
        <ProductHeader sku={product.sku} coverUri={media[0]?.uri ?? null} coverKind={media[0]?.kind ?? null} mediaCount={media.length} />
        <ProductFormSection key={`${product.sku}-${product.updatedAt}`} initialTitle={product.title} initialType={product.type} initialDescription={product.description} saving={saving} error={saveError} onSave={mutate} />
        <AddPhotoButton sku={product.sku} />
        <Text variant="sectionTitle">PHOTOS ({media.length})</Text>
        {media.length === 0 ? <EmptyStateCard icon="images-outline" title="No photos yet" body="Add a photo for this product." /> : null}
      </View>
    );
  }, [layout.contentGap, media, mutate, product, saveError, saving]);

  if (loading) {
    return <Screen testID="product-detail-screen"><Spinner /></Screen>;
  }

  if (error) {
    return <Screen testID="product-detail-screen"><EmptyStateCard icon="alert-circle-outline" title="Product failed to load" body={error.message} actionLabel="Back to Products" onAction={() => router.back()} /></Screen>;
  }

  if (!product) {
    return <Screen testID="product-detail-screen"><EmptyStateCard icon="alert-circle-outline" title="Product not found" body="This SKU is no longer available." actionLabel="Back to Products" onAction={() => router.back()} /></Screen>;
  }

  return (
    <Screen testID="product-detail-screen" scroll={false} safeAreaEdges={["left", "right"]} contentStyle={{ padding: 0, gap: 0 }}>
      <FlatList
        ListHeaderComponent={listHeader}
        data={media}
        key={columns}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        columnWrapperStyle={columns > 1 ? { gap: layout.gridGap } : undefined}
        contentContainerStyle={{ alignSelf: "center", gap: layout.contentGap, maxWidth: layout.contentMaxWidth, padding: layout.pagePadding, width: "100%" }}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        renderItem={renderMedia}
        windowSize={7}
      />
    </Screen>
  );
}
