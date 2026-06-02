import { Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";

import type { ScreenProps } from "@/src/components/ui/Screen/Screen.types";

/** Screen preserves safe areas, page padding, scroll support, and sticky footer behavior. */
export function Screen({ children, constrainContent = true, contentStyle, footer, safeAreaEdges = ["top", "left", "right"], scroll = true, testID }: ScreenProps) {
  const theme = useTheme();
  const layout = useResponsiveLayout();
  const content = [{ alignSelf: "center" as const, flexGrow: 1, gap: layout.contentGap, maxWidth: constrainContent ? layout.contentMaxWidth : undefined, padding: layout.pagePadding, width: "100%" as const }, contentStyle];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={safeAreaEdges}>
      {scroll ? (
        <ScrollView
          testID={testID}
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={content}
          scrollIndicatorInsets={{ bottom: theme.spacing.md }}
        >
          {children}
        </ScrollView>
      ) : (
        <View testID={testID} style={content}>
          {children}
        </View>
      )}
      {footer ? <SafeAreaView edges={["bottom"]} style={{ paddingTop: theme.spacing.md }}>{footer}</SafeAreaView> : null}
    </SafeAreaView>
  );
}
