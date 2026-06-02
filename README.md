# GemHub Lite

GemHub Lite is a local-first Expo inventory app for the project camera-to-SKU catalog flow. It ships a five-tab bottom shell (Home, Media, Camera (center), Products, and More) that preserves the required SKU-first catalog behavior locally.

## Local Media Storage

- Captured and imported photos are copied into app-owned `Documents/media/` storage.
- Images are stored under `Documents/media/images/`, normalized to JPEG, downscaled to a maximum 1600px edge, and saved at high-quality compression (`0.86`) to minimize file size while preserving product-detail fidelity.
- The storage layer has video-ready fields and a `Documents/media/videos/` directory, but the submitted UI is photo-only: camera capture and gallery import both save images, not video clips.
- Large image inputs are rejected before copy (`45 MB`) and saves require enough free disk headroom to avoid half-written catalog rows.
- Failed saves delete the just-copied media file, and startup maintenance removes orphaned files not referenced by SQLite.
- SQLite stores media kind, MIME type, dimensions, duration, original bytes, stored bytes, and compression status with each media row.

## Core Flow

1. Open Home or Camera.
2. Capture a photo or choose a simulator photo.
3. Generate, type, or select an existing SKU.
4. Save Product.
5. Review Product Detail, Products, Media, or Home recents.
6. Filter Products by type/sort and Media by type/date/sort.
7. Add another photo from Product Detail to append media to the same SKU.

## SKU Rules

- SKU is required before save.
- Manual SKUs are normalized: control chars stripped, trimmed, inner whitespace collapsed to `-`, uppercased.
- A normalized SKU must be 1–64 chars and contain only `A-Z`, `0-9`, `.`, `_`, or `-`.
- Generated SKUs use `GH-######` (6-digit zero-padded sequence = highest existing `GH-` suffix + 1; width expands past `999999`).
- Existing SKU saves append media to the product and may update non-empty metadata instead of creating a duplicate.
- SKU is treated as immutable after product creation.
- There is no save-without-SKU path: every saved media item is bound to a SKU (typed, picked from an existing product, or generated).

Bonus capabilities present beyond the required flow: photo-library import (also the simulator capture fallback), barcode/QR SKU fill, and adjustable grid density on Products and Media.

## Prerequisites And Running

### Stack Versions

- Expo SDK `56` (`expo ~56.0.8`).
- React Native `0.85.3`, React `19.2.3`, Hermes enabled, New Architecture enabled.
- VisionCamera `^5.0.11`; this means Expo Go is **not** enough. Use a native build.
- Minimum OS targets: iOS deployment target `16.4`; Android min SDK `24` (Android 7.0 Nougat). Android compile/target SDK is `36`.
- Main native IDs: iOS bundle `com.gemhublite.app`, Android package `com.gemhublite.app`, URL scheme `gemhublite`.

### Required Local Environment

- Node `22.21.0` recommended and pinned in `.nvmrc` / `.node-version`; package range is Node `>=20.19 <23`.
- npm `>=10`.
- macOS with Xcode + iOS Simulator for iOS builds.
- Ruby + CocoaPods for the iOS pod step (`ios/Pods/` is `.gitignore`d). Tested with Ruby `3.4.7` and CocoaPods `1.16.2`; macOS system Ruby also works, but a version manager (`rbenv`/`chruby`/`rvm`) is recommended. Install CocoaPods with `gem install cocoapods` if missing.
- Android Studio with Android SDK Platform `36`, Android SDK Build-Tools `36.0.0`, and Android NDK `27.1.12297006` for Android builds.
- Gradle wrapper is included and downloads Gradle `9.3.1`; do not install a separate Gradle manually.
- Java must be compatible with the Android Gradle Plugin used by Expo/RN; Android Studio's bundled JDK is recommended.
- No backend env vars or API keys are required. `.env.example` is intentionally placeholder-only because the app is local-only.

### Install Dependencies

Use the pinned Node version first:

```bash
nvm use
```

Then install packages:

```bash
npm install
```

Then run start:

```bash
npm run start
```

