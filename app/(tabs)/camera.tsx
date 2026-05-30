import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

import { Chip, Screen, Text } from "@/src/components/ui";
import { GemHubCameraView } from "@/src/features/camera/components/CameraView";
import { useTheme } from "@/src/theme";

export default function CameraScreen() {
  const theme = useTheme();
  const { sku } = useLocalSearchParams<{ sku?: string }>();
  const activeSku = Array.isArray(sku) ? sku[0] : sku;

  return (
    <Screen scroll={false} contentStyle={{ padding: 0, gap: 0 }} testID="camera-screen">
      <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, gap: theme.spacing.xs }}>
        <Text variant="screenTitle">Camera</Text>
        {activeSku ? <Chip label={`Adding to ${activeSku}`} tone="accent" /> : null}
      </View>
      <GemHubCameraView sku={activeSku} />
    </Screen>
  );
}
