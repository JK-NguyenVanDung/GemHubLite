import { memo, useCallback, useMemo, useState } from "react";
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
import { productTypeLabel, productTypes, type ProductListItem, type ProductType } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { ProductCard } from "@/src/features/products/components";
import { useProducts } from "@/src/features/products/store";
import { useResponsiveColumns, useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useCatalogNavigation } from "@/src/lib/navigation/catalogNavigation";

type SortMode = "newest" | "oldest" | "most-photos";
const MemoProductCard = memo(ProductCard);

const SORT_LABEL: Record<SortMode, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "most-photos": "Most photos",
};

export default function ProductsScreen() {
  const baseColumns = useResponsiveColumns({ compact: 2, medium: 3, expanded: 4 });
  const [dense, setDense] = useState(false);
  const columns = dense ? baseColumns + 1 : baseColumns;
  const layout = useResponsiveLayout();
  const { data, error, loading, refresh } = useProducts();
  const [query, setQuery] = useState("");
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const { importPhoto } = usePhotoImport();
  const { openCreateProduct, openProductDetail } = useCatalogNavigation();

  const refreshFromPull = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

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
    { label: "Open Camera", icon: "camera-outline", onPress: () => openCreateProduct(), testID: "new-product-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "new-product-library" },
  ], [importPhoto, openCreateProduct]);

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

  const openProduct = useCallback((sku: string) => {
    openProductDetail(sku);
  }, [openProductDetail]);

  const renderProduct = useCallback(({ item }: { item: ProductListItem }) => (
    <View style={{ flex: 1 / columns }}>
      <MemoProductCard product={item} onPress={openProduct} />
    </View>
  ), [columns, openProduct]);

  const listHeader = useMemo(() => (
    <View style={{ gap: layout.contentGap }}>
      <InventoryHeader
        title="Products"
        actionLabel="Add"
        searchPlaceholder="Search by SKU"
        searchValue={query}
        onSearchChange={setQuery}
        filterLabel={filterLabel}
        dense={dense}
        onToggleDensity={() => setDense((value) => !value)}
        onAction={() => setSourceSheetOpen(true)}
        onFilterPress={() => setFilterSheetOpen(true)}
      />
      {data.length === 0 ? (
        <EmptyStateCard icon="diamond-outline" title="No products yet" body={error?.message ?? "Add a product photo to start your catalog."} actionLabel="Add Product" onAction={() => setSourceSheetOpen(true)} />
      ) : filteredData.length === 0 ? (
        <EmptyStateCard icon="search-outline" title="No matching products" body="Try another SKU, type, or sort." actionLabel="Reset filters" onAction={() => { setQuery(""); setTypeFilter("all"); setSort("newest"); }} />
      ) : null}
    </View>
  ), [data.length, dense, error?.message, filterLabel, filteredData.length, layout.contentGap, query]);

  if (loading && data.length === 0) {
    return <Screen testID="products-screen"><Spinner /></Screen>;
  }

  return (
    <Screen testID="products-screen" scroll={false} contentStyle={{ padding: 0, gap: 0 }}>
        <FlatList
          ListHeaderComponent={listHeader}
          data={filteredData}
          keyExtractor={(product) => product.sku}
          key={columns}
          numColumns={columns}
          refreshing={refreshing}
          onRefresh={refreshFromPull}
          columnWrapperStyle={columns > 1 ? { gap: layout.gridGap } : undefined}
          contentContainerStyle={{ alignSelf: "center", gap: layout.contentGap, maxWidth: layout.contentMaxWidth, padding: layout.pagePadding, paddingBottom: layout.tabBarBottomPadding, width: "100%" }}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          removeClippedSubviews
          renderItem={renderProduct}
          windowSize={7}
        />
      <ActionSheet visible={sourceSheetOpen} title="New product" options={sourceOptions} onClose={() => setSourceSheetOpen(false)} />
      <FilterSheet
        visible={filterSheetOpen}
        title="Filter products"
        groups={filterGroups}
        onClose={() => setFilterSheetOpen(false)}
        testID="products-filter-sheet"
      />
    </Screen>
  );
}
