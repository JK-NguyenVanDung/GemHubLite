import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/src/theme";

import type { ScreenProps } from "@/src/components/ui/Screen/Screen.types";

/** Screen preserves safe areas, page padding, scroll support, and sticky footer behavior. */
export function Screen({ children, contentStyle, footer, scroll = true, testID }: ScreenProps) {
  const theme = useTheme();
  const content = [{ flexGrow: 1, gap: theme.spacing.md, padding: theme.spacing.md }, contentStyle];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView
          testID={testID}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={content}
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
