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

Required local environment:

- Node `22.21.0` recommended and pinned in `.nvmrc` / `.node-version`; package range is Node `>=20.19 <23`.
- npm `>=10`.
- Xcode + iOS Simulator for `npx expo run:ios`.
- Android Studio / Android SDK for `./gradlew`; this repo uses Gradle `9.3.1`, compile/target SDK `36`, min SDK `24`, and NDK `27.1.12297006`.
- A native development build is required because the app uses VisionCamera; Expo Go is not enough.
- No backend env vars or API keys are required. `.env.example` is intentionally empty/placeholder because the app is local-only.

Install dependencies:

```bash
npm install
```

Then run on a platform below. Optional checks: `npm test`, `npm run typecheck`, `npm run lint`, and `npm run verify:submission`.

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

### Workflow (the full pipeline)

1. **Inspect the real app.** Captured and reviewed production GemHub screenshots to extract the real mental model: capture → required SKU → media/products libraries → detail. Inspection notes live in `docs/research/` (`GEMIQ_APP_RESEARCH.md`, `REAL_APP_INSPECTION_CHECKLIST.md`) and captures in `docs/research/screenshots/`.
2. **Generate a design system from the real captures.** The screenshots fed a design pass (`DESIGN.md`) that defined the theme primitives, layout, and component patterns, so the Lite UX is intentional rather than a blind clone.
3. **Plan.** Produced a product requirements/plan (`PRP.MD`) and a harness/agent operating doc (`HARNESS.MD`) describing how the agent cluster should run.
4. **Grill the plan.** Stress-tested the plan against the extracted domain model and terminology before writing code, sharpening SKU rules, scope boundaries, and edge cases.
5. **Establish a checklist for the AI.** Turned scope into an explicit, machine-followable acceptance checklist (`CHECKLIST.md`) covering required journeys, platform validation, quality gates, and scope guardrails. The cluster worked against this as its source of truth.
6. **Build toward the goal with a subagent orchestra.** An orchestrator ran multiple specialized subagents (inspection, design, implementation, build/validation, regression) in parallel to drive each area to completion, while I corrected and rejected output where it was wrong.

### One example where I corrected/rejected AI output

The agent first generated SKUs using a **row count** as the sequence suffix (`GH-{rowCount+1}`). I rejected this: with seeded or imported SKUs the row count can lag the highest existing suffix and produce **colliding SKUs**. I changed it to derive the next sequence from the **maximum existing `GH-` suffix + 1** instead (`productsRepo.nextSequence`), which makes generated SKUs collision-safe against non-contiguous data. (See "Generated SKU sequencing uses max existing suffix rather than row count" in `CHECKLIST.md`.)

A second correction worth noting: an early existing-SKU save overwrote product metadata with whatever was in the form, including blanks. I constrained it to **update only non-empty fields**, so appending media from the camera never wipes an existing title or description.

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

## Submission

Static gates pass (`npm test`, `npm run typecheck`, `npm run lint`) and `npm run verify:submission` currently reports no local blockers with warnings for real signing/submission credentials. Android release artifacts and captured iOS/Android simulator or emulator evidence live under `docs/submission/` and `docs/evidence/`; real-device camera proof remains separate from simulator validation.
