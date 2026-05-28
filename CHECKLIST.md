# GemHub Lite Checklist

## Planning Artifacts

- [x] `PRP.MD` created.
- [x] `HARNESS.MD` created.
- [x] `DESIGN.md` created.
- [x] `docs/research/REAL_APP_INSPECTION_CHECKLIST.md` created.
- [ ] `docs/research/GemHubApp.md` completed after real-app analysis.
- [x] Screenshots captured in `docs/research/screenshots/`.
- [x] Final implementation plan created after research.

## Real App Inspection

- [x] Entry/navigation captured.
- [ ] Media area captured and summarized.
- [x] Products empty state captured and summarized.
- [ ] Product Detail captured and summarized.
- [x] Camera area captured or blocker documented.
- [x] SKU save flow captured or blocker documented.
- [x] New SKU creation captured.
- [x] Product type hierarchy captured.
- [ ] Existing SKU append behavior captured.
- [x] Safe Lite adaptations identified.
- [x] Proprietary/non-core surfaces explicitly excluded.

## Required Product Journeys

- [ ] New product from camera: capture -> SKU -> save -> Products + Media updated.
- [x] Add media to existing product from Product Detail.
- [x] Existing SKU from Camera appends media without duplicate product.
- [x] Products list shows SKU, title/placeholder, thumbnail, media count; populated cards implemented, manual visual verification pending.
- [x] Media gallery shows thumbnail and SKU/product context.
- [x] Media tap opens Product Detail for linked SKU.
- [x] Product Detail edits title, description, and type.
- [x] Product Detail shows all images for product.
- [x] SKU is always required before save.

## Platform Validation

- [ ] Real-device hosted test page cross-checked with `agent-device` snapshots before UI validation is called complete.
- [ ] iOS app builds/runs or exact blocker documented: static gates pass; native build not run in this camera/detail slice.
- [ ] Android app builds/runs or exact blocker documented: static gates pass; native build not run in this camera/detail slice.
- [ ] iOS camera permission verified.
- [ ] Android camera permission verified.
- [ ] Camera capture verified or device/simulator limitation documented.
- [ ] Safe areas verified on small and large phone sizes.
- [ ] Keyboard/form behavior verified.
- [ ] Image URIs load after app restart.

## Quality Gates

- [x] `npm run typecheck` passes or exact blocker documented: passed after camera route fix on 2026-05-28.
- [x] `npm run lint` passes or exact blocker documented: passed after camera route fix on 2026-05-28.
- [ ] `npm test` passes or exact blocker documented: Jest intentionally deferred until domain/storage test slice.
- [ ] No hard-coded secrets.
- [x] No orphan media possible.
- [x] No duplicate product for normalized SKU.
- [ ] README install/run instructions verified.
- [ ] Demo evidence prepared.

## Scope Guardrails

- [ ] No Home/dashboard built before core flows.
- [ ] No auth/org/cloud sync built before core flows.
- [ ] No hardware controls built before core flows.
- [ ] No editor/filter/background-removal pipeline built before core flows.
- [ ] Bonus features deferred until required scope passes.
