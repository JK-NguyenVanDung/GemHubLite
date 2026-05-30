import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import { storeMediaAsset } from "@/src/lib/files";

export function usePhotoImport(sku?: string) {
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const importPhoto = useCallback(async () => {
    setImporting(true);
    setImportError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Photo library access is required.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images", "videos"],
        quality: 1,
        videoExportPreset: ImagePicker.VideoExportPreset.H264_1280x720,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      });

      const asset = result.canceled ? null : result.assets[0];
      if (!asset?.uri) {
        return;
      }

      const kind = asset.type === "video" ? "video" : "image";
      const stored = await storeMediaAsset({
        uri: asset.uri,
        kind,
        width: asset.width || null,
        height: asset.height || null,
        durationMs: asset.duration ?? null,
        mimeType: asset.mimeType ?? null,
        filenameHint: asset.fileName ?? asset.assetId ?? null,
      });

      router.push({
        pathname: "/capture-preview",
        params: {
          ...(sku ? { sku } : {}),
          uri: stored.uri,
          kind: stored.kind,
          mimeType: stored.mimeType,
          originalBytes: stored.originalBytes?.toString() ?? "",
          storedBytes: stored.storedBytes?.toString() ?? "",
          width: stored.width?.toString() ?? "",
          height: stored.height?.toString() ?? "",
          durationMs: stored.durationMs?.toString() ?? "",
          compressed: stored.compressed ? "1" : "0",
        },
      });
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Photo import failed.");
    } finally {
      setImporting(false);
    }
  }, [sku]);

  return { importError, importing, importPhoto };
}
