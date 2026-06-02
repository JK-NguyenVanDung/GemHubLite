import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Stack } from "expo-router/stack";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Icon, Text } from "@/src/components/ui";
import { useStartupMaintenance } from "@/src/features/startup/useStartupMaintenance";
import { ThemeProvider, useTheme } from "@/src/theme";

function ProductBackButton() {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel="Back"
      accessibilityRole="button"
      hitSlop={theme.spacing.xs}
      onPress={() => router.back()}
      style={({ pressed }) => ({
        alignItems: "center",
        flexDirection: "row",
        gap: theme.spacing.xxs,
        marginLeft: theme.spacing.xs,
        opacity: pressed ? 0.65 : 1,
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: theme.spacing.xs,
      })}
      testID="product-detail-back-button"
    >
      <Icon name="chevron-back" size={26} tone="accent" />
      <Text variant="button" tone="accent">Back</Text>
    </Pressable>
  );
}

function AppStack() {
  const theme = useTheme();
  const { storageWarning } = useStartupMaintenance();

  return (
    <View style={{ flex: 1 }}>
      {storageWarning ? (
        <View style={{ backgroundColor: theme.colors.danger, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs }}>
          <Text variant="metadata" tone="onAccent">{storageWarning}</Text>
        </View>
      ) : null}
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: true,
          headerTintColor: theme.colors.accentDark,
          headerTitleStyle: {
            color: theme.colors.text,
            fontSize: theme.typography.screenTitle.fontSize,
            fontWeight: theme.typography.screenTitle.fontWeight,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ animation: "slide_from_bottom", headerShown: false, presentation: "fullScreenModal" }} />
        <Stack.Screen name="capture-preview" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[sku]"
          options={{
            headerBackTitle: "",
            headerBackVisible: false,
            headerLeft: () => <ProductBackButton />,
            title: "",
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppStack />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
