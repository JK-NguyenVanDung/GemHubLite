import { BottomSheet, RNHostView } from "@expo/ui";
import { Fragment } from "react";
import { Pressable, useWindowDimensions, View } from "react-native";

import { Icon } from "@/src/components/ui/Icon/Icon";
import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type {
  ActionSheetOption,
  ActionSheetProps,
} from "@/src/components/ui/ActionSheet/ActionSheet.types";

/** ActionSheet shows a parent-driven bottom sheet with consistent iOS + Android visuals. */
export function ActionSheet({
  cancelLabel = "Cancel",
  onClose,
  options,
  testID,
  title,
  visible,
}: ActionSheetProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);

  return (
    <BottomSheet isPresented={visible} onDismiss={onClose} testID={testID}>
      <RNHostView matchContents testID={testID} style={{ width: sheetWidth }}>
        <View
          testID={testID}
          style={{ gap: theme.spacing.xs, padding: theme.spacing.md, width: sheetWidth }}
        >
          <View
            style={{
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "space-between",
              minHeight: 44,
            }}
          >
            <View style={{ width: 44 }} />
            {title ? (
              <Text
                variant="sectionTitle"
                tone="secondary"
                align="center"
                style={{ flex: 1, paddingVertical: theme.spacing.xs }}
              >
                {title}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={title ? `Close ${title}` : "Close action sheet"}
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
          {options.map((option, index) => (
            <Fragment key={`${option.label}-${index}`}>
              <ActionSheetRow option={option} onClose={onClose} />
              {index < options.length - 1 ? (
                <View
                  style={{ height: 1, backgroundColor: theme.colors.border }}
                />
              ) : null}
            </Fragment>
          ))}
          <View style={{ height: theme.spacing.sm }} />
          <ActionSheetRow
            option={{ label: cancelLabel, onPress: onClose }}
            onClose={onClose}
            cancel
          />
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

function ActionSheetRow({
  cancel = false,
  onClose,
  option,
}: {
  cancel?: boolean;
  onClose: () => void;
  option: ActionSheetOption;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
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
        minHeight: 44,
        opacity: pressed ? 0.8 : 1,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
      })}
    >
      {option.icon ? (
        <Icon
          name={option.icon}
          tone={option.destructive ? "danger" : "primary"}
        />
      ) : null}
      <Text
        variant="bodyStrong"
        tone={option.destructive ? "danger" : cancel ? "secondary" : "primary"}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}
