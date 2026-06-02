import * as ImagePicker from "expo-image-picker";
import { router, usePathname } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform } from "react-native";

import { getPowerSaveWarning } from "@/src/lib/device/power";
import { toUserFacingError } from "@/src/lib/errors/userFacing";
import { storeMediaAsset } from "@/src/lib/files";
import { appendCaptureDraftMedia } from "@/src/features/camera/captureDraft";

export function usePhotoImport(sku?: string, options?: { returnToProduct?: boolean }) {
  const pathname = usePathname();
  const returnToProduct = options?.returnToProduct ?? false;
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

      const powerWarning = await getPowerSaveWarning();
      if (powerWarning) {
        Alert.alert("Power saver active", powerWarning);
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        allowsEditing: Platform.OS === "ios",
        mediaTypes: ["images"],
        quality: 1,
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

      // Adding from the camera screen while a review draft is in flight: append
      // to the draft and pop back so existing media/form survive.
      if (
        appendCaptureDraftMedia({
          uri: stored.uri,
          kind: stored.kind,
          mimeType: stored.mimeType,
          originalBytes: stored.originalBytes ?? null,
          storedBytes: stored.storedBytes ?? null,
          width: stored.width ?? null,
          height: stored.height ?? null,
          durationMs: stored.durationMs ?? null,
          compressed: stored.compressed,
        })
      ) {
        router.back();
        return;
      }

      const shouldReturnToProduct = returnToProduct || (!!sku && pathname.startsWith("/product/"));
      const route = {
        pathname: "/capture-preview",
        params: {
          ...(sku ? { sku } : {}),
          ...(shouldReturnToProduct ? { returnToProduct: "1" } : {}),
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
      } as const;

      if (shouldReturnToProduct) {
        router.replace(route);
        return;
      }

      router.push(route);
    } catch (error) {
      setImportError(toUserFacingError(error, "Photo import failed. Try another file or free storage.").message);
    } finally {
      setImporting(false);
    }
  }, [pathname, returnToProduct, sku]);

  return { importError, importing, importPhoto };
}
