# SKU Scan Flow Validation — 2026-06-01

## Scope

Focused comparison against provided production screenshots for the capture-review SKU path only.

Out of scope per request: AI Auto-Fill, Specification, Pricing & Inventory, Associated Collections.

## Production Flow Reference

- Capture screen leads into add-product form with large media preview and top thumbnail strip.
- `PRODUCT INFO` contains required `SKU*` field with barcode/QR scan icon on the right.
- Tapping scan icon opens full-screen scanner overlay with dark camera surface, close/settings controls, scanning frame, and helper copy.
- Scanned SKU returns to add-product form with SKU field filled.
- `Choose SKU` bottom sheet supports manual/search input, barcode scan, existing SKU list with thumbnails, generated/new SKU action, and empty state like `UN-0008 does not exist`.

## GemHub Lite Current Match

- Add-product preview keeps large captured media and thumbnail strip before product fields.
- SKU field is required and now has a right-side barcode scan icon.
- Scanner icon opens full-screen overlay.
- Overlay uses VisionCamera object scanning for QR/barcode families on real camera-capable devices.
- Simulator fallback exposes manual scanned value so the route can still be validated without rear camera hardware.
- Using scanned/manual fallback `UN-0008` fills the SKU field on return to add-product form.
- `Choose SKU` bottom sheet now includes search/manual input, scan icon, smart generate CTA, existing rows with thumbnails, and `UN-0008 does not exist` empty state with `Create New SKU` CTA.

## Intentional Lite Differences

- Hardware controls, AI Auto-Fill, product specification, pricing, inventory, and collection picker are not recreated because they are outside the take-home scope.
- Real scanner uses VisionCamera `useObjectOutput` instead of production hardware/AI stack.
- Simulator shows `Camera scanner unavailable` because iOS Simulator does not provide a usable rear camera feed for barcode proof.

## Validation Evidence

Commands run from `/Users/B/Documents/GemHub Lite`:

- `npm test` passed: SKU normalization, SKU validity, generated SKU parse.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run verify:submission` passed with no local verifier blockers and four existing warnings.
- `npm run ios -- --device 'iPhone 17 Pro'` built and launched successfully before this evidence note.

Argent iOS simulator smoke:

- Opened `gemhublite://capture-preview` with image file URI.
- Observed add-product form with image thumbnails and SKU field.
- Tapped right-side SKU scan icon.
- Observed full-screen scanner overlay.
- Tapped `Use Scanned SKU` fallback.
- Observed add-product form with `UN-0008` filled in SKU field.

## Remaining Proof Gap

Real-device barcode/QR auto-detection remains unverified. The implementation is wired to VisionCamera object scanning, but a physical device with camera access and a real barcode/QR target is required for final evidence.
