import { BottomSheet, RNHostView } from "@expo/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useTheme } from "@/src/theme";
import { BottomSaveBar } from "@/src/features/camera/components/BottomSaveBar";
import { useCaptureSave } from "@/src/features/camera/hooks/useCaptureSave";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";

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
  const [skuPrefix, setSkuPrefix] = useState("SKU");
  const [skuDateKey, setSkuDateKey] = useState(formatDateKey(new Date()));
  const [skuSequence, setSkuSequence] = useState("001");
  const [skuSuffix, setSkuSuffix] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { save } = useCaptureSave(uri);
  const { importPhoto } = usePhotoImport(initialValidSku || undefined);

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
        label: "Choose Different Photo",
        icon: "images-outline",
        onPress: importPhoto,
        testID: "capture-choose-another-photo",
      },
      {
        label: "Take New Photo",
        icon: "camera-outline",
        onPress: () =>
          router.replace(
            initialValidSku
              ? { pathname: "/camera", params: { sku: initialValidSku } }
              : "/camera",
          ),
        testID: "capture-retake-camera",
      },
    ],
    [importPhoto, initialValidSku],
  );
  const typeLabel = useMemo(
    () => productTypes.find((option) => option.value === type)?.label,
    [type],
  );
  const normalizedSku = normalizeSku(sku);
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
    Boolean(uri) && isValidSku(normalizedSku) && skuStatus.kind !== "error";

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
    hydrateGeneratedParts(nextSku);
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
    setSkuFlowOpen(false);
  }

  function composeSkuFromParts(
    nextPrefix = skuPrefix,
    nextDateKey = skuDateKey,
    nextSequence = skuSequence,
    nextSuffix = skuSuffix,
  ) {
    const paddedSequence = String(
      Math.max(1, Number.parseInt(nextSequence, 10) || 1),
    ).padStart(3, "0");
    return normalizeSku(
      [nextPrefix, nextDateKey, paddedSequence, nextSuffix]
        .filter(Boolean)
        .join("-"),
    );
  }

  function hydrateGeneratedParts(nextSku: string) {
    const [
      prefix = "SKU",
      dateKey = formatDateKey(new Date()),
      sequence = "001",
      ...suffixParts
    ] = normalizeSku(nextSku).split("-");
    setSkuPrefix(prefix);
    setSkuDateKey(dateKey);
    setSkuSequence(sequence.padStart(3, "0"));
    setSkuSuffix(suffixParts.join("-"));
  }

  function updateGeneratedPart(
    part: "prefix" | "date" | "sequence" | "suffix",
    value: string,
  ) {
    const nextPrefix = part === "prefix" ? normalizeSku(value) : skuPrefix;
    const nextDateKey =
      part === "date" ? value.replace(/\D/g, "").slice(0, 8) : skuDateKey;
    const nextSequence =
      part === "sequence" ? value.replace(/\D/g, "").slice(0, 6) : skuSequence;
    const nextSuffix = part === "suffix" ? normalizeSku(value) : skuSuffix;

    setSkuPrefix(nextPrefix);
    setSkuDateKey(nextDateKey);
    setSkuSequence(nextSequence);
    setSkuSuffix(nextSuffix);
    applyNewSku(
      composeSkuFromParts(nextPrefix, nextDateKey, nextSequence, nextSuffix),
    );
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
        media: mediaMetadata,
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
          <View
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
            <Icon name="add-circle" size={24} tone="secondary" />
          </View>
          {mediaKind === "image" ? (
            <Thumbnail source={{ uri }} selected size="sm" />
          ) : (
            <VideoThumb />
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
            label="Choose SKU"
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
        title="Photo actions"
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
          composedSku={composeSkuFromParts()}
          existingProducts={existingProducts}
          intent={skuIntent}
          onApply={() => setSkuFlowOpen(false)}
          onChangeGeneratedPart={updateGeneratedPart}
          onChangeManualSku={(value) => applyNewSku(value)}
          onClose={() => setSkuFlowOpen(false)}
          onGenerate={generate}
          onOpenScanner={() => setScannerOpen(true)}
          onSelectExisting={applyExistingSku}
          sku={normalizedSku}
          skuDateKey={skuDateKey}
          skuPrefix={skuPrefix}
          skuSequence={skuSequence}
          skuStatus={skuStatus}
          skuSuffix={skuSuffix}
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
  composedSku,
  existingProducts,
  intent,
  onApply,
  onChangeGeneratedPart,
  onChangeManualSku,
  onClose,
  onGenerate,
  onOpenScanner,
  onSelectExisting,
  sku,
  skuDateKey,
  skuPrefix,
  skuSequence,
  skuStatus,
  skuSuffix,
}: {
  composedSku: string;
  existingProducts: ProductListItem[];
  intent: SkuIntent;
  onApply: () => void;
  onChangeGeneratedPart: (
    part: "prefix" | "date" | "sequence" | "suffix",
    value: string,
  ) => void;
  onChangeManualSku: (value: string) => void;
  onClose: () => void;
  onGenerate: () => Promise<void>;
  onOpenScanner: () => void;
  onSelectExisting: (sku: string) => void;
  sku: string;
  skuDateKey: string;
  skuPrefix: string;
  skuSequence: string;
  skuStatus: SkuStatus;
  skuSuffix: string;
}) {
  const theme = useTheme();
  const layout = useResponsiveLayout();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);
  const [query, setQuery] = useState(sku);
  const normalizedQuery = normalizeSku(query);
  const filteredProducts = useMemo(
    () =>
      existingProducts.filter((product) =>
        product.sku.includes(normalizedQuery),
      ),
    [existingProducts, normalizedQuery],
  );
  const exactProduct = useMemo(
    () =>
      existingProducts.find((product) => product.sku === normalizedQuery) ??
      null,
    [existingProducts, normalizedQuery],
  );
  const ctaLabel =
    normalizedQuery && !exactProduct ? "Use This SKU" : "Generate SKU";
  const canApply = isValidSku(sku) && skuStatus.kind !== "error";

  function changeQuery(value: string) {
    setQuery(value);
    onChangeManualSku(value);
  }

  async function handlePrimarySkuAction() {
    if (normalizedQuery && !exactProduct) {
      onChangeManualSku(normalizedQuery);
      onApply();
      return;
    }

    await onGenerate();
  }

  return (
    <BottomSheet isPresented onDismiss={onClose} snapPoints={[{ fraction: 0.88 }]}>
      <RNHostView matchContents style={{ width: sheetWidth }}>
        <View style={{ width: sheetWidth }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: theme.colors.surface,
              flexDirection: "row",
              justifyContent: "space-between",
              padding: theme.spacing.md,
            }}
          >
            <Button label="Cancel" variant="ghost" size="sm" onPress={onClose} />
            <Text variant="screenTitle">Choose SKU</Text>
            <Button
              label="Apply"
              variant="ghost"
              size="sm"
              disabled={!canApply}
              onPress={onApply}
            />
          </View>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{
              alignSelf: "center",
              gap: layout.contentGap,
              maxWidth: layout.contentMaxWidth,
              padding: layout.pagePadding,
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
              label={ctaLabel}
              variant="secondary"
              fullWidth
              onPress={() => void handlePrimarySkuAction()}
              leftIcon={<Icon name="sparkles-outline" tone="accent" />}
            />
            {normalizedQuery && !exactProduct ? (
              <View
                style={{
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  minHeight: 220,
                  justifyContent: "center",
                }}
              >
                <Icon name="diamond-outline" size={76} tone="tertiary" />
                <Text variant="bodyStrong" align="center">
                  {normalizedQuery} does not exist
                </Text>
              </View>
            ) : filteredProducts.length ? (
              <View style={{ gap: theme.spacing.sm }}>
                {filteredProducts.map((product) => (
                  <Pressable
                    key={product.sku}
                    accessibilityRole="button"
                    accessibilityLabel={`Use existing SKU ${product.sku}`}
                    onPress={() => {
                      setQuery(product.sku);
                      onSelectExisting(product.sku);
                      onApply();
                    }}
                    style={({ pressed }) => ({
                      alignItems: "center",
                      flexDirection: "row",
                      gap: theme.spacing.md,
                      minHeight: 44,
                      opacity: pressed ? 0.78 : 1,
                      paddingVertical: theme.spacing.xs,
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
                      <Text variant="screenTitle" selectable>
                        {product.sku}
                      </Text>
                      <Text variant="metadata" tone="secondary">
                        {product.title || "Untitled product"} ·{" "}
                        {product.mediaCount} media
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  gap: theme.spacing.sm,
                  minHeight: 220,
                  justifyContent: "center",
                }}
              >
                <Icon name="diamond-outline" size={76} tone="tertiary" />
                <Text variant="bodyStrong" align="center">
                  No SKUs yet
                </Text>
                <Text variant="body" tone="secondary" align="center">
                  Add or scan a SKU to continue.
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <View style={{ flex: 0.8 }}>
                <Field
                  label="Prefix"
                  value={skuPrefix}
                  onChangeText={(value) =>
                    onChangeGeneratedPart("prefix", value)
                  }
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
              </View>
              <View style={{ flex: 1.2 }}>
                <Field
                  label="Date"
                  value={skuDateKey}
                  onChangeText={(value) => onChangeGeneratedPart("date", value)}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 0.8 }}>
                <Field
                  label="Seq"
                  value={skuSequence}
                  onChangeText={(value) =>
                    onChangeGeneratedPart("sequence", value)
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <Text variant="metadata" tone="tertiary">
              Next generated preview: {composedSku}
            </Text>
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
  const [manualCode, setManualCode] = useState("UN-0008");
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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
        <View style={StyleSheet.absoluteFill} />
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
                onSubmitEditing={() => onScanned(manualCode)}
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
                onPress={() => onScanned(manualCode)}
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

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}${month}${day}`;
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
