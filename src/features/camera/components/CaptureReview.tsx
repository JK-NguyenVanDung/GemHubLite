import { BottomSheet, RNHostView } from "@expo/ui";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  isScannedCode,
  useCameraDevice,
  useCameraPermission,
  useObjectOutput,
} from "react-native-vision-camera";
import type {
  ScannedObject,
  ScannedObjectType,
} from "react-native-vision-camera";

import {
  ActionSheet,
  Button,
  Card,
  Field,
  Icon,
  Picker,
  Text,
  Thumbnail,
} from "@/src/components/ui";
import type { ActionSheetOption, IoniconName } from "@/src/components/ui";
import {
  isValidSku,
  normalizeSku,
  type MediaKind,
  type ProductListItem,
  type ProductType,
} from "@/src/domain";
import { productsRepo } from "@/src/lib/db";
import { getPowerSaveWarning } from "@/src/lib/device/power";
import { toUserFacingError } from "@/src/lib/errors/userFacing";
import { storeMediaAsset } from "@/src/lib/files";
import { useTheme } from "@/src/theme";
import { BottomSaveBar } from "@/src/features/camera/components/BottomSaveBar";
import type { CaptureMediaMetadata } from "@/src/features/camera/hooks/useCaptureSave";
import { useCaptureSave } from "@/src/features/camera/hooks/useCaptureSave";

const productTypes: { value: ProductType; label: string; icon: IoniconName }[] =
  [
    { value: "ring", label: "Ring", icon: "ellipse-outline" },
    { value: "necklace", label: "Necklace", icon: "link-outline" },
    { value: "earring", label: "Earring", icon: "radio-button-off-outline" },
    { value: "bracelet", label: "Bracelet", icon: "sync-circle-outline" },
    { value: "pendant", label: "Pendant", icon: "diamond-outline" },
    { value: "other", label: "Other", icon: "cube-outline" },
  ];

type SkuIntent = "new" | "existing";

type PendingCaptureMedia = CaptureMediaMetadata & { uri: string };

const skuScannerTypes: ScannedObjectType[] = [
  "qr",
  "micro-qr",
  "code-128",
  "code-39",
  "code-93",
  "ean-13",
  "ean-8",
  "upc-e",
  "data-matrix",
  "pdf-417",
];

