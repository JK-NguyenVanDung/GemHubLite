# GemHub Lite Design System Final

## Summary

GemHub Lite uses the real GemHub/GemIQ screenshots as product-design evidence, then adapts only safe Lite patterns: camera prominence, SKU-first inventory, compact image cards, and clean merchant forms. It must not copy GemHub/GemIQ branding, assets, credit systems, profile surfaces, collections, video, AI studio, hardware, auth, cloud, or paid workflows.

Navigation stays focused on three required surfaces:

- `Camera`: primary capture route.
- `Media`: gallery over saved product photos.
- `Products`: SKU-first inventory browser.

## Evidence Source

Use these screenshots as final design inputs:

- `docs/research/screenshots/18-camera-screen.png`: primary camera route, large shutter, bottom control panel, teal action emphasis.
- `docs/research/screenshots/03-capture-product-info.png`: capture review, large image preview, thumbnail strip, SKU gate, bottom save CTA.
- `docs/research/screenshots/09-new-sku-product-form.png`: new SKU product form with title, product type, description, and compact section labels.
- `docs/research/screenshots/19-media-tab.png`: media gallery header, SKU search, filters, compact thumbnail grid.
- `docs/research/screenshots/27-product-tab.png`: products grid, two-column cards, SKU labels, media counts, centered camera tab.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#F7FAFA` | page canvas |
| `surface` | `#FFFFFF` | cards, forms, tab bar |
| `surfaceMuted` | `#F2F5F5` | fields, inactive controls |
| `border` | `#E5ECEC` | card and field outlines |
| `text` | `#111827` | primary labels |
| `secondaryText` | `#6B7280` | body/help text |
| `tertiaryText` | `#9CA3AF` | metadata placeholders |
| `accent` | `#18B8B8` | primary action and selected state |
| `accentDark` | `#079999` | pressed/strong teal |
| `accentSoft` | `#E8FAFA` | chip fills |
| `danger` | `#EF4444` | destructive/error states |

Typography uses platform system font:

- Screen title: `22`, weight `700`.
- Section title: `13`, weight `700`, uppercase.
- Body: `15`, weight `400`.
- Metadata: `12`, weight `500`.
- SKU chip: `12`, weight `700`.

Spacing scale (semantic, 4-pt base):

| Token | Value | Use |
| --- | --- | --- |
| `xxs` | `4` | hairline gaps, icon-to-text |
| `xs` | `8` | tight chip/inline gaps |
| `sm` | `12` | card padding, field gap |
| `md` | `16` | page padding, bottom CTA safe-area |
| `lg` | `20` | section gap |
| `xl` | `24` | screen-level breathing room |
| `xxl` | `32` | hero/empty-state vertical rhythm |

Applied rules:

- Page padding `md`.
- Card padding `sm`.
- Field gap `sm`.
- Section gap `lg`.
- Bottom CTA safe-area padding `md`.
- Card radius `16`, thumbnail radius `12`, button radius `12`, chip radius `999`, sheet radius `24`.
- Elevation is border plus subtle shadow only.

## Components

- `AppShell`: Expo Router tabs with centered prominent Camera button; Media and Products equal siblings.
- `Screen`: safe-area page shell with soft background, scroll support, and optional footer.
- `InventoryHeader`: title, optional `+ New`, SKU search, and filter chip; shared by Media and Products.
- `ProductCard`: thumbnail placeholder/photo, SKU, title fallback, media count, and card press target.
- `MediaTile`: square thumbnail, SKU chip overlay, product title context, and Product Detail navigation.
- `CaptureReview`: large photo preview, thumbnail strip, required SKU field, Generate SKU action, Save Product CTA.
- `ProductFormSection`: SKU read-only after create, title, type picker, description, and section grouping.
- `EmptyStateCard`: compact icon, direct title, helper text, and outline/primary CTA.
- `ActionSheet`: future source choice for Add Product/Add Photo; only Camera and Library when implemented.

## Screen Rules

- Camera is primary. It must expose capture-first UI and route to capture preview.
- Capture Preview blocks save without normalized SKU. Generated SKU uses `SKU-YYYYMMDD-###`.
- Products shows SKU, title/placeholder, cover image, and media count. `+ New` starts capture/source flow.
- Media shows saved media only. SKU context is always visible; no unassigned bucket exists.
- Product Detail is SKU-centered, supports editable title/type/description, shows media, and adds photo with SKU preselected.

## Validation

- Run `npm run typecheck` after component/screen work.
- Run `npm run lint` after typecheck passes.
- Manually verify Camera, Media, Products, Capture Preview, and Product Detail on iOS and Android when native run gates are available.
- Confirm no Home, profile, credits, collections, video, AI studio, auth, or cloud surfaces appear in v1 UI.
