# Android Device / OS Matrix

This matrix tracks the active goal requirement for Android phone providers, OS spread, resize behavior, low-memory risk, and submission compatibility.

## Current Verified Evidence

| Class | Device / Runtime | Evidence | Status |
| --- | --- | --- | --- |
| Pixel-style emulator | Pixel_9 emulator | `docs/evidence/android-default-after-resilience-2026-05-30.png` | Verified launch/layout |
| Compact width | 720x1280 emulator override | `docs/evidence/android-compact-after-resilience-2026-05-30.png` | Verified responsive layout |
| Expanded width | 1440x2000 emulator override | `docs/evidence/android-expanded-after-resilience-2026-05-30.png` | Verified responsive layout |
| Release manifest | target SDK 36 / min SDK 24 | `docs/evidence/android-release-merged-manifest-2026-05-30.xml` | Verified permissions/privacy |
| API 36 release APK | Android 16 / API 36 emulator, 1080x2424 | `docs/evidence/android-api36-release-launch-2026-05-30.png`, `docs/evidence/android-api36-release-layout-2026-05-30.json` | Verified non-dev release launch/layout |
| API 36 Android CLI recapture | Pixel_9 API36 via `android emulator start`, Android CLI screen/layout tools | `docs/evidence/android-pixel9-api36-release-androidcli-home-2026-05-31.png`, `docs/evidence/android-pixel9-api36-release-androidcli-layout-2026-05-31.json` | Verified Android CLI can capture visible app UI/layout before host ADB detach; layout includes Home/Media/Camera/Products/More tab tree |
| No-network release mode | Android 16 / API 36 emulator with Wi-Fi/data disabled | `docs/evidence/android-api36-release-no-network-2026-05-30.png`, `docs/evidence/android-api36-release-no-network-products-2026-05-30.png`, `docs/evidence/android-api36-release-no-network-media-2026-05-30.png`, `docs/evidence/android-api36-release-no-network-notes-2026-05-30.txt` | Verified local Home/Products/Media without network |
| Trim-memory pressure | Android 16 / API 36 emulator, release app with 1000-row dataset | `docs/evidence/android-trim-memory-summary-2026-05-30.txt`, `docs/evidence/android-trim-memory-products-after-2026-05-30.png`, `docs/evidence/android-trim-memory-media-after-2026-05-30.png` | Verified app process survived `RUNNING_CRITICAL` trim and memory dropped from ~307 MB to ~287 MB PSS |
| Low-RAM emulator attempt | LowRam_API36 AVD, 720x1280, configured 1024 MB RAM | `docs/evidence/android-lowram-api36-emulator-blocker-2026-05-31.txt` | Blocked: emulator booted and reported constrained display/RAM, then exited before release APK install |
| API 37 / Android 17 attempt | Resizable_Experimental AVD, 16 KB page-size image | `docs/evidence/android-api37-resizable-blocker-2026-05-30.txt` | Blocked: emulator boot log reached boot completed, then device disappeared from ADB before install/screenshot evidence |
| API 34 / Android 14 attempt | Pixel_API34 emulator, Google APIs arm64 image | `docs/evidence/android-api34-emulator-blocker-2026-05-31.txt` | Blocked: emulator booted, then disappeared from ADB before release APK install; retry after freeing host disk or use physical/cloud Android 14 device |
| Samsung-style large-phone attempt | Pixel_9 API36 with planned 1440x3088 / 500dpi override | `docs/evidence/android-samsung-style-api36-emulator-blocker-2026-05-31.txt` | Blocked: emulator booted, then exited before viewport override/install; use Android Studio UI, physical Samsung, or cloud device |

## Required Before Final Claim

