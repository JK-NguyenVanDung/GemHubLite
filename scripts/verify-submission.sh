#!/usr/bin/env bash
set -u

RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
fails=0
warnings=0
pass() { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; warnings=$((warnings+1)); }
fail() { printf "  ${RED}✗${RESET} %s\n" "$1"; fails=$((fails+1)); }
section() { printf "\n${BOLD}%s${RESET}\n" "$1"; }
bytes_available() { df -Pk . | awk 'NR==2 {print $4 * 1024}'; }
image_size() { sips -g pixelWidth -g pixelHeight "$1" 2>/dev/null | awk '/pixelWidth/ {w=$2} /pixelHeight/ {h=$2} END {print w "x" h}'; }

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$REPO_ROOT"

printf "${BOLD}GemHub Lite — submission verifier${RESET}\n"

section "Host environment"
available_bytes="$(bytes_available)"
if [ "$available_bytes" -ge $((5 * 1024 * 1024 * 1024)) ]; then
  pass "host has at least 5 GB free for native builds"
else
  warn "host has less than 5 GB free; native rebuilds may fail"
fi
if rg -n '^/(ios|android)$|^/(ios|android)/$' .gitignore >/dev/null 2>&1; then
  fail "native ios/android folders are ignored; submission customizations may be omitted from git"
else
  pass "native ios/android folders are not globally ignored"
fi

section "Expo config"
node -e "const app=require('./app.json').expo; if(app.scheme!=='gemhublite') process.exit(1)" >/dev/null 2>&1 && pass "app.json declares stable scheme gemhublite" || fail "app.json missing stable scheme gemhublite"
node -e "const fs=require('fs'); const pkg=require('./package.json'); const nvm=fs.readFileSync('.nvmrc','utf8').trim(); const nv=fs.readFileSync('.node-version','utf8').trim(); process.exit(pkg.engines?.node==='>=20.19 <23' && nvm===nv ? 0 : 1)" >/dev/null 2>&1 && pass "Node version files align with package engines" || fail "Node version files/package engines are inconsistent"
node -e "const info=require('./app.json').expo.ios?.infoPlist||{}; if(info.ITSAppUsesNonExemptEncryption!==false) process.exit(1)" >/dev/null 2>&1 && pass "iOS export-compliance flag is false" || fail "ITSAppUsesNonExemptEncryption=false missing from app.json"
node -e "const p=require('./app.json').expo.android?.blockedPermissions||[]; const need=['android.permission.INTERNET','android.permission.ACCESS_NETWORK_STATE','android.permission.READ_EXTERNAL_STORAGE','android.permission.WRITE_EXTERNAL_STORAGE','android.permission.READ_MEDIA_IMAGES','android.permission.READ_MEDIA_VIDEO','android.permission.READ_MEDIA_AUDIO','android.permission.RECORD_AUDIO']; process.exit(need.every(x=>p.includes(x))?0:1)" >/dev/null 2>&1 && pass "Android blockedPermissions covers network/storage/media/audio" || fail "Android blockedPermissions incomplete"

section "Native iOS"
/usr/libexec/PlistBuddy -c 'Print :ITSAppUsesNonExemptEncryption' ios/GemHubLite/Info.plist 2>/dev/null | grep -qx false && pass "Info.plist export-compliance flag is false" || fail "Info.plist export-compliance flag missing/incorrect"
/usr/libexec/PlistBuddy -c 'Print :CFBundleURLTypes:1:CFBundleURLSchemes:0' ios/GemHubLite/Info.plist 2>/dev/null | grep -qx gemhublite && pass "Info.plist URL scheme is gemhublite" || fail "Info.plist URL scheme is not gemhublite"
if rg -n 'Expo Dev Launcher|EXDevLauncher|_expo._tcp|NSLocalNetworkUsageDescription|expo-dev-client' ios -g '!Pods' -g '!build' >/dev/null 2>&1; then
  fail "iOS native project still contains dev-client/local-network residue"
else
  pass "iOS native project has no dev-client/local-network residue"
