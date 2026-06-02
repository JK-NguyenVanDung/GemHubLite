import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import type { CameraDevice } from "react-native-vision-camera";
import type { CameraRef } from "react-native-vision-camera/src/views/Camera";

import { ActionSheet, Button, Card, Icon, Text } from "@/src/components/ui";
import type { ActionSheetOption, IoniconName } from "@/src/components/ui";
import { getPowerSaveWarning } from "@/src/lib/device/power";
import { storeMediaAsset } from "@/src/lib/files";
import { useTheme } from "@/src/theme";
import { appendCaptureDraftMedia } from "@/src/features/camera/captureDraft";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";

const CAMERA_MOUNT_DELAY_MS = 250;
const ZOOM_PRESETS = [0.5, 1, 2, 3];
const FOCUS_RING_SIZE = 68;
const FOCUS_RING_DURATION_MS = 900;

export function GemHubCameraView({ returnToProduct = false, sku }: { returnToProduct?: boolean; sku?: string }) {
  const theme = useTheme();
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [focused, setFocused] = useState(false);
  const [canMountCamera, setCanMountCamera] = useState(false);
  const [cameraSession, setCameraSession] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCanMountCamera(false);
      setCameraSession((session) => session + 1);
      setFocused(true);
      return () => {
        setFocused(false);
        setCanMountCamera(false);
      };
    }, []),
  );

  useEffect(() => {
    if (!focused || !hasPermission || !device) {
      return;
    }

    const timer = setTimeout(() => setCanMountCamera(true), CAMERA_MOUNT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [device, focused, hasPermission]);

  if (!hasPermission) {
    return (
      <View style={{ flex: 1, padding: theme.spacing.md, justifyContent: "center" }}>
        <Card style={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
          <Text variant="screenTitle">Camera access</Text>
          <Text variant="body" tone="secondary">Allow camera to capture SKU-ready jewelry photos.</Text>
          <Button label="Allow Camera" onPress={requestPermission} fullWidth />
        </Card>
      </View>
    );
  }

  if (!device) {
    return <SimulatorCaptureFallback key={`fallback-${cameraSession}`} returnToProduct={returnToProduct} sku={sku} />;
  }

  if (!focused || !canMountCamera) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color={theme.colors.accent} />
        <Text variant="bodyStrong">Preparing camera</Text>
      </View>
    );
  }

  return <StableCameraPreview key={`camera-${device.id}-${cameraSession}`} device={device} returnToProduct={returnToProduct} sku={sku} />;
}

