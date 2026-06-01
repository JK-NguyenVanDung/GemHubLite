import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

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

test("product-detail barrel exports new components and drops retired ones", () => {
  const src = read("src/features/product-detail/components/index.ts");
  assert.match(src, /ProductHero/);
  assert.match(src, /MediaStrip/);
  assert.doesNotMatch(src, /ProductHeader/);
  assert.doesNotMatch(src, /AddPhotoButton/);
  assert.doesNotMatch(src, /MediaGrid/);
});

test("Products grid is 2-col and Media grid is 3-col on compact width", () => {
  const products = read("app/(tabs)/products.tsx");
  const media = read("app/(tabs)/media.tsx");
  assert.match(products, /useResponsiveColumns\(\{ compact: 2/);
  assert.match(media, /useResponsiveColumns\(\{ compact: 3/);
});
