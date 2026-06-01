import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from "react-native-vision-camera";
import type { CameraDevice } from "react-native-vision-camera";

import { ActionSheet, Button, Card, Icon, Text } from "@/src/components/ui";
import type { ActionSheetOption, IoniconName } from "@/src/components/ui";
import { getPowerSaveWarning } from "@/src/lib/device/power";
import { storeMediaAsset } from "@/src/lib/files";
import { useTheme } from "@/src/theme";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";

const CAMERA_MOUNT_DELAY_MS = 250;

export function GemHubCameraView({ sku }: { sku?: string }) {
  const theme = useTheme();
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [focused, setFocused] = useState(false);
  const [canMountCamera, setCanMountCamera] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    return <SimulatorCaptureFallback sku={sku} />;
  }

  if (!focused || !canMountCamera) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color={theme.colors.accent} />
        <Text variant="bodyStrong">Preparing camera</Text>
      </View>
    );
  }

  return <StableCameraPreview device={device} sku={sku} />;
}

function SimulatorCaptureFallback({ sku }: { sku?: string }) {
  const theme = useTheme();
  const { importError, importing, importPhoto } = usePhotoImport(sku);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: "center", padding: theme.spacing.md }}>
      <Card style={{ gap: theme.spacing.md, padding: theme.spacing.lg }}>
        <Icon name="camera-outline" size={42} tone="accent" />
        <Text variant="screenTitle">No camera device</Text>
        <Text variant="body" tone="secondary">Simulator cannot expose a real rear camera. Use Photo Library here, or run on a real device for VisionCamera preview.</Text>
        {importError ? <Text variant="metadata" tone="danger">{importError}</Text> : null}
        <Button label="Choose from Library" loading={importing} onPress={importPhoto} fullWidth leftIcon={<Icon name="images-outline" tone="onAccent" />} />
      </Card>
    </View>
  );
}

function StableCameraPreview({ device, sku }: { device: CameraDevice; sku?: string }) {
  const theme = useTheme();
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.FHD_4_3,
    qualityPrioritization: "balanced",
  });
  const outputs = useMemo(() => [photoOutput], [photoOutput]);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { importPhoto } = usePhotoImport(sku);
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

      const photo = await photoOutput.capturePhotoToFile({ flashMode: "off" }, {});
      const stored = await storeMediaAsset({ uri: photo.filePath, kind: "image", mimeType: "image/jpeg" });
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
          compressed: stored.compressed ? "1" : "0",
        },
      });
    } catch (captureError) {
      setError(captureError instanceof Error ? captureError.message : "Capture failed.");
    } finally {
      setCapturing(false);
    }
  }, [capturing, photoOutput, ready, sku]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={[styles.preview, { backgroundColor: theme.colors.black }]}> 
        <Camera
          device={device}
          isActive
          onStarted={() => setReady(true)}
          onStopped={() => setReady(false)}
          onPreviewStarted={() => setReady(true)}
          onPreviewStopped={() => setReady(false)}
          outputs={outputs}
          resizeMode="cover"
          enableNativeTapToFocusGesture
          enableNativeZoomGesture
          style={StyleSheet.absoluteFill}
        />
        <View style={{ position: "absolute", left: theme.spacing.md, right: theme.spacing.md, bottom: theme.spacing.md, flexDirection: "row", justifyContent: "space-between" }}>
          <RoundControl icon="flash-off" accessibilityLabel="Torch Unavailable" />
          <RoundControl label="1×" />
          <RoundControl icon="settings-outline" onPress={() => setSettingsOpen(true)} accessibilityLabel="Camera Options" />
        </View>
        {!ready ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={theme.colors.surface} />
            <Text variant="bodyStrong" tone="onAccent">Starting camera</Text>
          </View>
        ) : null}
      </View>
      <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, marginTop: -theme.spacing.md, padding: theme.spacing.md, gap: theme.spacing.md }}>
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <Pill label="Camera ready" icon="camera-outline" />
          <Pill label="Photo mode" icon="image-outline" />
        </View>
        {error ? <Text variant="metadata" tone="danger">{error}</Text> : null}
        <View style={{ alignItems: "center", gap: theme.spacing.xs, paddingTop: theme.spacing.xs }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Take photo" disabled={!ready || capturing} onPress={capture} style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accent, borderColor: theme.colors.surface, borderRadius: theme.radius.pill, borderWidth: 4, height: 76, justifyContent: "center", opacity: pressed || capturing ? 0.72 : 1, width: 76 })}>
            {capturing ? <ActivityIndicator color={theme.colors.surface} /> : <Icon name="camera" size={30} tone="onAccent" />}
          </Pressable>
          <Text variant="metadata" tone="secondary">Photo</Text>
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

function Pill({ icon, label }: { icon: IoniconName; label: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md, flex: 1, flexDirection: "row", gap: theme.spacing.xs, justifyContent: "center", padding: theme.spacing.sm }}>
      <Icon name={icon} tone="secondary" size={16} />
      <Text variant="metadata" tone="secondary">{label}</Text>
    </View>
  );
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
  preview: {
    flex: 1,
    minHeight: 420,
    overflow: "hidden",
  },
});
