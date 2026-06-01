# Real-Device Camera Evidence

Status: NOT VERIFIED

This file is intentionally not enough to satisfy `npm run verify:submission` until the verified marker below is changed after a real iOS or Android device capture succeeds.

VERIFIED_REAL_DEVICE_CAMERA=false

## Required Device Matrix

- iOS physical device with rear camera.
- Android physical device or emulator-backed camera where VisionCamera capture is available.
- At least one compact Android width and one expanded Android width must remain visually usable after capture/save.

## Required Flow Evidence

For each verified device, record:

- Device model:
- OS version:
- Build command:
- Install command:
- Camera permission result:
- Capture result:
- SKU used:
- Product Detail persistence after restart:
- Screenshot/video evidence path:
- Runtime log path:
- Known limitation, if any:

## Acceptance Criteria

- Camera permission prompt appears with correct copy.
- Rear-camera preview starts.
- Capture creates media and opens Capture Review.
- SKU is required before save.
- Save creates or appends product without duplicate normalized SKU.
- App restart preserves Product and Media rows.
- No orphan file remains after a failed/abandoned save.
