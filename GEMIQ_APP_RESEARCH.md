# GemIQ App Research

Inspection date: 2026-05-27  
Method: iPhone Mirroring live app walkthrough, user-assisted physical photo capture, App Store listing review  
Account state observed: logged-in free account with cloud storage and one captured product/media item

## Purpose

This file documents what GemIQ actually does and what matters for the GemHub Lite take-home. It is not a mandate to clone the production app. It is a source-of-truth for product behavior, feature hierarchy, visual language, and take-home scope decisions.

## Evidence Limits

- iPhone Mirroring cannot operate the iPhone camera from Mac. When the camera is invoked through mirroring, macOS shows: `iPhone camera is not available from Mac.`
- Real capture was completed by the user on the physical phone, then inspected through iPhone Mirroring.
- Save/product/media behavior was inspected after the user captured one watch image.
- Bluetooth/GemLightbox hardware behavior was visible in UI, but no physical GemLightbox was connected.
- Shopify connection, notification permission, destructive delete, and external share/export flows were not completed.

## App Store Context

GemIQ is positioned as a Photo & Video app by HEIG LIMITED / Picup Media. The App Store listing describes it as part of the GemLightbox and Picup Media family, focused on studio-quality jewelry images/videos, GemLightbox/turntable Bluetooth control, brightness/background controls, video modes including 45/90/360, and a separate built-in gallery.

App Store listing also indicates:

- Category: Photo & Video.
- Compatibility: iPhone/iPad, iOS/iPadOS 13+.
- Languages: English plus many others.
- Current App Store version observed: 5.6.4, May 11.
- Privacy label says data not collected, but logged-in app UI still shows cloud storage and account/org surfaces.

Reference: https://apps.apple.com/us/app/gemiq/id1348230536

## Product Mental Model

GemIQ is not just a camera. It is a capture-to-catalog workflow for jewelry merchants.

Core product loop:

```text
Capture or import media
-> attach media to SKU/product
-> enrich product metadata
-> browse media/products
-> share/export/sync product assets
```

Important product signal:

- Camera is central, but SKU/product identity is what turns a photo into inventory.
- Media and Products are separate browsing modes over related data.
- The app helps merchants move from raw jewelry photo to sellable catalog asset.
- Production GemIQ includes many advanced tools, but take-home should prove the core loop first.

## Navigation Structure

Observed bottom tabs:

- Home
- Media
- Camera
- Products
- More

The Camera tab is visually emphasized as a raised center tab with teal circular styling.

Home includes:

- GemIQ logo header.
- Profile/avatar shortcut.
- Recent captured product/media card.
- Quick Actions: Take Photo, Media, Products, Collections.
- Overview/tutorial video card.
- GemStudio promotional/content section.

Media includes:

- GemIQ header.
- Profile/avatar shortcut.
- Add button.
- Select mode.
- Filter button.
- Search by SKU.
- Date-grouped media grid.
- Empty state with tutorial and Add Media CTA.

Products includes:

- GemIQ header.
- Profile/avatar shortcut.
- Add button.
- Select mode.
- Filter button.
- Search by SKU.
- Product grid card with cover image, SKU, media count, and small cloud/sync indicator.

More includes:

- Collections entry.
- Integrations entry.
- Enable notifications CTA in header.

Profile includes:

- Avatar/photo edit.
- Name, organization, email, plan badge.
- Cloud storage usage.
- Personal Profile.
- Organization Profile.
- Business Details.
- Account & Security.

## Camera Flow

Observed camera UI:

- Full-screen preview area.
- Close button at top left.
- Settings button at top right.
- Flash/disabled-flash indicator.
- Zoom control, observed as `2x`.
- Bluetooth hardware connection status, observed as `Not Connected`.
- Lighting/background preset selector, observed as `Neutral`.
- Auto-adjust button.
- Brightness slider.
- Temperature/color slider.
- Large teal circular shutter button.
- Photo/video mode switch at bottom.
- GemAI entry near shutter controls.

Camera settings observed:

- Aspect ratio, observed as `1:1`.
- Save photos in max resolution.
- Save photos as 300dpi.
- Save videos in 4K.
- Enable delay timer.
- Enable manual focus.
- Enable macro lens.
- Enable logo on camera.
- Enable text watermark.
- Enable grid.

Production implications:

- GemIQ is built for controlled jewelry photography, not generic snapshots.
- The app expects square, marketplace-friendly output.
- The take-home should include still capture and square-preview thinking, but not replicate GemLightbox controls unless required.
- Hardware/Bluetooth controls are production-specific and should be out of scope for GemHub Lite.

## Post-Capture Save Flow

After capture, the user lands on product creation/editing.

Observed save screen:

- Top Cancel action.
- Large captured image preview.
- Floating edit/pencil button on image.
- Image options menu.
- Thumbnail strip with add-media button and captured thumbnail.
- Product Info section.
- AI Auto-Fill control.
- Required SKU field.
- Barcode/scan icon beside SKU.
- Save Product button.