export function CaptureReview() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    compressed?: string;
    durationMs?: string;
    height?: string;
    kind?: string;
    mimeType?: string;
    originalBytes?: string;
    sku?: string;
    storedBytes?: string;
    uri?: string;
    width?: string;
  }>();
  const uri = readParam(params.uri);
  const mediaKind: MediaKind = params.kind === "video" ? "video" : "image";
  const mediaMetadata = useMemo(
    () => ({
      kind: mediaKind,
      mimeType:
        readParam(params.mimeType) ??
        (mediaKind === "video" ? "video/mp4" : "image/jpeg"),
      originalBytes: parseOptionalNumber(params.originalBytes),
      storedBytes: parseOptionalNumber(params.storedBytes),
      width: parseOptionalNumber(params.width),
      height: parseOptionalNumber(params.height),
      durationMs: parseOptionalNumber(params.durationMs),
      compressed: params.compressed === "1",
    }),
    [
      mediaKind,
      params.compressed,
      params.durationMs,
      params.height,
      params.mimeType,
      params.originalBytes,
      params.storedBytes,
      params.width,
    ],
  );
  const initialSku = normalizeSku(readParam(params.sku) ?? "");
  const initialValidSku = isValidSku(initialSku) ? initialSku : "";
  const [sku, setSku] = useState(initialValidSku);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ProductType | null>(null);
  const [description, setDescription] = useState("");
  const [skuError, setSkuError] = useState<string | null>(null);
  const [imageSheetOpen, setImageSheetOpen] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [skuFlowOpen, setSkuFlowOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [existingProducts, setExistingProducts] = useState<ProductListItem[]>(
    [],
  );
  const [skuIntent, setSkuIntent] = useState<SkuIntent>(
    initialValidSku ? "existing" : "new",
  );
  const [pendingMedia, setPendingMedia] = useState<PendingCaptureMedia[]>(() =>
    uri ? [{ uri, ...mediaMetadata }] : [],
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [importingPhoto, setImportingPhoto] = useState(false);
  const { save } = useCaptureSave(uri);
  const normalizedSku = normalizeSku(sku);

  const typeOptions = useMemo(
    () =>
      productTypes.map((option) => ({
        label: option.label,
        icon: option.icon,
        onPress: () => setType(option.value),
      })),
    [],
  );
  const imageOptions: ActionSheetOption[] = useMemo(
    () => [
      {
        label: "Add Photo from Library",
        icon: "images-outline",
        onPress: addPhotoFromLibrary,
        testID: "capture-add-photo-library",
      },
      {
        label: "Add Photo with Camera",
        icon: "camera-outline",
        onPress: () =>
          router.replace(
            normalizedSku
              ? { pathname: "/camera", params: { sku: normalizedSku } }
              : "/camera",
          ),
        testID: "capture-add-photo-camera",
      },
    ],
    [normalizedSku],
  );
  const typeLabel = useMemo(
    () => productTypes.find((option) => option.value === type)?.label,
    [type],
  );
  const existingSku = useMemo(
    () =>
      existingProducts.find((product) => product.sku === normalizedSku) ?? null,
    [existingProducts, normalizedSku],
  );
  const skuStatus = getSkuStatus({
    existingProduct: existingSku,
    intent: skuIntent,
    sku: normalizedSku,
  });
  const canSave =
    pendingMedia.length > 0 && isValidSku(normalizedSku) && skuStatus.kind !== "error";

  useEffect(() => {
    let alive = true;

    productsRepo
      .list()
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
    const nextSku = await productsRepo.generateNextSku();
    applyNewSku(nextSku);
    return nextSku;
  }

  function applyExistingSku(nextSku: string) {
    setSku(normalizeSku(nextSku));
    setSkuIntent("existing");
    setSkuError(null);
  }

  function applyNewSku(nextSku: string) {
    setSku(normalizeSku(nextSku));
    setSkuIntent("new");
    setSkuError(null);
  }

  function applyScannedSku(nextSku: string) {
    const scannedSku = normalizeSku(nextSku);
    setSku(scannedSku);
    setSkuIntent(
      existingProducts.some((product) => product.sku === scannedSku)
        ? "existing"
        : "new",
    );
    setSkuError(null);
    setScannerOpen(false);
    setSkuFlowOpen(true);
  }

  async function addPhotoFromLibrary() {
    setImportingPhoto(true);
    setSaveError(null);

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
      if (!asset?.uri) return;

      const stored = await storeMediaAsset({
        uri: asset.uri,
        kind: "image",
        width: asset.width || null,
        height: asset.height || null,
        durationMs: asset.duration ?? null,
        mimeType: asset.mimeType ?? null,
        filenameHint: asset.fileName ?? asset.assetId ?? null,
      });

      setPendingMedia((current) => [
        ...current,
        {
          uri: stored.uri,
          kind: stored.kind,
          mimeType: stored.mimeType,
          originalBytes: stored.originalBytes,
          storedBytes: stored.storedBytes,
          width: stored.width,
          height: stored.height,
          durationMs: stored.durationMs,
          compressed: stored.compressed,
        },
      ]);
      setImageSheetOpen(false);
    } catch (error) {
      setSaveError(toUserFacingError(error, "Photo import failed. Try another file or free storage.").message);
    } finally {
      setImportingPhoto(false);
    }
  }

  async function attemptSave() {
    const normalized = normalizeSku(sku);
    if (!isValidSku(normalized)) {
      setSkuError("SKU is required");
      return;
    }
    if (skuStatus.kind === "error") {
      setSkuError(skuStatus.message);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      await save({
        sku: normalized,
        title,
        type,
        description,
        media: pendingMedia,
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onSave() {
    await attemptSave();
  }

  async function onRetrySave() {
    if (saving) return;
    await attemptSave();
  }

  if (!uri) {
    return (
      <View style={{ padding: theme.spacing.md }}>
        <Card style={{ gap: theme.spacing.md }}>
          <Text variant="screenTitle">Photo unavailable</Text>
          <Text variant="body" tone="secondary">
            Choose a photo or open the camera to try again.
          </Text>
          <Button
            label="Back to Camera"
            onPress={() => router.replace("/camera")}
          />
        </Card>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: theme.spacing.xs,
          }}
        >
          <Icon name="chevron-back" size={18} tone="accent" />
          <Text variant="bodyStrong" tone="accent">
            Cancel
          </Text>
        </Pressable>
        <Text variant="bodyStrong" tone="primary">
          Product photo
        </Text>
        <View style={{ width: 18 + 50 }} />
      </View>
      <View style={{ backgroundColor: theme.colors.surface }}>
        {mediaKind === "image" ? (
          <Image
            cachePolicy="memory-disk"
            source={{ uri }}
            style={{
              aspectRatio: 1.08,
              backgroundColor: theme.colors.surfaceMuted,
              width: "100%",
            }}
            contentFit="cover"
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              aspectRatio: 1.08,
              backgroundColor: theme.colors.black,
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Icon name="videocam" size={52} tone="onAccent" />
            <Text variant="bodyStrong" tone="onAccent">
              Video ready
            </Text>
            <Text variant="metadata" tone="onAccent">
              Stored locally for this SKU
            </Text>
          </View>
        )}
        <View
          style={{
            bottom: theme.spacing.sm,
            left: theme.spacing.sm,
            position: "absolute",
          }}
        >
          <RoundIcon
            icon="pencil"
            onPress={() => setImageSheetOpen(true)}
            accessibilityLabel="Photo actions"
          />
        </View>
        <View
          style={{
            bottom: theme.spacing.sm,
            right: theme.spacing.sm,
            position: "absolute",
          }}
        >
          <RoundIcon
            icon="ellipsis-horizontal"
            onPress={() => setImageSheetOpen(true)}
            accessibilityLabel="More photo actions"
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: theme.colors.surface,
          gap: theme.spacing.md,
          padding: theme.spacing.md,
        }}
      >
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={() => setImageSheetOpen(true)}
            style={{
              alignItems: "center",
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
              borderWidth: 1,
              height: 62,
              justifyContent: "center",
              width: 62,
            }}
          >
            {importingPhoto ? <ActivityIndicator /> : <Icon name="add-circle" size={24} tone="secondary" />}
          </Pressable>
          {pendingMedia.map((item, index) =>
            item.kind === "image" ? (
              <Thumbnail key={`${item.uri}-${index}`} source={{ uri: item.uri }} selected={index === pendingMedia.length - 1} size="sm" />
            ) : (
              <VideoThumb key={`${item.uri}-${index}`} />
            ),
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="sectionTitle">Product Info</Text>
          <Button
            label={normalizedSku ? "Edit SKU" : "Choose SKU"}
            variant="ghost"
            size="sm"
            onPress={() => setSkuFlowOpen(true)}
          />
        </View>
        <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.sm }}>
          <SkuSummaryCard
            sku={normalizedSku}
            status={skuError ?? skuStatus.message}
            statusTone={
              skuError || skuStatus.kind === "error"
                ? "danger"
                : skuStatus.kind === "warning"
                  ? "secondary"
                  : "tertiary"
            }
            onPress={() => setSkuFlowOpen(true)}
            onScan={() => setScannerOpen(true)}
          />
          <Field
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Knot ring in yellow gold"
            testID="capture-title-field"
          />
          <Picker
            label="Product type"
            value={typeLabel ?? undefined}
            placeholder="Choose product type"
            onPress={() => setTypeSheetOpen(true)}
          />
          <Field
            label="Description"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholder="Add product description"
            testID="capture-description-field"
          />
        </Card>
        {saveError ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <Text variant="metadata" tone="danger" style={{ flex: 1 }}>
              {saveError}
            </Text>
            <Button
              label={saving ? "Retrying" : "Retry"}
              variant="ghost"
              size="sm"
              onPress={onRetrySave}
              disabled={saving}
              testID="capture-save-retry"
            />
          </View>
        ) : null}
      </View>
      <BottomSaveBar canSave={canSave} saving={saving} onSave={onSave} />
      <ActionSheet
        visible={imageSheetOpen}
        title="Add photo"
        options={imageOptions}
        onClose={() => setImageSheetOpen(false)}
      />
      <ActionSheet
        visible={typeSheetOpen}
        title="Product type"
        options={typeOptions}
        onClose={() => setTypeSheetOpen(false)}
      />
      {scannerOpen ? (
        <SkuScannerOverlay
          onClose={() => setScannerOpen(false)}
          onScanned={applyScannedSku}
        />
      ) : null}
      {skuFlowOpen ? (
        <SkuCreationFlow
          existingProducts={existingProducts}
          intent={skuIntent}
          onApply={() => setSkuFlowOpen(false)}
          onChangeManualSku={(value) => applyNewSku(value)}
          onClose={() => setSkuFlowOpen(false)}
          onGenerate={generate}
          onOpenScanner={() => setScannerOpen(true)}
          onSelectExisting={applyExistingSku}
          sku={normalizedSku}
          skuStatus={skuStatus}
        />
      ) : null}
    </View>
  );
}

function SkuSummaryCard({
  onPress,
  onScan,
  sku,
  status,
  statusTone,
}: {
  onPress: () => void;
  onScan: () => void;
  sku: string;
  status: string;
  statusTone: "danger" | "secondary" | "tertiary";
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        sku
          ? `Choose SKU. Current SKU ${sku}. ${status}`
          : `Choose SKU. ${status}`
      }
      onPress={onPress}
      testID="capture-sku-field"
      style={({ pressed }) => ({
        gap: theme.spacing.xs,
        opacity: pressed ? 0.78 : 1,
      })}
    >
      <Text variant="metadata" tone="secondary">
        SKU *
      </Text>
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.colors.surfaceMuted,
          borderColor:
            statusTone === "danger" ? theme.colors.danger : theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          flexDirection: "row",
          gap: theme.spacing.sm,
          minHeight: 54,
          paddingHorizontal: theme.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong" selectable>
            {sku || "Select SKU"}
          </Text>
          {statusTone === "danger" ? (
            <Text variant="metadata" tone={statusTone}>
              {status}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Scan SKU barcode"
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation();
            onScan();
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.62 : 1,
            padding: theme.spacing.xs,
          })}
        >
          <Icon name="barcode-outline" size={28} tone="primary" />
        </Pressable>
      </View>
    </Pressable>
  );
}

