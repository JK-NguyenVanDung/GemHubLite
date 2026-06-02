import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";

import { EmptyStateCard, Screen, Spinner } from "@/src/components/ui";
import { MediaStrip, ProductFormSection, ProductHero, useProductDetail } from "@/src/features/product-detail";
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";

export default function ProductDetailScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const detailSku = Array.isArray(sku) ? sku[0] : sku;
  const { deleteMedia, deleteProduct, error, loading, media, mutate, product, saveError, saving } = useProductDetail(detailSku ?? "");
  const layout = useResponsiveLayout();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Derive the active media: honor the user's selection when it still exists,
  // otherwise fall back to the first item. Keeping this derived (instead of
  // syncing state in an effect) avoids cascading renders when `media` changes.
  const selected = useMemo(() => media.find((item) => item.id === selectedId) ?? media[0] ?? null, [media, selectedId]);

  const confirmDeleteProduct = () => {
    if (!product) return;

    Alert.alert("Delete product?", `Delete ${product.sku} and all images?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Product",
        style: "destructive",
        onPress: async () => {
          await deleteProduct();
          router.replace("/(tabs)/products");
        },
      },
    ]);
  };

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
      <Stack.Screen options={{ title: product.sku }} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ alignSelf: "center", gap: layout.contentGap, maxWidth: layout.contentMaxWidth, padding: layout.pagePadding, width: "100%" }}>
        <ProductHero uri={selected?.uri ?? null} kind={selected?.kind ?? null} />
        <MediaStrip media={media} selectedId={selected?.id ?? null} onDeleteMedia={deleteMedia} onDeleteProduct={confirmDeleteProduct} onSelect={setSelectedId} sku={product.sku} />
        <ProductFormSection key={`${product.sku}-${product.updatedAt}`} initialTitle={product.title} initialType={product.type} initialDescription={product.description} saving={saving} error={saveError} onDeleteProduct={confirmDeleteProduct} onSave={mutate} />
      </ScrollView>
    </Screen>
  );
}
