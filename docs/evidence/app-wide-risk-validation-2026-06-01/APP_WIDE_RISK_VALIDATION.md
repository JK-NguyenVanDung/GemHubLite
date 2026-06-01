# GemHub Lite App-Wide Risk Validation — 2026-06-01

## Scope

This pass treats the pasted advice catalog as consulting input for the whole app, not as literal found bugs and not only as requirement-spec coverage. The app was checked across UI/layout, navigation, camera/media, storage, performance, native config, Android/iOS behavior, and error handling.

## Corrections From Prior Pass

- Scope corrected after review: Home and More are out-of-scope; the required shell is Media / Camera / Products and launch redirects to Camera.
- Earlier evidence that showed Home/More is now marked historical only and no longer represents current scope.
- The app-wide validation now records which advice areas were applied, already covered, not applicable, blocked, or fixed.

## Fixes Applied

| Area | Fix | Files |
| --- | --- | --- |
| Image flicker/caching | Switched shared thumbnails, media tiles, and product covers from React Native `Image` to `expo-image` with `memory-disk` cache and short transition. | `src/components/ui/Thumbnail/Thumbnail.tsx`, `src/features/media/components/MediaTile.tsx`, `src/features/products/components/ProductCard.tsx` |
| Touch targets | Raised shared small buttons, filter chips, action-sheet rows, camera round controls, capture-review round icons, and thumbnail hit targets toward 44 pt mobile minimums. | `src/components/ui/Button/Button.tsx`, `src/components/ui/FilterSheet/FilterSheet.tsx`, `src/components/ui/ActionSheet/ActionSheet.tsx`, `src/features/camera/components/CameraView.tsx`, `src/features/camera/components/CaptureReview.tsx`, `src/components/ui/Thumbnail/Thumbnail.tsx` |
| Text scaling overflow | Added default `maxFontSizeMultiplier=1.3` to themed text and key text inputs so dynamic type cannot blow up fixed jewelry cards/forms while still allowing moderate scaling. | `src/components/ui/Text/Text.tsx`, `src/components/ui/Field/Field.tsx`, `src/features/camera/components/CaptureReview.tsx` |
| Android keyboard layout | Changed scanner modal `KeyboardAvoidingView` to iOS-only padding behavior instead of Android `height`, avoiding known Android resize jumps. | `src/features/camera/components/CaptureReview.tsx` |
| Route/deep-link safety | Product detail now exits loading and shows a user-facing error if the dynamic SKU route param is missing. | `src/features/product-detail/hooks/useProductDetail.ts` |
| Accessibility context | Product and media cards expose SKU-specific labels; product cards now include title, media count, and type, and SKU chooser controls have explicit accessibility labels. | `src/features/products/components/ProductCard.tsx`, `src/features/media/components/MediaTile.tsx` |
| Production log flood | Root error boundary logs details only in development builds, avoiding production bridge log spam after recoverable boundary catches. | `src/components/ErrorBoundary.tsx` |
| Scope/document consistency | PRP, design, and README now agree that Home/More are excluded and the required shell is Media / Camera / Products. | `PRP.MD`, `DESIGN.md`, `README.md` |
| Lint hygiene | Removed unused theme hooks in list screens. | `app/(tabs)/media.tsx`, `app/(tabs)/products.tsx`, `app/product/[sku].tsx` |
| Shell scope cleanup | Removed Home/More route files and restored strict Media / Camera / Products navigation. | `app/index.tsx`, `app/(tabs)/_layout.tsx` |
| Capture preview image caching | Added `expo-image` memory-disk caching to the full capture preview image, not only list thumbnails/cards. | `src/features/camera/components/CaptureReview.tsx` |
| Android SKU input hardening | Disabled autocorrect on generated-SKU prefix and scanner manual-code inputs to avoid keyboard mutation of SKU identity. | `src/features/camera/components/CaptureReview.tsx` |
| Reusable Product Detail gallery | Updated the exported media grid to always include Add Photo, so future Product Detail composition cannot hide the existing-SKU append action once media exists. | `src/features/product-detail/components/MediaGrid.tsx` |
| SKU chooser accessibility | Added explicit labels to the SKU chooser trigger, modal backdrop, existing-SKU rows, and maintained 44 pt row targets. | `src/features/camera/components/CaptureReview.tsx` |
| Focus refresh race guard | Products, Media, and Product Detail now ignore stale SQLite refresh results after blur/unmount so old async reads cannot overwrite newer route state. | `src/features/products/store.ts`, `src/features/media/store.ts`, `src/features/product-detail/hooks/useProductDetail.ts` |
| Sheet accessibility/back behavior | Shared action/filter sheets already use `onRequestClose`; backdrop/close rows have explicit labels and selected filter chips expose selected state. | `src/components/ui/ActionSheet/ActionSheet.tsx`, `src/components/ui/FilterSheet/FilterSheet.tsx` |
| Image temp-file cleanup | Image compression temp files are deleted in a `finally` block even if the copy into app-owned media storage fails. | `src/lib/files/media-storage.ts` |
| Generated SKU collision guard | Generated SKU sequence now uses the max existing numeric suffix for the date instead of row count, avoiding collisions if imported/seeded data has gaps. | `src/lib/db/repositories/products.ts` |
| Hot list callback stability | Product/media list item navigation now uses stable callbacks through card/tile components instead of recreating item press closures in hot FlatList render paths. | `app/(tabs)/products.tsx`, `app/(tabs)/media.tsx`, `src/features/products/components/ProductCard.tsx`, `src/features/media/components/MediaTile.tsx` |
| Route param SKU guard | Camera and capture preview normalize array/string SKU params and use only sanitized valid SKU values for prefill, import, retake, and intent handoff. | `app/(tabs)/camera.tsx`, `src/features/camera/components/CaptureReview.tsx` |
| Existing SKU metadata update | Existing SKU saves append media and update non-empty product metadata without creating duplicate product rows. | `src/lib/db/repositories/products.ts`, `src/features/camera/components/CaptureReview.tsx` |