Or run on a platform below. Optional checks: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run verify:submission`.

### Native Build (Expo Prebuild)

Short answer: the app needs native code (VisionCamera, so Expo Go is **not** enough), but you normally do **not** need to run `expo prebuild` yourself.

By default a managed Expo project does **not** ship `ios/` and `android/` folders — they are generated on demand by prebuild and are usually `.gitignore`d. This repo deliberately commits both native projects (only build artifacts like `ios/build/`, `android/build/`, `android/.gradle/`, `android/app/.cxx/` are ignored), so the native build is reproducible and the custom native edits are preserved in version control.

- Because `ios/` and `android/` are already committed (with custom native config: Info.plist permissions, Podfile, Gradle, `expo-build-properties`), `npx expo run:ios` / `npx expo run:android` build directly without a manual prebuild step. The native build commands also run prebuild automatically only if a native folder is ever missing.
- `npm run start` (Expo Go / Metro) is for JS-only iteration on an already-installed native build; it cannot bootstrap VisionCamera on its own.
- Only run a manual prebuild to regenerate native projects from `app.json`:
  ```bash
  npx expo prebuild --clean
  ```
  This is **destructive**: `--clean` overwrites `ios/` and `android/`, discarding the committed native edits. Avoid it for normal builds and reviews; use it only when intentionally regenerating native projects, and re-apply native config afterward.

### iOS: Build, Install, Run

Install CocoaPods dependencies once (and after native dep changes). `npx expo run:ios` runs this for you, so a manual step is only needed if you build through Xcode or hit a Pods error:

```bash
npx pod-install ios
# or directly:
(cd ios && pod install)
```

Run a native development build on the default simulator:

```bash
npx expo run:ios
```

If multiple simulators are installed, choose one explicitly:

```bash
npx expo run:ios --device "iPhone 17 Pro"
```

The iOS simulator has no rear camera. Expected simulator behavior: Camera opens a production-shaped shell and uses photo-library fallback for validation. Real VisionCamera capture needs a physical iPhone build.

Useful iOS reset when native deps or Pods get stale:

```bash
rm -rf ios/Pods ios/Podfile.lock
npx pod-install ios
npx expo run:ios
```

### Android: Build, Install, Run

Start an emulator from Android Studio Device Manager, or CLI if available:

```bash
~/Library/Android/sdk/emulator/emulator -avd Pixel_9 -no-window -wipe-data -no-snapshot -no-audio -gpu swiftshader_indirect
```

Build and install the debug app:

```bash
npx expo run:android
```

Build debug APK only:

```bash
(cd android && ./gradlew :app:assembleDebug --console=plain)
```

Install debug APK manually:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.gemhublite.app 1
```

Build release APK locally:

```bash
(cd android && ./gradlew :app:assembleRelease --no-daemon)
```

Release APK output:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Build release AAB locally:

```bash
(cd android && ./gradlew :app:bundleRelease --no-daemon)
```

Release AAB output:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Production signing is wired through `GEMHUB_RELEASE_STORE_FILE`, `GEMHUB_RELEASE_STORE_PASSWORD`, `GEMHUB_RELEASE_KEY_ALIAS`, and `GEMHUB_RELEASE_KEY_PASSWORD`. Without those, local release builds may use debug signing; `npm run verify:submission` reports this as a warning.

### Known Run Issues

- **Expo Go will not work**: VisionCamera requires native code.
- **iOS Simulator has no real camera**: use the built-in photo-library fallback, or test capture on a physical iPhone.
- **VisionCamera simulator regression can look like a library crash**: if Xcode stops in `HybridCameraPhotoOutput.swift` around `output.maxPhotoDimensions = nearestPhotoDimension`, do not patch VisionCamera first. The intended simulator path is the black "Camera unavailable" shell with the photo-library button. As a human fix, verify the app is still gating simulator capture before mounting `<Camera>`/photo outputs, then rebuild or reload the native app. This can reappear after Pods/native deps are refreshed because the VisionCamera device/output stack may start returning a simulator pseudo-device instead of no device.
- **Android emulator can drop during boot on this host**: if `adb` disconnects or the AVD exits, boot from Android Studio Device Manager or use the wiped/headless command above.
- **Android native linker error for Nitro/VisionCamera**: if you see `libNitroModules.so: unknown file type`, clean native CXX caches and rebuild:

