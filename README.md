# GemHub Lite

GemHub Lite is a local-first Expo inventory app for the project camera-to-SKU catalog flow. It keeps Home, Media, Products, and More tabs with a fullscreen camera overlay while preserving the required SKU-first catalog behavior locally.

## Local Media Storage

- Captured and imported assets are copied into app-owned `Documents/media/` storage.
- Images are stored under `Documents/media/images/`, normalized to JPEG, downscaled to a maximum 1600px edge, and saved at high-quality compression (`0.86`) to minimize file size while preserving product-detail fidelity.
- Videos are stored under `Documents/media/videos/`; picker import requests H.264 1280x720 export on iOS where supported, then preserves the resulting file without extra transcoding.
- Large inputs are rejected before copy (`45 MB` images, `220 MB` videos) and saves require enough free disk headroom to avoid half-written catalog rows.
- Failed saves delete the just-copied media file, and startup maintenance removes orphaned files not referenced by SQLite.
- SQLite stores media kind, MIME type, dimensions, duration, original bytes, stored bytes, and compression status with each media row.

## Core Flow

1. Open Home or Camera.
2. Capture a photo or choose a simulator photo.
3. Generate, type, or select an existing SKU.
4. Save Product.
5. Review Product Detail, Products, Media, or Home recents.
6. Filter Products by type/sort and Media by type/date/sort.
7. Add another image or video from Product Detail to append media to the same SKU.

## SKU Rules

- SKU is required before save.
- Manual SKUs are trimmed and uppercased.
- Generated SKUs use `SKU-YYYYMMDD-###`.
- Existing SKU saves append media to the product and may update non-empty metadata instead of creating a duplicate.
- SKU is treated as immutable after product creation.

## Run

