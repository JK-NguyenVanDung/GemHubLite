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
- [x] Products list shows SKU, title/placeholder, thumbnail, media count, search, type filter, and sort; populated cards implemented, manual visual verification pending.
- [x] Media gallery shows thumbnail, SKU/product context, search, type filter, date filter, and sort.
- [x] Local media storage defined for image/video assets under app-owned `Documents/media/` directories.
- [x] Image imports/captures compressed before persistence while retaining high visual quality.
- [x] Video imports request platform H.264 1280x720 export when available and persist video metadata locally.
- [x] Media tap opens Product Detail for linked SKU.
- [x] Product Detail edits title, description, and type.
- [x] Product Detail shows all images for product.
- [x] SKU is always required before save.

## Platform Validation

- [ ] Real-device hosted test page cross-checked with `agent-device` snapshots before UI validation is called complete.
- [ ] iOS app builds/runs or exact blocker documented: simulator dev-client loaded through existing installed build + LAN Metro; fresh native build currently blocked by VisionCamera generated Nitro Swift files missing from `node_modules/react-native-vision-camera`.
- [ ] Android app builds/runs or exact blocker documented: static gates pass; native build not run in this camera/detail slice.
- [ ] iOS camera permission verified.
- [ ] Android camera permission verified.
- [ ] Camera capture verified or device/simulator limitation documented.
- [ ] Safe areas verified on small and large phone sizes.
- [ ] Keyboard/form behavior verified.
- [ ] Image URIs load after app restart.
- [x] Media rows persist kind, MIME type, dimensions, duration, original/stored bytes, and compression status.

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

- [x] Home and More tabs added only after screenshot parity request; they remain Lite-scoped and route back to core catalog flows.
- [ ] No auth/org/cloud sync built before core flows.
- [ ] No hardware controls built before core flows.
- [x] Product and Media filter capability added without editor/background-removal pipeline.
- [ ] Bonus features deferred until required scope passes.
