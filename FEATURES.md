# GemHub Lite Feature Tracker

## Research And Planning

- [x] PRP defines product goal, scope, data model, SKU rules, validation gates.
- [x] Harness defines roles, execution phases, gate evidence, stop conditions.
- [x] Design plan defines production-inspired UI direction and primitives.
- [ ] Real app analysis records product logic and safe design-system lessons.
- [x] Final execution plan converts docs into implementation slices.

## App Foundation

- [x] Expo TypeScript app scaffolded.
- [x] Expo Router installed and configured.
- [x] Route groups created for tabs and stack screens.
- [x] TypeScript path aliases configured.
- [x] Lint/type scripts configured; Jest deferred until test slice.

## Design System

- [x] Theme tokens created for color, spacing, and radius.
- [x] `Screen` primitive implemented.
- [x] `Card` primitive implemented.
- [x] `Button` primitive implemented.
- [x] `Field` primitive implemented.
- [x] `EmptyStateCard` primitive implemented.
- [x] `Text`, `Icon`, `Chip`, `Thumbnail`, `Picker`, and `ActionSheet` primitives implemented.
- [x] UI primitives expose accessibility labels/test IDs for primary controls.

## Persistence And Domain

- [x] Product and media types defined.
- [x] SKU normalization implemented.
- [x] Generated SKU sequence implemented.
- [x] SQLite schema created.
- [x] Product repository implemented.
- [x] Media repository implemented.
- [ ] Product upsert by SKU tested.
- [ ] Existing SKU append behavior tested.
- [ ] No orphan media behavior tested.

## Navigation

- [x] Camera tab created.
- [x] Media tab created.
- [x] Products tab created.
- [x] Capture Preview stack route created.
- [x] Product Detail stack route created.
- [x] Product Detail Add Photo route params support SKU context.

## Camera And Save Flow

- [x] VisionCamera installed.
- [x] iOS camera permission configured.
- [x] Android camera permission configured.
- [x] Camera permission states implemented.
- [x] Still capture implemented.
- [x] Preview screen receives captured media.
- [x] SKU field blocks empty save.
- [x] Generate SKU action implemented.
- [ ] Existing SKU selector implemented.
- [x] Save creates product or appends media.
- [x] Save navigates to Product Detail or returns to existing detail.

## Products

- [x] Empty state routes to Camera.
- [x] Product list/grid loads from repository.
- [x] Product card shows cover, SKU, title/placeholder, media count.
- [x] Product card opens Product Detail.
- [x] Product list updates after saves.

## Media

- [x] Empty state routes to Camera.
- [x] Media gallery loads from repository.
- [x] Media tile shows thumbnail and SKU context.
- [x] Media tile opens Product Detail.
- [x] Media gallery updates after saves.

## Product Detail

- [x] SKU header shown.
- [x] Title edit persists.
- [x] Description edit persists.
- [x] Product type edit persists.
- [x] Media grid shows all product images.
- [x] Add Photo opens Camera with SKU context.
- [x] New media appears after return.

## README And Demo

- [ ] README prerequisites documented.
- [ ] README iOS run steps documented.
- [ ] README Android run steps documented.
- [ ] README architecture overview documented.
- [ ] README scope cuts documented.
- [ ] README SKU rules documented.
- [ ] README AI tool usage documented.
- [ ] README known gaps documented.
- [ ] Screenshot walkthrough or screen recording prepared.
