# GemHub/GemIQ Real-App Research

## Purpose

Capture real-app product logic and design-system lessons before implementing GemHub Lite. This file should guide a production-inspired take-home app without copying proprietary branding, exact assets, paid features, or hardware/cloud surfaces.

## Research Rules

- Use the take-home brief as the required scope boundary.
- Inspect real app behavior conservatively through iPhone Mirroring/Computer Use.
- Use `CONTEXT.md` glossary terms when recording observations.
- Prefer screenshots and written observations over assumptions.
- Separate product logic from visual/design observations.
- Mark anything not observed as unknown.
- Do not enter sensitive account data or modify production data unless explicitly approved.

## Screenshot Index

Store screenshots in `docs/research/screenshots/` and list them here.

| Screenshot | Screen | Observation |
| --- | --- | --- |
| `docs/research/screenshots/01-home.png` | Home / entry navigation | Home/dashboard with quick actions, GemStudio card, and bottom navigation. |
| `docs/research/screenshots/02-after-camera-tap.png` | Camera transition attempt | Intermediate capture from camera-tab tap attempt; kept as interaction evidence. |
| `docs/research/screenshots/03-capture-product-info.png` | Post-capture product info | Captured media review + product form with SKU and save affordance. |
| `docs/research/screenshots/07-sku-does-not-exist.png` | Choose SKU sheet | Unknown SKU search shows `Create New SKU` and `UN-0002 does not exist`. |
| `docs/research/screenshots/09-new-sku-product-form.png` | New SKU product form | New SKU expands form with SKU, Title, Product Type, Description, Specification, and Save Product. |
| `docs/research/screenshots/11-product-type-menu.png` | Product type picker | Product type picker uses searchable category list with jewelry categories. |
| `docs/research/screenshots/13-ring-type-selected.png` | Product subtype picker | Ring category drills into subtypes before final selection. |
| `docs/research/screenshots/14-filled-product-form.png` | Filled product form | Minimal product save path with title and product type selected. |
| `docs/research/screenshots/16-second-capture-blank-sku.png` | Second capture after save | After save, app returns to capture/product form with new captured image and blank SKU field. |

## Navigation Observations

### Home / Entry Navigation

- Screenshot(s): `docs/research/screenshots/01-home.png`.
- Observed product logic: Home starts with education/overview content, then exposes direct action cards for `Take Photo`, `Take video`, `Upload media`, and `New collection`.
- Observed product logic: Camera, Media, Products, and More are first-class bottom navigation items; Camera is visually primary with a larger centered tab button.
- Observed product logic: Top bar includes account/profile affordance, GemIQ brand, and a credit/balance pill showing `30`.
- Observed product logic: Scrolling below the overview video reveals a `GemStudio` promotional/AI creation card with a `Tap to Create` CTA.
- Observed visual/design pattern: white/light gray background, rounded cards, teal icon accents, soft shadows, compact merchant-dashboard density.
- Observed visual/design pattern: Quick actions use two-column cards with icon left and short verb labels.
- Observed visual/design pattern: GemStudio card uses before/after jewelry/model imagery, a small arrow badge, centered title text, muted explainer copy, and a teal-to-purple gradient CTA.
- Safe Lite adaptation: Make Camera primary in bottom navigation, keep Media and Products as sibling tabs, and provide fast home actions for capture/upload/create flows.
- Safe Lite adaptation: Use neutral cards, teal accent, rounded thumbnails, and concise labels without copying production branding/assets.
- Safe Lite adaptation: If using a Home/dashboard, show one value card beneath quick actions; for take-home, avoid AI/GemStudio scope unless framed as static placeholder/future enhancement.
- Do not copy: GemIQ/GemHub branding, overview video asset, credit economy, account/org surfaces, production imagery.
- Do not copy: GemStudio AI/lifestyle-generation feature; it is outside required camera-to-catalog flow.
- Open question: Whether Lite needs Home at all, or can start on Camera/Products because take-home required flow is capture -> SKU -> library -> detail.

### Interaction Reliability Notes

- `screencapture -l` now captures the iPhone Mirroring window reliably; screenshots are saved under `docs/research/screenshots/`.
- Computer Use still exposes iPhone Mirroring mostly as a single window, so visual inspect-before-tap remains required.
- A coordinate click toward the centered Camera tab reached the post-capture product-info screen after a brief `iPhone in Use` reconnect state.
- Further navigation should follow inspect-first sequence: inspect current screen, choose one visible target away from overview video, tap once, inspect result, then record only observed facts.

## Camera Flow Observations

- Camera is first-class and visually emphasized as the centered bottom tab.
- Home exposes `Take Photo` as the first quick action.
- Post-capture screen observed in `docs/research/screenshots/03-capture-product-info.png`.
- Observed product logic: capture lands on a media review/product-info form rather than returning directly to a generic gallery.
- Observed product logic: top-left `Cancel` exits the capture/product-info flow.
- Observed product logic: captured image appears large at top, with an active thumbnail strip below.
- Observed product logic: a plus tile beside the active thumbnail implies adding more media before save.
- Observed product logic: floating edit/pencil and overflow controls are available on the captured image.
- Observed product logic: `Save Product` is the primary bottom action.
- Safe Lite adaptation: keep capture -> review -> SKU -> save as one focused flow with clear cancel and add-more-media affordances.

