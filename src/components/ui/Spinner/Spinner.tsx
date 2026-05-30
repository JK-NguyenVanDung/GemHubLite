import { ActivityIndicator, View } from "react-native";

import { useTheme } from "@/src/theme";

export function Spinner({ testID }: { testID?: string }) {
  const theme = useTheme();
  return (
    <View testID={testID} style={{ alignItems: "center", justifyContent: "center", padding: theme.spacing.xl }}>
      <ActivityIndicator color={theme.colors.accentDark} />
    </View>
  );
}