fi

section "Native Android"
MERGED_MANIFEST="android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml"
if [ ! -f "$MERGED_MANIFEST" ] && [ -f docs/evidence/android-release-merged-manifest-2026-05-30.xml ]; then
  MERGED_MANIFEST="docs/evidence/android-release-merged-manifest-2026-05-30.xml"
fi
if [ ! -f "$MERGED_MANIFEST" ]; then
  warn "release merged manifest not generated; run: cd android && ./gradlew :app:processReleaseManifest"
else
  rg 'android.permission.INTERNET|android.permission.ACCESS_NETWORK_STATE|READ_EXTERNAL_STORAGE|WRITE_EXTERNAL_STORAGE|READ_MEDIA_|RECORD_AUDIO' "$MERGED_MANIFEST" >/dev/null 2>&1 && fail "release manifest contains blocked network/storage/media/audio permission" || pass "release manifest excludes network/storage/media/audio permissions"
  rg 'android.permission.CAMERA' "$MERGED_MANIFEST" >/dev/null 2>&1 && pass "release manifest keeps camera permission" || fail "release manifest missing camera permission"
  rg 'android:allowBackup="false"' "$MERGED_MANIFEST" >/dev/null 2>&1 && pass "Android backup disabled" || fail "Android backup not disabled"
  rg 'android:dataExtractionRules="@xml/data_extraction_rules"' "$MERGED_MANIFEST" >/dev/null 2>&1 && pass "Android data extraction rules configured" || fail "Android data extraction rules missing"
  rg '<data android:scheme="gemhublite"' "$MERGED_MANIFEST" >/dev/null 2>&1 && pass "Android deep link scheme is gemhublite" || fail "Android deep link scheme is not gemhublite"
fi
[ -f android/app/src/main/res/xml/backup_rules.xml ] && [ -f android/app/src/main/res/xml/data_extraction_rules.xml ] && pass "Android backup/data-extraction XML files exist" || fail "Android backup/data-extraction XML files missing"

section "Store assets and privacy"
[ "$(image_size assets/icon.png)" = "1024x1024" ] && pass "Expo app icon is 1024x1024" || fail "assets/icon.png must be 1024x1024"
[ "$(image_size ios/GemHubLite/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png)" = "1024x1024" ] && pass "iOS App Store icon is 1024x1024" || fail "iOS 1024 app icon missing/invalid"
[ -f assets/android-icon-foreground.png ] && [ -f assets/android-icon-background.png ] && [ -f assets/android-icon-monochrome.png ] && pass "Android adaptive icon foreground/background/monochrome assets exist" || fail "Android adaptive icon assets missing"
[ -f ios/GemHubLite/PrivacyInfo.xcprivacy ] && pass "iOS privacy manifest exists" || fail "iOS privacy manifest missing"
if /usr/libexec/PlistBuddy -c 'Print :NSPrivacyTracking' ios/GemHubLite/PrivacyInfo.xcprivacy 2>/dev/null | grep -qx false; then
  pass "iOS privacy manifest declares tracking false"
else
  fail "iOS privacy manifest must declare NSPrivacyTracking=false"
fi
if /usr/libexec/PlistBuddy -c 'Print :NSPrivacyCollectedDataTypes' ios/GemHubLite/PrivacyInfo.xcprivacy 2>/dev/null | grep -q 'Array {'; then
  pass "iOS privacy manifest has collected-data section"
else
  fail "iOS privacy manifest missing collected-data section"
fi

