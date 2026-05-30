import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

import { ActionSheet, Button, Card, Chip, Field, Icon, Picker, Text, Thumbnail } from "@/src/components/ui";
import type { ActionSheetOption, IoniconName } from "@/src/components/ui";
import { isValidSku, normalizeSku, type MediaKind, type ProductListItem, type ProductType } from "@/src/domain";
import { productsRepo } from "@/src/lib/db";
import { useTheme } from "@/src/theme";
import { BottomSaveBar } from "@/src/features/camera/components/BottomSaveBar";
import { useCaptureSave } from "@/src/features/camera/hooks/useCaptureSave";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";

const productTypes: { value: ProductType; label: string; icon: IoniconName }[] = [
  { value: "ring", label: "Ring", icon: "ellipse-outline" },
  { value: "necklace", label: "Necklace", icon: "link-outline" },
  { value: "earring", label: "Earring", icon: "radio-button-off-outline" },
  { value: "bracelet", label: "Bracelet", icon: "sync-circle-outline" },
  { value: "pendant", label: "Pendant", icon: "diamond-outline" },
  { value: "other", label: "Other", icon: "cube-outline" },
];

export function CaptureReview() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ compressed?: string; durationMs?: string; height?: string; kind?: string; mimeType?: string; originalBytes?: string; sku?: string; storedBytes?: string; uri?: string; width?: string }>();
  const uri = typeof params.uri === "string" ? params.uri : null;
  const mediaKind: MediaKind = params.kind === "video" ? "video" : "image";
  const mediaMetadata = useMemo(() => ({
    kind: mediaKind,
    mimeType: typeof params.mimeType === "string" && params.mimeType.length ? params.mimeType : mediaKind === "video" ? "video/mp4" : "image/jpeg",
    originalBytes: parseOptionalNumber(params.originalBytes),
    storedBytes: parseOptionalNumber(params.storedBytes),
    width: parseOptionalNumber(params.width),
    height: parseOptionalNumber(params.height),
    durationMs: parseOptionalNumber(params.durationMs),
    compressed: params.compressed === "1",
  }), [mediaKind, params.compressed, params.durationMs, params.height, params.mimeType, params.originalBytes, params.storedBytes, params.width]);
  const [sku, setSku] = useState(typeof params.sku === "string" ? normalizeSku(params.sku) : "");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductType | null>(null);
  const [description, setDescription] = useState("");
  const [skuError, setSkuError] = useState<string | null>(null);
  const [imageSheetOpen, setImageSheetOpen] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [skuSheetOpen, setSkuSheetOpen] = useState(false);
  const [existingProducts, setExistingProducts] = useState<ProductListItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { save } = useCaptureSave(uri);
  const { importPhoto } = usePhotoImport(typeof params.sku === "string" ? normalizeSku(params.sku) : undefined);

  const typeOptions = useMemo(
    () => productTypes.map((option) => ({ label: option.label, icon: option.icon, onPress: () => setType(option.value) })),
    [],
  );
  const imageOptions: ActionSheetOption[] = useMemo(() => [
    { label: "Choose Another Photo", icon: "images-outline", onPress: importPhoto, testID: "capture-choose-another-photo" },
    { label: "Retake with Camera", icon: "camera-outline", onPress: () => router.replace(typeof params.sku === "string" ? { pathname: "/(tabs)/camera", params: { sku: params.sku } } : "/(tabs)/camera"), testID: "capture-retake-camera" },
  ], [importPhoto, params.sku]);
  const typeLabel = useMemo(() => productTypes.find((option) => option.value === type)?.label, [type]);
  const skuOptions = useMemo(
    () => existingProducts.map((product) => ({ label: product.title ? `${product.sku} · ${product.title}` : product.sku, onPress: () => setSku(product.sku) })),
    [existingProducts],
  );
  const canSave = Boolean(uri) && isValidSku(sku);

  useEffect(() => {
    let alive = true;

    productsRepo.list()
      .then((products) => {
        if (alive) setExistingProducts(products);
      })
      .catch(() => {
        if (alive) setExistingProducts([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function generate() {
    setSku(await productsRepo.generateNextSku());
    setSkuError(null);
  }

  async function onSave() {
    const normalized = normalizeSku(sku);
    if (!isValidSku(normalized)) {
      setSkuError("SKU is required");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await save({ sku: normalized, title, type, description, media: mediaMetadata });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (!uri) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Card style={{ gap: theme.spacing.md }}>
          <Text variant="screenTitle">Capture missing</Text>
          <Text variant="body" tone="secondary">No photo found for this save flow.</Text>
          <Button label="Back to Camera" onPress={() => router.replace("/(tabs)/camera")} />
        </Card>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      <View style={{ backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", paddingVertical: theme.spacing.xs }}>
          <Icon name="chevron-back" size={18} tone="accent" />
          <Text variant="bodyStrong" tone="accent">Cancel</Text>
        </Pressable>
        <Text variant="bodyStrong" tone="primary">Create Product</Text>
        <View style={{ width: 18 + 50 }} />
      </View>
      <View style={{ backgroundColor: theme.colors.surface }}>
        {mediaKind === "image" ? (
          <Image source={{ uri }} style={{ aspectRatio: 1.08, backgroundColor: theme.colors.surfaceMuted, width: "100%" }} contentFit="cover" />
        ) : (
          <View style={{ alignItems: "center", aspectRatio: 1.08, backgroundColor: theme.colors.black, justifyContent: "center", width: "100%" }}>
            <Icon name="videocam" size={52} tone="onAccent" />
            <Text variant="bodyStrong" tone="onAccent">Video ready</Text>
            <Text variant="metadata" tone="onAccent">Stored locally for this SKU</Text>
          </View>
        )}
        <View style={{ bottom: theme.spacing.sm, left: theme.spacing.sm, position: "absolute" }}>
          <RoundIcon icon="pencil" onPress={() => setImageSheetOpen(true)} accessibilityLabel="Photo actions" />
        </View>
        <View style={{ bottom: theme.spacing.sm, right: theme.spacing.sm, position: "absolute" }}>
          <RoundIcon icon="ellipsis-horizontal" onPress={() => setImageSheetOpen(true)} accessibilityLabel="More photo actions" />
        </View>
      </View>
      <View style={{ backgroundColor: theme.colors.surface, gap: theme.spacing.md, padding: theme.spacing.md }}>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ alignItems: "center", borderColor: theme.colors.border, borderRadius: theme.radius.sm, borderWidth: 1, height: 62, justifyContent: "center", width: 62 }}>
            <Icon name="add-circle" size={24} tone="secondary" />
          </View>
          {mediaKind === "image" ? <Thumbnail source={{ uri }} selected size="sm" /> : <VideoThumb />}
        </View>
        <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
          <Chip label={mediaKind === "video" ? "Video" : "Image"} tone="accent" />
          <Chip label={mediaMetadata.compressed ? "Compressed" : "Stored original"} />
          {mediaMetadata.storedBytes ? <Chip label={formatBytes(mediaMetadata.storedBytes)} /> : null}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="sectionTitle">PRODUCT INFO</Text>
          <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
            <Button label="Existing" variant="ghost" size="sm" disabled={!existingProducts.length} onPress={() => setSkuSheetOpen(true)} />
            <Button label="Generate SKU" variant="ghost" size="sm" leftIcon={<Icon name="sparkles-outline" tone="accent" />} onPress={generate} />
          </View>
        </View>
        <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.sm }}>
          <Field
            label="SKU"
            required
            value={sku}
            onChangeText={(value) => {
              setSku(normalizeSku(value));
              setSkuError(null);
            }}
            autoCapitalize="characters"
            error={skuError ?? undefined}
            placeholder="UN-0001"
            testID="capture-sku-field"
          />
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Knot ring in yellow gold" testID="capture-title-field" />
          <Picker label="Product type" value={typeLabel ?? undefined} placeholder="Choose product type" onPress={() => setTypeSheetOpen(true)} />
          <Field label="Description" multiline numberOfLines={4} value={description} onChangeText={setDescription} placeholder="Add product description" testID="capture-description-field" />
        </Card>
        <Text variant="sectionTitle">SPECIFICATION</Text>
        <Card style={{ gap: theme.spacing.xs }}>
          <Text variant="metadata" tone="secondary">Lite keeps specifications optional. Core save needs SKU only.</Text>
        </Card>
        {saveError ? <Text variant="metadata" tone="danger">{saveError}</Text> : null}
      </View>
      <BottomSaveBar canSave={canSave} saving={saving} onSave={onSave} />
      <ActionSheet visible={imageSheetOpen} title="Photo actions" options={imageOptions} onClose={() => setImageSheetOpen(false)} />
      <ActionSheet visible={typeSheetOpen} title="Product type" options={typeOptions} onClose={() => setTypeSheetOpen(false)} />
      <ActionSheet visible={skuSheetOpen} title="Assign existing SKU" options={skuOptions} onClose={() => setSkuSheetOpen(false)} />
    </View>
  );
}

function RoundIcon({ accessibilityLabel, icon, onPress }: { accessibilityLabel: string; icon: "pencil" | "ellipsis-horizontal"; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill, height: 34, justifyContent: "center", opacity: pressed ? 0.72 : 1, width: 34 })}>
      <Icon name={icon} size={18} tone="accent" />
    </Pressable>
  );
}

function VideoThumb() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", backgroundColor: theme.colors.black, borderColor: theme.colors.accent, borderRadius: theme.radius.sm, borderWidth: 2, height: 64, justifyContent: "center", width: 64 }}>
      <Icon name="videocam" size={22} tone="onAccent" />
    </View>
  );
}

function parseOptionalNumber(value?: string | string[]): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