## Advice Catalog Mapping

| Advice group | Status | Evidence / decision |
| --- | --- | --- |
| KeyboardAvoidingView misconfiguration | Fixed | Scanner modal no longer uses Android `height` behavior. |
| Safe areas / insets | Covered | Shared `Screen`, sheets, and capture preview use `react-native-safe-area-context`; footer uses bottom safe area. |
| Android elevation clipping | Not currently applicable | App styling uses borders/card surfaces and no legacy Android elevation shadows were found. |
| lineHeight crashes | Covered | Theme typography includes explicit `fontSize` with line-height-like values; no custom unloaded fonts. |
| System text-scaling overflow | Fixed / bounded | `Text` and key inputs have moderate max multiplier. |
| Zero-dimension images | Covered | Thumbnails/cards/media tiles set explicit square dimensions or aspect ratios. |
| Nested ScrollView deadlocks | Covered | Main large lists use `FlatList`; scanner scroll uses `keyboardShouldPersistTaps`. No nested virtualized-scroll deadlock found. |
| Absolute positioning / zIndex | Covered | Overlay buttons define explicit size/position and `zIndex` where overlapping SKU input. |
| Splash white flash | Not changed | Native splash config exists; no runtime white-flash evidence captured in this pass. |
| Auth redirect loops | Not applicable | No auth stack. |
| Dynamic route slug collisions | Covered | Only one dynamic route folder: `app/product/[sku].tsx`. |
| Route param serialization | Fixed / covered | Router params are strings only; media metadata is stringified before navigation; SKU params are normalized from string/array inputs and invalid values are ignored. |
| Deep link cold boot | Fixed one real edge | Missing product SKU no longer leaves Product Detail stuck loading. Full cold deep-link device test still pending. |
| Android back button bypass | Covered | RN `Modal` sheets provide `onRequestClose`; sheet backdrops/close controls are explicitly labeled; no custom multi-step checkout. |
| AppState interval freeze | Covered | No app-critical intervals found; camera mount timer cleans up. |
| Ephemeral permissions expiry | Covered | Camera and image library permissions are requested at action time and denial surfaces user-facing messages. |
| Android 16 edge-to-edge shifts | Needs device evidence | Safe areas are implemented; Android emulator UI evidence was blocked by host ADB. |
| Background network throttling | Not applicable | Local-first app; no uploads/API flows. |
| Orientation recalculations | Covered | Responsive layout uses `useWindowDimensions`, not cached `Dimensions.get`. |
| Production console/log flood | Fixed / covered | No logging loops found; root error-boundary details now log only in development builds. |
| Index keyExtractor | Covered | FlatLists use stable IDs/SKUs, not array index keys. |
| Uncached image flickering | Fixed | Shared thumbnail, media grid, and product card images now use `expo-image` cache. |
| Inline callbacks / React Compiler | Partially accepted | Hot list renderers are memoized where useful; remaining callbacks are small navigation handlers and not proven bottlenecks. |
| Dangling listeners | Covered | Keyboard listeners and camera timer clean up. |
| Main-thread blocking operations | Covered | No large `JSON.parse`, crypto, or heavy regex loops in app runtime paths. |
| Dynamic FlatList layout jumps | Accepted | Variable-height product/media cards make `getItemLayout` unsafe; virtualization settings already tuned. |
| Context state overuse | Covered | Data loading is screen-local hooks, not root high-frequency context. |
| Expo Go vs dev build | Covered | Native iOS/Android folders and builds exist for VisionCamera. |
| Missing config plugins | Covered | Config/native manifests are verified by `npm run verify:submission`. |
| EAS env omissions | Blocked outside code | Submit placeholders remain until real store credentials are provided. |
| Android 16KB page size | Needs release/device evidence | Native libs compile in current debug/release outputs; real provider matrix remains documented separately. |
| Android predictive text duplication | Mitigated | SKU/search inputs disable autocorrect and autocapitalize characters. |
| Production-only Home/More drift | Fixed | Home/More route files are removed; production-only profile, notifications, collections, and support-placeholder surfaces cannot appear in the tab shell. |
| Android multiline overflow | Covered | Shared `Field` sets `textAlignVertical: "top"` for multiline. |
| AsyncStorage overload | Not applicable | SQLite plus app-owned file storage; no AsyncStorage payload persistence. |
| Hermes date parsing | Covered | Generated SKU uses `Date` object fields, not fragile date-string parsing. |
| SQLite locks / orphan media / SKU sequence | Fixed / covered | Capture save is transactional; failed saves delete copied file; startup orphan cleanup exists; generated SKU sequence uses max suffix rather than count. |
| Raw SVG rendering | Not applicable | No raw SVG rendering path. |
| Notification payload mismatch | Not applicable | No push notifications. |
| Async state races | Fixed | Focused SQLite refresh hooks now use request IDs and invalidate pending reads on blur/unmount. |
| Blob/file leaks | Fixed / covered | File APIs copy app-owned files; image manipulation temp files are cleaned up in `finally`; no open blob streams. |
| Theme switch artifacts | Not applicable | No runtime theme switch feature. |
| Dev-client network interceptor drops | Covered | Native verifier checks dev-client/local-network residue; app has no upload pipeline. |
| Missing global error boundary | Covered | Root layout wraps app in `ErrorBoundary`. |

