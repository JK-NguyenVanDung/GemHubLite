# GemHub Lite Store Submission Metadata

## App Identity

- App name: GemHub Lite
- iOS bundle ID: `com.gemhublite.app`
- Android package: `com.gemhublite.app`
- Production URL scheme: `gemhublite`
- Version: `1.0.0`
- Primary category suggestion: Business / Productivity

## Short Description

Capture jewelry product media, assign required SKUs, and manage a local-first product catalog.

## Full Description

GemHub Lite helps jewelry teams capture product photos or import local media, assign required SKUs, and organize products into a lightweight on-device catalog. The app is built for fast local workflows: products, media metadata, and SKU history are stored on the device without requiring an account, cloud sync, or network connection.

Core capabilities:

- Capture or import jewelry media.
- Require a SKU before saving.
- Append new media to existing normalized SKUs without duplicating products.
- Browse product and media grids with responsive layouts.
- Edit title, description, and product type locally.
- Clean up failed or orphaned media files.
- Warn before large imports when device storage is low.

## Privacy Labels

### Data Collected

- None collected by developer.
- No analytics SDK, ad SDK, crash-reporting SDK, account system, cloud sync, or remote API is configured in this build.

### Data Stored On Device

- Product SKUs, titles, descriptions, product type, media metadata, and app-owned image files. Video storage fields exist in code, but the submitted UI is photo-only.
- Data stays local to the app container.
- Android backup/device-transfer is disabled in the native manifest to avoid exporting local jewelry catalog data.

### Tracking

- Tracking: No.
- `NSPrivacyTracking`: false.

### Network Use

- Release build is local-first and does not require network access for catalog use.
- Android release blocks `INTERNET` and `ACCESS_NETWORK_STATE` permissions.
- Expo Updates are disabled.

## Permission Rationales

### iOS

- Camera: GemHub Lite needs camera access to capture jewelry product photos.
- Photo Library: GemHub Lite needs photo library access to import existing jewelry product media.
- Encryption: `ITSAppUsesNonExemptEncryption=false` because this build does not implement custom/non-exempt encryption.

### Android

- Camera: Required to capture jewelry product photos.
- Optional camera hardware: set to `required=false` so devices without camera hardware are not excluded from install compatibility.
- Blocked: network, storage/media read-write, audio recording.

## Required Screenshots Before Submission

- Home dashboard.
- Camera permission / camera screen on a real device.
- Capture Review with SKU field.
- Products grid.
- Product Detail.
- Media grid.
- Android compact width.
- Android expanded width.
- iOS small phone and large phone safe areas.

## Current Evidence

- iOS simulator launch: `docs/evidence/ios-home-storeready-2026-05-30.png`
- Android default resize: `docs/evidence/android-default-after-resilience-2026-05-30.png`
- Android compact resize: `docs/evidence/android-compact-after-resilience-2026-05-30.png`
- Android expanded resize: `docs/evidence/android-expanded-after-resilience-2026-05-30.png`
- Android release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Remaining Store Blockers

- Real iOS/Android device camera capture evidence is still required.
- Android release keystore or EAS-managed Android credentials must be supplied.
- App Store Connect app record values must be supplied in `eas.json` or entered during manual submit.
- Play Console service account key must be supplied for `eas submit` or upload must be manual.
- Final store screenshots/icons must be reviewed in App Store Connect and Play Console.
