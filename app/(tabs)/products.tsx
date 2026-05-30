import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";

import {
  ActionSheet,
  EmptyStateCard,
  FilterSheet,
  InventoryHeader,
  Screen,
  Spinner,
} from "@/src/components/ui";
import type { ActionSheetOption, FilterGroup } from "@/src/components/ui";
import { productTypeLabel, productTypes, type ProductType } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { ProductCard } from "@/src/features/products/components";
import { useProducts } from "@/src/features/products/store";
import { useTheme } from "@/src/theme";

type SortMode = "newest" | "oldest" | "most-photos";

const SORT_LABEL: Record<SortMode, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "most-photos": "Most photos",
};

export default function ProductsScreen() {
  const theme = useTheme();
  const { data, error, loading, refresh } = useProducts();
  const [query, setQuery] = useState("");
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const { importPhoto } = usePhotoImport();

  const filteredData = useMemo(() => {
    const needle = query.trim().toUpperCase();
    let next = data;
    if (needle) {
      next = next.filter((product) => {
        const title = product.title?.toUpperCase() ?? "";
        return product.sku.toUpperCase().includes(needle) || title.includes(needle);
      });
    }
    if (typeFilter !== "all") {
      next = next.filter((product) => product.type === typeFilter);
    }
    const copy = [...next];
    if (sort === "oldest") {
      copy.sort((a, b) => a.updatedAt - b.updatedAt);
    } else if (sort === "most-photos") {
      copy.sort((a, b) => b.mediaCount - a.mediaCount);
    } else {
      copy.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return copy;
  }, [data, query, sort, typeFilter]);

  const sourceOptions: ActionSheetOption[] = useMemo(() => [
    { label: "Open Camera", icon: "camera-outline", onPress: () => router.push("/(tabs)/camera"), testID: "new-product-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "new-product-library" },
  ], [importPhoto]);

  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: "Product type",
      value: typeFilter,
      onChange: (value) => setTypeFilter(value as typeof typeFilter),
      options: [
        { label: "All", value: "all", icon: "apps-outline" },
        ...productTypes.map((type) => ({ label: productTypeLabel(type), value: type })),
      ],
    },
    {
      title: "Sort by",
      value: sort,
      onChange: (value) => setSort(value as SortMode),
      options: [
        { label: "Newest", value: "newest", icon: "arrow-down-outline" },
        { label: "Oldest", value: "oldest", icon: "arrow-up-outline" },
        { label: "Most photos", value: "most-photos", icon: "images-outline" },
      ],
    },
  ], [sort, typeFilter]);

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (typeFilter !== "all") parts.push(productTypeLabel(typeFilter));
    if (sort !== "newest") parts.push(SORT_LABEL[sort]);
    if (query.trim()) parts.push(`${filteredData.length} results`);
    return parts.length ? parts.join(" · ") : "All SKUs";
  }, [filteredData.length, query, sort, typeFilter]);

  if (loading && data.length === 0) {
    return <Screen testID="products-screen"><Spinner /></Screen>;
  }

  return (
    <Screen testID="products-screen">
      <InventoryHeader
        title="Products"
        actionLabel="+ New"
        searchPlaceholder="Search by SKU"
        searchValue={query}
        onSearchChange={setQuery}
        filterLabel={filterLabel}
        onAction={() => setSourceSheetOpen(true)}
        onFilterPress={() => setFilterSheetOpen(true)}
      />
      {data.length === 0 ? (
        <EmptyStateCard icon="diamond-outline" title="No products yet" body={error?.message ?? "Capture photo, assign SKU, and build catalog."} actionLabel="Add Product" onAction={() => setSourceSheetOpen(true)} />
      ) : filteredData.length === 0 ? (
        <EmptyStateCard icon="search-outline" title="No matching products" body="Try another SKU, type, or sort." actionLabel="Reset filters" onAction={() => { setQuery(""); setTypeFilter("all"); setSort("newest"); }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(product) => product.sku}
          numColumns={2}
          scrollEnabled={false}
          refreshing={loading}
          onRefresh={refresh}
          columnWrapperStyle={{ gap: theme.spacing.sm }}
          contentContainerStyle={{ gap: theme.spacing.md }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ProductCard product={item} onPress={(sku) => router.push({ pathname: "/product/[sku]", params: { sku } })} />
            </View>
          )}
        />
      )}
      <ActionSheet visible={sourceSheetOpen} title="New product" options={sourceOptions} onClose={() => setSourceSheetOpen(false)} />
      <FilterSheet
        visible={filterSheetOpen}
        title="Filter products"
        groups={filterGroups}
        onClear={() => { setTypeFilter("all"); setSort("newest"); }}
        onClose={() => setFilterSheetOpen(false)}
        testID="products-filter-sheet"
      />
    </Screen>
  );
}
