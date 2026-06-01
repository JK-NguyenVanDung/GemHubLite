# Real App Inspection Checklist

## Purpose

Use this short checklist before touching the real GemHub/GemIQ app. Goal is to learn product logic and safe design-system patterns for GemHub Lite, not to wander through the production app.

## Session Rules

- Use iPhone Mirroring + Computer Use for observation; do not use macOS screenshot capture unless user explicitly asks.
- Record visible state directly in `docs/research/GemHubApp.md`; use existing screenshots as evidence.
- Record findings in `docs/research/GemHubApp.md` immediately after each screen group.
- Do not enter sensitive account data.
- Do not modify production/customer data unless explicitly approved.
- Stop if app asks for payment, org setup, account changes, Bluetooth hardware, or external permissions unrelated to viewing flows.

## What We Want To Learn

- Which screens prove the product mental model: capture -> SKU -> library -> detail.
- How production app makes Camera feel primary.
- How Media and Products differ visually and behaviorally.
- How SKU is displayed, generated, required, edited, or selected.
- How Product Detail groups images and metadata.
- Which UI patterns are safe to adapt for Lite.

## Minimum Click Path

### 1. App Entry And Navigation

- [x] Open app through iPhone Mirroring.
- [x] Capture first visible screen through iPhone Mirroring screenshot: `docs/research/screenshots/01-home.png`.
- [x] Identify visible tabs/menu items.
- [x] Note whether Camera, Media, and Products are first-class navigation items.
- [x] Capture tab bar or hub navigation through iPhone Mirroring screenshot: `docs/research/screenshots/01-home.png`.
- [ ] Record any login/org/hardware blocker without trying to bypass it.

Note: use visible component centers only. Do not click approximate/random coordinates. Pause before any camera shutter/capture and wait for user to capture manually.

### 2. Media Area

- [ ] Open Media.
- [ ] Capture empty or populated gallery state.
- [ ] Note tile density, thumbnail shape, labels, SKU visibility, and search/filter affordances.
- [ ] Tap one safe existing media item if available.
- [ ] Record whether it opens media detail, product detail, preview, or action sheet.
- [ ] Back out without editing/deleting.

### 3. Products Area

- [x] Open Products.
- [x] Capture empty or populated product list/grid through iPhone Mirroring observation.
- [x] Note empty-state structure: title, `+ New`, SKU search, filter chip, tutorial card, `Add Product` CTA.
- [ ] Tap one safe product if available.
- [ ] Record how Product Detail is structured.
- [ ] Back out without editing/deleting.

### 4. Product Detail

- [ ] Capture top/header area.
- [ ] Capture metadata fields or sections.
- [ ] Capture media section.
- [ ] Note if SKU is editable, read-only, generated, or primary title.
- [ ] Locate Add Media/Add Photo action if visible.
- [ ] Do not save changes.

### 5. Camera Area

- [ ] Open Camera.
- [ ] Capture camera UI if permission/session allows.
- [x] Note capture button placement, SKU/product context, and post-capture affordances.
- [x] If safe, inspect without saving production-impacting data.
- [x] If capture is needed later, use disposable SKU/product context and do not save unless explicitly needed.
- [x] Inspect unknown-SKU behavior: unknown SKU opens `Choose SKU`, offers `Create New SKU`, and shows not-found empty state.
- [x] Inspect new-SKU form fields: SKU, Title, Product Type, Description, Specification.
- [x] Inspect product type picker: searchable hierarchy with jewelry categories and ring subtypes.
- [x] Inspect post-save reset: app returns to next capture/product form with blank SKU.
- [ ] Inspect existing-SKU behavior by entering saved SKU on second capture.

### 6. SKU Save Flow

- [ ] Look for generated SKU behavior.
- [ ] Look for required SKU field.
- [ ] Look for existing SKU selector/search.
- [ ] Look for save/cancel language.
- [ ] Record whether app permits unassigned media.
- [ ] Do not create real inventory unless explicitly approved.

## Screenshots To Capture

- `01-entry-navigation.png`
- `02-media-gallery.png`
- `03-products-list.png` or direct iPhone Mirroring observation note in `GemHubApp.md`
- `04-product-detail-top.png`
- `05-product-detail-media.png`
- `06-camera-ui.png`
- `07-sku-save-flow.png`

If a screen is blocked, capture the blocker instead and name it with `blocked`, e.g. `06-camera-blocked-permission.png`.

## Grill-With-Docs Questions During Inspection

Ask these one at a time only when observation cannot answer them:

1. Should Lite prioritize speed of repeated capture or completeness of product metadata?
2. If production allows unassigned media, should Lite still enforce required SKU because the project explicitly says so?
3. Should generated SKUs visually resemble production examples, or use the documented `SKU-YYYYMMDD-###` format for clarity?
4. Which real-app visual pattern is worth adapting first: camera prominence, card density, or Product Detail sectioning?
5. What is worse for submission: less production-like UI, or slower/fragile capture-to-SKU flow?

## Output Shape

Each screen group in `GemHubApp.md` should include:

```md
### Screen Name
- Screenshot(s):
- Observed product logic:
- Observed visual/design pattern:
- Safe Lite adaptation:
- Do not copy:
- Open question:
```