Observed default SKU behavior:

- New captures auto-generated sequential SKU values, observed as `UN-0002` and `UN-0003`.
- SKU is required.
- Captured media can become a product under that SKU.

Cancel behavior:

- Cancel prompts with warning that product will not be saved.
- Product-detail back prompts if unsaved product info changes would be lost.

Image options observed:

- Set as Cover Photo.
- View image info.

Image info observed:

- Date captured.
- Resolution, observed as `3024 x 3024`.
- Device info, observed as iPhone 15 Pro and Apple manufacturer.
- Serial/device identifier shown.

Save behavior observed:

- Under iPhone Mirroring, tapping Save Product showed camera-unavailable alert again.
- Despite this, the captured media/product appeared in Media, Products, Home Recent, and Product Detail after returning.
- Treat this as a mirroring limitation/production side effect. Real-device verification required.

## Product Detail

Product detail screen is SKU-centered. Observed title: `UN-0003`.

Top/actions:

- Back button.
- Overflow menu.
- Share button.
- Save Product button when edits exist.
- Cancel button for edit state.

Overflow menu:

- Share settings.
- Delete product.

Media area:

- Large product image.
- GemStudio entry overlay.
- Image options menu.
- Thumbnail strip with add-media button.

Product Info fields:

- SKU, required.
- Title, placeholder example: `e.g Knot ring in yellow gold`.
- Product Type.
- Description.
- AI Auto-Fill.

Product Type picker observed:

- Search product type field.
- Diamonds (loose).
- GemStones (loose).
- Bracelets.
- Earrings.
- Necklaces.
- Rings.
- Watches.
- Brooches.
- Pendants.
- Coins.
- Bullions.
- Minerals.

Specification section:

- Main Stone, with Add details.
- Jewelry Details, with Add details.

Pricing & Inventory section:

- Price with currency selector, observed as USD.
- Quantity.

Associated Collections section:

- Select collections.

Product behavior implications:

- Production product model is much richer than take-home minimum.
- Take-home should not implement every field, but should reflect the core hierarchy: identity, title/type/description, media, pricing/inventory if time permits.
- Product type taxonomy matters for jewelry domain feel.
- SKU/title/media count/thumbnail are must-have browse signals.

## Media Library

Media tab behavior observed:

- Captured image appears under date group: `May 27, 2026`.
- Media grid card can open the linked SKU/product detail.
- Search by SKU is primary search affordance.
- Filter entry opens Apply Filters screen.
- Add button opens action sheet.

Add media action sheet:

- Take new photo/video.
- Choose media from device.
- Cancel.

Filter screen categories:

- Product Type.
- Media Type.
- Created by.
- Creation time.
- Reset All.
- Apply.

Select mode:

- Selecting one media item shows bottom action bar.
- Actions observed:
  - Assign to SKU.
  - Save to camera roll.
  - Share media.
  - Export media.
  - Delete.

Media implications:

- Media can exist as its own library item and can be assigned/linked to SKU.
- Bulk/select action model is important in production but can be simplified in take-home.
- For take-home, implement clear media browsing, SKU context, and add-to-existing-SKU path before export/share/delete.

## Products Library

Products tab behavior observed:

- Product grid card shows cover image.
- SKU shown below image.
- Media count shown, observed as `1 media`.
- Small cloud/sync icon shown on card.
- Search by SKU.
- Filter button.
- Select mode.
- Add button.

Product card opens Product Detail.

Implications:

- Products are catalog entities; media are assets attached to catalog entities.
- Product grid must stay in sync with captured media.
- Cover image should default from first/selected media.
- Media count is useful and low-cost for take-home.
- Cloud/sync state is a production signal; take-home with Supabase should show simple sync status if implemented.

## Collections

Collections appear in Quick Actions and More.

Observed Collections screen:

- Title: Collection.
- Filters/chips:
  - Created by: All.
  - All.
  - Automatic.
  - Manual.
- Empty state with tutorial video.
- Create Collection CTA.

Implications:

- Collections are merchandising/share units over product/media.
- Collections are not core to first take-home pass unless explicitly required.
- A collection-ready schema can be considered, but UI should not distract from capture/SKU/catalog flow.

## Integrations

More -> Integrations observed:

- Shopify card.
- Copy: sync images, videos and product information.
- Connect button.
- Learn More button.

Implications:

- GemIQ product value extends to commerce channel publishing.
- For take-home, this supports why product data quality matters.
- Do not implement Shopify unless requested.

## Profile, Account, Sync

Observed profile:

- User identity and organization are first-class.
- Plan badge observed as Free.
- Cloud storage card shows usage, observed around `7.89 MB of 3.00 GB used`.
- Storage card also shows photo/video count, observed as `1 Photos, 0 Videos`.
- Profile has personal, organization, business, account/security sections.

Implications for Supabase take-home:

- Supabase should model ownership explicitly, even if demo auth is simple.
- Cloud sync should be visible as product/media persistence, not hidden implementation detail.
- Avoid hard-coded secrets.
- Keep demo account/single-user flow simple unless assignment demands org membership.

## AI / GemStudio / GemAI

Observed AI surfaces:

- Camera GemAI entry.
- Product form AI Auto-Fill.
- AI settings:
  - Language, observed US English.
  - Description style, observed E-commerce.
  - Free-text instruction box, max 500 chars.
- Product detail GemStudio overlay.
- GemStudio promo explains generation of model images, lifestyle scenes, and metal color variations.

Implications:

- AI assists catalog content after capture; it is not required for basic save.
- Take-home AI, if included, should be optional and editable.
- Do not require AI to save product/media.
- Do not overbuild GemStudio; it is a production feature outside core exercise.

## Visual Language

Overall style:

- White background.
- Soft teal accent for primary actions and selected states.
- Dark navy/charcoal text.
- Rounded cards and inputs.
- Very light gray surfaces for empty states, skeletons, disabled fields, and cards.
- Bottom tab bar with simple line icons.
- Center camera tab raised and visually dominant.
- Product/media images are large, square, and edge-to-edge within cards/previews.
- Forms use section headings in uppercase.
- Buttons:
  - Primary: filled teal.
  - Secondary: white/outline or light gray.
  - Destructive: red.
- Empty states use tutorial video card plus CTA.
- Loading states use skeleton placeholders.
- Alerts are plain, action-oriented, and destructive/cancel flows are confirmed.

Design implications for GemHub Lite:

- Build a calm utility app, not marketing UI.
- Use teal sparingly for primary action, selected tab, save/share.
- Favor square media thumbnails and large visual previews.
- Keep Camera, Media, Products as main surfaces.
- Product detail should feel like an editable inventory form, not a content page.
- Use empty states only where they help start capture/import.

## Take-Home Requirement Interpretation

Must build:

- Camera capture path.
- Preview/save path.
- Required SKU before/at save.
- New SKU creates product.
- Existing SKU appends media to product.
- Products library with image, SKU, title/placeholder, media count.
- Media library with image and SKU/product context.
- Product detail with editable fields and attached media.
- Add more media from product detail with SKU prefilled.
- Supabase-backed sync if assignment asks backend sync.
- iOS and Android parity for RN implementation.

Should build if time:

- Search by SKU.
- Product type picker or compact taxonomy.
- Sync status indicator.
- Basic filters.
- Share/export stubs only if honest and working.
- Simple gallery import.

Do not build first:

- Home dashboard beyond maybe a minimal shell.
- More tab.
- Collections.
- Shopify.
- GemLightbox/Bluetooth/turntable.
- 360 video.
- Full GemStudio.
- Full media editor.
- Profile/org management beyond demo ownership.
- Complex AI.

## Recommended GemHub Lite Shape

Recommended main tabs:

- Media.
- Camera.
- Products.

Recommended stack screens:

- Capture preview / Save Product.
- Product Detail.
- Product Type picker.

Recommended product fields:

- SKU, required.
- Title.
- Product Type.
- Description.
- Price.
- Quantity.

Recommended media fields:

- Local URI.
- Supabase storage path.
- Product ID.
- SKU snapshot.
- Capture/import timestamp.
- Width/height if available.
- Sync status.
- Cover flag.

Recommended Supabase entities:

- `products`
- `media`
- `profiles` or simple owner mapping if auth is implemented

Core acceptance demo:

1. Open Camera.
2. Capture/import photo.
3. Save with generated SKU.
4. Confirm product appears in Products.
5. Confirm image appears in Media.
6. Open Product Detail.
7. Edit title/type/description.
8. Add another image to same SKU.
9. Confirm media count updates.
10. Relaunch or refresh and confirm Supabase/local state remains consistent.

## Open Questions Worth Asking Paul

These are high-leverage questions, not implementation trivia:

1. In review, should GemHub Lite feel like a small slice of GemIQ, or a new app that only preserves the capture-to-catalog workflow?
2. Is the strongest signal reliable capture-to-SKU sync, or accurate modeling of GemIQ product metadata?
3. Should Supabase sync be visible to the user as status/progress, or only demonstrated through persistence across sessions/devices?
4. Should the demo prioritize merchant speed, e.g. repeated capture for many SKUs, or product completeness for each SKU?
5. Which real GemIQ mistake would be worse in the take-home: weak camera flow, weak SKU discipline, weak product detail, or weak sync reliability?
6. Should product type/specification fields be simplified, or should the jewelry taxonomy be represented enough to show domain understanding?
7. Should a captured image be allowed to exist unassigned, then assigned later, or should GemHub Lite enforce SKU at save time only?

## Final Product Read

GemIQ is a jewelry inventory media system with camera at the center. Its product truth is not the full five-tab shell, hardware controls, AI editor, or Shopify integration. The take-home should show that the candidate understands the hard part: every capture becomes durable, searchable, synced product inventory through SKU discipline and clear media/product linking.
