import { BottomSheet, RNHostView } from "@expo/ui";
import { useState } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

import { Button, Icon, Text } from "@/src/components/ui";
import { useTheme } from "@/src/theme";

import type { FilterSheetProps } from "@/src/components/ui/FilterSheet/FilterSheet.types";

export function FilterSheet({
  groups,
  onClose,
  testID,
  title,
  visible,
}: FilterSheetProps) {
  return (
    <BottomSheet isPresented={visible} onDismiss={onClose} testID={testID}>
      {visible ? (
        <FilterSheetContent
          groups={groups}
          onClose={onClose}
          testID={testID}
          title={title}
        />
      ) : null}
    </BottomSheet>
  );
}

type FilterSheetContentProps = Pick<
  FilterSheetProps,
  "groups" | "onClose" | "testID" | "title"
>;

function FilterSheetContent({
  groups,
  onClose,
  testID,
  title,
}: FilterSheetContentProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(groups.map((group) => [group.title, group.value])),
  );

  const clearDraft = () => {
    setDraftValues(
      Object.fromEntries(
        groups.map((group) => [group.title, group.options[0]?.value ?? group.value]),
      ),
    );
  };

  const applyDraft = () => {
    groups.forEach((group) => {
      group.onChange(draftValues[group.title] ?? group.value);
    });
    onClose();
  };

  return (
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
                  const selected = option.value === (draftValues[group.title] ?? group.value);
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="button"
                      accessibilityLabel={`${group.title}: ${option.label}`}
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setDraftValues((values) => ({
                          ...values,
                          [group.title]: option.value,
                        }));
                      }}
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
                onPress={clearDraft}
                fullWidth
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Apply" onPress={applyDraft} fullWidth />
            </View>
          </View>
        </View>
    </RNHostView>
  );
}
