import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Icon, Text } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

import type { FilterSheetProps } from "@/src/components/ui/FilterSheet/FilterSheet.types";

export function FilterSheet({ groups, onClear, onClose, testID, title, visible }: FilterSheetProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible} testID={testID}>
      <Pressable accessibilityRole="button" onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.32)" }}>
        <Pressable onPress={(event) => event.stopPropagation()} style={{ marginTop: "auto" }}>
          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }}>
            <View style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
              <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="screenTitle">{title}</Text>
                <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
                  <Icon name="close" tone="secondary" />
                </Pressable>
              </View>
              {groups.map((group) => (
                <View key={group.title} style={{ gap: theme.spacing.sm }}>
                  <Text variant="sectionTitle">{group.title}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs }}>
                    {group.options.map((option) => {
                      const selected = option.value === group.value;
                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          onPress={() => group.onChange(option.value)}
                          style={({ pressed }) => ({
                            alignItems: "center",
                            backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceMuted,
                            borderColor: selected ? theme.colors.accentDark : theme.colors.border,
                            borderRadius: theme.radius.pill,
                            borderWidth: 1,
                            flexDirection: "row",
                            gap: theme.spacing.xxs,
                            opacity: pressed ? 0.75 : 1,
                            paddingHorizontal: theme.spacing.sm,
                            paddingVertical: theme.spacing.xs,
                          })}
                        >
                          {option.icon ? <Icon name={option.icon} size={16} tone={selected ? "onAccent" : "secondary"} /> : null}
                          <Text variant="button" tone={selected ? "onAccent" : "secondary"}>{option.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}><Button variant="secondary" label="Clear" onPress={onClear} fullWidth /></View>
                <View style={{ flex: 1 }}><Button label="Apply" onPress={onClose} fullWidth /></View>
              </View>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