| Class | Target | Required proof | Status |
| --- | --- | --- | --- |
| Samsung-style large phone | Samsung physical device or Samsung-like emulator skin | Install/launch + Product/Media/Camera navigation screenshots | Attempted via Pixel_9 API36 large-phone viewport override; emulator exited before install; physical/cloud provider proof still missing |
| Small low-memory phone | Low-RAM emulator/device, compact width | Launch + Products/Media scroll + capture fallback/import flow | Trim-memory pressure verified on API 36 release build; LowRam_API36 emulator booted but exited before install; true low-RAM device/cloud proof still missing |
| Android 13 | API 33 device/emulator | Launch + permission state + local catalog persistence | Missing |
| Android 14 | API 34 device/emulator | Launch + permission state + local catalog persistence | API 34 emulator prepared but blocked by host/ADB detach before install; physical/cloud Android 14 still missing |
| Android 15+ | API 35/36/37 device/emulator | Launch + permission state + local catalog persistence | API 36 release launch/layout verified; API 37 attempted but ADB attach blocked; persistence after real capture still missing |
| Real camera device | Physical Android camera | VisionCamera capture -> SKU -> save -> restart persistence | Missing |
| Airplane mode / no network | Non-dev release/installable build | Launch/use Products/Media/Product Detail with network disabled | Home/Products/Media verified with Wi-Fi/data disabled; Product Detail after saved product still missing |

## Completion Rule

Do not claim Android provider/OS readiness complete until every Required row has evidence paths or a deliberate written exclusion accepted by the reviewer.

## Host emulator environment blocker — 2026-05-31

The CLI emulator binary (`~/Library/Android/sdk/emulator/emulator`) currently exits shortly after `Boot completed` on this host. Logs show `Failed to make display surface context current: 12299` and `Failed to create window surface for DisplaySurfaceGl`; ADB then drops the device to offline and qemu terminates before any `adb install` can run. The same failure reproduces for `Pixel_9`, `Pixel_API34`, `LowRam_API36`, and `Resizable_Experimental`, with or without `-no-window`, and with or without enlarged `-memory`/`-partition-size`. This is a host GPU/Qt environment regression, not an app crash. Existing API 36 release evidence (launch, no-network, 1000-row perf, trim-memory) was captured before this regression and remains valid.

To unblock new device-matrix rows: launch the AVD from Android Studio Device Manager UI (so Android Studio owns the Qt/swiftshader context), then reuse the existing `adb install -r android/app/build/outputs/apk/release/app-release.apk` + `adb exec-out screencap -p` flow against the resulting `emulator-5554` device.

## Evidence capture helper

Once any Android device or AVD is in `adb devices` `device` state, run:

```bash
npm run capture:android -- <label> [<device-id>]
```

Examples:
- `npm run capture:android -- android-api34-release`
- `npm run capture:android -- android-samsung-galaxy-s24 emulator-5554`
- `NO_NETWORK=0 npm run capture:android -- android-pixel-9-release` to skip the airplane-mode pass

The script installs `android/app/build/outputs/apk/release/app-release.apk`, then writes the following files under `docs/evidence/`:

- `<label>-<date>-device.txt` (Android release, SDK, manufacturer, model, ABI, window size, density)
- `<label>-<date>-install.txt` and `<label>-<date>-start.txt`
- `<label>-<date>-home.png`, `<label>-<date>-home-layout.xml`, `<label>-<date>-products.png`, `<label>-<date>-media.png`
- `<label>-<date>-meminfo.txt`, `<label>-<date>-logcat-tail.txt`
- `<label>-<date>-no-network-home.png`, `<label>-<date>-no-network-products.png`, `<label>-<date>-no-network-media.png` when `NO_NETWORK` is not `0`
- `<label>-<date>-summary.txt`

The script first reads the `uiautomator` layout dump and taps the center of the `Products` / `Media` tab labels when available. If Android accessibility/layout dumping fails, it falls back to tap points computed from the connected device's current `wm size`, so it works across compact phones, Samsung-style high-density phones, emulator resize overrides, and Android Studio resizable devices instead of relying on hard-coded Pixel coordinates.
