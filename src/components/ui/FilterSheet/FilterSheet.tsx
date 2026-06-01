import { BottomSheet, RNHostView } from "@expo/ui";
import { Pressable, useWindowDimensions, View } from "react-native";

import { Button, Icon, Text } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

import type { FilterSheetProps } from "@/src/components/ui/FilterSheet/FilterSheet.types";

export function FilterSheet({
  groups,
  onClear,
  onClose,
  testID,
  title,
  visible,
}: FilterSheetProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);

  return (
    <BottomSheet isPresented={visible} onDismiss={onClose} testID={testID}>
      <RNHostView matchContents testID={testID} style={{ width: sheetWidth }}>
        <View
          testID={testID}
          style={{ gap: theme.spacing.md, padding: theme.spacing.md, width: sheetWidth }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text variant="screenTitle">{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              onPress={onClose}
              hitSlop={10}
              style={{
                alignItems: "center",
                height: 44,
                justifyContent: "center",
                width: 44,
              }}
            >
              <Icon name="close" tone="secondary" />
            </Pressable>
          </View>
          {groups.map((group) => (
            <View key={group.title} style={{ gap: theme.spacing.sm }}>
              <Text variant="sectionTitle">{group.title}</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.xs,
                }}
              >
                {group.options.map((option) => {
                  const selected = option.value === group.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityLabel={`${group.title}: ${option.label}`}
                      accessibilityState={{ selected }}
                      onPress={() => group.onChange(option.value)}
                      style={({ pressed }) => ({
                        alignItems: "center",
                        backgroundColor: selected
                          ? theme.colors.accent
                          : theme.colors.surfaceMuted,
                        borderColor: selected
                          ? theme.colors.accentDark
                          : theme.colors.border,
                        borderRadius: theme.radius.pill,
                        borderWidth: 1,
                        flexDirection: "row",
                        gap: theme.spacing.xxs,
                        minHeight: 44,
                        opacity: pressed ? 0.75 : 1,
                        paddingHorizontal: theme.spacing.sm,
                        paddingVertical: theme.spacing.xs,
                      })}
                    >
                      {option.icon ? (
                        <Icon
                          name={option.icon}
                          size={16}
                          tone={selected ? "onAccent" : "secondary"}
                        />
                      ) : null}
                      <Text
                        variant="button"
                        tone={selected ? "onAccent" : "secondary"}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                variant="secondary"
                label="Clear"
                onPress={onClear}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Apply" onPress={onClose} fullWidth />
            </View>
          </View>
        </View>
      </RNHostView>
    </BottomSheet>
  );
}
