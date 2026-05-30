import { useMemo, useState } from "react";
import { View } from "react-native";

import { ActionSheet, Button, Card, Field, Picker, Text } from "@/src/components/ui";
import type { ActionSheetOption, IoniconName } from "@/src/components/ui";
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
  onSave: (patch: ProductPatch) => Promise<void>;
}

export function ProductFormSection({ error, initialDescription, initialTitle, initialType, onSave, saving }: ProductFormSectionProps) {
  const theme = useTheme();
  const [title, setTitle] = useState(initialTitle ?? "");
  const [type, setType] = useState<ProductType | null>(initialType);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);

  const typeLabel = useMemo(() => productTypes.find((item) => item.value === type)?.label, [type]);
  const typeOptions: ActionSheetOption[] = useMemo(() => productTypes.map((item) => ({ label: item.label, icon: item.icon, onPress: () => setType(item.value) })), []);
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
      <ActionSheet
        visible={typeSheetOpen}
        title="Select product type"
        onClose={() => setTypeSheetOpen(false)}
        options={typeOptions}
      />
    </Card>
  );
}

function clean(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}
