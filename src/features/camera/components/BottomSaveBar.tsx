import { View } from "react-native";

import { Button } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

export function BottomSaveBar({ canSave, onSave, saving }: { canSave: boolean; onSave: () => void; saving: boolean }) {
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, borderTopWidth: 1, padding: theme.spacing.md }}>
      <Button disabled={!canSave || saving} fullWidth label="Save" loading={saving} onPress={onSave} size="lg" />
    </View>
  );
}
