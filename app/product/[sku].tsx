import { router, useLocalSearchParams } from "expo-router";

import { EmptyStateCard, Screen, Spinner, Text } from "@/src/components/ui";
import { AddPhotoButton, MediaGrid, ProductFormSection, ProductHeader, useProductDetail } from "@/src/features/product-detail";

export default function ProductDetailScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const detailSku = Array.isArray(sku) ? sku[0] : sku;
  const { error, loading, media, mutate, product, saveError, saving } = useProductDetail(detailSku ?? "");

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
    <Screen testID="product-detail-screen">
      <ProductHeader sku={product.sku} coverUri={media[0]?.uri ?? null} coverKind={media[0]?.kind ?? null} mediaCount={media.length} />
      <ProductFormSection key={`${product.sku}-${product.updatedAt}`} initialTitle={product.title} initialType={product.type} initialDescription={product.description} saving={saving} error={saveError} onSave={mutate} />
      <AddPhotoButton sku={product.sku} />
      <MediaGrid sku={product.sku} media={media} />
      <Text variant="metadata" tone="tertiary">SKU locked after creation. Add Photo keeps this SKU context.</Text>
    </Screen>
  );
}
