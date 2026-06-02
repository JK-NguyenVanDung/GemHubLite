import { router } from "expo-router";

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
  async function save(input: { sku: string; title: string; type: ProductType | null; description: string; media?: CaptureMediaMetadata | (CaptureMediaMetadata & { uri: string })[] }) {
    if (!uri) {
      throw new Error("Captured image missing.");
    }

    const normalized = normalizeSku(input.sku);
    if (!isValidSku(normalized)) {
      throw new Error("SKU is required.");
    }

    const mediaItems = Array.isArray(input.media) ? input.media : [{ uri, ...input.media }];
    let result;

    try {
      for (const item of mediaItems) {
        result = await saveCaptureAtomically({ sku: normalized, title: input.title, type: input.type, description: input.description, ...item, uri: item.uri });
      }
    } catch (error) {
      mediaItems.forEach((item) => deleteMediaFile(item.uri));
      throw toUserFacingError(error, "Save failed. Your photo was not added; please retry.");
    }

    if (!result) {
      throw new Error("Save failed. Add a photo and try again.");
    }

    router.dismissTo("/(tabs)/camera");
  }

  return { save };
}
