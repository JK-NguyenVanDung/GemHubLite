import { router } from "expo-router";
import { Alert } from "react-native";

import { isValidSku, normalizeSku, type MediaKind, type ProductType } from "@/src/domain";
import { mediaRepo, productsRepo } from "@/src/lib/db";

export type CaptureMediaMetadata = {
  kind: MediaKind;
  mimeType: string | null;
  originalBytes: number | null;
  storedBytes: number | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  compressed: boolean;
};

export function useCaptureSave(uri: string | null) {
  async function save(input: { sku: string; title: string; type: ProductType | null; description: string; media?: CaptureMediaMetadata }) {
    if (!uri) {
      throw new Error("Captured image missing.");
    }

    const normalized = normalizeSku(input.sku);
    if (!isValidSku(normalized)) {
      throw new Error("SKU is required.");
    }

    const { product, created } = await productsRepo.upsertBySku({
      sku: normalized,
      title: input.title,
      type: input.type,
      description: input.description,
    });
    await mediaRepo.appendMedia({ sku: product.sku, uri, ...input.media });

    if (!created) {
      Alert.alert("Added media", "Media added to existing SKU.");
    }

    router.replace({ pathname: "/product/[sku]", params: { sku: product.sku } });
  }

  return { save };
}
