# GemHub Lite Progress

## Current Status

- Phase: Camera capture/save and Product Detail slices implemented; native/manual validation still pending.
- Repo state: Expo TypeScript app, UI primitives, SKU/domain persistence, camera capture/save flow, repository-backed Products/Media tabs, and editable Product Detail exist alongside planning docs.
- Current blocker: iOS native build, Android native build, real camera smoke, and manual persistence smoke remain unverified.
- Next slice: run native iOS/Android validation, then close README/demo evidence gaps.

## Log

### 2026-05-28

- Implemented camera route fixes from handoff: VisionCamera live preview/capture screen, permission states, captured media copy into app document media directory, capture preview review form, required SKU gate, generated SKU action, existing-SKU append, and replace-navigation to `/product/[sku]`.
- Updated route consistency: Product Detail Add Photo now uses `/(tabs)/camera?sku=...`, Camera forwards SKU into `/capture-preview`, and save route targets `/product/[sku]` instead of stale `[id]`.
- Confirmed `app.json` carries iOS/Android camera permissions; `react-native-vision-camera@5.0.11` has no package config plugin file in this install, so no invalid plugin entry was added.
- Ran `npm run typecheck` successfully after camera route fix on 2026-05-28.
- Ran `npm run lint` successfully after camera route fix on 2026-05-28.
- Native gates not run in this session: `npm run ios`, `npm run android`, live-camera screenshots, and save-flow screenshots remain pending.

- Implemented Product Detail slice from handoff: `app/product/[sku].tsx`, `src/features/product-detail/`, `ProductCard`, `MediaTile`, and repo-backed Products/Media grids.
- Added Product Detail edit form for title, product type, and description with explicit Save, inline save error, immutable SKU header, media grid, and Add Photo route to `/camera?sku=...`.
- Reconciled Camera/Product Detail imports to the locked persistence barrels: `productsRepo.upsertBySku`, `mediaRepo.appendMedia`, and `src/lib/files`.
- Confirmed Camera route reads SKU param and forwards it into capture preview/save path.
- Ran `npm run typecheck` successfully after Product Detail changes.
- Ran `npm run lint` successfully after Product Detail changes.

- Implemented persistence/domain slice from handoff: `src/domain`, `src/lib/db`, `src/lib/files`, `src/features/products/store.ts`, and `src/features/media/store.ts`.
- Added SKU normalization, validation, generated SKU formatting/parsing, product/media types, SQLite v1 schema, migration runner, product repository, media repository, and no-orphan media guard.
- Added app-document media directory helpers with Expo FileSystem `Directory`/`File` API for camera slice reuse.
- Wired Products and Media tabs to repository-backed focus-refresh hooks, preserving empty/error/loading states.
- Updated `FEATURES.md` and `CHECKLIST.md` for implemented persistence contracts while leaving test rows unchecked per no-Jest handoff.

- Built modular UI library under `src/components/ui/` with folder-per-component primitives: `Text`, `Icon`, `Button`, `Card`, `Chip`, `Thumbnail`, `Field`, `Picker`, `ActionSheet`, `EmptyStateCard`, and `Screen`.
- Added theme context module: `ThemeProvider`, `useTheme`, theme barrel exports, and derived theme/token types.
- Mounted `ThemeProvider` in `app/_layout.tsx` and updated tab icons to use Ionicons through the UI `Icon` primitive.
- Installed `@expo/vector-icons` through `npx expo install @expo/vector-icons`.
- Removed legacy presentation mocks: deleted `src/components/design/`, deleted old `src/components/ui/screen.tsx`, and removed all legacy product fixture references.
- Stubbed Products, Media, Camera, Capture Preview, and Product Detail screens so downstream camera/detail slices can rebuild feature components cleanly.
- Ran `npm run typecheck` successfully.
- Ran `npm run lint` successfully.
- Ran UI guardrail searches: no raw `fontSize:` in `app` or `src/components`, no direct UI imports from `@/src/theme/theme`, no legacy product fixtures, and `src/components/design` is gone.
- Ran `npx expo start --clear --localhost`; Metro started and waited on `http://localhost:8081`, then was stopped manually.
- Added follow-up validation gate: cross-reference UI against a real-device hosted test page using `agent-device` snapshots before calling UI validation complete.