```bash
npm install
nvm install
nvm use
npm run typecheck
npm run lint
npm run verify:submission
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
- `src/features/` owns Camera, Products, Media, Product Detail, startup maintenance, and local asset lifecycle UI.
- `src/components/ui/` owns reusable theme-driven primitives.

## Scope Cuts

GemHub Lite intentionally excludes production-only GemHub/GemIQ systems: auth/orgs, cloud sync, billing, Shopify integrations, hardware controls, 360/editor tools, appraisal/stone-detail forms, production dashboard, and account/profile surfaces. Lite Home and More stay local-only and route back into catalog/support flows.

## Validation Evidence

Screenshots live in `docs/research/screenshots/validation/` and `docs/evidence/`. Current evidence includes iOS native build Home, camera fallback, capture preview, product detail, products grid/filter, media grid/filter, More, and Android development-build launch/blocker notes.

## Known Gaps

- Real-device live-camera capture remains unverified; simulator validation uses the photo-library fallback because iOS Simulator exposes no rear camera.
- Repository unit tests are still deferred; manual iOS flow validated product upsert and existing-SKU append behavior.
- AI metadata extraction is out-of-scope backlog; save never depends on AI.

## Submission Readiness (2026-05-30)

- iOS: `xcodebuildmcp build_sim` Debug on iPhone 17 Pro simulator (iOS 26.5) succeeded; install + launch verified. Evidence: `docs/evidence/ios-launch-iphone17pro.png`.
- iOS native cleanup: removed stale dev-launcher local-network keys and script phase; clean Debug rebuild + relaunch verified. Evidence: `docs/evidence/ios-home-clean-2026-05-30.png`.
- iOS App Store pre-flight: `ITSAppUsesNonExemptEncryption=false` and stable `gemhublite` URL scheme verified in built `Info.plist`. Evidence: `docs/evidence/ios-home-storeready-2026-05-30.png`.
- Android release perms locked down to `CAMERA` and Expo's internal `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`; network, storage/media, and audio permissions are blocked, camera hardware is marked optional, and Android backup/device transfer is disabled for local catalog privacy. Evidence: `android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml`.
- Resilience UX: capture-save failures keep the form open and show a `Retry` action; startup warns when device storage is below 500 MB and media writes still perform per-file disk-space preflight.
- Android resize evidence after resilience changes: `docs/evidence/android-default-after-resilience-2026-05-30.png`, `docs/evidence/android-compact-after-resilience-2026-05-30.png`, and `docs/evidence/android-expanded-after-resilience-2026-05-30.png`.
- Android release JS bundle generated at `android/app/build/generated/assets/react/release/index.android.bundle` (~3.5 MB after R8/resource-shrink config).
- Store submission copy, privacy labels, permission rationales, and screenshot checklist are drafted in `docs/submission/STORE_METADATA.md`.
- Store runbook is drafted in `docs/submission/SUBMISSION_RUNBOOK.md`; real-device camera evidence must be recorded in `docs/evidence/REAL_DEVICE_CAMERA.md` and marked `VERIFIED_REAL_DEVICE_CAMERA=true` before the app can be called ready.
- Completion audit lives at `docs/submission/COMPLETION_AUDIT.md`; it maps each hardening/submission requirement to evidence, status, and missing proof.
- Screenshot readiness is tracked in `docs/submission/SCREENSHOT_EVIDENCE.md`; verifier checks the local evidence files, while the manifest still marks real-device/store-console screenshots as missing until captured.
- Android provider/OS readiness is tracked in `docs/submission/ANDROID_DEVICE_MATRIX.md`; current Pixel/resize/API 36 release/no-network evidence is captured and API 37 emulator attach blocker is documented, while Samsung-style, true low-memory, Android 13/14, real-camera, and saved Product Detail no-network proof remain open.
- Once an Android device or AVD is in `adb devices` `device` state, capture device-matrix evidence with `npm run capture:android -- <label> [<device-id>]`; this drops install/start/screenshot/layout/meminfo/logcat/no-network artifacts under `docs/evidence/` for that device.
- `npm run capture:android` computes tap points from the active Android `wm size`, so the evidence flow is usable on compact, expanded, Samsung-style, and resizable Android profiles.
- Large-catalog performance validation is tracked in `docs/submission/PERFORMANCE_RUNBOOK.md`; Android release 1000-row Products/Media scroll, meminfo, trim-memory survival, and logcat evidence is captured, while exact 100/500-row and iOS profiling proof remain reviewer-dependent.
- Bundle-size analysis is verified in `docs/submission/BUNDLE_ANALYSIS.md`; Expo Atlas Android export evidence is saved under `docs/evidence/`, with current Android Hermes bundle around `3.7 MB` and export `dist/` around `17 MB`.
- `npm run verify:submission` checks Expo config, native iOS/Android release posture, release artifacts, Android release/no-network/perf/trim-memory evidence, real-device camera proof, API37 blocker evidence, and credential placeholders. Current expected warnings are real-device camera proof, missing real Android signing env vars, and empty EAS submit credentials.
- The verifier also checks store assets and privacy posture: Expo/iOS 1024 icons, Android adaptive icon assets, iOS privacy manifest, `NSPrivacyTracking=false`, and collected-data section presence.
- Native `ios/` and `android/` folders are source-of-truth for this submission build; generated native build outputs remain ignored. The verifier also accepts the preserved release manifest snapshot at `docs/evidence/android-release-merged-manifest-2026-05-30.xml` when Gradle intermediates are cleaned.
- Android production signing wired via `GEMHUB_RELEASE_STORE_FILE`, `GEMHUB_RELEASE_STORE_PASSWORD`, `GEMHUB_RELEASE_KEY_ALIAS`, `GEMHUB_RELEASE_KEY_PASSWORD` env or `~/.gradle` props; without them release builds fall back to the debug keystore.
- `eas.json` is in repo for `development` / `preview` / `production` profiles; populate `submit.production.ios.{appleId,ascAppId,appleTeamId}` and `submit.production.android.serviceAccountKeyPath` before running `eas submit`.
- Android: debug install on Pixel_9 emulator verified; resize captured at compact (720x1280) and expanded (1440x2000). Evidence under `docs/evidence/`.
- Android release: `app-release.aab` produced at `android/app/build/outputs/bundle/release/app-release.aab` (~85 MB). Manifest merger report contains no dev-client references.
- Static gates: `npm run typecheck` and `npm run lint` pass. Unit tests skipped per user instruction.
- `npm run doctor` passes under the pinned Node runtime when invoked with `. ~/.nvm/nvm.sh && nvm use 22.21.0 && PATH="$NVM_BIN:$PATH" npm run doctor`; Homebrew Node `v25.x` remains first in the default shell PATH, so use the pinned command for final native submission builds.
- Node is pinned to `22.21.0` in `.nvmrc` and `.node-version`.
- Outstanding before store submission: real-device VisionCamera capture proof, App Store / Play Store metadata + privacy labels, store icons/screenshots, and production signing credentials.
