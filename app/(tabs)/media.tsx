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
import { productTypeLabel, productTypes, type Media, type MediaListItem, type ProductType } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { MediaTile } from "@/src/features/media/components";
import { useMedia } from "@/src/features/media/store";
import { useResponsiveColumns, useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useCatalogNavigation } from "@/src/lib/navigation/catalogNavigation";

type SortMode = "newest" | "oldest";
type Range = "all" | "today" | "week";

const DAY_MS = 24 * 60 * 60 * 1000;
const MemoMediaTile = memo(MediaTile);

export default function MediaScreen() {
  const baseColumns = useResponsiveColumns({ compact: 3, medium: 4, expanded: 6 });
  const [dense, setDense] = useState(false);
  const columns = dense ? baseColumns + 1 : baseColumns;
  const layout = useResponsiveLayout();
  const { data, error, loading, refresh } = useMedia();
  const [query, setQuery] = useState("");
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [filterNow] = useState(() => Date.now());
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
      next = next.filter((media) => {
        const title = media.productTitle?.toUpperCase() ?? "";
        return media.sku.toUpperCase().includes(needle) || title.includes(needle);
      });
    }
    if (typeFilter !== "all") {
      next = next.filter((media) => media.productType === typeFilter);
    }
    if (range !== "all") {
      const cutoff = filterNow - (range === "today" ? DAY_MS : DAY_MS * 7);
      next = next.filter((media) => media.createdAt >= cutoff);
    }
    const copy = [...next];
    copy.sort((a, b) => sort === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);
    return copy;
  }, [data, filterNow, query, range, sort, typeFilter]);

  const sourceOptions: ActionSheetOption[] = useMemo(() => [
    { label: "Open Camera", icon: "camera-outline", onPress: () => openCreateProduct(), testID: "new-media-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "new-media-library" },
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
      title: "Captured",
      value: range,
      onChange: (value) => setRange(value as Range),
      options: [
        { label: "All time", value: "all", icon: "infinite-outline" },
        { label: "Today", value: "today", icon: "today-outline" },
        { label: "Last 7 days", value: "week", icon: "calendar-outline" },
      ],
    },
    {
      title: "Sort",
      value: sort,
      onChange: (value) => setSort(value as SortMode),
      options: [
        { label: "Newest", value: "newest", icon: "arrow-down-outline" },
        { label: "Oldest", value: "oldest", icon: "arrow-up-outline" },
      ],
    },
  ], [range, sort, typeFilter]);

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (typeFilter !== "all") parts.push(productTypeLabel(typeFilter));
    if (range === "today") parts.push("Today");
    if (range === "week") parts.push("7 days");
    if (sort !== "newest") parts.push("Oldest");
    if (query.trim()) parts.push(`${filteredData.length} results`);
    return parts.length ? parts.join(" · ") : "All SKUs";
  }, [filteredData.length, query, range, sort, typeFilter]);

  const openMediaProduct = useCallback((media: Media | MediaListItem) => {
    openProductDetail(media.sku);
  }, [openProductDetail]);

  const renderMedia = useCallback(({ item }: { item: MediaListItem }) => (
    <View style={{ flex: 1 / columns }}>
      <MemoMediaTile media={item} size="md" onPress={openMediaProduct} />
    </View>
  ), [columns, openMediaProduct]);

  const listHeader = useMemo(() => (
    <View style={{ gap: layout.contentGap }}>
      <InventoryHeader
        title="Media"
        actionLabel="Add Photo"
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
        <EmptyStateCard icon="images-outline" title="No photos yet" body={error?.message ?? "Add your first product photo to get started."} actionLabel="Add Photo" onAction={() => setSourceSheetOpen(true)} />
      ) : filteredData.length === 0 ? (
        <EmptyStateCard icon="search-outline" title="No matching media" body="Try another SKU, type, or date." actionLabel="Reset filters" onAction={() => { setQuery(""); setTypeFilter("all"); setRange("all"); setSort("newest"); }} />
      ) : null}
    </View>
  ), [data.length, dense, error?.message, filterLabel, filteredData.length, layout.contentGap, query]);

  if (loading && data.length === 0) {
    return <Screen testID="media-screen"><Spinner /></Screen>;
  }

  return (
    <Screen testID="media-screen" scroll={false} contentStyle={{ padding: 0, gap: 0 }}>
        <FlatList
          ListHeaderComponent={listHeader}
          data={filteredData}
          keyExtractor={(media) => media.id}
          key={columns}
          numColumns={columns}
          refreshing={refreshing}
          onRefresh={refreshFromPull}
          columnWrapperStyle={columns > 1 ? { gap: layout.gridGap } : undefined}
          contentContainerStyle={{ alignSelf: "center", gap: layout.contentGap, maxWidth: layout.contentMaxWidth, padding: layout.pagePadding, paddingBottom: layout.tabBarBottomPadding, width: "100%" }}
          initialNumToRender={18}
          maxToRenderPerBatch={18}
          removeClippedSubviews
          renderItem={renderMedia}
          windowSize={7}
        />
      <ActionSheet visible={sourceSheetOpen} title="New media" options={sourceOptions} onClose={() => setSourceSheetOpen(false)} />
      <FilterSheet
        visible={filterSheetOpen}
        title="Filter media"
        groups={filterGroups}
        onClose={() => setFilterSheetOpen(false)}
        testID="media-filter-sheet"
      />
    </Screen>
  );
}
