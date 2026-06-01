# Store Screenshot Evidence

This file separates screenshots already captured from screenshots still required before store submission. Simulator/emulator images are useful evidence, but real store screenshots should be reviewed in App Store Connect and Play Console before upload.

## Verified Local Evidence

| Surface | Platform | Evidence | Status |
| --- | --- | --- | --- |
| iOS Home launch | iOS simulator | `docs/evidence/ios-home-storeready-2026-05-30.png` | Captured |
| iOS clean native relaunch | iOS simulator | `docs/evidence/ios-home-clean-2026-05-30.png` | Captured |
| Android default width | Android emulator | `docs/evidence/android-default-after-resilience-2026-05-30.png` | Captured |
| Android compact width | Android emulator | `docs/evidence/android-compact-after-resilience-2026-05-30.png` | Captured |
| Android expanded width | Android emulator | `docs/evidence/android-expanded-after-resilience-2026-05-30.png` | Captured |
| Android release manifest | Android release build | `docs/evidence/android-release-merged-manifest-2026-05-30.xml` | Captured |
| Android API 36 release Home | Android emulator | `docs/evidence/android-api36-release-launch-2026-05-30.png` | Captured |
| Android API 36 no-network Products | Android release emulator | `docs/evidence/android-api36-release-no-network-products-2026-05-30.png` | Captured |
| Android API 36 no-network Media | Android release emulator | `docs/evidence/android-api36-release-no-network-media-2026-05-30.png` | Captured |
| Android trim-memory Products/Media | Android release emulator | `docs/evidence/android-trim-memory-products-after-2026-05-30.png`, `docs/evidence/android-trim-memory-media-after-2026-05-30.png` | Captured |

## Missing Before Store Upload

| Surface | Platform | Required proof |
| --- | --- | --- |
| Camera permission prompt | iOS real device | Screenshot/video path in `docs/evidence/REAL_DEVICE_CAMERA.md` |
| Camera preview / capture | iOS real device | Screenshot/video path in `docs/evidence/REAL_DEVICE_CAMERA.md` |
| Capture Review with SKU field | iOS or Android real device | Screenshot/video path in `docs/evidence/REAL_DEVICE_CAMERA.md` |
| Product Detail after restart | iOS or Android real device | Screenshot/video path in `docs/evidence/REAL_DEVICE_CAMERA.md` |
| Media grid after save | iOS or Android real device | Screenshot/video path in `docs/evidence/REAL_DEVICE_CAMERA.md` |
| App Store Connect screenshot set | iOS store sizes | Exported/uploaded store screenshot set |
| Play Console screenshot set | Android phone sizes | Exported/uploaded store screenshot set |

## Completion Rule

Do not mark screenshot readiness complete until all Missing rows have evidence paths and the store-console assets have been reviewed.
