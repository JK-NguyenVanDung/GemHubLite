# GemHub Lite Performance Runbook

This runbook covers the active-goal requirement for large-catalog performance, max-memory risk, and scroll smoothness without adding unit tests.

## Current Local Optimizations

- Products, Media, and Product Detail galleries use FlatList-owned scrolling instead of nested virtualized lists.
- Product/media cards use stable IDs for keys.
- Responsive column counts are width-driven, not device-name driven.
- Images are downscaled to max 1600px edge and JPEG-compressed before persistence.
- Release Android build uses R8/resource shrink config.

## Current Android Release Evidence

Large-catalog release profiling was captured on the API 36 emulator with 1000 seeded products and 1000 media rows. The seed was copied into Expo SQLite at `files/SQLite/gemhub-lite.db` through a debuggable install, then the installable release APK was installed over it with `adb install -r` to preserve data and profile the non-dev app shell.

| Dataset | Evidence | Result |
| --- | --- | --- |
| 1000 products / 1000 media | `docs/evidence/android-perf-1000-summary-2026-05-30.txt` | Release app launched and Home showed 1000 Products / 1000 Media |
| Products scroll | `docs/evidence/android-perf-1000-products-top-release-2026-05-30.png`, `docs/evidence/android-perf-1000-products-after-scroll-release-2026-05-30.png` | Scroll completed without crash |
| Media scroll | `docs/evidence/android-perf-1000-media-top-release-2026-05-30.png`, `docs/evidence/android-perf-1000-media-after-scroll-release-2026-05-30.png` | Scroll completed without crash |
| Memory | `docs/evidence/android-perf-1000-meminfo-before-2026-05-30.txt`, `docs/evidence/android-perf-1000-meminfo-after-2026-05-30.txt` | Total PSS moved from ~218 MB to ~314 MB after Products/Media scroll |
| Runtime logs | `docs/evidence/android-perf-1000-logcat-tail-2026-05-30.txt` | No app fatal exception, ANR, or out-of-memory crash found in captured tail; dummy 1x1 fixture emits non-fatal Exif warnings |
| Trim-memory pressure | `docs/evidence/android-trim-memory-summary-2026-05-30.txt`, `docs/evidence/android-trim-memory-logcat-tail-2026-05-30.txt` | Release app survived `am send-trim-memory ... RUNNING_CRITICAL`; process stayed alive and PSS dropped from ~307 MB to ~287 MB |

## Required Manual Dataset Sizes

| Dataset | Products | Media rows | Required evidence |
| --- | ---: | ---: | --- |
| Small | 100 | 100+ | Covered by current 1000-row release stress pass; capture separate 100-row proof only if reviewer requires exact-size evidence |
| Medium | 500 | 500+ | Covered by current 1000-row release stress pass; capture separate 500-row proof only if reviewer requires exact-size evidence |
| Large | 1000 | 1000+ | Release screenshots, meminfo, and logcat captured under `docs/evidence/android-perf-1000-*` |

## Suggested Seed Strategy

Do not add unit tests. Use a temporary dev-only script or simulator DB import, then remove or keep it outside production code. Capture evidence only.

Suggested data shape:

- SKU: `PERF-000001` through `PERF-001000`.
- Title: `Performance sample {n}`.
- Type: rotate through existing product types.
- Media: use a small repeated local fixture copied into app-owned media storage, or create placeholder DB rows only if UI handles missing thumbnails gracefully.

## Profiling Commands

### Android

```bash
adb shell am start -n com.gemhublite.app/.MainActivity
adb shell dumpsys meminfo com.gemhublite.app > docs/evidence/android-meminfo-before.txt
# Scroll Products and Media manually or with adb input swipe.
adb shell dumpsys meminfo com.gemhublite.app > docs/evidence/android-meminfo-after.txt
adb shell logcat -d > docs/evidence/android-large-catalog-logcat.txt
```

### iOS

Use Argent or Xcode Instruments after launching a native build:

```bash
# Capture screenshots/video/log paths in docs/evidence/REAL_DEVICE_CAMERA.md or a dedicated perf evidence file.
```

## Completion Rule

Large-catalog Android release evidence now exists for the 1000-row stress case. Do not claim full performance complete until any reviewer-requested exact 100/500-row captures and iOS profiling are either captured or explicitly waived.
