import { Image } from "expo-image";
import { View } from "react-native";

import { Icon, Text } from "@/src/components/ui";
import type { MediaKind } from "@/src/domain";
import { useTheme } from "@/src/theme";

export function ProductHero({ kind, uri }: { uri: string | null; kind: MediaKind | null }) {
  const theme = useTheme();

  if (kind === "video") {
    return (
      <View style={{ alignItems: "center", aspectRatio: 1, backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, justifyContent: "center", overflow: "hidden", width: "100%" }}>
        <Icon name="play-circle" size={56} tone="onAccent" />
        <Text variant="metadata" tone="onAccent">Video</Text>
      </View>
    );
  }

  return (
    <View style={{ aspectRatio: 1, backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, borderRadius: theme.radius.lg, borderWidth: 1, justifyContent: "center", overflow: "hidden", width: "100%" }}>
      {uri ? (
        <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri }} style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} transition={120} />
      ) : (
        <Text variant="bodyStrong" tone="tertiary" align="center">No photo yet</Text>
      )}
    </View>
  );
}
