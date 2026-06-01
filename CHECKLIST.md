# GemHub Lite Checklist

## Planning Artifacts

- [x] `PRP.MD` created.
- [x] `HARNESS.MD` created.
- [x] `DESIGN.md` created.
- [x] `docs/research/REAL_APP_INSPECTION_CHECKLIST.md` created.
- [ ] `docs/research/GemHubApp.md` completed after real-app analysis.
- [x] Screenshots captured in `docs/research/screenshots/`.
- [x] Final implementation plan created after research.

## Real App Inspection

- [x] Entry/navigation captured.
- [ ] Media area captured and summarized.
- [x] Products empty state captured and summarized.
- [ ] Product Detail captured and summarized.
- [x] Camera area captured or blocker documented.
- [x] SKU save flow captured or blocker documented.
- [x] New SKU creation captured.
- [x] Product type hierarchy captured.
- [ ] Existing SKU append behavior captured.
- [x] Safe Lite adaptations identified.
- [x] Proprietary/non-core surfaces explicitly excluded.

## Required Product Journeys

- [ ] New product from camera: capture -> SKU -> save -> Products + Media updated on real device; simulator fallback flow exists.
- [x] Add media to existing product from Product Detail.
- [x] Existing SKU from Camera appends media and may update product metadata without duplicate product.
- [x] Products list shows SKU, title/placeholder, thumbnail, media count, search, type filter, and sort; populated cards implemented, manual visual verification pending.
- [x] Media gallery shows thumbnail, SKU/product context, search, type filter, date filter, and sort.
- [x] Local media storage defined for image/video assets under app-owned `Documents/media/` directories.
- [x] Image imports/captures compressed before persistence while retaining high visual quality.
- [x] Video imports request platform H.264 1280x720 export when available and persist video metadata locally.
- [x] Media tap opens Product Detail for linked SKU.
- [x] Product Detail edits title, description, and type.
- [x] Product Detail shows all local image/video media for product.
- [x] SKU is always required before save.

## Platform Validation

- [x] App-wide pasted-advice validation artifact added: `docs/evidence/app-wide-risk-validation-2026-06-01/APP_WIDE_RISK_VALIDATION.md`.
- [x] Image caching/flicker advice applied across product/media grid image paths with `expo-image` memory-disk caching.
- [x] App-wide mobile touch-target pass includes shared buttons, sheets, filters, camera controls, thumbnail press areas, and capture-review controls.
- [x] Production logging pass completed: no hot-loop logs found; error-boundary detail logging is development-only.
- [x] PRP/DESIGN/README scope language reconciled to strict Media / Camera / Products shell.
- [x] Regression tests added for the revert and app-wide advice fixes: `tests/app-risk-regression.test.mjs`.
- [x] Android debug compile passed on 2026-06-01: `./android/gradlew -p android :app:assembleDebug`.
- [x] iOS final rebuild passed on 2026-06-01: `xcodebuildmcp build_run_sim`; current source route scope is Media / Camera / Products only.
- [ ] Android strict UI validation blocked on 2026-06-01: `android emulator start Pixel_9` reported `emulator-5554`, but `adb devices` stayed empty and `android layout` could not find the device.