function SkuCreationFlow({
  existingProducts,
  intent,
  onApply,
  onChangeManualSku,
  onClose,
  onGenerate,
  onOpenScanner,
  onSelectExisting,
  sku,
  skuStatus,
}: {
  existingProducts: ProductListItem[];
  intent: SkuIntent;
  onApply: () => void;
  onChangeManualSku: (value: string) => void;
  onClose: () => void;
  onGenerate: () => Promise<string>;
  onOpenScanner: () => void;
  onSelectExisting: (sku: string) => void;
  sku: string;
  skuStatus: SkuStatus;
}) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);
  const [queryState, setQueryState] = useState({ sourceSku: sku, value: sku });
  const query = queryState.sourceSku === sku ? queryState.value : sku;
  const normalizedQuery = normalizeSku(query);
  const filteredProducts = useMemo(
    () =>
      existingProducts.filter((product) =>
        product.sku.includes(normalizedQuery),
    ),
    [existingProducts, normalizedQuery],
  );
  const compactProducts = filteredProducts.slice(0, 5);
  const exactProduct = useMemo(
    () =>
      existingProducts.find((product) => product.sku === normalizedQuery) ??
      null,
    [existingProducts, normalizedQuery],
  );
  const [generating, setGenerating] = useState(false);
  const ctaLabel = normalizedQuery
    ? exactProduct
      ? "Use Existing SKU"
      : "Use This SKU"
    : "Generate SKU";
  const canApply = isValidSku(sku) && skuStatus.kind !== "error";

  function changeQuery(value: string) {
    setQueryState({ sourceSku: sku, value });
    onChangeManualSku(value);
  }

  async function handlePrimarySkuAction() {
    if (exactProduct) {
      onSelectExisting(exactProduct.sku);
      onApply();
      return;
    }

    if (normalizedQuery && !exactProduct) {
      onChangeManualSku(normalizedQuery);
      onApply();
      return;
    }

    setGenerating(true);
    try {
      const generatedSku = await onGenerate();
      setQueryState({ sourceSku: generatedSku, value: generatedSku });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <BottomSheet isPresented onDismiss={onClose} snapPoints={[{ fraction: 0.58 }]}> 
      <RNHostView matchContents style={{ width: sheetWidth }}>
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.radius.xl,
            borderTopRightRadius: theme.radius.xl,
            overflow: "hidden",
            width: sheetWidth,
          }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.lg,
              paddingBottom: theme.spacing.sm,
            }}
          >
            <Button label="Cancel" variant="ghost" size="sm" onPress={onClose} />
            <Text variant="screenTitle">Choose SKU</Text>
            <Button
              label="Confirm"
              variant="ghost"
              size="sm"
              disabled={!canApply}
              onPress={onApply}
            />
          </View>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{
              gap: theme.spacing.md,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing.xs,
              paddingBottom: theme.spacing.xl,
              width: "100%",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <SkuSearchBox
              value={query}
              onChangeText={changeQuery}
              onScan={onOpenScanner}
            />
            <Button
              label={generating ? "Generating" : ctaLabel}
              variant="secondary"
              fullWidth
              onPress={() => void handlePrimarySkuAction()}
              disabled={generating}
              leftIcon={<Icon name="sparkles-outline" tone="accent" />}
            />
            {normalizedQuery && !exactProduct ? (
              <View
                style={{
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  gap: theme.spacing.xs,
                  minHeight: 44,
                  padding: theme.spacing.md,
                }}
              >
                <Text variant="bodyStrong">{normalizedQuery}</Text>
              </View>
            ) : compactProducts.length ? (
              <View style={{ gap: theme.spacing.xs }}>
                <Text variant="metadata" tone="secondary">
                  Existing SKUs
                </Text>
                {compactProducts.map((product) => (
                  <Pressable
                    key={product.sku}
                    accessibilityRole="button"
                    accessibilityLabel={`Use existing SKU ${product.sku}`}
                    onPress={() => {
                      setQueryState({ sourceSku: product.sku, value: product.sku });
                      onSelectExisting(product.sku);
                      onApply();
                    }}
                    style={({ pressed }) => ({
                      alignItems: "center",
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radius.md,
                      borderWidth: 1,
                      flexDirection: "row",
                      gap: theme.spacing.sm,
                      minHeight: 64,
                      opacity: pressed ? 0.78 : 1,
                      padding: theme.spacing.sm,
                    })}
                  >
                    <Thumbnail
                      source={
                        product.coverUri ? { uri: product.coverUri } : undefined
                      }
                      placeholder="◇"
                      size="sm"
                    />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyStrong" selectable>
                        {product.sku}
                      </Text>
                      <Text variant="metadata" tone="secondary">
                        {product.title || "Untitled product"} · {product.mediaCount} media
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={18} tone="tertiary" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <View
                style={{
                  alignItems: "flex-start",
                  backgroundColor: theme.colors.surfaceMuted,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.lg,
                  borderWidth: 1,
                  gap: theme.spacing.sm,
                  padding: theme.spacing.md,
                }}
              >
                <Icon name="barcode-outline" size={24} tone="tertiary" />
                <Text variant="bodyStrong">
                  No SKUs yet
                </Text>
                <Text variant="metadata" tone="secondary">
                  Add or scan a SKU to continue.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

function SkuSearchBox({
  onChangeText,
  onScan,
  value,
}: {
  onChangeText: (value: string) => void;
  onScan: () => void;
  value: string;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.md,
        borderWidth: 1.5,
        flexDirection: "row",
        minHeight: 56,
        paddingHorizontal: theme.spacing.sm,
        position: "relative",
      }}
    >
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        maxFontSizeMultiplier={1.3}
        onChangeText={onChangeText}
        placeholder="Search or enter SKU"
        placeholderTextColor={theme.colors.tertiaryText}
        style={[
          theme.typography.body,
          {
            color: theme.colors.text,
            flex: 1,
            paddingRight: value ? 88 : 48,
            paddingVertical: theme.spacing.sm,
          },
        ]}
        testID="choose-sku-search-field"
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear SKU search"
          hitSlop={10}
          onPress={() => onChangeText("")}
          style={{
            alignItems: "center",
            bottom: 0,
            justifyContent: "center",
            position: "absolute",
            right: 48,
            top: 0,
            width: 44,
            zIndex: 2,
          }}
        >
          <Icon name="close-circle" size={22} tone="tertiary" />
        </Pressable>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan SKU barcode"
        hitSlop={10}
        onPress={onScan}
        style={{
          alignItems: "center",
          bottom: 0,
          justifyContent: "center",
          position: "absolute",
          right: 6,
          top: 0,
          width: 44,
          zIndex: 2,
        }}
      >
        <Icon name="barcode-outline" size={30} tone="primary" />
      </Pressable>
    </View>
  );
}

function SkuScannerOverlay({
  onClose,
  onScanned,
}: {
  onClose: () => void;
  onScanned: (sku: string) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [manualCode, setManualCode] = useState("");
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const normalizedManualCode = normalizeSku(manualCode);
  const canUseManualCode = isValidSku(normalizedManualCode);

  function submitManualCode() {
    if (!canUseManualCode) return;
    onScanned(normalizedManualCode);
  }

  const handleObjectsScanned = useCallback(
    (objects: ScannedObject[]) => {
      if (detectedCode) return;
      const scannedCode = objects.find(isScannedCode)?.value;
      if (!scannedCode) return;

      const normalizedCode = normalizeSku(scannedCode);
      if (!normalizedCode) return;

      setDetectedCode(normalizedCode);
      setManualCode(normalizedCode);
      onScanned(normalizedCode);
    },
    [detectedCode, onScanned],
  );
  const objectOutput = useObjectOutput({
    types: skuScannerTypes,
    onObjectsScanned: handleObjectsScanned,
  });
  const scannerOutputs = useMemo(() => [objectOutput], [objectOutput]);
  const canUseNativeScanner = hasPermission && Boolean(device);
  const bottomInset = Math.max(insets.bottom, theme.spacing.md);
  const topInset = Math.max(insets.top, theme.spacing.md);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Modal animationType="fade" onRequestClose={onClose} visible>
      <View style={{ backgroundColor: theme.colors.black, flex: 1 }}>
        {canUseNativeScanner && device ? (
          <Camera
            device={device}
            isActive
            outputs={scannerOutputs}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View pointerEvents="none" style={StyleSheet.absoluteFill} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingBottom: theme.spacing.sm,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: topInset + theme.spacing.sm,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close SKU chooser"
              onPress={onClose}
              hitSlop={8}
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.16)",
                borderRadius: theme.radius.pill,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Icon name="close" size={26} tone="onAccent" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scanner settings"
              hitSlop={8}
              style={{
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.16)",
                borderRadius: theme.radius.pill,
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Icon name="settings" size={24} tone="onAccent" />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: keyboardVisible ? "flex-start" : "center",
              paddingBottom: bottomInset + theme.spacing.md,
              paddingHorizontal: theme.spacing.lg,
              paddingTop: keyboardVisible ? theme.spacing.sm : theme.spacing.md,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                alignSelf: "center",
                aspectRatio: keyboardVisible ? undefined : 1,
                borderColor: theme.colors.surface,
                borderRadius: theme.radius.xl,
                borderWidth: keyboardVisible ? 2 : 4,
                justifyContent: "center",
                maxWidth: 330,
                minHeight: keyboardVisible ? 92 : undefined,
                opacity: 0.95,
                width: keyboardVisible ? "100%" : "84%",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  padding: keyboardVisible ? theme.spacing.md : 0,
                }}
              >
                {canUseNativeScanner ? (
                  <Icon
                    name="scan-outline"
                    size={keyboardVisible ? 28 : 56}
                    tone="onAccent"
                  />
                ) : (
                  <ActivityIndicator color={theme.colors.surface} />
                )}
                <Text variant="bodyStrong" tone="onAccent" align="center">
                  {canUseNativeScanner
                    ? "Scan SKU or QR code"
                    : "Camera scanner unavailable"}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.lg,
                gap: theme.spacing.sm,
                marginTop: theme.spacing.xl,
                padding: theme.spacing.md,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: theme.spacing.sm,
                }}
              >
                <Icon name="bulb" tone="accent" />
                <Text variant="body" style={{ flex: 1 }}>
                  {canUseNativeScanner
                    ? "Place the code inside the frame."
                    : "Enter the SKU manually, or allow camera access to scan."}
                </Text>
              </View>
              {!hasPermission ? (
                <Button
                  label="Allow Camera"
                  variant="secondary"
                  fullWidth
                  onPress={requestPermission}
                />
              ) : null}
              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                blurOnSubmit
                maxFontSizeMultiplier={1.3}
                onChangeText={setManualCode}
                onSubmitEditing={submitManualCode}
                placeholder="Enter SKU"
                placeholderTextColor={theme.colors.tertiaryText}
                returnKeyType="done"
                style={[
                  theme.typography.body,
                  {
                    backgroundColor: theme.colors.surfaceMuted,
                    borderRadius: theme.radius.md,
                    color: theme.colors.text,
                    minHeight: 48,
                    paddingHorizontal: theme.spacing.sm,
                  },
                ]}
                testID="sku-scanner-manual-code"
                value={manualCode}
              />
              <Button
                label="Use SKU"
                fullWidth
                onPress={submitManualCode}
                disabled={!canUseManualCode}
                leftIcon={<Icon name="barcode-outline" tone="onAccent" />}
                testID="sku-scanner-use-code"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type SkuStatus = { kind: "ok" | "warning" | "error"; message: string };

function getSkuStatus({
  existingProduct,
  intent,
  sku,
}: {
  existingProduct: ProductListItem | null;
  intent: SkuIntent;
  sku: string;
}): SkuStatus {
  if (!sku) return { kind: "warning", message: "SKU required" };
  if (!isValidSku(sku))
    return {
      kind: "error",
      message: "Use 1-64 chars: A-Z, numbers, dot, underscore, hyphen.",
    };
  if (existingProduct)
    return {
      kind: "ok",
      message: intent === "new" ? "Photo will be added to this product." : "Ready to save",
    };
  return { kind: "ok", message: "Ready to save" };
}

function RoundIcon({
  accessibilityLabel,
  icon,
  onPress,
}: {
  accessibilityLabel: string;
  icon: "pencil" | "ellipsis-horizontal";
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.pill,
        height: 44,
        justifyContent: "center",
        opacity: pressed ? 0.72 : 1,
        width: 44,
      })}
    >
      <Icon name={icon} size={18} tone="accent" />
    </Pressable>
  );
}

function VideoThumb() {
  const theme = useTheme();
  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: theme.colors.black,
        borderColor: theme.colors.accent,
        borderRadius: theme.radius.sm,
        borderWidth: 2,
        height: 64,
        justifyContent: "center",
        width: 64,
      }}
    >
      <Icon name="videocam" size={22} tone="onAccent" />
    </View>
  );
}

function parseOptionalNumber(value?: string | string[]): number | null {
  const raw = readParam(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function readParam(value?: string | string[]): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && raw.length ? raw : null;
}