```bash
rm -rf \
  node_modules/react-native-nitro-modules/android/build/intermediates/cxx \
  node_modules/react-native-nitro-modules/android/.cxx \
  node_modules/react-native-nitro-image/android/build/intermediates/cxx \
  node_modules/react-native-nitro-image/android/.cxx \
  node_modules/react-native-vision-camera/android/.cxx \
  node_modules/react-native-vision-camera/android/build/intermediates/cxx
./android/gradlew -p android --stop
(cd android && ./gradlew :app:assembleRelease --no-daemon)
```

- **Android Studio cannot find Node**: `android/settings.gradle` tries to resolve Node from `NODE_BINARY`, `/usr/local/bin/node`, `/opt/homebrew/bin/node`, or the default `nvm` alias. If Android Studio was opened from Finder and Gradle cannot find Node, set `NODE_BINARY` or symlink Node into `/usr/local/bin`.
- **Release credentials are not included**: store upload signing and EAS submit credentials must be supplied by the reviewer/developer.

### Verification Commands

```bash
npm test
npm run typecheck
npm run lint
npm run verify:submission
```

`npm test` runs the regression suite in [`tests/`](tests/): SKU generation/append in [`tests/sku-flow.test.mjs`](tests/sku-flow.test.mjs), product-detail behavior in [`tests/product-detail-redesign.test.mjs`](tests/product-detail-redesign.test.mjs), and app risk/regression guards in [`tests/app-risk-regression.test.mjs`](tests/app-risk-regression.test.mjs).

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

## Scope And UX Divergence

**Included:** Camera → SKU → Product save, Media library, Products library, Product Detail, metadata edits, append-photo-to-existing-SKU, local SQLite persistence, app-owned media storage, gallery import, barcode/QR SKU fill, basic search/filter/sort, and adjustable grid density on Products and Media.

**Deliberately cut:** auth, cloud sync, billing, ecommerce/integrations, hardware workflows, appraisal/editor tooling, AI-generated descriptions, and camera video capture. These were cut to keep the submission focused on the required non-technical jeweler flow: capture an item, assign a SKU, and find it again quickly.

The brief's required catalog shell is Camera, Media, and Products. GemHub Lite ships those plus two deliberate local-only additions for a five-tab bottom shell (Home, Media, Camera, Products, More). `app/index.tsx` redirects to Home on launch.

- Home diverges from a typical three-tab catalog app with a simple launch dashboard: Add Product CTA, product/media counts, and recent products. This gives a jeweler a clear next action instead of dropping them into an empty grid.
- More keeps secondary navigation out of the required capture/catalog loop, so the main tabs stay focused and non-technical users do not have to understand backend or admin concepts.

Both additions are local-only (no network calls). Everything is offline by design.

## Secrets

GemHub Lite is offline-first and ships with no hard-coded secrets. No environment variables, API keys, or backend endpoints are required to build or run the app — all data lives in on-device SQLite and file storage. `.env.example` documents this zero-secrets posture.

## AI Tooling

This app was built AI-first, with engineering judgment applied at every checkpoint. The toolchain was **Claude (Claude Code) and OpenAI Codex running together in a custom multi-agent cluster**. An orchestrator dispatched specialized subagents and I reviewed and steered their output.

The workflow was designed so AI accelerated the work without becoming the source of truth: align before code, stress-test vague requirements, turn the result into a PRD/checklist, slice work into vertical end-to-end journeys, run agents with tight feedback loops, and review the output in a fresh context instead of trusting a long-running chat blindly.

### Workflow (the full pipeline)

