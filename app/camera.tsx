import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionSheet, Chip, Icon, Screen } from "@/src/components/ui";
import type { ActionSheetOption } from "@/src/components/ui";
import { isValidSku, normalizeSku } from "@/src/domain";
import { GemHubCameraView } from "@/src/features/camera/components/CameraView";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { useTheme } from "@/src/theme";

export default function CameraScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const entrance = useMemo(() => new Animated.Value(0), []);
  const { returnToProduct, sku } = useLocalSearchParams<{ returnToProduct?: string; sku?: string }>();
  const normalizedSku = normalizeSku(Array.isArray(sku) ? sku[0] : sku ?? "");
  const activeSku = isValidSku(normalizedSku) ? normalizedSku : undefined;
  const shouldReturnToProduct = returnToProduct === "1" && activeSku;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { importPhoto } = usePhotoImport(activeSku, { returnToProduct: !!shouldReturnToProduct });
  const settingsOptions: ActionSheetOption[] = useMemo(() => [
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "camera-header-library" },
  ], [importPhoto]);

  useEffect(() => {
    entrance.setValue(0);
    Animated.timing(entrance, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const entranceStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <Screen scroll={false} constrainContent={false} safeAreaEdges={["left", "right"]} contentStyle={{ padding: 0, gap: 0 }} testID="camera-screen">
      <Animated.View style={[{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 64, paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, paddingTop: Math.max(insets.top, 54) }, entranceStyle]}>
        <Pressable accessibilityLabel="Close Camera" accessibilityRole="button" hitSlop={theme.spacing.sm} onPress={() => shouldReturnToProduct ? router.replace({ pathname: "/product/[sku]", params: { sku: activeSku } }) : router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1, padding: theme.spacing.xs })} testID="camera-close-button">
          <Icon name="close" size={34} tone="secondary" />
        </Pressable>
        {activeSku ? <Chip label={`Adding to ${activeSku}`} tone="accent" /> : <View />}
        <Pressable accessibilityLabel="Camera Options" accessibilityRole="button" hitSlop={theme.spacing.sm} onPress={() => setSettingsOpen(true)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1, padding: theme.spacing.xs })} testID="camera-options-button">
          <Icon name="settings" size={30} tone="secondary" />
        </Pressable>
      </Animated.View>
      <Animated.View style={[{ flex: 1 }, entranceStyle]}>
        <GemHubCameraView returnToProduct={!!shouldReturnToProduct} sku={activeSku} />
      </Animated.View>
      <ActionSheet visible={settingsOpen} title="Camera options" options={settingsOptions} onClose={() => setSettingsOpen(false)} />
    </Screen>
  );
}
