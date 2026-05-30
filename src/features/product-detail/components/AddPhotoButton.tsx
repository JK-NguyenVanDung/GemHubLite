import { router } from "expo-router";
import { useMemo, useState } from "react";

import { ActionSheet, Button, Icon } from "@/src/components/ui";
import type { ActionSheetOption } from "@/src/components/ui";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";

export function AddPhotoButton({ sku }: { sku: string }) {
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const { importPhoto } = usePhotoImport(sku);
  const options: ActionSheetOption[] = useMemo(() => [
    { label: "Open Camera", icon: "camera-outline", onPress: () => router.push({ pathname: "/(tabs)/camera", params: { sku } }), testID: "add-photo-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "add-photo-library" },
  ], [importPhoto, sku]);

  return (
    <>
      <Button fullWidth label="Add Photo" leftIcon={<Icon name="camera-outline" tone="onAccent" />} onPress={() => setSourceSheetOpen(true)} />
      <ActionSheet visible={sourceSheetOpen} title={`Add photo to ${sku}`} options={options} onClose={() => setSourceSheetOpen(false)} />
    </>
  );
}
