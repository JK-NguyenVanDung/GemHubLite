import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

import { Button, Card, Chip, EmptyStateCard, Icon, Screen, Spinner, Text } from "@/src/components/ui";
import { ProductCard } from "@/src/features/products/components";
import { useProducts } from "@/src/features/products/store";
import { useMedia } from "@/src/features/media/store";
import { useTheme } from "@/src/theme";

export default function HomeScreen() {
  const theme = useTheme();
  const { data: products, loading: productsLoading } = useProducts();
  const { data: media, loading: mediaLoading } = useMedia();
  const recentProducts = useMemo(() => products.slice(0, 4), [products]);
  const loading = productsLoading && mediaLoading && products.length === 0;

  if (loading) {
    return <Screen testID="home-screen"><Spinner /></Screen>;
  }

  return (
    <Screen testID="home-screen">
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.sm }}>
        <View style={{ flex: 1, gap: theme.spacing.xxs }}>
          <Text variant="screenTitle">GemHub Lite</Text>
          <Text variant="metadata" tone="secondary">Capture jewelry, assign SKU, build catalog.</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile menu"
          onPress={() => router.push("/(tabs)/more")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.pill,
            borderWidth: 1,
            height: 42,
            justifyContent: "center",
            opacity: pressed ? 0.75 : 1,
            width: 42,
          })}
          testID="home-profile-button"
        >
          <Icon name="person-outline" tone="accent" />
        </Pressable>
      </View>

      <Card style={{ gap: theme.spacing.md, padding: theme.spacing.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View style={{
            alignItems: "center",
            backgroundColor: theme.colors.accentSoft,
            borderRadius: theme.radius.xl,
            height: 76,
            justifyContent: "center",
            width: 76,
          }}>
            <Icon name="camera" size={34} tone="accent" />
          </View>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <Text variant="bodyStrong">Ready for next SKU</Text>
            <Text variant="body" tone="secondary">Capture photo, create or attach SKU, then review in Products and Media.</Text>
          </View>
        </View>
        <Button fullWidth label="Capture Product" leftIcon={<Icon name="camera-outline" tone="onAccent" />} onPress={() => router.push("/(tabs)/camera")} testID="home-capture-button" />
      </Card>

      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <Metric label="Products" value={products.length} icon="diamond-outline" />
        <Metric label="Media" value={media.length} icon="images-outline" />
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="sectionTitle">Recent products</Text>
          <Chip label="Local" tone="accent" />
        </View>
        {recentProducts.length === 0 ? (
          <EmptyStateCard icon="sparkles-outline" title="No catalog yet" body="Start by capturing first product photo." actionLabel="Open Camera" onAction={() => router.push("/(tabs)/camera")} />
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm }}>
            {recentProducts.map((product) => (
              <View key={product.sku} style={{ width: "48%" }}>
                <ProductCard product={product} onPress={(sku) => router.push({ pathname: "/product/[sku]", params: { sku } })} />
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: React.ComponentProps<typeof Icon>["name"]; label: string; value: number }) {
  const theme = useTheme();

  return (
    <Card style={{ flex: 1, gap: theme.spacing.xs, padding: theme.spacing.md }}>
      <Icon name={icon} tone="accent" />
      <Text variant="screenTitle">{value}</Text>
      <Text variant="metadata" tone="secondary">{label}</Text>
    </Card>
  );
}
