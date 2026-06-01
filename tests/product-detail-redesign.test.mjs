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