## SKU/Product Logic Observations

- Post-capture product-info form observed with SKU as visible first field.
- Observed product logic: SKU field is prefilled as `UN-0001` and marked required via `SKU*`.
- Observed product logic: SKU field includes a barcode/scan icon affordance.
- Observed product logic: `AI Auto-Fill` appears as an expandable helper beside `PRODUCT INFO`.
- Observed product logic: Product is saved by explicit `Save Product` CTA after SKU review.
- Products is first-class bottom navigation, suggesting product catalog is a primary surface.
- Observed product logic: pressing Save with an unknown SKU opens a `Choose SKU` sheet rather than saving immediately.
- Observed product logic: unknown SKU search shows `Create New SKU` and an empty-state message like `UN-0002 does not exist`.
- Observed product logic: `Create New SKU` returns to the product form and expands additional fields: Title, Product Type, Description, and Specification.
- Observed product logic: Product Type is a searchable hierarchical picker with top-level categories such as Diamonds, GemStones, Bracelets, Earrings, Necklaces, Rings, Watches, Brooches, and Pendants.
- Observed product logic: selecting `Rings` drills into subtypes such as Bands, Multi-Stone Rings, Signet Rings, Solitaire Rings, Stackable Rings, Wedding Rings, Engagement Rings, Cocktail Rings, and Eternity Rings.
- Observed product logic: after a successful save attempt with title and product type, the app returned to a fresh post-capture form with a new image and blank SKU field instead of opening Products or Product Detail.
- Not observed yet: whether entering an existing SKU appends media to the existing product or opens a product picker/detail.

## Media Library Observations

- Media is first-class bottom navigation.
- Home exposes `Upload media` as a quick action.
- Post-capture screen shows captured media as both large preview and thumbnail strip before save.
- Media gallery/list not observed yet because navigation tap calibration is blocked.

## Products Area Observations

- Screenshot/status: observed through iPhone Mirroring on 2026-05-28; no new macOS screenshot captured per handoff.
- Observed product logic: Products is a first-class bottom tab, separate from Media and Camera.
- Observed empty state: top title `Products`, right `+ New` action, SKU search field, and filter icon chip.
- Observed empty state: central tutorial card says `Welcome to GemIQ!`, short learning copy, video preview card, helper line, and `Add Product` CTA.
- Observed visual/design pattern: mostly white canvas, compact top controls, light rounded search field, isolated filter chip, centered tutorial block, outlined teal empty-state action.
- Safe Lite adaptation: reuse one inventory header pattern for Products and Media: title, `+ New`, SKU search, filter chip, empty/tutorial card, and primary empty CTA.
- Safe Lite adaptation: `+ New` and `Add Product` should open a source-choice sheet before Camera/library selection; Lite can omit video if not implemented.
- Do not copy: production tutorial video image, exact GemHub/GemIQ copy, Home/dashboard dependency, credits/account chrome.
- Open question: populated product card layout and Product Detail remain unobserved because current visible account state has no accessible saved product in Products.

## Product Detail Observations

- Not observed yet.

## Design-System Observations

Track reusable lessons:

- spacing,
- tab hierarchy,
- tile density,
- typography,
- form rhythm,
- empty states,
- image treatment,
- action placement.

Current status: entry/home, Products empty state, new-SKU capture save flow, product type hierarchy, and second-capture reset behavior inspected; Media gallery, populated Products cards, Product Detail, and existing-SKU append behavior remain pending.

## Safe Lite Adaptations

| Production-Inspired Pattern | Why It Helps | Lite Adaptation | Not Copied |
| --- | --- | --- | --- |
| Center-primary Camera tab | Communicates capture as main workflow | Larger centered Camera tab/button in bottom navigation | Exact icons, shape, brand treatment |
| Two-column quick actions | Lets merchants start common tasks fast | Home or header actions for Take Photo, Upload, New Product/Collection | Production video, credit/account mechanics |
| Rounded media/product cards | Supports scan-heavy jewelry catalog browsing | Rounded thumbnails/cards with compact metadata | Production imagery/assets |
| Teal accent on neutral surfaces | Keeps UI clean while emphasizing actions | Use teal as limited action/accent color | GemIQ/GemHub logo/branding |
| Capture review before save | Prevents bad inventory entries | Show captured media, SKU field, add-more-media, cancel, and save in one flow | AI autofill branding, exact controls, production SKU semantics |
| Shared Products/Media empty state | Keeps empty inventory actionable | Reuse search/filter chrome, tutorial-safe card, and add CTA | Production tutorial video asset/copy |

## Out-Of-Scope Production Surfaces

Record production surfaces seen during research that must not distract v1.

- Hardware controls.
- Auth/org/account surfaces.
- Cloud sync or storage quotas.
- AI/editor/filter/background tools.
- Integrations and commerce surfaces.

## Open Questions After Research

- What happens after `Save Product`: product detail, products list, media list, or home?
- Does an existing SKU append media or show a conflict/merge UI?
- What fields appear when `AI Auto-Fill` is expanded?
- Can Media and Products tabs be opened safely from current post-capture state without saving production data?
- Should GemHub Lite include a Home tab, or should it prioritize required take-home flows with Camera, Media, Products only?
