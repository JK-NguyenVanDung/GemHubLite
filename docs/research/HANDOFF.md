# GemHub Lite Fast Research Handoff

## Mission

Use iPhone Mirroring to inspect only the real-app screens needed to implement GemHub Lite UI, design system, and required feature flows. Move faster than manual browsing: inspect current state, click decisively, record visual facts, and update docs after each screen group. Do not use macOS screenshot capture because it slows and blocks navigation.

## Workspace

- Repo: `/Users/B/Documents/GemHub Lite`
- Current state: planning/research docs only; no Expo app scaffold yet.
- Main sources of truth:
  - `/Users/B/Documents/GemHub Lite/PRP.MD`
  - `/Users/B/Documents/GemHub Lite/DESIGN.md`
  - `/Users/B/Documents/GemHub Lite/CHECKLIST.md`
  - `/Users/B/Documents/GemHub Lite/PROGRESS.md`
  - `/Users/B/Documents/GemHub Lite/docs/research/GemHubApp.md`
  - `/Users/B/Documents/GemHub Lite/docs/research/REAL_APP_INSPECTION_CHECKLIST.md`
- Existing screenshot folder: `/Users/B/Documents/GemHub Lite/docs/research/screenshots/`; use existing files as evidence, but do not spend time capturing new macOS screenshots.

## Current Evidence Already Captured

Do not re-document what is already in `GemHubApp.md`; use these files as evidence:

- `01-home.png`: Home/dashboard, quick actions, bottom nav.
- `03-capture-product-info.png`: capture preview/product info with SKU and Save Product.
- `07-sku-does-not-exist.png`: unknown SKU sheet with Create New SKU.
- `09-new-sku-product-form.png`: new SKU product form fields.
- `11-product-type-menu.png`: product type category picker.
- `13-ring-type-selected.png`: ring subtype picker.
- `14-filled-product-form.png`: minimal filled product form.
- `16-second-capture-blank-sku.png`: second capture reset after save.
- `18-camera-screen.png`: camera preview UI.

## Fast Operating Rules

- Use `get_app_state` for current screen, then click; do not over-explain.
- Do not call macOS `screencapture`; it blocks speed. Use iPhone Mirroring visual state from `get_app_state` and write observations directly.
- If a click misses, recalibrate cursor once from visible state, then continue.
- Prefer screen coverage over screenshot proof.
- After each screen group, update:
  - `docs/research/GemHubApp.md` for observed behavior.
  - `DESIGN.md` for UI/design-system patterns.
  - `CHECKLIST.md` for capture status.
  - `PROGRESS.md` for current evidence and next target.
- Keep updates terse and factual. No long narrative.

## Capture Targets Still Needed

1. Existing SKU append behavior: use saved `UN-0002` if reachable.
2. Products list/card layout.
3. Media gallery/tile layout.
4. Product Detail layout.
5. Product Detail Add Photo route/SKU context.
6. Any save success confirmation, navigation result, or sync between Products and Media.

## Scope Filter

Care only about screens/features that implement the take-home flow:

- Camera preview and capture entry.
- Capture Preview / SKU binding.
- New SKU and existing SKU behavior.
- Product metadata form.
- Product type picker only as Lite taxonomy/design input.
- Products, Media, Product Detail, Add Photo.

Skip fast if encountered:

- GemAI, AI image generation, background/lifestyle tools.
- Hardware/Bluetooth/lightbox/turntable controls.
- Account/org/profile/payment/credits.
- Branding/logo exact copy.
- Advanced filters/editor/360/video unless needed to avoid navigation dead end.

## Current Screen Note

Last known visible state was Camera screen. User said actual shutter capture is not needed/possible; inspect camera UI only and move to Products/Media/Detail targets.

## Suggested Skills

- `caveman`: terse progress updates.
- `mobile-harness-skill`: keep GemHub/GemIQ research aligned with PRP and take-home scope.
- `computer-use`: iPhone Mirroring inspection.
- `handoff`: compact transfer if session stops again.