- Created planning artifacts: `PRP.MD`, `HARNESS.MD`, `DESIGN.md`, `CHECKLIST.md`, `FEATURES.md`, `PROGRESS.md`.
- Created research folders: `docs/research/` and `docs/research/screenshots/`.
- Created short real-app inspection checklist: `docs/research/REAL_APP_INSPECTION_CHECKLIST.md`.
- Added research handoff: `docs/research/HANDOFF.md`.
- Locked initial stack assumptions: Expo Router, VisionCamera v5, `expo-sqlite`, MMKV, filesystem media URIs.
- Locked scope guardrail: no app scaffold or implementation before real-app analysis and final execution plan.
- Captured iPhone Mirroring Home/dashboard screenshot: `docs/research/screenshots/01-home.png`.
- Captured Camera/post-capture product-info evidence: `docs/research/screenshots/03-capture-product-info.png`.
- Updated `docs/research/GemHubApp.md` with observed capture -> SKU -> save screen facts.
- Captured unknown-SKU sheet, create-new-SKU flow, product form fields, product type picker, ring subtype picker, filled save form, and second-capture reset state.
- Observed Products empty state through iPhone Mirroring without macOS screenshot capture: title, `+ New`, SKU search, filter chip, tutorial card, and `Add Product` CTA.
- Updated `DESIGN.md` with reusable `InventoryShell`, `CapturePreviewForm`, and Product Detail component contracts plus scaffold gate.
- Scaffolded Expo app through a URL-safe temporary project, then copied scaffold files into the existing repo while preserving docs.
- Installed baseline dependencies: Expo Router, safe-area/screens/gesture-handler, `expo-sqlite`, `expo-file-system`, `expo-image`, `expo-haptics`, and `react-native-mmkv`.
- Deferred VisionCamera per scaffold plan; native camera work starts after foundation compiles.
- Added route shell: `/`, Camera tab, Media tab, Products tab, Capture Preview stack route, and Product Detail stack route.
- Added reusable source foundation: theme tokens, theme export, and `Screen` scroll/safe-area primitive.
- Configured `package.json` scripts for `start`, `ios`, `android`, `web`, `typecheck`, and `lint`.
- Configured TypeScript aliases for `@/*` and `@/src/*`; added `ignoreDeprecations` for TypeScript 6 `baseUrl` warning.
- Ran `npm run typecheck` successfully after TypeScript config fix.
- Ran `npm run lint`; first run installed Expo ESLint config, second run passed.
- Ran `npx expo start --clear --localhost`; Metro started and waited on `http://localhost:8081`, then was stopped manually.
- Noted dependency warnings: npm reports 10 moderate audit findings from scaffold dependencies, and Expo Router install emits a `react-native-worklets` peer warning from Expo SDK 56 packages.

## Commands Run

```bash
rtk pwd
rtk git status --short --branch
rtk ls -la
rtk mkdir -p docs/research/screenshots docs/visuals
screencapture -x -l 113670 docs/research/screenshots/01-home.png
screencapture -x -l 113670 docs/research/screenshots/03-capture-product-info.png
cd /Users/B/Documents
rtk proxy npx create-expo-app@latest gemhub-lite-scaffold-temp --template blank-typescript
rsync -a --exclude='.git' --exclude='node_modules' --exclude='AGENTS.md' --exclude='CLAUDE.md' --exclude='LICENSE' --exclude='.claude' /Users/B/Documents/gemhub-lite-scaffold-temp/ "/Users/B/Documents/GemHub Lite/"
rtk proxy npm install
rtk proxy npx expo install expo-router react-native-safe-area-context react-native-screens react-native-gesture-handler expo-sqlite expo-file-system expo-image expo-haptics
rtk proxy npm install react-dom@19.2.3 --save-dev
rtk proxy npm install react-native-mmkv
rtk proxy npm run typecheck
rtk proxy npm run lint
rtk proxy npx expo start --clear --localhost
```

## Platform Status

| Platform | Status | Evidence |
| --- | --- | --- |
| iOS | Scaffold only | `expo run:ios` script configured; native build not run in scaffold slice |
| Android | Scaffold only | `expo run:android` script configured; native build not run in scaffold slice |
| Real app/iPhone Mirroring | In progress | Existing screenshots plus Products empty-state observation on 2026-05-28 |

## Screenshot Evidence

- `docs/research/screenshots/01-home.png` — Home/dashboard, quick actions, bottom nav.
- `docs/research/screenshots/03-capture-product-info.png` — Post-capture review, SKU field, Save Product CTA.
- `docs/research/screenshots/07-sku-does-not-exist.png` — Unknown SKU sheet with Create New SKU.
- `docs/research/screenshots/09-new-sku-product-form.png` — Expanded product form after Create New SKU.
- `docs/research/screenshots/11-product-type-menu.png` — Top-level product type picker.
- `docs/research/screenshots/13-ring-type-selected.png` — Ring subtype picker.
- `docs/research/screenshots/14-filled-product-form.png` — Minimal filled save form.
- `docs/research/screenshots/16-second-capture-blank-sku.png` — Second capture reset state after save.
- Products empty-state observation — iPhone Mirroring live view only; no new macOS screenshot per handoff.

## Next Actions

1. Add domain tests for SKU normalization, generated SKU sequence, duplicate SKU append, and no orphan media.
2. Implement product/media types plus SQLite schema and repositories.
3. Build Products and Media empty states against repository reads.
4. Install/configure VisionCamera only when starting the camera slice.
5. Run iOS and Android native build gates when native camera/development-client work begins.
