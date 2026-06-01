# PRP — Product Detail Redesign + Product/Media Differentiation

Date: 2026-06-01
Status: Approved design, ready for implementation plan
Scope owner: GemHub Lite

## Goal

Bring the Product Detail screen up to the visual fidelity of the real GemStudio app
(reference: screen recording, June 2026) and sharpen the visual distinction between the
Products tab and the Media tab. This is a **UI/UX redesign**. The underlying data layer
already supports everything required (multiple media per product, add-media-to-existing,
metadata edit). No schema, repository, or domain changes.

## Reference (real app, observed)

Product Detail in the real app shows:

- Nav header: back arrow, **SKU** as the title, kebab menu (out of scope).
- Full-width **hero** image of the currently selected media (video shows a play overlay).
- Horizontal **media strip** under the hero: leading `[+]` add tile, then one thumbnail per
  media item; tapping a thumbnail swaps the hero; the active thumbnail has an accent border.
- `PRODUCT INFO` form: SKU (read-only), Title, Product Type, Description, Save.

Products tab: 2-column card grid, cover = first image, title, "N media", type.
Media tab: 3-column grid of every asset (images + videos) with SKU context.

## Decisions (locked with user)

- **Header title = SKU** (matches real app). Title remains an editable field below.
- **Full fidelity** Product Detail: full-width hero + horizontal media strip with inline
  `[+]` add tile + selected-thumbnail highlight, info form below.
- **Add media = inline `[+]` tile** in the strip (replaces the standalone Add Photo button).
- **Differentiation**: Products = 2-column grid, Media = 3-column grid.
- **Out of scope**: AI Auto-Fill, Share, GemStudio brand badge, barcode scan icon,
  Specification section, Pricing & Inventory. Keeps within existing PRP non-goals.

## Current State (what already works — do NOT rebuild)

- `useProductDetail` loads product + all media for a SKU and exposes `mutate` for edits.
- `app/product/[sku].tsx` renders all media in a `FlatList` (multi-media already supported).
- `AddPhotoButton` opens an ActionSheet (Open Camera / Choose from Library) with SKU prefilled.
- Media tab (`useMedia` → `mediaRepo.listAll`) already shows all assets, 3 cols on phones.
- Products tab cover already uses `media[0]`, shows media count, 2 cols on phones.

## Changes

### 1. Product Detail — `app/product/[sku].tsx`

- Set the Stack header title to the **SKU** via `Stack.Screen` `options` (or `navigation.setOptions`).
  Header shows back + SKU. Remove the in-body "Product Detail" title text.
- Local UI state: `selectedMediaId` — defaults to `media[0]?.id`; resets when `media` changes
  (e.g. after adding a photo, keep selection valid; if selected item removed, fall back to first).
- Layout (top → bottom), no longer a media grid:
  1. `ProductHero` — full-width, selected media.
  2. `MediaStrip` — horizontal scroll: `[+]` tile first, then thumbnails.
  3. `ProductFormSection` — unchanged (SKU read-only, Title, Type, Description, Save).
- Empty media: hero shows placeholder; strip shows only the `[+]` tile.

### 2. New component — `ProductHero` (replaces `ProductHeader`)

- Path: `src/features/product-detail/components/ProductHero.tsx`.
- Props: `{ uri: string | null; kind: MediaKind | null }`.
- Full-width, aspect ratio ~1:1 (match real app feel). Photo via `expo-image` `contentFit:cover`.
- Video → black background + centered play icon (reuse existing video-cover pattern).
- No SKU chip overlay (SKU now lives in the nav header).
- Retire `ProductHeader.tsx` (or repurpose). Update the `product-detail` barrel export.

### 3. New component — `MediaStrip`

- Path: `src/features/product-detail/components/MediaStrip.tsx`.
- Props: `{ media: Media[]; selectedId: string | null; onSelect: (id: string) => void; sku: string }`.
- Horizontal `ScrollView` (small list; ScrollView is fine — no virtualization needed).
- First item: `[+]` **AddPhotoTile** — same dimensions as thumbnails, accent-bordered, plus icon.
  Opens the existing Add-photo ActionSheet (Open Camera / Choose from Library, SKU prefilled).
  Reuse the logic currently in `AddPhotoButton` (camera route + `usePhotoImport(sku)`).
- Each thumbnail: square, tap → `onSelect(id)`. Active item: accent border (`theme.colors.accent`,
  ~2px) + subtle. Video thumbnails show a small play badge.
- Retire the standalone `AddPhotoButton` from the detail layout (logic moves into the strip's tile;
  delete the component or keep only if reused elsewhere — confirm no other importers).

### 4. Products tab — `app/(tabs)/products.tsx`

- Lock the phone/compact column count to **2** (already `compact: 2`; keep). No card-content change
  required for differentiation beyond the existing cover + title + "N media" + type layout.

### 5. Media tab — `app/(tabs)/media.tsx`

- Keep **3** columns on compact (already `compact: 3`). No change to "all assets" behavior — it
  already lists every media row via `mediaRepo.listAll`.

## Architecture / Boundaries (unchanged principles)

- Route file `[sku].tsx` stays thin: owns `selectedMediaId` state + composition only.
- `ProductHero` and `MediaStrip` are presentational, theme-driven, independently testable.
- No domain/repository edits. Add-photo continues through the existing camera + `usePhotoImport` path.

## Data Flow

```
useProductDetail(sku) -> { product, media, mutate }
  -> selectedMediaId (local, default media[0])
  -> ProductHero(selected media)
  -> MediaStrip(media, selectedId, onSelect, sku)
       [+] tile -> ActionSheet -> camera (sku prefilled) / library import
                -> on return, useFocusEffect refresh -> media updates -> selection revalidated
  -> ProductFormSection -> mutate(patch)
```

## Error / Edge States

- No media: hero placeholder + strip with only `[+]`.
- Selected media deleted/replaced after refresh: fall back to `media[0]?.id ?? null`.
- Loading / error / not-found: keep existing `Screen` states in `[sku].tsx`.
- Video selected as hero: play-overlay rendering, no crash on missing dimensions.

## Testing

- Component: `ProductHero` renders photo vs video branch; `MediaStrip` renders `[+]` + N thumbnails,
  marks the active item, calls `onSelect`.
- Interaction (manual / argent simulator): open detail → SKU in header; tap thumbnail → hero swaps;
  tap `[+]` → ActionSheet → camera with SKU prefilled → new photo appears in strip.
- Regression: Products tab 2-col, Media tab 3-col, both still open Product Detail.
- Static gates: `npm run typecheck`, `npm run lint`, `npm test`.

## Out of Scope (explicit)

AI Auto-Fill, Share, GemStudio brand badge, barcode scan, Specification, Pricing & Inventory,
SKU editing, video playback (still placeholder), any DB/domain/repository change.

## Files Touched

- `app/product/[sku].tsx` — recompose, header title = SKU, `selectedMediaId` state.
- `src/features/product-detail/components/ProductHero.tsx` — new (replaces `ProductHeader`).
- `src/features/product-detail/components/MediaStrip.tsx` — new (includes `[+]` add tile).
- `src/features/product-detail/components/AddPhotoButton.tsx` — retire from detail / fold logic in.
- `src/features/product-detail/index.ts` (barrel) — update exports.
- `app/(tabs)/products.tsx`, `app/(tabs)/media.tsx` — confirm/lock column counts (2 / 3).
