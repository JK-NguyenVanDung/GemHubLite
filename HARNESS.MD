# GemHub Lite AI Harness

## Purpose

This harness keeps GemHub Lite implementation evidence-based, cross-platform, and focused on the product requirements. It should guide AI agents and human review through product, platform, implementation, QA, and security work without drifting into bonus scope too early.

## Operating Rules

- Read `PRP.MD`, `DESIGN.md`, `CHECKLIST.md`, `FEATURES.md`, and `PROGRESS.md` before implementation work.
- Use `CONTEXT.md` for domain terminology and update it when terms are resolved.
- Keep product, platform, and delivery layers active for every slice.
- Do not claim completion without static, platform, or explicit blocker evidence.
- Do not add Home, auth, hardware, cloud sync, editor tools, or bonus features before required flows pass.
- Keep file changes scoped to the active slice.
- Keep screenshots and validation notes attached to the relevant feature task.

## Roles

### Orchestrator

Owns sequencing, scope control, and integration.

Responsibilities:

- Convert PRP into implementation slices.
- Assign independent review or implementation work when parallel agents are explicitly allowed.
- Prevent conflicting edits.
- Integrate reports and reject fake completion.
- Keep `PROGRESS.md`, `CHECKLIST.md`, and `FEATURES.md` current.

Report format:

```md
## Orchestrator Update
- Current slice:
- Completed:
- Blockers:
- Evidence:
- Next slice:
```

### Product Owner

Owns requirement fit and merchant usability.

Responsibilities:

- Compare each feature against the product brief.
- Confirm Camera -> SKU -> Products/Media -> Detail remains obvious.
- Flag scope drift and missing empty/error states.
- Review README honesty and demo narrative.

Report format:

```md
## Product Review
- Required flows covered:
- Missing flows:
- Scope drift:
- UX risks:
- README/demo risks:
- Required fixes:
```

### Platform

Owns iOS/Android behavior.

Responsibilities:

- Verify Expo native setup.
- Verify VisionCamera setup and permissions.
- Check safe areas, keyboard behavior, image URI loading, and app restart persistence.
- Run or document iOS and Android build attempts.
- Use `agent-device` or `argent-simulator-interact` for simulator validation when available.

Report format:

```md
## Platform Review
- iOS status:
- Android status:
- Native config risks:
- Simulator/device limits:
- Screenshot evidence:
- Required fixes:
```

### Implementation

Owns one scoped code slice at a time.

Responsibilities:

- Implement only assigned behavior.
- Preserve architecture boundaries.
- Add or update tests for domain/storage logic.
- Avoid unrelated refactors and dead files.
- Report exact commands run.

Report format:

```md
## Implementation Report
- Slice:
- Files changed:
- Behavior added:
- Tests run:
- Risks/blockers:
```

### QA / Grill-With-Docs

Owns adversarial verification against docs.

Responsibilities:

- Compare implementation with `PRP.MD`, `DESIGN.md`, and product brief.
- Challenge missing required journeys.
- Challenge README claims that lack evidence.
- Confirm screenshots/walkthrough match implemented behavior.

Report format:

```md
## Grill-With-Docs Review
- Requirement mismatches:
- Missing acceptance evidence:
- Platform gaps:
- README inaccuracies:
- Must-fix before submit:
```

### Security / Correctness

Owns data integrity and privacy.

Responsibilities:

- Check no hard-coded secrets.
- Check minimum permissions.
- Check no save without SKU.
- Check no duplicate product rows for normalized SKU.
- Check no orphan media.
- Check optional AI/backend claims are documented as out-of-scope backlog unless implemented.

Report format:

```md
## Security Correctness Review
- Secrets/privacy:
- Permissions:
- Persistence integrity:
- AI/backend claims:
- Required fixes:
```

## Execution Phases

### Phase 0: Research And Design Lock

- Capture real-app observations in `docs/research/GemHubApp.md`.
- Store screenshots in `docs/research/screenshots/`.
- Finalize `DESIGN.md` after research.
- Update checklist and features if research changes safe Lite adaptations.

### Phase 1: Scaffold And Foundation

- Create Expo TypeScript app.
- Add Expo Router.
- Add theme and reusable UI primitives.
- Add lint/type/test scripts.

### Phase 2: Domain And Persistence

- Implement SKU normalization/generation.
- Implement product/media model.
- Implement SQLite schema/repository.
- Add tests for duplicate SKU and no orphan media.

### Phase 3: Browse And Detail UI

- Implement Products.
- Implement Media.
- Implement Product Detail edits.
- Validate empty states and responsive layout.

### Phase 4: Camera And Save Flow

- Install/configure VisionCamera.
- Add camera permissions.
- Implement still capture.
- Implement preview/save SKU gate.
- Wire Product Detail Add Photo.

### Phase 5: Evidence And Submission

- Run static gates.
- Run iOS/Android gates or document blockers.
- Capture simulator/device screenshots.
- Write README and demo walkthrough.
- Run final grill-with-docs review.

## Slice Handoff Template

```md
## Task
- Slice:
- Owner:
- Files/modules owned:
- Inputs/docs:
- Required behavior:
- Out of scope:
- Validation commands:
- Screenshot/manual proof:
- Report format:
```

## Device Validation Workflow

After each UI slice:

1. Start the app with the appropriate Expo command.
2. Use `agent-device` or `argent-simulator-interact` to inspect visible UI.
3. Capture screenshot into `docs/research/screenshots/` or later `docs/evidence/screenshots/`.
4. Update `PROGRESS.md` with command, result, and screenshot path.
5. Update `CHECKLIST.md` if an acceptance item is proven.

Preferred simulator inspection:

- Use accessibility/snapshot discovery before tapping.
- Prefer element refs or accessibility labels over raw coordinates.
- Re-snapshot after each meaningful navigation.
- Record exact blocker if simulator, camera, or permission behavior cannot be validated.

## Required Gates

| Gate | Command/Action | Required Evidence |
| --- | --- | --- |
| TypeScript | `npm run typecheck` | Passing output or exact blocker |
| Lint | `npm run lint` | Passing output or exact blocker |
| Tests | `npm test` | Passing output or exact blocker |
| iOS | `npx expo run:ios` | Build/run result + screenshot |
| Android | `npx expo run:android` | Build/run result + screenshot |
| Manual | Acceptance checklist | Written result + screenshots |
| Security | Repo scan | No secrets + permission notes |
| README | Truth check | Claims match evidence |

## Stop Conditions

- SKU can be bypassed.
- Existing SKU creates duplicate product row.
- Media can exist without product.
- README claims iOS/Android support without evidence or blocker note.
- Camera dependency blocks all app progress; isolate and continue non-camera required surfaces with documented blocker.
- Bonus scope starts before required flows pass.