1. **Research the real app.** Captured and reviewed production GemHub screenshots to extract the real mental model: capture → required SKU → media/products libraries → detail. Inspection notes live in `docs/research/` (`GEMIQ_APP_RESEARCH.md`, `REAL_APP_INSPECTION_CHECKLIST.md`, `UI_GRAPH.md`) with raw captures in `docs/research/screenshots/`.
2. **Derive a design system from the captures.** The screenshots fed a design pass (`DESIGN.md`) that defined theme primitives, layout, and component patterns, so the Lite UX is intentional rather than a blind clone of production.
3. **Write the plan as a PRD.** Produced a product requirements/plan (`PRP.MD`) plus a harness/agent operating doc (`HARNESS.MD`) that fixed required scope, non-goals, the platform matrix, the data model, and validation gates up front.
4. **Grill the plan before coding.** Stress-tested the PRD against the extracted domain model and terminology — required vs. bonus, scope cuts, SKU rules, and edge cases — so the destination was locked before any implementation.
5. **Turn scope into a machine-followable checklist.** Converted the PRD into an explicit acceptance checklist (`CHECKLIST.md`) covering required journeys, platform validation, quality gates, and scope guardrails. This stayed the single source of truth the agents worked against.
6. **Implement in vertical slices.** Built one end-to-end journey at a time (Camera → required SKU → file copy → SQLite product/media → Products/Media refresh → Product Detail) so each slice proved the full loop before any secondary polish.
7. **Run a subagent orchestra against the checklist.** An orchestrator dispatched specialized subagents (research, design, implementation, platform build/validation, regression, security) in parallel on independent surfaces, while I kept integration decisions centralized and corrected or rejected output that drifted.
8. **Validate with evidence, then review in a fresh context.** Closed each slice with static gates, platform attempts, and captured evidence, then re-reviewed README/submission claims against actual code in clean context to catch stale or overstated docs before submitting.
9. **Drive a live visual feedback loop with Argent.** I used Argent (iOS Simulator / Android Emulator control) to launch the app, navigate the real running build, and interact with each screen (tabs, camera fallback, SKU entry, save, Products/Media refresh, detail). Argent took screenshots of the actual UI and fed them back to the agents, which compared the running output against `DESIGN.md` and the production captures, flagged misalignment (spacing, touch targets, states, flow gaps), proposed fixes, and re-ran the loop until the live screens matched intent.

### How I used AI to move faster without losing control

- **Keep the model in the smart zone.** Instead of asking one giant chat to “build GemHub,” I externalized state into small repo files: `PRP.MD` for destination, `DESIGN.md` for UI rules, `HARNESS.MD` for agent roles, and `CHECKLIST.md` for acceptance. That made it cheap to reset context and re-run agents without losing product intent.
- **Grill before coding.** I used a grill-with-docs pass to challenge vague requirements: what is required vs. bonus, what a non-technical jeweler needs first, which production GemHub features to cut, and how SKU/media persistence should behave. This prevented early drift into auth, cloud sync, AI studio, video, and other impressive-looking but wrong surfaces.
- **Use vertical tracer bullets.** I sliced implementation around end-to-end user journeys rather than horizontal layers: Camera → required SKU → local file copy → SQLite product/media row → Products/Media refresh → Product Detail. This gave immediate feedback that the full loop worked before polishing secondary UI.
- **Role-split the work.** I used separate mental/agent roles for product fit, platform validation, implementation, QA/grill-with-docs, and security/correctness. That kept UI decisions, native setup, persistence, and submission readiness from blending into one vague task.
- **Parallelize only independent surfaces.** While one path focused on camera/SKU persistence, another checked iOS/Android native setup, another reviewed required-scope drift, and another captured validation/runbook evidence. I kept integration decisions centralized so parallel work did not create conflicting architecture.
- **Use AI as an adversarial reviewer, not just a code generator.** I repeatedly asked it to challenge false completion, missing required journeys, stale README claims, platform gaps, and privacy/security risks. This is why the repo includes completion audits, Android issue notes, bundle analysis, and screenshot evidence instead of only code.
- **Close the loop on the running app with Argent.** I did not trust code review alone: I used Argent to launch the build on simulator/emulator, interact with the live flows, and capture real screenshots. Those screenshots went straight back to the AI agents as visual ground truth, so they could validate actual output against `DESIGN.md` and the production references, catch UI/flow misalignment, and propose targeted fixes — then I re-launched and re-shot to confirm the adjustment landed before moving on.
- **Convert advice into tests and gates.** Risk reviews became regression tests in [`tests/`](tests/) for SKU generation, existing-SKU append behavior, stale async refresh guards, touch targets, grid density, media cleanup, and product-detail behavior. Final gates are `npm test`, `npm run typecheck`, `npm run lint`, and `npm run verify:submission`.
- **Trace native failures to evidence.** When Android/VisionCamera failed, I inspected the native artifact itself rather than guessing; the bad Nitro `.so` was zero-filled data, so the fix was a targeted CXX cache clean and rebuild, then release verification.
- **Review in fresh context and correct the docs.** After implementation, I used clean review passes to compare README/submission claims against actual code. That caught and fixed stale claims such as video import support, SKU format, and run/setup requirements.
- **Keep scope honest.** AI suggested broader GemHub-like surfaces (auth, cloud, AI/editor tools, video, production navigation). I cut those when they did not serve the take-home core flow, and documented them as deliberate cuts or bonus backlog.