- [ ] Real-device hosted test page cross-checked with `agent-device` snapshots before UI validation is called complete.
- [x] iOS app builds/runs or exact blocker documented: `npm run ios -- --no-build-cache` built and installed on iPhone 17 Pro simulator on 2026-05-30; VisionCamera simulator capture remains limited by no rear camera.
- [x] Android app builds/runs or exact blocker documented: `npm run android -- --variant debug` built, installed, and opened on Pixel_9 emulator on 2026-05-30.
- [x] iOS Xcode build/install/launch verified with `xcodebuildmcp build_sim`, `install_app_sim`, and `launch_app_sim` on iPhone 17 Pro simulator on 2026-05-30. Evidence: `docs/evidence/ios-launch-iphone17pro.png`.
- [x] iOS dev-client residue removed from native project: no `_expo._tcp`, no local-network usage copy, no dev-launcher build phase; rebuilt and relaunched on iPhone 17 Pro simulator on 2026-05-30. Evidence: `docs/evidence/ios-home-clean-2026-05-30.png`.
- [x] iOS app store metadata pre-flight: `ITSAppUsesNonExemptEncryption=false`, stable `gemhublite` URL scheme baked into the built app on 2026-05-30. Evidence: `docs/evidence/ios-home-storeready-2026-05-30.png`.
- [x] Android release manifest perms restricted to `CAMERA`, `INTERNET`, `ACCESS_NETWORK_STATE`, dynamic receiver signature perm (legacy storage/media/audio perms blocked + tools:node="remove" in native manifest); camera hardware `required="false"`. Evidence: `android/app/build/intermediates/packaged_manifests/release/processReleaseManifestForPackage/AndroidManifest.xml`.
- [x] Android local-first release privacy tightened: `INTERNET` and `ACCESS_NETWORK_STATE` blocked, `allowBackup=false`, cloud backup/device transfer excluded with XML rules, release AAB rebuilt on 2026-05-30.
- [x] Android production signing hooks wired via env/Gradle properties; current AAB still uses debug signing until real keystore credentials are provided.
- [x] `eas.json` build/submit profiles added for development/preview/production on both platforms.
- [x] Android resize responsiveness captured at compact and expanded sizes. Evidence: `docs/evidence/android-compact-720x1280-2026-05-30.png`, `docs/evidence/android-expanded-1440x2000-2026-05-30.png`.
- [x] Android release AAB produced. Evidence: `android/app/build/outputs/bundle/release/app-release.aab` (~85 MB on 2026-05-30).
- [ ] iOS camera permission verified.
- [ ] Android camera permission verified.
- [ ] Camera capture verified or device/simulator limitation documented.
- [ ] Safe areas verified on small and large phone sizes.
- [ ] Keyboard/form behavior verified.
- [ ] Image URIs load after app restart.
- [x] Media rows persist kind, MIME type, dimensions, duration, original/stored bytes, and compression status.

## Quality Gates

- [x] `npm run typecheck` passes or exact blocker documented: passed after local storage/compression review on 2026-05-30.
- [x] `npm run lint` passes or exact blocker documented: passed after local storage/compression review on 2026-05-30.
- [x] `npm test` passes or exact blocker documented: skipped by user request on 2026-05-30.
- [x] No hard-coded secrets: source scan passed on 2026-05-30.
- [x] No orphan media possible.
- [x] No duplicate product for normalized SKU.
- [x] Retryable save failure has visible retry UX on Capture Review.
- [x] Low-storage risk has startup warning + per-media write preflight.
- [x] README install/run instructions verified against current scripts on 2026-05-30.
- [x] Demo evidence prepared for iOS launch, Android launch/resize, and Android release AAB.
- [x] Store metadata/privacy-label draft prepared at `docs/submission/STORE_METADATA.md`.
- [x] Local submission verifier added and passing with credential-only warnings: `npm run verify:submission`.
- [x] Real-device camera evidence template added and verifier-protected: `docs/evidence/REAL_DEVICE_CAMERA.md` must contain `VERIFIED_REAL_DEVICE_CAMERA=true` before completion.
- [x] Submission runbook added: `docs/submission/SUBMISSION_RUNBOOK.md`.
- [x] Store icon/privacy checks added to `npm run verify:submission`: app icons, adaptive icon assets, iOS privacy manifest, tracking=false, collected-data section.
- [x] Completion audit added and verifier-linked: `docs/submission/COMPLETION_AUDIT.md`.
- [x] Node version pin added for submission environment: `.nvmrc` and `.node-version` both use `22.21.0`; doctor prints the exact fix command when local Node is wrong.
- [x] Screenshot evidence manifest added and verifier-linked: `docs/submission/SCREENSHOT_EVIDENCE.md`.
- [x] Android provider/OS matrix added and verifier-linked: `docs/submission/ANDROID_DEVICE_MATRIX.md`; verifier also requires API36 release/no-network evidence and API37 blocker proof.
- [x] Performance runbook added and verifier-linked: `docs/submission/PERFORMANCE_RUNBOOK.md`; verifier also requires Android 1000-row and trim-memory evidence files.
- [x] Bundle analysis artifact added and verifier-linked: `docs/submission/BUNDLE_ANALYSIS.md` verifies Expo Atlas Android export proof.

