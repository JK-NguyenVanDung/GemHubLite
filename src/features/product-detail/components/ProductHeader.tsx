import { View } from "react-native";

import { Card, Chip, Icon, Text, Thumbnail } from "@/src/components/ui";
import type { MediaKind } from "@/src/domain";
import { useTheme } from "@/src/theme";

export function ProductHeader({ coverKind, coverUri, mediaCount, sku }: { sku: string; coverUri: string | null; coverKind?: MediaKind | null; mediaCount: number }) {
  const theme = useTheme();
  return (
    <Card style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
      <View style={{ flexDirection: "row", gap: theme.spacing.md }}>
        {coverKind === "video" ? <VideoCover /> : <Thumbnail source={coverUri ? { uri: coverUri } : undefined} placeholder="Photo" size="lg" radius="lg" />}
        <View style={{ flex: 1, gap: theme.spacing.xs, justifyContent: "center" }}>
          <Chip label={sku} tone="accent" />
          <Text variant="screenTitle" numberOfLines={2}>Product Detail</Text>
          <View style={{ flexDirection: "row", gap: theme.spacing.xs, alignItems: "center" }}>
            <Icon name="lock-closed-outline" size={14} tone="secondary" />
            <Text variant="metadata" tone="secondary">SKU locked</Text>
          </View>
          <Text variant="metadata" tone="secondary">{mediaCount} media item{mediaCount === 1 ? "" : "s"}</Text>
        </View>
      </View>
    </Card>
  );
}

function VideoCover() {
  const theme = useTheme();
  return (
    <View style={{ alignItems: "center", backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, height: 140, justifyContent: "center", width: 140 }}>
      <Icon name="play-circle" size={38} tone="onAccent" />
      <Text variant="metadata" tone="onAccent">Video</Text>
    </View>
  );
}
