import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";

import type { Media, Product, ProductPatch } from "@/src/domain";
import { mediaRepo, productsRepo } from "@/src/lib/db";

export function useProductDetail(sku: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!sku) return;
    setLoading(true);
    try {
      const [nextProduct, nextMedia] = await Promise.all([productsRepo.getBySku(sku), mediaRepo.listForSku(sku)]);
      setProduct(nextProduct);
      setMedia(nextMedia);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("Product detail failed to load."));
    } finally {
      setLoading(false);
    }
  }, [sku]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const mutate = useCallback(async (patch: ProductPatch) => {
    setSaving(true);
    try {
      const nextProduct = await productsRepo.update(sku, patch);
      setProduct(nextProduct);
      setSaveError(null);
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Product failed to save.");
    } finally {
      setSaving(false);
    }
  }, [sku]);

  return { product, media, loading, saving, error, saveError, refresh, mutate };
}