### One example where I corrected/rejected AI output

The agent first generated SKUs using a **row count** as the sequence suffix (`GH-{rowCount+1}`). I rejected this: with seeded or imported SKUs the row count can lag the highest existing suffix and produce **colliding SKUs**. I changed it to derive the next sequence from the **maximum existing `GH-` suffix + 1** instead (`productsRepo.nextSequence`), which makes generated SKUs collision-safe against non-contiguous data. (See "Generated SKU sequencing uses max existing suffix rather than row count" in `CHECKLIST.md`.)

A second correction worth noting: an early existing-SKU save overwrote product metadata with whatever was in the form, including blanks. I constrained it to **update only non-empty fields**, so appending media from the camera never wipes an existing title or description.

A third correction was the iOS Simulator camera path. A native VisionCamera crash appeared inside `HybridCameraPhotoOutput.swift` at `output.maxPhotoDimensions = nearestPhotoDimension`. An AI pass initially over-focused on the native library/pod symptoms, but the human diagnosis was simpler: the simulator should never enter the real photo-output configuration path. The correct behavior is the app-level fallback shell that says "Camera unavailable" and lets the reviewer choose from the photo library. The fix process was to compare the crashing screen against the intended simulator screenshot, reject node_modules/native-library patching, and keep the app logic responsible for routing simulator validation to library import while leaving real camera capture for physical devices.

## Validation Evidence

Screenshots live in `docs/research/screenshots/validation/` and `docs/evidence/`. Current evidence includes iOS simulator Home, camera fallback, capture preview, product detail, Products grid/filter, Media grid/filter, More, and Android release/emulator evidence where captured.

## Demo Evidence

A walkthrough of the four required journeys (new product from camera, add media to an existing product, existing SKU from camera, and Products/Media sync) is scripted in `docs/submission/DEMO_SCRIPT.md`, with supporting screenshots in `docs/evidence/` and `docs/research/screenshots/validation/`. The script explicitly calls out the iOS simulator camera limitation (no rear camera → photo-library fallback; save/SKU/persistence logic is identical after an image is selected).

## Bonus Scope (Optional Extra Credit Only)

Evaluation is based on the required scope. The items below can strengthen the submission but are not required to pass.

**Bonus shipped:**

- Import from gallery / camera roll, with SKU required before save and the same save rules as camera capture.
- Basic search, filters, and sort on Products and Media.
- Offline-first local persistence with SQLite and app-owned media storage.
- List/grid density toggle on Products and Media.

**Bonus not built:**

- Video capture, short clip per product.
- AI product description via a conventional LLM API such as OpenAI or Anthropic, e.g. a button on preview or product detail that drafts a description from title/type and remains user-editable before save.
- Offline-first sync to Supabase or other cloud storage.

Completing only the required scope can still receive a strong pass. Bonus work mainly shows range and polish, not baseline competence.

## Time Spent

About half a day total, split across Thursday night and the following Monday night. Most time went into native setup/camera validation, SKU edge cases, and keeping the required save/search flows reliable on both platforms.