## Remaining Validation Gaps

- Android emulator UI/manual flow remains blocked until `adb devices` shows a booted device.
- Real-device VisionCamera capture remains required; simulator camera fallback is not enough.
- Store signing and submit credentials remain external placeholders.
- Full cold deep-link testing requires device/emulator runtime evidence.

## Final Verification Addendum

- `npm run test` passed.
- Added `tests/app-risk-regression.test.mjs` so 3-tab scope, scope-doc consistency, expo-image cache usage, development-only error logging, hardened touch targets, stable hot-list callbacks, and storage/input advisory risks are regression-checked.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run verify:submission` passed with no local blockers and 5 warnings: host disk under 5 GB, missing real-device camera proof, missing Android signing env vars, placeholder iOS submit values, placeholder Android service account path.
- Re-ran after expanding image-cache fixes to MediaTile and ProductCard.
- `./android/gradlew -p android :app:assembleDebug` passed.
- `xcodebuildmcp build_run_sim` previously passed on iPhone 17 Pro simulator; current source scope was later corrected to Media / Camera / Products and needs a fresh runtime screenshot pass.
- Android emulator UI remains blocked because `adb devices -l` lists no devices and `android layout --device=emulator-5554 --pretty` cannot find the emulator.
- PRP/DESIGN/README scope language was reconciled to strict Media / Camera / Products, then static gates were rerun.
- A later Android debug compile retry after test/doc-only changes stalled in native CMake while the host remained under the verifier's 5 GB free-space warning; no app code changed after the previous successful `assembleDebug`.

## Continuation Addendum — 2026-06-01

- Re-verified the current route state before edits: launch remains Home and tab shell remains Home, Media, Camera, Products, More.
- Fixed additional applicable app-wide risks: Home/More routes removed; capture preview image uses `expo-image` memory-disk caching; generated-SKU prefix and scanner manual-code inputs disable autocorrect; reusable Product Detail `MediaGrid` always exposes Add Photo; shared tiles/cards use stable press callbacks and accessibility labels.
- Expanded `tests/app-risk-regression.test.mjs` to lock those fixes.
- `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run verify:submission` passed after the continuation fixes.
- `./android/gradlew -p android :app:assembleDebug` passed after the continuation fixes; log: `RUNTIME_ATTEMPT_2026-06-01.md`.
- iOS runtime refresh is blocked in this continuation by CoreSimulator service connection refusal after `xcodebuildmcp build_run_sim` timed out at 120 s.
- Android runtime refresh is blocked in this continuation by `Pixel_9` appearing in adb briefly, then dropping before install/layout/screenshot.
- Full command and blocker evidence: `docs/evidence/app-wide-risk-validation-2026-06-01/RUNTIME_ATTEMPT_2026-06-01.md`.
- A follow-up retry also hardened SKU chooser/ProductCard accessibility labels and confirmed `npm run test`, `npm run typecheck`, `npm run lint`, and `npm run verify:submission` still pass.
- Android runtime retry on `LowRam_API36` hit the same host-side adb drop before install/layout/screenshot; this is recorded in `RUNTIME_ATTEMPT_2026-06-01.md`.
- iOS runtime refresh later succeeded on iPhone 17 Pro after starting Metro; live Media, Camera fallback, Products, Product Detail, and Add Photo sheet screenshots are recorded in `RUNTIME_ATTEMPT_2026-06-01.md`.
- Android final retry on `Pixel_9` still dropped from adb before install/layout/screenshot.

## Scope Correction Addendum

- Reverted shell to the required take-home scope: Media / Camera / Products only.
- `app/index.tsx` now redirects launch to Camera.
- `app/(tabs)/home.tsx` and `app/(tabs)/more.tsx` were removed as out-of-scope surfaces.
- Regression coverage now fails if Home/More routes return, if docs re-allow Home/More, or if hot list item callbacks/accessibility hardening regress.
- The pasted advisory catalog was re-applied app-wide: navigation scope, image caching, text inputs, touch targets, list callbacks, storage cleanup, route params, error boundary, and SQLite/file integrity are tracked as fixed/blocked/not-applicable instead of ignored for being outside the minimum spec.
