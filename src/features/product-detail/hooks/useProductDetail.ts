import { useCallback, useRef, useState } from "react";
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
  const refreshIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const refreshId = refreshIdRef.current + 1;
    refreshIdRef.current = refreshId;
    if (!sku) {
      setProduct(null);
      setMedia([]);
      setError(new Error("Missing SKU route parameter."));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextProduct, nextMedia] = await Promise.all([productsRepo.getBySku(sku), mediaRepo.listForSku(sku)]);
      if (refreshId === refreshIdRef.current) {
        setProduct(nextProduct);
        setMedia(nextMedia);
        setError(null);
      }
    } catch (caught) {
      if (refreshId === refreshIdRef.current) {
        setError(caught instanceof Error ? caught : new Error("Product detail failed to load."));
      }
    } finally {
      if (refreshId === refreshIdRef.current) {
        setLoading(false);
      }
    }
  }, [sku]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      return () => {
        refreshIdRef.current += 1;
      };
    }, [refresh]),
  );

  const mutate = useCallback(async (patch: ProductPatch) => {
    if (!sku) {
      setSaveError("Missing SKU route parameter.");
      return;
    }

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
