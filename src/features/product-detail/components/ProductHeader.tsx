import { useWindowDimensions, View } from "react-native";

import { Card, Chip, Icon, Text, Thumbnail } from "@/src/components/ui";
import type { MediaKind } from "@/src/domain";
import { useTheme } from "@/src/theme";

export function ProductHeader({ coverKind, coverUri, mediaCount, sku }: { sku: string; coverUri: string | null; coverKind?: MediaKind | null; mediaCount: number }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const coverSize = width < 360 ? 112 : 140;

  return (
    <Card style={{ gap: theme.spacing.md }}>
      <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
        {coverKind === "video" ? <VideoCover dimension={coverSize} /> : <Thumbnail source={coverUri ? { uri: coverUri } : undefined} placeholder="Photo" size="lg" dimension={coverSize} radius="lg" />}
        <View style={{ flex: 1, gap: theme.spacing.xs, justifyContent: "center" }}>
          <Chip label={sku} tone="accent" />
          <Text variant="screenTitle" numberOfLines={2}>Product Detail</Text>
          <Text variant="metadata" tone="secondary">{mediaCount} media item{mediaCount === 1 ? "" : "s"}</Text>
        </View>
      </View>
    </Card>
  );
}

function VideoCover({ dimension }: { dimension: number }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, height: dimension, justifyContent: "center", width: dimension }}>
      <Icon name="play-circle" size={38} tone="onAccent" />
      <Text variant="metadata" tone="onAccent">Video</Text>
    </View>
  );
}
