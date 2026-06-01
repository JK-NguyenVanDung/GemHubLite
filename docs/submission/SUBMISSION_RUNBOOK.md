# GemHub Lite Submission Runbook

## 0. Host Preconditions

```bash
npm run doctor
npm run typecheck
npm run lint
npm run verify:submission
```

Expected today:

- `typecheck`: pass.
- `lint`: pass.
- `verify:submission`: pass with warnings only for missing real credentials and real-device camera evidence.
- `doctor`: fails on this host until Node is switched from v25.x to project engine `>=20.19 <23`.

## 1. Real-Device Camera Proof

1. Connect iPhone or Android phone.
2. Install a native build:
   - iOS: `npm run ios -- --device`
   - Android: `npm run android -- --device`
3. Run the core flow:
   - Launch app.
   - Accept camera permission.
   - Open Camera.
   - Capture photo.
   - Enter SKU.
   - Save.
   - Open Product Detail.
   - Restart app.
   - Confirm Product + Media persist.
4. Save screenshot/video/log paths in `docs/evidence/REAL_DEVICE_CAMERA.md`.
5. Change `VERIFIED_REAL_DEVICE_CAMERA=false` to `VERIFIED_REAL_DEVICE_CAMERA=true` only after proof is saved.
6. Re-run `npm run verify:submission`.

## 2. Android Release Signing

Use either EAS-managed credentials or local env/Gradle properties.

### Local env option

```bash
export GEMHUB_RELEASE_STORE_FILE=/absolute/path/to/gemhub-release.keystore
export GEMHUB_RELEASE_STORE_PASSWORD=...
export GEMHUB_RELEASE_KEY_ALIAS=...
export GEMHUB_RELEASE_KEY_PASSWORD=...
cd android
./gradlew :app:bundleRelease --console=plain
```

The verifier only checks that env vars are present; Play Console still validates that the AAB is signed with the expected upload key.

## 3. EAS Submit Values

Fill `eas.json` before automated submit:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "name@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "TEAMID12345"
      },
      "android": {
        "serviceAccountKeyPath": "./private/play-service-account.json"
      }
    }
  }
}
```

Do not commit service account JSON or signing secrets.

## 4. Final Store Assets

- App icon verified in both stores.
- Android adaptive icon verified on Android 13+ themed icon preview.
- Screenshots:
  - Home.
  - Camera permission / camera preview.
  - Capture Review SKU field.
  - Products grid.
  - Product Detail.
  - Media grid.
  - Android compact and expanded widths.
  - iOS small and large phones.
- Privacy labels use `docs/submission/STORE_METADATA.md` as source.

## 5. Final Commands

```bash
npm run verify:submission
cd android && ./gradlew :app:bundleRelease --console=plain
# or: eas build --platform all --profile production
# then: eas submit --platform all --profile production
```

Do not mark submission-ready unless `npm run verify:submission` has zero blockers and only credential warnings that are intentionally handled by manual store upload.
