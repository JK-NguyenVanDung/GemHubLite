# GemHub Lite

GemHub Lite is a local-first Expo inventory app for the take-home camera-to-SKU catalog flow. It starts on Camera, requires a SKU before save, and keeps Products and Media as two synced views over the same local SQLite inventory.

## Local Media Storage

- Captured and imported assets are copied into app-owned `Documents/media/` storage.
- Images are stored under `Documents/media/images/`, normalized to JPEG, downscaled to a maximum 1600px edge, and saved at high-quality compression (`0.86`) to minimize file size while preserving product-detail fidelity.
- Videos are stored under `Documents/media/videos/`; picker import requests H.264 1280x720 export on iOS where supported, then preserves the resulting file without extra transcoding.
- SQLite stores media kind, MIME type, dimensions, duration, original bytes, stored bytes, and compression status with each media row.

## Core Flow

1. Open Camera.
2. Capture a photo or choose a simulator photo.
3. Generate, type, or select an existing SKU.
4. Save Product.
5. Review Product Detail, Products, and Media.
6. Add another photo from Product Detail to append media to the same SKU.

## SKU Rules

- SKU is required before save.
- Manual SKUs are trimmed and uppercased.
- Generated SKUs use `SKU-YYYYMMDD-###`.
- Existing SKU saves append media to the product instead of creating a duplicate.
- SKU is treated as immutable after product creation.

## Run

```bash
npm install
npm run typecheck
npm run lint
```

### iOS

```bash
npx expo run:ios
```

VisionCamera requires a native/development build. The iOS simulator has no rear camera, so the app shows a production-shaped camera shell with a photo-picker fallback for validation.

### Android

```bash
cd android
./gradlew :app:assembleDebug --console=plain
```

Android runtime validation uses an emulator plus the development build. If the default AVD hangs or exits during boot, launch it headless with wiped state:

```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_9 -no-window -wipe-data -no-snapshot -no-audio -gpu swiftshader_indirect
```

## Architecture

```text
app/ routes
  -> feature screens
    -> domain services
      -> repositories
        -> SQLite + file storage
```

- `app/` keeps Expo Router tabs and stack routes thin.
- `src/domain/` owns product/media types and SKU normalization.
- `src/lib/db/` owns SQLite repositories.
- `src/features/` owns Camera, Products, Media, and Product Detail UI.
- `src/components/ui/` owns reusable theme-driven primitives.

## Scope Cuts

GemHub Lite intentionally excludes production-only GemHub/GemIQ surfaces: Home dashboard, More/Profile, auth/orgs, cloud sync, collections, billing, Shopify integrations, hardware controls, video, 360/editor tools, and appraisal/stone-detail forms.

## Validation Evidence

Screenshots live in `docs/research/screenshots/validation/`. Current evidence includes iOS camera fallback, capture preview, product detail, products grid, media grid, and Android development-build launch attempts.

## Known Gaps

- Android app compiles successfully, but runtime flow validation is still being retried because the current development build reached a blank Dev Launcher app surface on emulator.
- Repository unit tests are still deferred; manual iOS flow validated product upsert and existing-SKU append behavior.
- AI metadata extraction is future scope; save never depends on AI.
