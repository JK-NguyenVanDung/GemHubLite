import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ActionSheet, Icon } from "@/src/components/ui";
import type { ActionSheetOption } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { useTheme } from "@/src/theme";

const TILE = 72;

export function MediaStrip({ media, onSelect, selectedId, sku }: { media: Media[]; selectedId: string | null; onSelect: (id: string) => void; sku: string }) {
  const theme = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { importPhoto } = usePhotoImport(sku);

  const options: ActionSheetOption[] = useMemo(() => [
    { label: "Open Camera", icon: "camera-outline", onPress: () => router.push({ pathname: "/camera", params: { sku } }), testID: "add-photo-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "add-photo-library" },
  ], [importPhoto, sku]);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.xxs }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add photo to ${sku}`}
          onPress={() => setSheetOpen(true)}
          testID="media-strip-add"
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent, borderRadius: theme.radius.md, borderWidth: 1, height: TILE, justifyContent: "center", opacity: pressed ? 0.82 : 1, width: TILE })}
        >
          <Icon name="add" size={28} tone="accent" />
        </Pressable>
        {media.map((item) => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Show media for ${sku}`}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => ({ borderColor: active ? theme.colors.accent : theme.colors.border, borderRadius: theme.radius.md, borderWidth: active ? 2 : 1, height: TILE, opacity: pressed ? 0.82 : 1, overflow: "hidden", width: TILE })}
            >
              {item.kind === "video" ? (
                <View style={{ alignItems: "center", backgroundColor: theme.colors.black, flex: 1, justifyContent: "center" }}>
                  <Icon name="play-circle" size={24} tone="onAccent" />
                </View>
              ) : (
                <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri: item.uri }} style={{ flex: 1 }} transition={120} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <ActionSheet visible={sheetOpen} title={`Add photo to ${sku}`} options={options} onClose={() => setSheetOpen(false)} />
    </>
  );
}
