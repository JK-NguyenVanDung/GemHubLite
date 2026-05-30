import { Fragment } from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/src/components/ui/Icon/Icon";
import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { ActionSheetOption, ActionSheetProps } from "@/src/components/ui/ActionSheet/ActionSheet.types";

/** ActionSheet shows a parent-driven bottom sheet with consistent iOS + Android visuals. */
export function ActionSheet({ cancelLabel = "Cancel", onClose, options, testID, title, visible }: ActionSheetProps) {
  const theme = useTheme();

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible} testID={testID}>
      <Pressable accessibilityRole="button" onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.32)" }}>
        <Pressable onPress={(event) => event.stopPropagation()} style={{ marginTop: "auto" }}>
          <SafeAreaView edges={["bottom"]} style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl }}>
            <View style={{ padding: theme.spacing.md, gap: theme.spacing.xs }}>
              {title ? (
                <Text variant="sectionTitle" tone="secondary" align="center" style={{ paddingVertical: theme.spacing.xs }}>
                  {title}
                </Text>
              ) : null}
              {options.map((option, index) => (
                <Fragment key={`${option.label}-${index}`}>
                  <ActionSheetRow option={option} onClose={onClose} />
                  {index < options.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: theme.colors.border }} />
                  ) : null}
                </Fragment>
              ))}
              <View style={{ height: theme.spacing.sm }} />
              <ActionSheetRow option={{ label: cancelLabel, onPress: onClose }} onClose={onClose} cancel />
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ActionSheetRow({ cancel = false, onClose, option }: { cancel?: boolean; onClose: () => void; option: ActionSheetOption }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        option.onPress();
        if (!cancel) {
          onClose();
        }
      }}
      testID={option.testID}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: cancel ? theme.colors.surfaceMuted : "transparent",
        borderRadius: theme.radius.md,
        flexDirection: "row",
        gap: theme.spacing.sm,
        justifyContent: cancel ? "center" : "flex-start",
        opacity: pressed ? 0.8 : 1,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
      })}
    >
      {option.icon ? <Icon name={option.icon} tone={option.destructive ? "danger" : "primary"} /> : null}
      <Text variant="bodyStrong" tone={option.destructive ? "danger" : cancel ? "secondary" : "primary"}>
        {option.label}
      </Text>
    </Pressable>
  );
}