## Scope Guardrails

- [x] Home and More tabs are excluded from the required shell.
- [x] Pasted advice catalog reviewed app-wide; applicable issues fixed or recorded as blocked/not-applicable in evidence.
- [x] No auth/org/cloud sync built before core flows.
- [x] No hardware controls built before core flows.
- [x] Product and Media filter capability added without editor/background-removal pipeline.
- [ ] Bonus features deferred until required scope passes.

## Strict Validation Continuation — 2026-06-01

### Fixed

- [x] Required 3-tab shell restored: Media / Camera / Products.
- [x] Home and More route files removed so production-only profile/support surfaces cannot appear.
- [x] Capture preview image path now uses `expo-image` memory-disk caching.
- [x] Generated SKU prefix and scanner manual-code inputs disable autocorrect for Android keyboard safety.
- [x] Reusable Product Detail gallery keeps Add Photo available after existing media.
- [x] Regression tests cover the above app-wide fixes.

### Still Blocked / Needs Device Evidence

- [ ] Android strict UI pass still requires a visible adb target before layout/screenshot evidence can be refreshed.
- [x] iOS runtime UI refreshed on iPhone 17 Pro after Metro launch: Media, Camera fallback, Products, Product Detail, and Add Photo sheet screenshots captured.
- [ ] Real-device VisionCamera capture remains separate from simulator/emulator validation.

### Verified In This Continuation

- [x] `npm run test` passed after continuation fixes.
- [x] `npm run typecheck` passed after continuation fixes.
- [x] `npm run lint` passed after continuation fixes.
- [x] `npm run verify:submission` passed after continuation fixes with documented warnings only.
- [x] Android debug compile passed after continuation fixes.
- [x] SKU chooser and product-card accessibility labels hardened after continuation retry.
- [x] Products, Media, and Product Detail refresh hooks guard against stale async SQLite results after blur/unmount.
- [x] Shared action/filter sheets expose explicit close labels and selected filter state while keeping Android modal back handling.
- [x] Image manipulation temp files are cleaned up in `finally` even when media copy fails.
- [x] Generated SKU sequencing uses max existing suffix rather than row count to avoid collisions with non-contiguous seeded/imported SKUs.
- [x] Camera and Capture Preview route params normalize SKU string/array inputs and ignore invalid SKU handoffs.
- [x] Existing SKU save updates non-empty metadata and still avoids duplicate product rows.

### Blocked In This Continuation

- [x] iOS simulator UI refresh succeeded after Metro launch; see `docs/evidence/app-wide-risk-validation-2026-06-01/RUNTIME_ATTEMPT_2026-06-01.md`.
- [ ] Android emulator UI refresh blocked by Pixel_9/adb dropping before install/layout/screenshot; see `docs/evidence/app-wide-risk-validation-2026-06-01/RUNTIME_ATTEMPT_2026-06-01.md`.
- [ ] Android emulator UI refresh also blocked on LowRam_API36; adb drops before install/layout/screenshot; see `docs/evidence/app-wide-risk-validation-2026-06-01/RUNTIME_ATTEMPT_2026-06-01.md`.

## 2026-06-01 Final Static Regression Closure

- [x] More tab removed; required shell stays Media / Camera / Products.
- [x] SKU chooser exposes explicit close accessibility label.
- [x] Shared ActionSheet exposes explicit close accessibility label.
- [x] `npm run lint` passes with 0 warnings after final import cleanup.
- [x] `npm run test` passes 17/17 after final regression closure.
- [ ] Android emulator UI refresh remains blocked externally before install/launch; see `docs/evidence/app-wide-risk-validation-2026-06-01/RUNTIME_ATTEMPT_2026-06-01.md`.

## 2026-06-01 Scope Correction After Review

- [x] Launch redirects to Camera.
- [x] Tab shell contains only Media / Camera / Products.
- [x] `app/(tabs)/home.tsx` and `app/(tabs)/more.tsx` removed.
- [x] Regression tests now fail if Home/More return.
- [x] Pasted-risk audit remains app-wide; current status is tracked in `docs/evidence/app-wide-risk-validation-2026-06-01/APP_WIDE_RISK_VALIDATION.md`.