section "Build artifacts"
[ -f android/app/build/outputs/bundle/release/app-release.aab ] && pass "Android release AAB exists" || warn "Android release AAB missing; run: cd android && ./gradlew :app:bundleRelease"
[ -f android/app/build/generated/assets/react/release/index.android.bundle ] && pass "Android release JS bundle exists" || warn "Android release JS bundle missing; run: cd android && ./gradlew :app:processReleaseManifest"
[ -f docs/submission/COMPLETION_AUDIT.md ] && pass "completion audit exists" || fail "docs/submission/COMPLETION_AUDIT.md missing"
[ -f docs/submission/SCREENSHOT_EVIDENCE.md ] && pass "screenshot evidence manifest exists" || fail "docs/submission/SCREENSHOT_EVIDENCE.md missing"
[ -f docs/submission/ANDROID_DEVICE_MATRIX.md ] && pass "Android device matrix exists" || fail "docs/submission/ANDROID_DEVICE_MATRIX.md missing"
[ -f docs/submission/PERFORMANCE_RUNBOOK.md ] && pass "performance runbook exists" || fail "docs/submission/PERFORMANCE_RUNBOOK.md missing"
[ -f docs/submission/BUNDLE_ANALYSIS.md ] && pass "bundle analysis artifact exists" || fail "docs/submission/BUNDLE_ANALYSIS.md missing"
for screenshot in \
  docs/evidence/ios-home-storeready-2026-05-30.png \
  docs/evidence/android-default-after-resilience-2026-05-30.png \
  docs/evidence/android-compact-after-resilience-2026-05-30.png \
  docs/evidence/android-expanded-after-resilience-2026-05-30.png \
  docs/evidence/android-release-merged-manifest-2026-05-30.xml \
  docs/evidence/android-api36-release-launch-2026-05-30.png \
  docs/evidence/android-api36-release-layout-2026-05-30.json \
  docs/evidence/android-pixel9-api36-release-androidcli-home-2026-05-31.png \
  docs/evidence/android-pixel9-api36-release-androidcli-layout-2026-05-31.json \
  docs/evidence/android-api36-release-no-network-products-2026-05-30.png \
  docs/evidence/android-api36-release-no-network-media-2026-05-30.png \
  docs/evidence/android-perf-1000-summary-2026-05-30.txt \
  docs/evidence/android-perf-1000-products-after-scroll-release-2026-05-30.png \
  docs/evidence/android-perf-1000-media-after-scroll-release-2026-05-30.png \
  docs/evidence/android-trim-memory-summary-2026-05-30.txt \
  docs/evidence/android-trim-memory-products-after-2026-05-30.png \
  docs/evidence/android-trim-memory-media-after-2026-05-30.png \
  docs/evidence/android-api37-resizable-blocker-2026-05-30.txt; do
  [ -f "$screenshot" ] || fail "required evidence file missing: $screenshot"
done
for evidence in \
  docs/evidence/android-api34-emulator-blocker-2026-05-31.txt \
  docs/evidence/android-lowram-api36-emulator-blocker-2026-05-31.txt \
  docs/evidence/android-samsung-style-api36-emulator-blocker-2026-05-31.txt; do
  [ -f "$evidence" ] || fail "required evidence file missing: $evidence"
done
if rg 'API 34|Android 14' docs/evidence/android-api34-emulator-blocker-2026-05-31.txt >/dev/null 2>&1; then
  pass "Android API34 emulator blocker is documented"
else
  fail "Android API34 blocker evidence is missing/invalid"
fi
if rg 'LowRam_API36|Low-RAM|low-RAM' docs/evidence/android-lowram-api36-emulator-blocker-2026-05-31.txt >/dev/null 2>&1; then
  pass "Android low-RAM emulator blocker is documented"
else
  fail "Android low-RAM blocker evidence is missing/invalid"
fi
if rg 'Samsung-style|1440x3088|provider' docs/evidence/android-samsung-style-api36-emulator-blocker-2026-05-31.txt >/dev/null 2>&1; then
  pass "Android Samsung-style emulator blocker is documented"
else
  fail "Android Samsung-style blocker evidence is missing/invalid"
fi
if rg 'Host emulator environment blocker|host GPU/Qt' docs/submission/ANDROID_DEVICE_MATRIX.md >/dev/null 2>&1; then
  pass "Android host emulator regression is documented in the matrix"
else
  fail "Android host emulator regression is not documented in docs/submission/ANDROID_DEVICE_MATRIX.md"
