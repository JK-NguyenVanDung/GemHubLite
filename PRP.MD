# GemHub Lite PRP

## Goal

Build a focused Expo React Native take-home app for Picup Media: a jewelry merchant captures product photos, must bind every saved photo to a SKU, then manages the resulting inventory through Products, Media, and Product Detail.

Core model:

```text
Camera capture -> required SKU confirmation -> create/update product -> Products and Media stay synced -> Product Detail manages metadata and images
```

This app should feel production-inspired by GemHub/GemIQ, but it must remain a Lite take-home implementation. Replicate useful product patterns and broad UX structure, not proprietary branding, assets, hardware/cloud surfaces, or exact copy.

## Source Truth

1. Picup Media take-home brief pasted into this repo setup session.
2. Real GemHub/GemIQ app analysis captured in `docs/research/GemHubApp.md`.
3. Expo, VisionCamera, SQLite, and platform docs used to validate technical feasibility.

## Required Flows

### New Product From Camera

1. User opens Camera.
2. User captures a still product photo.
3. App shows preview/save screen.
4. User enters or generates a SKU.
5. Save creates a product if SKU is new.
6. Product appears in Products.
7. Photo appears in Media.
8. Product Detail opens or is reachable for that SKU.

### Add Media To Existing Product

1. User opens Product Detail.
2. User taps Add Photo.
3. Camera opens with current SKU prefilled or strongly selected.
4. User captures and saves.
5. Media appends to existing product.
6. User returns to Product Detail with new image visible.

### Existing SKU From Camera

1. User opens Camera from tab.
2. User captures a still photo.
3. User selects an existing SKU on preview/save.
4. Save appends media to that product.
5. App does not create a duplicate product row.

### Browse And Sync

1. Products shows SKU, title/placeholder, cover image, and media count.
2. Media shows all saved items with thumbnail and SKU context.
3. Tapping a Product opens Product Detail.
4. Tapping a Media item opens Product Detail for that SKU.
5. Products and Media reflect saves without manual reload.

## Non-Goals

- No Home/dashboard tab.
- No auth, organization, cloud sync, billing, or multi-tenant features.
- No Picup production API integration.
- No Bluetooth, GemLightbox, turntable, BLE, or UVC camera support.
- No lighting filters, background removal, crop/editor pipeline, GPU editing, or 360 capture.
- No Shopify/integration surfaces.
- No pricing, inventory quantities, gemstone appraisal, analytics, or share links.
- No App Store or Play Store release pipeline.
- No bonus features until all required flows pass validation.

## Platform Matrix

| Concern | iOS | Android | Evidence Needed |
| --- | --- | --- | --- |
| Navigation | Expo Router tabs + stack | Expo Router tabs + stack | Screenshots after each route slice |
| Camera permission | `NSCameraUsageDescription` | `android.permission.CAMERA` | Permission screenshots/log notes |
| Photo capture | VisionCamera v5 still capture | VisionCamera v5 still capture | Capture happy path proof |
| Metadata storage | `expo-sqlite` | `expo-sqlite` | Repository tests |
| Preferences/cache | MMKV | MMKV | Smoke check only |
| Media files | App document storage URI | App document storage URI | Image loads after restart |
| Safe areas | iPhone small/large | Android small/large | Simulator/emulator screenshots |
| Build | `npx expo run:ios` | `npx expo run:android` | Command result or exact blocker |

## Data Model

### Product

```ts
type Product = {
  id: string;
  sku: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};
```

Rules:

- `sku` is required.
- `sku` is unique after normalization.
- `sku` is read-only after create in v1.
- Empty title displays as `Untitled product`.
- Cover image defaults to the first attached media item.

### MediaItem

```ts
type MediaItem = {
  id: string;
  productId: string;
  sku: string;
  uri: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};
```

Rules:

- Every media item belongs to one product.
- Every media item stores SKU snapshot for gallery context.
- No orphan media rows.
- No unassigned or `No SKU` bucket.

## SKU Rules

