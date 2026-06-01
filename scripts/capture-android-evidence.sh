#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADB="${ANDROID_HOME:-$HOME/Library/Android/sdk}/platform-tools/adb"
APK="$ROOT_DIR/android/app/build/outputs/apk/release/app-release.apk"
OUT_DIR="$ROOT_DIR/docs/evidence"
DATE_TAG="${DATE_TAG:-$(date +%Y-%m-%d)}"
LABEL="${1:-android-device}"
DEVICE="${2:-}"

if [ ! -x "$ADB" ]; then
  echo "adb not found at $ADB. Set ANDROID_HOME or install Android SDK platform-tools." >&2
  exit 2
fi
if [ ! -f "$APK" ]; then
  echo "Release APK missing: $APK" >&2
  echo "Build it first: cd android && ./gradlew :app:assembleRelease" >&2
  exit 2
fi
mkdir -p "$OUT_DIR"

if [ -z "$DEVICE" ]; then
  DEVICE="$($ADB devices | awk 'NR>1 && $2=="device" {print $1; exit}')"
fi
if [ -z "$DEVICE" ]; then
  echo "No connected Android device/emulator in 'device' state." >&2
  echo "Open Android Studio Device Manager or connect a phone, then retry." >&2
  $ADB devices >&2
  exit 2
fi

PREFIX="$OUT_DIR/${LABEL}-${DATE_TAG}"
run_adb() { "$ADB" -s "$DEVICE" "$@"; }
shot() { run_adb exec-out screencap -p > "$PREFIX-$1.png"; }
dump_layout() {
  run_adb shell uiautomator dump /sdcard/window.xml >/dev/null
  run_adb exec-out cat /sdcard/window.xml > "$PREFIX-$1-layout.xml"
}

SIZE_RAW="$(run_adb shell wm size 2>/dev/null | tr -d '\r')"
SCREEN_WH="$(printf '%s\n' "$SIZE_RAW" | awk -F': ' '/Override size|Physical size/ {print $2}' | tail -1)"
SCREEN_W="$(printf '%s\n' "$SCREEN_WH" | awk -Fx '{print $1}')"
SCREEN_H="$(printf '%s\n' "$SCREEN_WH" | awk -Fx '{print $2}')"
if ! [[ "$SCREEN_W" =~ ^[0-9]+$ && "$SCREEN_H" =~ ^[0-9]+$ ]]; then
  SCREEN_W=1080
  SCREEN_H=2400
fi
# Default tab positions derived from the active window size. The tab bar in
# app/(tabs)/_layout.tsx renders five tabs in the order Home, Media, Camera,
# Products, More with a fixed 78dp height, so the math below approximates each
# tab's center. The defaults are only used when layout-based lookup fails.
TAB_BAR_HEIGHT=$(( SCREEN_H / 22 ))
TAB_Y=$(( SCREEN_H - TAB_BAR_HEIGHT ))
HOME_X=$(( SCREEN_W / 10 ))
MEDIA_X=$(( (SCREEN_W * 3) / 10 ))
CAMERA_X=$(( SCREEN_W / 2 ))
PRODUCTS_X=$(( (SCREEN_W * 7) / 10 ))
MORE_X=$(( (SCREEN_W * 9) / 10 ))

# Find a tab tap point by content-desc/text in the latest uiautomator XML dump.
# Usage: find_tab_center <home-layout-file> <Products|Media|Home|More|Camera>
find_tab_center() {
  local layout_file="$1" label="$2"
  [ -f "$layout_file" ] || return 1
  python3 - "$layout_file" "$label" <<'PY' 2>/dev/null
import re, sys, xml.etree.ElementTree as ET
layout, label = sys.argv[1], sys.argv[2]
try:
    root = ET.parse(layout).getroot()
except Exception:
    sys.exit(1)
best = None
for node in root.iter('node'):
    attrs = node.attrib
    text = (attrs.get('text') or '').strip()
    desc = (attrs.get('content-desc') or '').strip()
    matches = label.lower() in text.lower() or label.lower() in desc.lower()
    if not matches:
        continue
    bounds = attrs.get('bounds', '')
    m = re.match(r'\[(\d+),(\d+)\]\[(\d+),(\d+)\]', bounds)
    if not m:
        continue
    x1, y1, x2, y2 = map(int, m.groups())
    cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
    candidate = (cy, cx)
    if best is None or candidate > best:
        best = candidate
if best is None:
    sys.exit(1)
print(f"{best[1]} {best[0]}")
PY
}