fi
if [ -f docs/evidence/privacy-secret-scan-2026-05-31.txt ] && rg 'no live API keys/credentials/tokens detected|NSPrivacyTracking=false|no network/storage/media/audio permissions' docs/evidence/privacy-secret-scan-2026-05-31.txt >/dev/null 2>&1; then
  pass "privacy/secret scan evidence is present"
else
  fail "privacy/secret scan evidence missing or invalid"
fi
if [ -f docs/submission/ANDROID_ISSUES_AND_FIXES.md ] && rg 'Host CLI emulator regression|Real device camera proof missing|Pixel_9 API36 Android CLI partial capture' docs/submission/ANDROID_ISSUES_AND_FIXES.md >/dev/null 2>&1; then
  pass "Android issues + fixes document is present"
else
  fail "Android issues + fixes document is missing or incomplete"
fi
if rg '1000 products, 1000 media rows' docs/evidence/android-perf-1000-summary-2026-05-30.txt >/dev/null 2>&1; then
  pass "Android 1000-row performance evidence is present"
else
  fail "Android 1000-row performance evidence is missing/invalid"
fi
if rg 'RUNNING_CRITICAL|PSS dropped|PSS:.*287|survived' docs/evidence/android-trim-memory-summary-2026-05-30.txt >/dev/null 2>&1; then
  pass "Android trim-memory evidence is present"
else
  fail "Android trim-memory evidence is missing/invalid"
fi
if rg 'ADB|No app evidence captured|API37|Android 17' docs/evidence/android-api37-resizable-blocker-2026-05-30.txt >/dev/null 2>&1; then
  pass "Android API37 emulator blocker is documented"
else
  fail "Android API37 blocker evidence is missing/invalid"
fi
if [ -f docs/evidence/REAL_DEVICE_CAMERA.md ] && rg '^VERIFIED_REAL_DEVICE_CAMERA=true$' docs/evidence/REAL_DEVICE_CAMERA.md >/dev/null 2>&1; then
  pass "real-device camera evidence is verified"
else
  warn "real-device camera evidence is missing or still marked false"
fi
if [ -f docs/submission/BUNDLE_ANALYSIS.md ] && rg '^VERIFIED_EXPO_ATLAS=true$' docs/submission/BUNDLE_ANALYSIS.md >/dev/null 2>&1; then
  pass "Expo Atlas bundle analysis is verified"
else
  warn "Expo Atlas bundle analysis is missing or still marked false"
fi

section "Credentials"
if [ -n "${GEMHUB_RELEASE_STORE_FILE:-}" ] && [ -n "${GEMHUB_RELEASE_STORE_PASSWORD:-}" ] && [ -n "${GEMHUB_RELEASE_KEY_ALIAS:-}" ] && [ -n "${GEMHUB_RELEASE_KEY_PASSWORD:-}" ]; then
  pass "Android release signing env vars are present"
else
  warn "Android release signing env vars are not all present; local AAB may be debug-signed"
fi
node -e "const eas=require('./eas.json'); const s=eas.submit?.production||{}; process.exit(s.ios&&s.android?0:1)" >/dev/null 2>&1 && pass "eas submit.production exists" || fail "eas submit.production missing"
node -e "const s=require('./eas.json').submit?.production?.ios||{}; process.exit(s.appleId&&s.ascAppId&&s.appleTeamId?0:1)" >/dev/null 2>&1 && warn "EAS iOS submit values are filled" || warn "EAS iOS submit values are placeholders/empty"
node -e "const s=require('./eas.json').submit?.production?.android||{}; process.exit(s.serviceAccountKeyPath?0:1)" >/dev/null 2>&1 && warn "EAS Android service account path is filled" || warn "EAS Android service account path is placeholder/empty"

printf "\n"
if [ "$fails" -gt 0 ]; then
  printf "${RED}${BOLD}✗ %s blocker(s), %s warning(s).${RESET}\n" "$fails" "$warnings"
  exit 1
fi
printf "${GREEN}${BOLD}✓ No local verifier blockers, %s warning(s).${RESET}\n" "$warnings"
