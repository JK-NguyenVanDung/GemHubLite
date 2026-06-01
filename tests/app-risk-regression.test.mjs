import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("shell keeps current Home and More routes restored", () => {
  const index = read("app/index.tsx");
  const tabs = read("app/(tabs)/_layout.tsx");

  assert.match(index, /href="\/\(tabs\)\/home"/);
  for (const route of ["home", "media", "camera", "products", "more"]) {
    assert.match(tabs, new RegExp(`name=\"${route}\"`));
  }
  assert.doesNotMatch(index, /href="\/\(tabs\)\/camera"/);
});

test("scope docs allow restored Lite Home and More shell", () => {
  const prp = read("PRP.MD");
  const design = read("DESIGN.md");
  const readme = read("README.md");

  assert.doesNotMatch(prp, /No Home\/dashboard tab\./);
  assert.match(prp, /Lite local summary and shortcuts/);
  assert.match(design, /Lite Home and More may appear/);
  assert.match(readme, /Lite Home and More stay local-only/);
});

test("product and media image grids use expo-image caching", () => {
  for (const path of [
    "src/components/ui/Thumbnail/Thumbnail.tsx",
    "src/features/media/components/MediaTile.tsx",
    "src/features/products/components/ProductCard.tsx",
  ]) {
    const source = read(path);
    assert.match(source, /from "expo-image"/);
    assert.match(source, /cachePolicy="memory-disk"/);
    assert.match(source, /contentFit="cover"/);
    assert.doesNotMatch(source, /import \{ Image[^}]*\} from "react-native"/);
    assert.doesNotMatch(source, /resizeMode="cover"/);
  }
});

