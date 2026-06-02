import { BottomSheet, RNHostView } from "@expo/ui";
import { Fragment, useCallback, useRef } from "react";
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
  onClose,
  options,
  testID,
  title,
  visible,
}: ActionSheetProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const sheetWidth = Math.max(280, width - theme.spacing.xxl);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runPendingAction = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    pendingAction?.();
  }, []);

  const handleDismiss = useCallback(() => {
    onClose();
    runPendingAction();
  }, [onClose, runPendingAction]);

  const handleSelect = useCallback(
    (action: () => void) => {
      pendingActionRef.current = action;
      onClose();

      fallbackTimerRef.current = setTimeout(runPendingAction, 400);
    },
    [onClose, runPendingAction],
  );

  return (
    <BottomSheet isPresented={visible} onDismiss={handleDismiss} testID={testID}>
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
              <ActionSheetRow option={option} onClose={onClose} onSelect={handleSelect} />
              {index < options.length - 1 ? (
                <View
                  style={{ height: 1, backgroundColor: theme.colors.border }}
                />
              ) : null}
            </Fragment>
          ))}
        </View>
      </RNHostView>
    </BottomSheet>
  );
}

function ActionSheetRow({
  cancel = false,
  onClose,
  onSelect,
  option,
}: {
  cancel?: boolean;
  onClose: () => void;
  onSelect: (action: () => void) => void;
  option: ActionSheetOption;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected: option.selected }}
      onPress={() => {
        if (cancel) {
          onClose();
          return;
        }

        onSelect(option.onPress);
      }}
      testID={option.testID}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: cancel
          ? theme.colors.surfaceMuted
          : option.selected
            ? theme.colors.accentSoft
            : "transparent",
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
          tone={option.destructive ? "danger" : option.selected ? "accent" : "primary"}
        />
      ) : null}
      <Text
        variant="bodyStrong"
        tone={option.destructive ? "danger" : cancel ? "secondary" : "primary"}
        style={{ flex: 1 }}
      >
        {option.label}
      </Text>
      {option.selected && !cancel ? <Icon name="checkmark-circle" tone="accent" /> : null}
    </Pressable>
  );
}
