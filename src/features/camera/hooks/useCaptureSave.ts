import { router } from "expo-router";
import { Alert } from "react-native";

import { isValidSku, normalizeSku, type MediaKind, type ProductType } from "@/src/domain";
import { saveCaptureAtomically } from "@/src/lib/db";
import { toUserFacingError } from "@/src/lib/errors/userFacing";
import { deleteMediaFile } from "@/src/lib/files";

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

    let result;

    try {
      result = await saveCaptureAtomically({ sku: normalized, uri, title: input.title, type: input.type, description: input.description, ...input.media });
    } catch (error) {
      deleteMediaFile(uri);
      throw toUserFacingError(error, "Save failed. Your photo was not added; please retry.");
    }

    if (!result.created) {
      Alert.alert("Photo added", "This product now has a new photo.");
    }

    router.replace({ pathname: "/product/[sku]", params: { sku: result.product.sku } });
  }

  return { save };
}
