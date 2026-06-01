# Production SKU Flow Diff — 2026-06-01

## Screenshot-Derived Target

1. Capture product media first.
2. Show add-product form/sheet with large media preview and selected thumbnail.
3. Keep `SKU*` as required identity field.
4. Provide scan icon inside SKU field.
5. Use full-screen scanner overlay for barcode/QR input.
6. Return scanned SKU into the add-product form.
7. Provide `Choose SKU` sheet for alternate search/create/select path.
8. Existing SKU rows show thumbnails.
9. Unknown typed SKU shows empty state and changes CTA to `Create New SKU`.

## Current GemHub Lite Status

| Requirement | Status | Evidence |
| --- | --- | --- |
| Capture preview before save | Matched | `CaptureReview` renders media preview and selected thumbnail strip. |
| Required SKU field | Matched | SKU field displays `SKU *`; save disabled until SKU valid. |
| Scan icon in SKU field | Matched | `SkuSummaryCard` right-side `barcode-outline` button. |
| Full-screen scanner overlay | Matched | `SkuScannerOverlay` modal with dark surface, close/settings, scanning frame, helper card. |
| Scanned value fills SKU field | Simulator-proven; real-device pending | Manual fallback returns `UN-0008`; real object output wired. |
| Choose SKU bottom sheet | Matched | `SkuCreationFlow` title `Choose SKU`, search input, Apply/Cancel. |
| Manual/search input | Matched | `SkuSearchBox` normalizes through capture SKU state. |
| Barcode scan from Choose SKU | Matched | `SkuSearchBox` scan icon opens same scanner overlay. |
| Generate/create CTA | Matched | CTA shows `Generate New SKU`, changes to `Create New SKU` for unknown typed SKU. |
| Existing SKU list with thumbnails | Matched | Existing product rows include `Thumbnail` and metadata. |
| Unknown SKU empty state | Matched | Displays `{SKU} does not exist`; verified with `UN-0008`. |
| Out-of-scope sections omitted | Matched | Specification/pricing/collections not added. |

## Code Touchpoints

- `src/features/camera/components/CaptureReview.tsx`: scanner overlay, Choose SKU sheet, SKU field scan icon, scanned SKU application.
- `tests/sku-flow.test.mjs`: SKU normalization/validity/generated SKU coverage.
- `package.json`: `npm test` command for automated SKU logic validation.

## Remaining Gap

Only missing proof is physical-device barcode/QR auto-detection. Simulator can verify visual flow and fallback, not real camera scanning.
