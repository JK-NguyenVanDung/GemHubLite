# Product Detail Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Product Detail to real-app fidelity (full-width hero of selected media + horizontal media strip with inline `[+]` add tile + SKU in nav header) and keep Products (2-col) / Media (3-col) grids visually distinct.

**Architecture:** Pure UI recompose. The data layer (`useProductDetail`, repos) already supports multi-media, add-media, and metadata edit — untouched. Add two presentational components (`ProductHero`, `MediaStrip`); recompose the `[sku].tsx` route to own a `selectedMediaId`; retire `ProductHeader`, `AddPhotoButton`, `MediaGrid`.

**Tech Stack:** Expo Router, React Native, `expo-image`, existing theme system, Node built-in test runner (`node --test`) with structural source assertions.

---

## Testing Convention (read first)

This repo has **no React render testing**. Tests live in `tests/*.test.mjs`, run via `npm test`
(`node --test`), and assert on **source-file structure** by reading files and regex-matching —
see `tests/app-risk-regression.test.mjs`. Domain logic tests import `.ts` directly
(`tests/sku-flow.test.mjs`). All tests below follow the structural-assertion idiom: write the
assertion first, run it (fails because the file/string does not yet exist), then make it pass.

Shared helper used by every task below (already the pattern in the repo):

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}
```

## File Structure

- Create `src/features/product-detail/components/ProductHero.tsx` — full-width hero of one media item.
- Create `src/features/product-detail/components/MediaStrip.tsx` — horizontal selector + inline `[+]` add tile.
- Create `tests/product-detail-redesign.test.mjs` — structural tests for all changes.
- Modify `app/product/[sku].tsx` — recompose layout, `selectedMediaId` state, SKU header title.
- Modify `src/features/product-detail/components/index.ts` — export new, drop retired.
- Delete `src/features/product-detail/components/ProductHeader.tsx`, `AddPhotoButton.tsx`, `MediaGrid.tsx`.
- Verify (no change expected) `app/(tabs)/products.tsx` (`compact: 2`), `app/(tabs)/media.tsx` (`compact: 3`).

---

### Task 1: ProductHero component

**Files:**
- Create: `src/features/product-detail/components/ProductHero.tsx`
- Test: `tests/product-detail-redesign.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/product-detail-redesign.test.mjs` with the shared helper (above) plus:

```js
test("ProductHero renders full-width media with photo and video branches", () => {
  const src = read("src/features/product-detail/components/ProductHero.tsx");
  assert.match(src, /from "expo-image"/);
  assert.match(src, /cachePolicy="memory-disk"/);
  assert.match(src, /contentFit="cover"/);
  assert.match(src, /aspectRatio: 1/);
  assert.match(src, /width: "100%"/);
  assert.match(src, /kind === "video"/);
  assert.match(src, /play-circle/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `ENOENT` reading `ProductHero.tsx` (file does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `src/features/product-detail/components/ProductHero.tsx`:

```tsx
import { Image } from "expo-image";
import { View } from "react-native";

import { Icon, Text } from "@/src/components/ui";
import type { MediaKind } from "@/src/domain";
import { useTheme } from "@/src/theme";

export function ProductHero({ kind, uri }: { uri: string | null; kind: MediaKind | null }) {
  const theme = useTheme();

  if (kind === "video") {
    return (
      <View style={{ alignItems: "center", aspectRatio: 1, backgroundColor: theme.colors.black, borderRadius: theme.radius.lg, justifyContent: "center", overflow: "hidden", width: "100%" }}>
        <Icon name="play-circle" size={56} tone="onAccent" />
        <Text variant="metadata" tone="onAccent">Video</Text>
      </View>
    );
  }

  return (
    <View style={{ aspectRatio: 1, backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.border, borderRadius: theme.radius.lg, borderWidth: 1, justifyContent: "center", overflow: "hidden", width: "100%" }}>
      {uri ? (
        <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri }} style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }} transition={120} />
      ) : (
        <Text variant="bodyStrong" tone="tertiary" align="center">No photo yet</Text>
      )}
    </View>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the ProductHero test.

- [ ] **Step 5: Commit**

```bash
git add src/features/product-detail/components/ProductHero.tsx tests/product-detail-redesign.test.mjs
git commit -m "feat(product-detail): add ProductHero component"
```

---

### Task 2: MediaStrip component (with inline `[+]` add tile)

**Files:**
- Create: `src/features/product-detail/components/MediaStrip.tsx`
- Test: `tests/product-detail-redesign.test.mjs`

The add-tile reuses the exact ActionSheet logic currently in `AddPhotoButton.tsx`
(Open Camera → `/camera` with `sku`; Choose from Library → `usePhotoImport(sku).importPhoto`).

- [ ] **Step 1: Write the failing test**

Append to `tests/product-detail-redesign.test.mjs`:

```js
test("MediaStrip is a horizontal selector with an inline add tile", () => {
  const src = read("src/features/product-detail/components/MediaStrip.tsx");
  assert.match(src, /ScrollView/);
  assert.match(src, /horizontal/);
  assert.match(src, /testID="media-strip-add"/);
  assert.match(src, /usePhotoImport/);
  assert.match(src, /pathname: "\/camera"/);
  assert.match(src, /ActionSheet/);
  // active thumbnail gets an accent border
  assert.match(src, /active \? theme\.colors\.accent/);
  assert.match(src, /onSelect\(item\.id\)/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `ENOENT` reading `MediaStrip.tsx`.

- [ ] **Step 3: Write minimal implementation**

Create `src/features/product-detail/components/MediaStrip.tsx`:

```tsx
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { ActionSheet, Icon } from "@/src/components/ui";
import type { ActionSheetOption } from "@/src/components/ui";
import type { Media } from "@/src/domain";
import { usePhotoImport } from "@/src/features/camera/hooks/usePhotoImport";
import { useTheme } from "@/src/theme";

const TILE = 72;

export function MediaStrip({ media, onSelect, selectedId, sku }: { media: Media[]; selectedId: string | null; onSelect: (id: string) => void; sku: string }) {
  const theme = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { importPhoto } = usePhotoImport(sku);

  const options: ActionSheetOption[] = useMemo(() => [
    { label: "Open Camera", icon: "camera-outline", onPress: () => router.push({ pathname: "/camera", params: { sku } }), testID: "add-photo-camera" },
    { label: "Choose from Library", icon: "images-outline", onPress: importPhoto, testID: "add-photo-library" },
  ], [importPhoto, sku]);

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.xxs }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add photo to ${sku}`}
          onPress={() => setSheetOpen(true)}
          testID="media-strip-add"
          style={({ pressed }) => ({ alignItems: "center", backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent, borderRadius: theme.radius.md, borderWidth: 1, height: TILE, justifyContent: "center", opacity: pressed ? 0.82 : 1, width: TILE })}
        >
          <Icon name="add" size={28} tone="accent" />
        </Pressable>
        {media.map((item) => {
          const active = item.id === selectedId;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Show media for ${sku}`}
              onPress={() => onSelect(item.id)}
              style={({ pressed }) => ({ borderColor: active ? theme.colors.accent : theme.colors.border, borderRadius: theme.radius.md, borderWidth: active ? 2 : 1, height: TILE, opacity: pressed ? 0.82 : 1, overflow: "hidden", width: TILE })}
            >
              {item.kind === "video" ? (
                <View style={{ alignItems: "center", backgroundColor: theme.colors.black, flex: 1, justifyContent: "center" }}>
                  <Icon name="play-circle" size={24} tone="onAccent" />
                </View>
              ) : (
                <Image cachePolicy="memory-disk" contentFit="cover" source={{ uri: item.uri }} style={{ flex: 1 }} transition={120} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <ActionSheet visible={sheetOpen} title={`Add photo to ${sku}`} options={options} onClose={() => setSheetOpen(false)} />
    </>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the MediaStrip test.

- [ ] **Step 5: Commit**

```bash
git add src/features/product-detail/components/MediaStrip.tsx tests/product-detail-redesign.test.mjs
git commit -m "feat(product-detail): add MediaStrip with inline add tile"
```

---

### Task 3: Recompose Product Detail route

**Files:**
- Modify: `app/product/[sku].tsx` (full rewrite of the component file)
- Test: `tests/product-detail-redesign.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/product-detail-redesign.test.mjs`:

```js
test("product detail route uses hero + strip and SKU header title", () => {
  const src = read("app/product/[sku].tsx");
  assert.match(src, /ProductHero/);
  assert.match(src, /MediaStrip/);
  assert.match(src, /Stack\.Screen options=\{\{ title: product\.sku \}\}/);
  assert.match(src, /selectedId/);
  // retired components must no longer be referenced here
  assert.doesNotMatch(src, /ProductHeader/);
  assert.doesNotMatch(src, /AddPhotoButton/);
  assert.doesNotMatch(src, /MediaGrid/);
  assert.doesNotMatch(src, /from "@\/src\/features\/media\/components"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — current `[sku].tsx` references `ProductHeader`/`AddPhotoButton` and lacks `ProductHero`/`MediaStrip`.

- [ ] **Step 3: Write minimal implementation**

Replace the entire contents of `app/product/[sku].tsx` with:

```tsx
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { EmptyStateCard, Screen, Spinner } from "@/src/components/ui";
import { MediaStrip, ProductFormSection, ProductHero, useProductDetail } from "@/src/features/product-detail";
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";

export default function ProductDetailScreen() {
  const { sku } = useLocalSearchParams<{ sku: string }>();
  const detailSku = Array.isArray(sku) ? sku[0] : sku;
  const { error, loading, media, mutate, product, saveError, saving } = useProductDetail(detailSku ?? "");
  const layout = useResponsiveLayout();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId((current) => (current && media.some((item) => item.id === current) ? current : media[0]?.id ?? null));
  }, [media]);

  const selected = useMemo(() => media.find((item) => item.id === selectedId) ?? media[0] ?? null, [media, selectedId]);

  if (loading) {
    return <Screen testID="product-detail-screen"><Spinner /></Screen>;
  }

  if (error) {
    return <Screen testID="product-detail-screen"><EmptyStateCard icon="alert-circle-outline" title="Product failed to load" body={error.message} actionLabel="Back to Products" onAction={() => router.back()} /></Screen>;
  }

  if (!product) {
    return <Screen testID="product-detail-screen"><EmptyStateCard icon="alert-circle-outline" title="Product not found" body="This SKU is no longer available." actionLabel="Back to Products" onAction={() => router.back()} /></Screen>;
  }

  return (
    <Screen testID="product-detail-screen" scroll={false} safeAreaEdges={["left", "right"]} contentStyle={{ padding: 0, gap: 0 }}>
      <Stack.Screen options={{ title: product.sku }} />
      <ScrollView contentContainerStyle={{ alignSelf: "center", gap: layout.contentGap, maxWidth: layout.contentMaxWidth, padding: layout.pagePadding, width: "100%" }}>
        <ProductHero uri={selected?.uri ?? null} kind={selected?.kind ?? null} />
        <MediaStrip media={media} selectedId={selected?.id ?? null} onSelect={setSelectedId} sku={product.sku} />
        <ProductFormSection key={`${product.sku}-${product.updatedAt}`} initialTitle={product.title} initialType={product.type} initialDescription={product.description} saving={saving} error={saveError} onSave={mutate} />
      </ScrollView>
    </Screen>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the route test. (Barrel still exports `ProductHero`/`MediaStrip` after Task 4 — see note; if `npm run typecheck` is run now it will error on the missing barrel exports, which Task 4 fixes. Run typecheck after Task 4.)

- [ ] **Step 5: Commit**

```bash
git add app/product/[sku].tsx tests/product-detail-redesign.test.mjs
git commit -m "feat(product-detail): recompose route with hero, strip, SKU header"
```

---

### Task 4: Update barrel and retire old components

**Files:**
- Modify: `src/features/product-detail/components/index.ts`
- Delete: `src/features/product-detail/components/ProductHeader.tsx`
- Delete: `src/features/product-detail/components/AddPhotoButton.tsx`
- Delete: `src/features/product-detail/components/MediaGrid.tsx`
- Test: `tests/product-detail-redesign.test.mjs`

- [ ] **Step 1: Write the failing test**

Append to `tests/product-detail-redesign.test.mjs`:

```js
test("product-detail barrel exports new components and drops retired ones", () => {
  const src = read("src/features/product-detail/components/index.ts");
  assert.match(src, /ProductHero/);
  assert.match(src, /MediaStrip/);
  assert.doesNotMatch(src, /ProductHeader/);
  assert.doesNotMatch(src, /AddPhotoButton/);
  assert.doesNotMatch(src, /MediaGrid/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — barrel still exports `ProductHeader`/`AddPhotoButton`/`MediaGrid` and not the new components.

- [ ] **Step 3: Write minimal implementation**

Replace the entire contents of `src/features/product-detail/components/index.ts` with:

```ts
export { MediaStrip } from "@/src/features/product-detail/components/MediaStrip";
export { ProductFormSection } from "@/src/features/product-detail/components/ProductFormSection";
export { ProductHero } from "@/src/features/product-detail/components/ProductHero";
```

Then delete the retired files:

```bash
git rm src/features/product-detail/components/ProductHeader.tsx \
       src/features/product-detail/components/AddPhotoButton.tsx \
       src/features/product-detail/components/MediaGrid.tsx
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the barrel test.

Run: `npm run typecheck`
Expected: PASS — no dangling imports of the deleted components (they were only referenced by the barrel and `[sku].tsx`, both now updated).

- [ ] **Step 5: Commit**

```bash
git add src/features/product-detail/components/index.ts tests/product-detail-redesign.test.mjs
git commit -m "refactor(product-detail): retire ProductHeader, AddPhotoButton, MediaGrid"
```

---

### Task 5: Lock Products / Media grid differentiation

The grids already differ (`products.tsx` → `compact: 2`, `media.tsx` → `compact: 3`). This task
adds a regression test so the differentiation cannot silently drift.

**Files:**
- Test: `tests/product-detail-redesign.test.mjs`
- Modify (only if the assertion fails): `app/(tabs)/products.tsx`, `app/(tabs)/media.tsx`

- [ ] **Step 1: Write the test**

Append to `tests/product-detail-redesign.test.mjs`:

```js
test("Products grid is 2-col and Media grid is 3-col on compact width", () => {
  const products = read("app/(tabs)/products.tsx");
  const media = read("app/(tabs)/media.tsx");
  assert.match(products, /useResponsiveColumns\(\{ compact: 2/);
  assert.match(media, /useResponsiveColumns\(\{ compact: 3/);
});
```

- [ ] **Step 2: Run the test**

Run: `npm test`
Expected: PASS immediately (current values already match). If it FAILS, edit the
`useResponsiveColumns({ compact: ... })` call in the failing screen so Products uses
`compact: 2` and Media uses `compact: 3`, then re-run.

- [ ] **Step 3: Commit**

```bash
git add tests/product-detail-redesign.test.mjs app/(tabs)/products.tsx app/(tabs)/media.tsx
git commit -m "test(inventory): lock Products 2-col / Media 3-col differentiation"
```

---

### Task 6: Full validation gate

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: PASS (no new errors; fix any reported in the files touched above).

- [ ] **Step 3: Tests**

Run: `npm test`
Expected: PASS — all existing tests plus the new `product-detail-redesign` tests.

- [ ] **Step 4: Manual simulator check (argent)**

Launch the app, open a product with ≥2 media:
- Nav header shows the **SKU**.
- Hero shows the first media; tapping a strip thumbnail swaps the hero and shows the accent border on the active tile.
- Tapping `[+]` opens the ActionSheet → Open Camera routes to `/camera` with the SKU prefilled.
- After capturing/importing, returning to detail shows the new media in the strip (selection stays valid).
- Products tab = 2 columns, Media tab = 3 columns; both open Product Detail.

- [ ] **Step 5: Final commit (if any lint fixes were made)**

```bash
git add -A
git commit -m "chore(product-detail): pass typecheck, lint, tests for redesign"
```

---

## Self-Review

**Spec coverage:**
- Multiple media per product display → Task 1 (hero) + Task 2 (strip). ✓
- SKU as header title → Task 3 (`Stack.Screen options={{ title: product.sku }}`). ✓
- Update existing product with additional media → Task 2 inline `[+]` tile (camera/library, SKU prefilled). ✓
- Differentiated Product vs Media display → Task 5 (2-col / 3-col, locked by test). ✓
- Media tab = all assets, Products = first image cover, both open detail → already implemented; Task 5 guards columns; route open behavior unchanged. ✓
- Out of scope (AI/Share/badge/scan/spec/pricing) → not introduced. ✓

**Placeholder scan:** No TBD/TODO; every code step contains full file contents or full functions.

**Type consistency:** `ProductHero({ uri, kind })`, `MediaStrip({ media, selectedId, onSelect, sku })`,
`selectedId`/`setSelectedId` used consistently across Tasks 2–3; barrel exports in Task 4 match the
imports in Task 3 (`MediaStrip`, `ProductFormSection`, `ProductHero`). `Media.kind`/`Media.uri`/`Media.id`
match the existing `Media` domain type used by `useProductDetail`.
