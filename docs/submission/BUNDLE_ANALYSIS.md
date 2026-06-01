# Bundle Analysis

## Current Evidence

- Android release JS bundle: `android/app/build/generated/assets/react/release/index.android.bundle`
- Current observed bundle size: ~3.5 MB (generated during release manifest/build work on 2026-05-30).
- Android release AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Current observed AAB size: ~85 MB.
- R8/resource shrink enabled in release configuration.
- Unused direct native dependencies removed from `package.json` during hardening.

## Expo Atlas Status

VERIFIED_EXPO_ATLAS=true

Expo Atlas has been run for Android export. Evidence: `docs/evidence/expo-atlas-android-2026-05-30.jsonl` and `docs/evidence/expo-atlas-android-summary-2026-05-30.txt`.

## Atlas Command Run

```bash
EXPO_UNSTABLE_ATLAS=true npx expo export --platform android --source-maps
```

`expo-atlas` was installed as a dev dependency during the export workflow so later runs do not need Expo CLI auto-install.

## Required Review

- Confirm top JS bundle contributors.
- Confirm no removed packages remain as direct dependencies.
- Confirm VisionCamera/Nitro native weight is expected for camera requirement.
- Record any package removal candidates.
- Atlas JSONL and text summary are saved under `docs/evidence/`.

## Dependency hygiene audit — 2026-05-31

- Direct dependencies in `package.json` are scoped to runtime: `@expo/vector-icons`, `expo`, `expo-build-properties`, `expo-file-system`, `expo-image`, `expo-image-manipulator`, `expo-image-picker`, `expo-router`, `expo-sqlite`, `react`, `react-native`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `react-native-vision-camera`.
- Source grep across `app/` and `src/` confirms no remaining import for previously removed `react-native-mmkv`, `react-native-nitro-image`, or `expo-haptics`.
- `react-native-nitro-image` is still present as a transitive dependency of `react-native-vision-camera@5.x` (declared in vision-camera `peerDependencies`/`dependencies` and locked in `ios/Podfile.lock`). It is not source-used by GemHub Lite. Removing it requires replacing the camera stack, which is out of scope; the AAB/JS bundle sizes already reflect this transitive weight.
- Current artifact sizes after R8 + resource shrink: Android release AAB ≈ 85 MB, Android release APK ≈ 128 MB, Android release JS bundle ≈ 3.5 MB.

## Completion Rule

Atlas baseline is captured and reviewed. Backlog optimization can improve icon/font granularity, but bundle-size proof is no longer missing.
