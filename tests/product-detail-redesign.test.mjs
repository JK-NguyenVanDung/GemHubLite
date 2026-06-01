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