test("production error boundary does not flood logs", () => {
  const source = read("src/components/ErrorBoundary.tsx");

  assert.match(source, /if \(__DEV__\)/);
  assert.match(source, /console\.error\("Unhandled app error"/);
});

test("touch target hardening covers known small controls", () => {
  const button = read("src/components/ui/Button/Button.tsx");
  const captureReview = read("src/features/camera/components/CaptureReview.tsx");

  assert.match(button, /sm: \{ paddingV: "xs", minHeight: 44 \}/);
  assert.match(captureReview, /accessibilityLabel="Clear SKU search"[\s\S]*?hitSlop=\{10\}/);
  assert.match(captureReview, /accessibilityLabel="Scan SKU barcode"[\s\S]*?hitSlop=\{10\}/);
  assert.match(captureReview, /accessibilityLabel=\{[\s\S]*?sku[\s\S]*?\? `Choose SKU\. Current SKU/);
  assert.match(captureReview, /accessibilityLabel="Close SKU chooser"/);
  assert.match(captureReview, /minHeight: 44/);
});

test("Lite shell avoids production-only profile and collection surfaces", () => {
  const home = read("app/(tabs)/home.tsx");
  const more = read("app/(tabs)/more.tsx");

  assert.match(home, /accessibilityLabel="Open More support menu"/);
  assert.doesNotMatch(home, /home-profile-button/);
  assert.doesNotMatch(more, /Profile-style|Merchant profile|Collections|Notifications/);
  assert.doesNotMatch(more, /Local device|SKU required|Take-home checklist|Privacy/);
  assert.doesNotMatch(more, /onPress: \(\) => null/);
  assert.match(more, /Quick links for your product library/);
});

test("capture preview and SKU scanner use mobile-safe inputs and cached image rendering", () => {
  const captureReview = read("src/features/camera/components/CaptureReview.tsx");
  const mediaGrid = read("src/features/product-detail/components/MediaGrid.tsx");

  assert.match(captureReview, /<Image[\s\S]*?cachePolicy="memory-disk"/);
  assert.match(captureReview, /Field[\s\S]*?label="Prefix"[\s\S]*?autoCorrect=\{false\}/);
  assert.match(captureReview, /TextInput[\s\S]*autoCapitalize="characters"[\s\S]*autoCorrect=\{false\}/);
  assert.match(mediaGrid, /<AddPhotoButton sku=\{sku\} \/>/);
  assert.doesNotMatch(mediaGrid, /!media\.length \? <AddPhotoButton/);
});

test("product cards announce SKU title count and type", () => {
  const productCard = read("src/features/products/components/ProductCard.tsx");

  assert.match(productCard, /accessibilityLabel=\{`Open product \$\{product\.sku\}/);
  assert.match(productCard, /\$\{mediaLabel\}/);
  assert.match(productCard, /\$\{typeLabel\}/);
});

test("focused SQLite refresh hooks ignore stale async results after blur", () => {
  for (const path of [
    "src/features/products/store.ts",
    "src/features/media/store.ts",
    "src/features/product-detail/hooks/useProductDetail.ts",
  ]) {
    const source = read(path);

    assert.match(source, /useRef/);
    assert.match(source, /refreshIdRef/);
    assert.match(source, /refreshId === refreshIdRef\.current/);
    assert.match(source, /return \(\) => \{\s*refreshIdRef\.current \+= 1;/);
  }
});

test("shared modal sheets expose close labels and selected filter state", () => {
  const actionSheet = read("src/components/ui/ActionSheet/ActionSheet.tsx");
  const filterSheet = read("src/components/ui/FilterSheet/FilterSheet.tsx");

  assert.match(actionSheet, /accessibilityLabel=\{[\s\S]*?title \? `Close \$\{title\}` : "Close action sheet"[\s\S]*?\}/);
  assert.match(actionSheet, /accessibilityLabel=\{option\.label\}/);
  assert.match(filterSheet, /accessibilityLabel=\{`Close \$\{title\}`\}/);
  assert.match(filterSheet, /accessibilityLabel=\{`\$\{group\.title\}: \$\{option\.label\}`\}/);
  assert.match(filterSheet, /accessibilityState=\{\{ selected \}\}/);
});

test("image storage cleanup deletes manipulation temp file even when copy fails", () => {
  const storage = read("src/lib/files/media-storage.ts");

  assert.match(storage, /try \{\s*await tempFile\.copy\(destination, \{ overwrite: false \}\);\s*\} finally \{/);
  assert.match(storage, /finally \{\s*deleteMediaFile\(tempFile\.uri\);\s*\}/);
});

test("generated SKU sequence uses max existing suffix instead of row count", () => {
  const productsRepo = read("src/lib/db/repositories/products.ts");

  assert.doesNotMatch(productsRepo, /COUNT\(\*\) AS count/);
  assert.match(productsRepo, /SELECT sku FROM products WHERE sku LIKE \?/);
  assert.match(productsRepo, /maxSequence = rows\.reduce/);
  assert.match(productsRepo, /return maxSequence \+ 1/);
});

test("camera route params normalize and reject invalid SKU handoff", () => {
  const camera = read("app/camera.tsx");
  const captureReview = read("src/features/camera/components/CaptureReview.tsx");

  assert.match(camera, /normalizeSku\(Array\.isArray\(sku\) \? sku\[0\] : sku \?\? ""\)/);
  assert.match(camera, /isValidSku\(normalizedSku\) \? normalizedSku : undefined/);
  assert.match(captureReview, /const uri = readParam\(params\.uri\)/);
  assert.match(captureReview, /const initialSku = normalizeSku\(readParam\(params\.sku\) \?\? ""\)/);
  assert.match(captureReview, /const initialValidSku = isValidSku\(initialSku\) \? initialSku : ""/);
  assert.match(captureReview, /useState\(initialValidSku\)/);
  assert.match(captureReview, /usePhotoImport\(initialValidSku \|\| undefined\)/);
  assert.match(captureReview, /params: \{ sku: initialValidSku \}/);
  assert.doesNotMatch(captureReview, /typeof params\.sku === "string"/);
  assert.match(captureReview, /function readParam\(value\?: string \| string\[\]\): string \| null/);
});

test("existing SKU saves can update metadata without creating duplicate rows", () => {
  const productsRepo = read("src/lib/db/repositories/products.ts");
  const captureReview = read("src/features/camera/components/CaptureReview.tsx");
  const mediaRepo = read("src/lib/db/repositories/media.ts");

  assert.match(productsRepo, /updates non-empty metadata for an existing SKU/);
  assert.match(productsRepo, /UPDATE products SET title = \?, type = \?, description = \?, updated_at = \? WHERE sku = \?/);
  assert.match(productsRepo, /created: false/);
  assert.match(mediaRepo, /SELECT \* FROM media WHERE sku = \? AND uri = \? LIMIT 1/);
  assert.match(mediaRepo, /WHERE media\.id = \(/);
  assert.match(mediaRepo, /WHERE latest_media\.sku = media\.sku/);
  assert.doesNotMatch(captureReview, /SKU already exists/);
  assert.match(captureReview, /Photo will be added to this product/);
});


test("shared interactive components avoid tiny unlabeled press targets", () => {
  const picker = read("src/components/ui/Picker/Picker.tsx");
  const thumbnail = read("src/components/ui/Thumbnail/Thumbnail.tsx");

  assert.match(picker, /accessibilityLabel=\{`\$\{label\}: \$\{value \?\? placeholder \?\? "Select"\}`\}/);
  assert.match(thumbnail, /accessibilityLabel=\{accessibilityLabel\}/);
  assert.match(thumbnail, /hitSlop=\{10\}/);
});

test("hot list item presses use stable callbacks", () => {
  const products = read("app/(tabs)/products.tsx");
  const media = read("app/(tabs)/media.tsx");
  const productCard = read("src/features/products/components/ProductCard.tsx");
  const mediaTile = read("src/features/media/components/MediaTile.tsx");

  assert.match(products, /const openProduct = useCallback/);
  assert.match(products, /onPress=\{openProduct\}/);
  assert.doesNotMatch(products, /onPress=\{\(sku\) => router\.push/);
  assert.match(media, /const openMediaProduct = useCallback/);
  assert.match(media, /onPress=\{openMediaProduct\}/);
  assert.doesNotMatch(media, /onPress=\{\(media\) => router\.push/);
  assert.match(productCard, /const handlePress = useCallback/);
  assert.match(productCard, /onPress=\{handlePress\}/);
  assert.match(mediaTile, /const handlePress = useCallback/);
  assert.match(mediaTile, /onPress=\{handlePress\}/);
});

test("storage and input risks from advisory catalog stay covered app-wide", () => {
  const field = read("src/components/ui/Field/Field.tsx");
  const startup = read("src/features/startup/useStartupMaintenance.ts");
  const allAppSource = [
    "app/camera.tsx",
    "app/(tabs)/media.tsx",
    "app/(tabs)/products.tsx",
    "app/product/[sku].tsx",
    "src/components/ui/Field/Field.tsx",
    "src/features/camera/components/CaptureReview.tsx",
    "src/lib/db/repositories/products.ts",
    "src/lib/files/media-storage.ts",
  ].map(read).join("\n");

  assert.match(field, /textAlignVertical: multiline \? "top" : "center"/);
  assert.match(startup, /cleanupOrphanedMedia\(\)\.catch/);
  assert.doesNotMatch(allAppSource, /AsyncStorage/);
  assert.doesNotMatch(allAppSource, /Date\.parse|new Date\([^)]*\d{4}-\d{2}-\d{2}/);
  assert.doesNotMatch(allAppSource, /JSON\.parse/);
});