function SimulatorCaptureFallback({ returnToProduct, sku }: { returnToProduct: boolean; sku?: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { importError, importing, importPhoto } = usePhotoImport(sku, { returnToProduct });

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.preview, { alignItems: "center", backgroundColor: theme.colors.black, justifyContent: "center" }]}> 
        <View style={{ alignItems: "center", gap: theme.spacing.sm, padding: theme.spacing.lg }}>
          <Icon name="camera-outline" size={42} tone="onAccent" />
          <Text variant="bodyStrong" tone="onAccent">Camera unavailable</Text>
          <Text variant="metadata" tone="onAccent" style={{ textAlign: "center" }}>Use Library to validate capture flow in Simulator.</Text>
        </View>
        <View style={{ position: "absolute", left: theme.spacing.md, right: theme.spacing.md, bottom: theme.spacing.xl, flexDirection: "row", justifyContent: "space-between" }}>
          <RoundControl icon="flash-off" accessibilityLabel="Flash unavailable" />
          <RoundControl label="1×" accessibilityLabel="Zoom unavailable" />
          <RoundControl icon="images-outline" onPress={importPhoto} accessibilityLabel="Choose from Library" />
        </View>
      </View>
      <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.md, paddingBottom: Math.max(theme.spacing.md, insets.bottom + theme.spacing.xs), gap: theme.spacing.sm }}>
        {importError ? <Text variant="metadata" tone="danger">{importError}</Text> : null}
        <View style={{ alignItems: "center", gap: theme.spacing.xs }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Choose from Library" disabled={importing} onPress={importPhoto} style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accent, borderColor: theme.colors.surface, borderRadius: theme.radius.pill, borderWidth: 4, height: 76, justifyContent: "center", opacity: pressed || importing ? 0.72 : 1, width: 76 })}>
            {importing ? <ActivityIndicator color={theme.colors.surface} /> : <Icon name="images-outline" size={30} tone="onAccent" />}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function StableCameraPreview({ device, returnToProduct, sku }: { device: CameraDevice; returnToProduct: boolean; sku?: string }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.FHD_4_3,
    qualityPrioritization: "balanced",
  });
  const outputs = useMemo(() => [photoOutput], [photoOutput]);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoom, setZoom] = useState(() => clampZoom(1, device.minZoom, device.maxZoom));
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { importPhoto } = usePhotoImport(sku, { returnToProduct });
  const availableZooms = useMemo(
    () => ZOOM_PRESETS.filter((preset) => preset >= device.minZoom && preset <= device.maxZoom),
    [device.maxZoom, device.minZoom],
  );
  const settingsOptions: ActionSheetOption[] = useMemo(() => [
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "camera-library" },
  ], [importPhoto]);

  const capture = useCallback(async () => {
    if (!ready || capturing) return;

    setCapturing(true);
    setError(null);

    try {
      const powerWarning = await getPowerSaveWarning();
      if (powerWarning) {
        setError(powerWarning);
      }

      const photo = await photoOutput.capturePhotoToFile({ flashMode: flashEnabled && device.hasFlash ? "on" : "off" }, {});
      const stored = await storeMediaAsset({ uri: photo.filePath, kind: "image", mimeType: "image/jpeg" });
      const media = {
        uri: stored.uri,
        kind: stored.kind,
        mimeType: stored.mimeType,
        originalBytes: stored.originalBytes ?? null,
        storedBytes: stored.storedBytes ?? null,
        width: stored.width ?? null,
        height: stored.height ?? null,
        durationMs: stored.durationMs ?? null,
        compressed: stored.compressed,
      };
      // If we got here from an existing review draft (the "Add Photo with
      // Camera" path), append to that draft and pop back to it so prior media
      // and form fields survive instead of being replaced by a fresh review.
      if (appendCaptureDraftMedia(media)) {
        router.back();
        return;
      }
      router.push({
        pathname: "/capture-preview",
        params: {
          ...(sku ? { sku } : {}),
          ...(returnToProduct ? { returnToProduct: "1" } : {}),
          uri: stored.uri,
          kind: stored.kind,
          mimeType: stored.mimeType,
          originalBytes: stored.originalBytes?.toString() ?? "",
          storedBytes: stored.storedBytes?.toString() ?? "",
          width: stored.width?.toString() ?? "",
          height: stored.height?.toString() ?? "",
          compressed: stored.compressed ? "1" : "0",
        },
      });
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Capture failed.");
    } finally {
      setCapturing(false);
    }
  }, [capturing, device.hasFlash, flashEnabled, photoOutput, ready, returnToProduct, sku]);

  const toggleFlash = useCallback(() => {
    if (!device.hasFlash && !device.hasTorch) {
      setError("Flash is not available on this camera.");
      return;
    }

    setError(null);
    setFlashEnabled((enabled) => !enabled);
  }, [device.hasFlash, device.hasTorch]);

  const cycleZoom = useCallback(() => {
    setError(null);
    setZoom((currentZoom) => {
      const presets = availableZooms.length > 0 ? availableZooms : [clampZoom(1, device.minZoom, device.maxZoom)];
      const currentIndex = presets.findIndex((preset) => Math.abs(preset - currentZoom) < 0.01);
      const nextIndex = currentIndex === -1 || currentIndex === presets.length - 1 ? 0 : currentIndex + 1;
      return presets[nextIndex];
    });
  }, [availableZooms, device.maxZoom, device.minZoom]);

  const focusAt = useCallback(async (x: number, y: number) => {
    setFocusPoint({ x, y });

    if (!device.supportsFocusMetering && !device.supportsExposureMetering) {
      setError("Tap focus is not available on this camera.");
      return;
    }

    try {
      setError(null);
      await cameraRef.current?.focusTo(
        { x, y },
        {
          adaptiveness: "continuous",
          autoResetAfter: 4,
          modes: getFocusModes(device),
          responsiveness: "snappy",
        },
      );
    } catch (focusError) {
      setError(focusError instanceof Error ? focusError.message : "Tap focus failed.");
    }
  }, [device]);

  useEffect(() => {
    if (!focusPoint) return;

    const timer = setTimeout(() => setFocusPoint(null), FOCUS_RING_DURATION_MS);
    return () => clearTimeout(timer);
  }, [focusPoint]);

  return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Pressable
        accessibilityLabel="Camera preview"
        accessibilityRole="button"
        onPress={(event) => focusAt(event.nativeEvent.locationX, event.nativeEvent.locationY)}
        style={[styles.preview, { backgroundColor: theme.colors.black }]}
      >
        <Camera
          key={device.id}
          ref={cameraRef}
          device={device}
          isActive
          onStarted={() => setReady(true)}
          onStopped={() => setReady(false)}
          onPreviewStarted={() => setReady(true)}
          onPreviewStopped={() => setReady(false)}
          outputs={outputs}
          resizeMode="cover"
          torchMode={flashEnabled && device.hasTorch ? "on" : "off"}
          zoom={zoom}
          enableNativeTapToFocusGesture
          style={StyleSheet.absoluteFill}
        />
        {focusPoint ? <View pointerEvents="none" style={[styles.focusRing, { borderColor: theme.colors.surface, left: focusPoint.x - FOCUS_RING_SIZE / 2, top: focusPoint.y - FOCUS_RING_SIZE / 2 }]} /> : null}
        <View style={{ position: "absolute", left: theme.spacing.md, right: theme.spacing.md, bottom: theme.spacing.xl, flexDirection: "row", justifyContent: "space-between" }}>
          <RoundControl active={flashEnabled} icon={flashEnabled ? "flash" : "flash-off"} onPress={toggleFlash} accessibilityLabel={flashEnabled ? "Turn flash off" : "Turn flash on"} />
          <RoundControl label={`${formatZoom(zoom)}×`} onPress={cycleZoom} accessibilityLabel="Change zoom" />
          <RoundControl icon="images-outline" onPress={() => setSettingsOpen(true)} accessibilityLabel="Camera Options" />
        </View>
        {!ready ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={theme.colors.surface} />
            <Text variant="bodyStrong" tone="onAccent">Starting camera</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.md, paddingBottom: Math.max(theme.spacing.md, insets.bottom + theme.spacing.xs), gap: theme.spacing.sm }}>
        {error ? <Text variant="metadata" tone="danger">{error}</Text> : null}
        <View style={{ alignItems: "center", gap: theme.spacing.xs }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Take photo" disabled={!ready || capturing} onPress={capture} style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accent, borderColor: theme.colors.surface, borderRadius: theme.radius.pill, borderWidth: 4, height: 76, justifyContent: "center", opacity: pressed || capturing ? 0.72 : 1, width: 76 })}>
            {capturing ? <ActivityIndicator color={theme.colors.surface} /> : <Icon name="camera" size={30} tone="onAccent" />}
          </Pressable>
        </View>
      </View>
      <ActionSheet visible={settingsOpen} title="Camera options" options={settingsOptions} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

function RoundControl({ accessibilityLabel, active = false, icon, label, onPress }: { accessibilityLabel?: string; active?: boolean; icon?: IoniconName; label?: string; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} disabled={!onPress} onPress={onPress} style={({ pressed }) => ({ alignItems: "center", backgroundColor: active ? theme.colors.accent : "rgba(8, 13, 26, 0.58)", borderRadius: theme.radius.pill, height: 44, justifyContent: "center", opacity: pressed ? 0.72 : 1, width: 44 })}>
      {icon ? <Icon name={icon} tone="onAccent" size={17} /> : <Text variant="metadata" tone="onAccent">{label}</Text>}
    </Pressable>
  );
}

function clampZoom(value: number, minZoom: number, maxZoom: number) {
  return Math.min(Math.max(value, minZoom), maxZoom);
}

function formatZoom(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getFocusModes(device: CameraDevice) {
  return [
    ...(device.supportsExposureMetering ? ["AE" as const] : []),
    ...(device.supportsFocusMetering ? ["AF" as const] : []),
    ...(device.supportsWhiteBalanceMetering ? ["AWB" as const] : []),
  ];
}

const styles = StyleSheet.create({
  centeredState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  overlay: {
    alignItems: "center",
    bottom: 0,
    gap: 12,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  focusRing: {
    borderRadius: FOCUS_RING_SIZE / 2,
    borderWidth: 2,
    height: FOCUS_RING_SIZE,
    position: "absolute",
    width: FOCUS_RING_SIZE,
  },
  preview: {
    flex: 1,
    minHeight: 420,
    overflow: "hidden",
  },
});
