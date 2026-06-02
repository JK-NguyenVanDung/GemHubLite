# GemHub Lite — Demo Script

A ready-to-record narration script for the **Demo evidence** deliverable (2–5 min screen recording), plus the two written sections the brief asks for inline: **AI tooling** and **Known gaps**.

Read the **[SAY]** lines aloud; the **[DO]** lines are what you tap/show on screen.

---

## 0. Intro (≈20s)

**[DO]** Open the app on the iOS simulator (or Android emulator), landing on the **Home** tab.

**[SAY]**
> "This is GemHub Lite — a local-first React Native app, built with Expo and TypeScript, for a jeweler who photographs inventory and needs every shot tied to a product SKU. Everything is stored locally in SQLite plus app-owned file storage — no backend, no auth, no cloud. I'll walk through the four required journeys: a new product from the camera, adding media to an existing product, reusing an existing SKU, and confirming Products and Media stay in sync.
>
> One honest note up front: the iOS simulator has no rear camera, so the capture screen shows a production-shaped camera shell with a photo-library fallback. The save flow, SKU logic, and persistence are identical to real capture — only the frame source differs."

---

## Journey 1 — New product from camera (≈60s)

**[DO]** Tap the center **Camera** tab. Show the camera shell. Capture a photo (or pick one via the fallback).

**[SAY]**
> "From the Camera tab I capture a shot. After capture, the app goes straight to a preview-and-save step — and here's the core rule: I cannot save without a SKU."

**[DO]** On the Capture Review screen, show the SKU field empty and the disabled save button.

**[SAY]**
> "There's no 'save without SKU' path. I have three ways to set one: type it, pick an existing SKU, or generate one."

**[DO]** Tap **Generate SKU**. Show the generated value, e.g. `GH-000001`.

**[SAY]**
> "Generate creates a unique `GH-######` value. The sequence is derived from the highest existing `GH-` suffix, not a row count, so it won't collide with imported or seeded SKUs. I'll add a title too."

**[DO]** Type a title (e.g. "Gold Solitaire Ring"). Tap **Save**.

**[SAY]**
> "On save, the media is copied into app-owned storage, normalized and compressed, and a new product is created and linked to this SKU."

**[DO]** Navigate to **Products** — show the new product card with SKU, title, and thumbnail. Then **Media** — show the same photo.

**[SAY]**
> "The product now appears under Products with its cover thumbnail, and the photo appears in the Media gallery. New product, end to end."

---

## Journey 2 — Add media to an existing product (≈45s)

**[DO]** From **Products**, tap the product to open **Product Detail**. Show title, description, type, and the media section.

**[SAY]**
> "Product Detail lets me edit the title, description, and product type, and shows every saved photo for this SKU. I can add more photos right from here."

**[DO]** Tap **Add Photo**. Note that it routes to the camera with the SKU pre-filled.

**[SAY]**
> "Add Photo takes me to the camera with this product's SKU already filled in, so I don't have to re-enter it."

**[DO]** Capture/pick another photo, save, and return to Product Detail showing the new image in the list.

**[SAY]**
> "I capture, save, and I'm returned to the detail screen with the new image attached to the same product."

---

## Journey 3 — Existing SKU from camera (≈40s)

**[DO]** Go to **Camera**, capture a photo. On Capture Review, tap to **pick an existing SKU** from the chooser.

**[SAY]**
> "Now the existing-SKU case. I capture from the camera, but instead of generating, I pick a SKU that already exists."

**[DO]** Select the SKU from Journey 1. Save.

**[SAY]**
> "On save, the media is appended to that existing product — no duplicate product row is created. If I'd filled in metadata, it would update the non-empty fields rather than overwrite with blanks."

**[DO]** Open **Products** — confirm there is still only one card for that SKU, now with a higher media count.

**[SAY]**
> "Still one product for that SKU, with the media count incremented. SKU is the single source of truth."

---

## Journey 4 — Browse & sync (≈30s)

**[DO]** Show **Products** grid, then **Media** grid. Demonstrate the filters/sort and a tap from Media into Product Detail.

**[SAY]**
> "Products and Media stay in sync after every save. Products supports search, type filter, and sort; Media supports search, type and date filters, and sort. Tapping any media item opens the Product Detail for its SKU — so the navigation always closes the loop back to the product."

**[DO]** Briefly show an empty state if available (or mention it).

**[SAY]**
> "Empty states are handled — no products yet and no media yet both show intentional placeholders rather than a blank screen."

---

## Closing (≈15s)

**[SAY]**
> "That's the full required scope: capture → required SKU → Products and Media libraries → Product Detail, all local-first. I also shipped small bonuses — photo-library import, barcode/QR SKU fill, search/filter/sort, and grid-density controls. Thanks for watching."

---

# Written sections for the README / submission

## AI tooling — what I used and one correction

**What I used:** I drove this build with Claude Code as the primary agent for scaffolding the Expo Router shell, the SQLite repositories, and the SKU normalization logic, plus the iOS/Android build and validation loops.

**One example where I corrected/rejected AI output:**
> _(Fill in with your real example — the strongest candidates from this codebase:)_
> - The AI initially generated SKUs using a **row count** for the sequence suffix. I rejected this: with seeded or imported SKUs, the count can lag the highest existing suffix and produce **collisions**. I changed it to derive the next sequence from the **maximum existing suffix** instead. (See the "Generated SKU sequencing uses max existing suffix rather than row count" line in `CHECKLIST.md`.)
> - Alternatively: the AI proposed an existing-SKU save that overwrote product metadata with whatever was in the form — including blanks. I corrected it to **only update non-empty fields** so an append from the camera doesn't wipe an existing title/description.

Pick whichever you actually want to narrate; both are real, defensible engineering corrections.

## Known gaps & what I'd tackle next

- **Real-device live camera is unverified.** Simulator validation uses the photo-library fallback because the iOS Simulator exposes no rear camera. Next: capture VisionCamera proof on a physical device.
- **Android emulator UI validation was intermittently blocked** by the AVD/adb dropping before install. Next: stabilize the emulator (headless wiped-state boot) or validate on a physical Android device.
- **Test coverage is partial.** Tests run on the Node test runner and cover the SKU flow, the Product Detail redesign, and app-wide regression guards; dedicated repository-level unit tests are still deferred. Next: add focused repository tests around upsert/append.
- **AI product description (bonus) is backlog**, intentionally — save never depends on AI.
- Next-sprint polish: user-selectable cover image, large-catalog performance profiling on iOS, and optional AI-generated draft descriptions.
