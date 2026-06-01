# Android Issues and Fixes (Submission Hardening Log)

This document summarizes Android-side issues encountered while preparing GemHub
Lite for submission, the evidence captured for each, and the proven or
recommended way to resolve them.

Source of evidence: files under `docs/evidence/`. Source of policy: this
document plus `docs/submission/ANDROID_DEVICE_MATRIX.md` and
`docs/submission/COMPLETION_AUDIT.md`.

## 1. Host CLI emulator regression (primary blocker)

- Symptom: CLI-launched Android emulators (`~/Library/Android/sdk/emulator/emulator` and `android emulator start`) boot fully but then drop from ADB with "device offline" and the qemu process exits before any release-APK install or evidence capture can complete.
- Reproduced on AVDs: `Pixel_9`, `Pixel_API34`, `LowRam_API36`, `Resizable_Experimental`.
- Reproduced under: `-no-window`, windowed, `-gpu swiftshader_indirect`, `-gpu host`, `-memory` increased, `-no-snapshot`, snapshot-resume, `android emulator start <name>`.
- Root cause signature in emulator log:
  - `Failed to make display surface context current: 12299`
  - `Failed to create window surface for DisplaySurfaceGl`
  - Followed by: `adb command ... failed: 'adb: device offline'`.
- Evidence:
  - `docs/evidence/android-api34-emulator-blocker-2026-05-31.txt`
  - `docs/evidence/android-lowram-api36-emulator-blocker-2026-05-31.txt`
  - `docs/evidence/android-samsung-style-api36-emulator-blocker-2026-05-31.txt`
  - `docs/evidence/android-api37-resizable-blocker-2026-05-30.txt`
- Fix path:
  1. Launch the AVD from Android Studio "Device Manager" UI (Studio owns the Qt/swiftshader context).
  2. With the Studio-launched device showing in `adb devices` `device` state, run `npm run capture:android -- <label> [<device-id>]` to capture install/start/screenshot/layout/meminfo/logcat plus optional airplane-mode pass.
  3. Alternative: connect a physical Android device or use a Google/Samsung managed-cloud device.

## 2. Pixel_9 API36 Android CLI partial capture

- Symptom: `android emulator start Pixel_9` plus `android run --apks=android/app/build/outputs/apk/release/app-release.apk` succeeded in installing/launching the release APK and capturing the Home screen and full layout tree, but the next ADB-driven taps/no-network pass still hit the host emulator detach above.
- Evidence:
  - `docs/evidence/android-pixel9-api36-release-androidcli-home-2026-05-31.png`
  - `docs/evidence/android-pixel9-api36-release-androidcli-layout-2026-05-31.json` (contains Home/Media/Camera/Products/More content-desc nodes for the release build)
  - `docs/evidence/android-pixel9-api36-release-androidcli-run-2026-05-31.txt`
  - `docs/evidence/android-pixel9-api36-release-androidcli-capture-2026-05-31.txt`
- Fix path: once an AVD is launched from Studio and stays attached, re-run `npm run capture:android -- android-pixel9-api36-release emulator-5554` to fill the remaining Products/Media and no-network passes. The Android CLI screen/layout tools are already proven to work; only the ADB detach race blocks the deeper pass.

## 3. Headless host disk pressure for second AVDs

- Symptom: When two AVDs were attempted, or when emulators required ~7 GiB userdata, host disk dropped below the Android emulator threshold ("Not enough space to create userdata partition").
- Resolution applied: Freed ~14 GiB by clearing `~/Library/Developer/Xcode/DerivedData`, `~/Library/Caches/Yarn`, and `~/.gradle/caches/transforms-*`/`daemon`. Host disk reached ~18 GiB free.
- Fix path: Keep ~20 GiB free per simultaneous AVD; only run one emulator at a time when possible.

## 4. Android 37 / Resizable_Experimental disappearance

- Symptom: API 37 "Resizable_Experimental" AVD boots and momentarily appears in `adb devices` but disappears before install/screenshot capture.
- Evidence: `docs/evidence/android-api37-resizable-blocker-2026-05-30.txt`.
- Fix path: Treat as forward-compatibility check only; use API 36 release evidence as the latest verified Android target. Retry from Android Studio UI when the AVD remains attached, or skip until Android 17 stable.

## 5. Real device camera proof missing

- Symptom: VisionCamera capture works on simulator but cannot fully scope camera path; real device camera proof is required.
- Evidence: `docs/evidence/REAL_DEVICE_CAMERA.md` currently marks `VERIFIED_REAL_DEVICE_CAMERA=false`.
- Fix path: On a real Android device with VisionCamera-compatible OS, capture install/run/SKU-save/restart-persistence screenshots, then update `docs/evidence/REAL_DEVICE_CAMERA.md` to include device details and set `VERIFIED_REAL_DEVICE_CAMERA=true`.

## 6. Release signing credentials placeholder

- Symptom: Android release builds fall back to debug-signing when `GEMHUB_RELEASE_STORE_FILE`/`GEMHUB_RELEASE_STORE_PASSWORD`/`GEMHUB_RELEASE_KEY_ALIAS`/`GEMHUB_RELEASE_KEY_PASSWORD` are unset; verifier emits a warning until set.
- Evidence: `scripts/verify-submission.sh` Credentials section warning.
- Fix path: Generate a real Play upload keystore (`keytool -genkey -v -keystore gemhub-release.jks -alias gemhub -keyalg RSA -keysize 2048 -validity 10000`), then export the four env vars and re-run `npm run verify:submission`.

## 7. EAS submit placeholders

- Symptom: `eas.json` has submit.production scaffolding, but iOS values (`appleId`, `ascAppId`, `appleTeamId`) and Android `serviceAccountKeyPath` are placeholders.
- Evidence: `scripts/verify-submission.sh` Credentials section warning.
- Fix path: Fill the real App Store Connect API values and place a Play service-account JSON outside the repo; reference it via `serviceAccountKeyPath`. Then `eas submit -p ios|android` can run from CI/local with the same `eas.json`.

## 8. Node engine vs Homebrew default

- Symptom: System shell uses Homebrew Node `v25.x`, which violates `engines.node >=20.19 <23` and fails `npm run doctor`.
- Evidence: `npm run doctor` Node section.
- Fix path: Always invoke final native build/validate steps via the pinned Node runtime: `. ~/.nvm/nvm.sh && nvm use 22.21.0 && PATH="$NVM_BIN:$PATH" npm run doctor`.

## How to recover Android device-matrix coverage in one pass

1. Open Android Studio. Use "Device Manager" to start `Pixel_9`, `Pixel_API34`, `LowRam_API36`, or a Samsung profile.
2. Confirm `adb devices` shows the device as `device`.
3. Build the release APK once if not already present: `(cd android && ./gradlew :app:assembleRelease)`.
4. For each device, run:
   - `npm run capture:android -- <label> [<device-id>]`
   - Example: `npm run capture:android -- android-pixel9-api36-release emulator-5554`
   - Example (no airplane pass): `NO_NETWORK=0 npm run capture:android -- android-lowram-api36 emulator-5554`
5. After captures, run `npm run verify:submission` to confirm new evidence files are tracked.