{
  echo "Android evidence capture"
  echo "Label: $LABEL"
  echo "Device: $DEVICE"
  echo "Date: $DATE_TAG"
  echo "APK: $APK"
  echo "Android release: $(run_adb shell getprop ro.build.version.release | tr -d '\r')"
  echo "Android SDK: $(run_adb shell getprop ro.build.version.sdk | tr -d '\r')"
  echo "Manufacturer: $(run_adb shell getprop ro.product.manufacturer | tr -d '\r')"
  echo "Model: $(run_adb shell getprop ro.product.model | tr -d '\r')"
  echo "ABI: $(run_adb shell getprop ro.product.cpu.abi | tr -d '\r')"
  echo "Window size: $(run_adb shell wm size | tr -d '\r')"
  echo "Window density: $(run_adb shell wm density | tr -d '\r')"
} > "$PREFIX-device.txt"

run_adb install -r "$APK" | tee "$PREFIX-install.txt"
run_adb shell am force-stop com.gemhublite.app || true
run_adb shell am start -W -n com.gemhublite.app/.MainActivity | tee "$PREFIX-start.txt"
sleep 5
shot home
dump_layout home

# Bottom-tab taps prefer layout-discovered centers; fall back to size-based
# math so the script also works on devices where uiautomator dump fails.
products_tap="$(find_tab_center "$PREFIX-home-layout.xml" "Products" || true)"
media_tap="$(find_tab_center "$PREFIX-home-layout.xml" "Media" || true)"

if [ -n "$products_tap" ]; then
  run_adb shell input tap $products_tap || true
else
  run_adb shell input tap "$PRODUCTS_X" "$TAB_Y" || true
fi
sleep 2
shot products
if [ -n "$media_tap" ]; then
  run_adb shell input tap $media_tap || true
else
  run_adb shell input tap "$MEDIA_X" "$TAB_Y" || true
fi
sleep 2
shot media

run_adb shell dumpsys meminfo com.gemhublite.app > "$PREFIX-meminfo.txt" || true
run_adb shell logcat -d -t 500 > "$PREFIX-logcat-tail.txt" || true

if [ "${NO_NETWORK:-1}" = "1" ]; then
  run_adb shell svc wifi disable || true
  run_adb shell svc data disable || true
  sleep 2
  run_adb shell am force-stop com.gemhublite.app || true
  run_adb shell am start -W -n com.gemhublite.app/.MainActivity > "$PREFIX-no-network-start.txt" || true
  sleep 5
  shot no-network-home
  dump_layout no-network-home
  nn_products_tap="$(find_tab_center "$PREFIX-no-network-home-layout.xml" "Products" || true)"
  nn_media_tap="$(find_tab_center "$PREFIX-no-network-home-layout.xml" "Media" || true)"
  if [ -n "$nn_products_tap" ]; then
    run_adb shell input tap $nn_products_tap || true
  else
    run_adb shell input tap "$PRODUCTS_X" "$TAB_Y" || true
  fi
  sleep 2
  shot no-network-products
  if [ -n "$nn_media_tap" ]; then
    run_adb shell input tap $nn_media_tap || true
  else
    run_adb shell input tap "$MEDIA_X" "$TAB_Y" || true
  fi
  sleep 2
  shot no-network-media
fi

{
  echo "Result: captured launch, Products, Media, meminfo, logcat, and optional no-network screenshots."
  echo "Fatal/ANR lines:"
  rg -i "FATAL EXCEPTION|ANR in|Application Not Responding" "$PREFIX-logcat-tail.txt" -n || true
} > "$PREFIX-summary.txt"

echo "Evidence written with prefix: $PREFIX"
