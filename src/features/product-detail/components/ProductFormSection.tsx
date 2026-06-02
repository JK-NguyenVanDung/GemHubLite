import { useMemo, useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";
import { BottomSheet, RNHostView } from "@expo/ui";

import { Button, Card, Field, Icon, Picker, Text } from "@/src/components/ui";
import type { IoniconName } from "@/src/components/ui";
import type { ProductPatch, ProductType } from "@/src/domain";
import { useTheme } from "@/src/theme";

const productTypes: { value: ProductType; label: string; icon: IoniconName }[] = [
  { value: "ring", label: "Ring", icon: "ellipse-outline" },
  { value: "necklace", label: "Necklace", icon: "link-outline" },
  { value: "earring", label: "Earring", icon: "radio-button-off-outline" },
  { value: "bracelet", label: "Bracelet", icon: "sync-circle-outline" },
  { value: "pendant", label: "Pendant", icon: "diamond-outline" },
  { value: "other", label: "Other", icon: "cube-outline" },
];

export interface ProductFormSectionProps {
  initialTitle: string | null;
  initialType: ProductType | null;
  initialDescription: string | null;
  saving: boolean;
  error: string | null;
  onSave: (patch: ProductPatch) => Promise<boolean>;
  onDeleteProduct: () => void;
}

export function ProductFormSection({ error, initialDescription, initialTitle, initialType, onDeleteProduct, onSave, saving }: ProductFormSectionProps) {
  const theme = useTheme();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [type, setType] = useState<ProductType | null>(initialType);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);

  const typeLabel = useMemo(() => productTypes.find((item) => item.value === type)?.label, [type]);
  const dirty = title !== (initialTitle ?? "") || type !== initialType || description !== (initialDescription ?? "");

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <Text variant="sectionTitle">Product details</Text>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="Add product title" />
      <Picker label="Product type" value={typeLabel} placeholder="Select type" onPress={() => setTypeSheetOpen(true)} />
      <Field label="Description" multiline numberOfLines={4} value={description} onChangeText={setDescription} placeholder="Add short description" />
      {error ? <Text variant="metadata" tone="danger">{error}</Text> : null}
      <View style={{ paddingTop: theme.spacing.xs }}>
        <Button fullWidth label="Save changes" disabled={!dirty || saving} loading={saving} onPress={() => onSave({ title: clean(title), type, description: clean(description) })} />
      </View>
      <Button fullWidth label="Delete product" variant="danger" onPress={onDeleteProduct} testID="product-delete-button" />
      <ProductTypeSheet
        selectedType={type}
        visible={typeSheetOpen}
        onClose={() => setTypeSheetOpen(false)}
        onSelect={(nextType) => {
          setType(nextType);
          setTypeSheetOpen(false);
        }}
      />
    </Card>
  );
}

function ProductTypeSheet({ onClose, onSelect, selectedType, visible }: { visible: boolean; selectedType: ProductType | null; onClose: () => void; onSelect: (type: ProductType) => void }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);

  return (
    <BottomSheet isPresented={visible} onDismiss={onClose} testID="product-type-sheet">
      <RNHostView matchContents testID="product-type-sheet-content" style={{ width: sheetWidth }}>
        <View style={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.md, width: sheetWidth }}>
          <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 }}>
            <Text variant="screenTitle">Product type</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close product type picker" hitSlop={10} onPress={onClose} style={{ alignItems: "center", height: 44, justifyContent: "center", width: 44 }}>
              <Icon name="close" tone="secondary" />
            </Pressable>
          </View>
          <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radius.lg, borderWidth: 1, overflow: "hidden" }}>
            {productTypes.map((item, index) => {
              const selected = item.value === selectedType;

              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.label}`}
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(item.value)}
                  style={({ pressed }) => ({
                    alignItems: "center",
                    backgroundColor: selected ? theme.colors.accentSoft : theme.colors.surface,
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: index === productTypes.length - 1 ? 0 : 1,
                    flexDirection: "row",
                    gap: theme.spacing.sm,
                    minHeight: 56,
                    opacity: pressed ? 0.78 : 1,
                    paddingHorizontal: theme.spacing.md,
                  })}
                >
                  <Icon name={item.icon} tone={selected ? "accent" : "secondary"} />
                  <Text variant="bodyStrong" style={{ flex: 1 }}>{item.label}</Text>
                  {selected ? <Icon name="checkmark-circle" tone="accent" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

function clean(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