- Normalize manual SKU by trimming whitespace, collapsing internal repeated spaces, and uppercasing.
- Block save when normalized SKU is empty.
- Generated SKU format: `SKU-YYYYMMDD-###`.
- Sequence is per local day and must not collide with existing products.
- Existing SKU save appends media to current product instead of creating duplicate product.
- SKU editing is out of scope for v1 to avoid relinking complexity.

## UX States

### Navigation

- Use three bottom tabs: Camera, Media, Products.
- Use stack routes for Capture Preview and Product Detail.
- Keep Camera prominent because capture is the main workflow.
- Keep Media and Products as two views over the same inventory truth.

### Camera

- States: permission unknown, permission denied, no device, live preview, captured preview, saving, save error.
- Live view: dominant camera preview, capture control, optional SKU chip when launched from Product Detail.
- Preview view: image preview, required SKU field, Generate SKU action, existing SKU selector, optional title/type fields, save/cancel.

### Products

- Grid/list of product cards.
- Card content: cover image, SKU, title/placeholder, media count.
- Empty state explains capture-first workflow and routes to Camera.

### Media

- Gallery of all media items.
- Tile content: thumbnail, SKU, optional product title.
- Empty state routes to Camera.

### Product Detail

- SKU header.
- Editable title, description, and type.
- Media grid for attached images.
- Add Photo action routes to Camera with SKU prefilled.

## Native Dependencies

- Expo latest stable SDK with TypeScript.
- Expo Router for tabs and stack routes.
- VisionCamera v5 for maintained still-photo capture.
- `expo-sqlite` for local durable metadata.
- MMKV for lightweight preferences/cache only.
- Expo filesystem/document storage for persisted image URIs.
- React Native safe-area handling via `react-native-safe-area-context`.

Important build note: VisionCamera is not a plain Expo Go feature. Pure UI may be previewed before camera integration, but final camera validation must use an Expo development/native build path such as `npx expo run:ios`, `npx expo run:android`, or EAS development builds.

## Architecture

```text
app/ routes
  -> feature screens
    -> domain services
      -> repositories
        -> SQLite + file storage
```

Boundaries:

- Route files stay thin and call feature components.
- Components are reusable and theme-driven.
- Domain logic owns SKU normalization, product upsert, media append, and generated SKU sequence.
- Repository layer owns SQL and file metadata persistence.
- Camera integration owns native permission/capture only.

## Implementation Order

1. Scaffold Expo app after this planning phase is accepted.
2. Add theme and reusable UI primitives.
3. Add domain model and repository tests.
4. Implement SQLite schema and repository.
5. Build navigation shell.
6. Build Products, Media, and Product Detail with seeded/dev data if needed.
7. Add VisionCamera permission and live capture.
8. Add Capture Preview save flow.
9. Wire Product Detail Add Photo.
10. Run platform validation and fix regressions.
11. Write README and demo walkthrough.

## Validation Gates

### Static Gates

```bash
npm run typecheck
npm run lint
npm test
```

### Platform Gates

```bash
npx expo run:ios
npx expo run:android
```

If a gate cannot run, record the exact command, error, environment reason, and next fix in `PROGRESS.md`.

### Manual Acceptance

- New product from camera passes.
- Add media to existing product passes.
- Existing SKU from camera passes.
- Products and Media stay synced.
- Product Detail edits persist.
- App handles empty states.
- App has no hard-coded secrets.

## Demo Script

1. Start on empty Products/Media state.
2. Open Camera.
3. Capture photo.
4. Generate SKU or type new SKU.
5. Save and show Product Detail.
6. Show Products card with cover/media count.
7. Show Media tile with SKU.
8. Open Product Detail and edit title/type/description.
9. Add another photo from Product Detail.
10. Show same SKU has multiple images.
11. Capture another photo from Camera and select existing SKU.
12. Show no duplicate product row.
13. Briefly explain README, architecture, scope cuts, AI usage, known gaps.

## Known Gotchas

- VisionCamera native setup can slow iteration; isolate camera after UI/storage foundations pass.
- iPhone Mirroring is useful for real-app research, but not reliable proof for real camera capture.
- Simulator camera limitations may require device validation or documented blocker.
- File URI behavior must be tested after app restart.
- SKU normalization must be centralized to prevent duplicate rows.
- README must not claim unsupported iOS/Android evidence.

