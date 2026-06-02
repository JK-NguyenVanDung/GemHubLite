import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, View } from "react-native";
import type { ListRenderItem } from "react-native";

import { ActionSheet, Icon } from "@/src/components/ui";
import type { ActionSheetOption } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { useCatalogNavigation } from "@/src/lib/navigation/catalogNavigation";
import { useTheme } from "@/src/theme";

const TILE = 72;
const keyMedia = (item: Media) => item.id;

export function MediaStrip({ media, onDeleteMedia, onDeleteProduct, onSelect, selectedId, sku }: { media: Media[]; selectedId: string | null; onDeleteMedia: (id: string) => Promise<void>; onDeleteProduct: () => void; onSelect: (id: string) => void; sku: string }) {
  const theme = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { importPhoto } = usePhotoImport(sku);
  const { openCreateProduct } = useCatalogNavigation();

  const options: ActionSheetOption[] = useMemo(() => [
    { label: "Add Photo with Camera", icon: "camera-outline", onPress: () => openCreateProduct(sku), testID: "add-photo-camera" },
    { label: "Add Photo from Library", icon: "images-outline", onPress: importPhoto, testID: "add-photo-library" },
  ], [importPhoto, openCreateProduct, sku]);

  const confirmProductDelete = useCallback(() => {
    Alert.alert("Delete product?", `${sku} has one image left. Delete the product instead?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete Product", style: "destructive", onPress: () => void onDeleteProduct() },
    ]);
  }, [onDeleteProduct, sku]);

  const confirmMediaDelete = useCallback((item: Media) => {
    if (media.length <= 1) {
      confirmProductDelete();
      return;
    }

    Alert.alert("Remove image?", "This removes the image from this product.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          setDeletingId(item.id);
          try {
            await onDeleteMedia(item.id);
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }, [confirmProductDelete, media.length, onDeleteMedia]);

  const listHeader = useMemo(() => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add photo to ${sku}`}
      onPress={() => setSheetOpen(true)}
      testID="media-strip-add"
      style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent, borderRadius: theme.radius.md, borderWidth: 1, height: TILE, justifyContent: "center", opacity: pressed ? 0.82 : 1, width: TILE })}
    >
      <Icon name="add" size={28} tone="accent" />
    </Pressable>
  ), [sku, theme.colors.accent, theme.colors.accentSoft, theme.radius.md]);

  const renderItem: ListRenderItem<Media> = useCallback(({ item }) => {
    const active = item.id === selectedId;

    return (
      <Pressable
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove media from ${sku}`}
          hitSlop={8}
          onPress={() => setEditingMedia(item)}
          testID={`media-strip-remove-${item.id}`}
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: 14, borderWidth: 1, height: 28, justifyContent: "center", opacity: pressed ? 0.78 : 0.96, position: "absolute", right: 4, top: 4, width: 28 })}
        >
          {deletingId === item.id ? <ActivityIndicator size="small" /> : <Icon name="pencil" size={15} tone="primary" />}
        </Pressable>
      </Pressable>
    );
  }, [deletingId, onSelect, selectedId, sku, theme.colors.accent, theme.colors.black, theme.colors.border, theme.colors.surface, theme.radius.md]);

  return (
    <>
      <FlatList
        horizontal
        data={media}
        keyExtractor={keyMedia}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.xxs }}
        ListHeaderComponent={listHeader}
        renderItem={renderItem}
      />
      <ActionSheet visible={sheetOpen} title={`Add photo to ${sku}`} options={options} onClose={() => setSheetOpen(false)} />
      <ActionSheet
        visible={!!editingMedia}
        title="Edit photo"
        options={editingMedia ? [{ label: "Remove Asset", icon: "trash-outline", destructive: true, onPress: () => confirmMediaDelete(editingMedia), testID: `media-strip-delete-${editingMedia.id}` }] : []}
        onClose={() => setEditingMedia(null)}
      />
    </>
  );
}
