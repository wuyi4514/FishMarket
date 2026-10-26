# Video UI → cloud alignment

## Goal / authorized scope
Restore the accepted film's product layout and exact avatars in the working cloud prototype. Preserve all existing rooms, credentials, outcomes, checkpoints and the real Vertex Gemini / Firestore chain. No film fixture data, false tool claims, competition submission or PR creation.

## Phases
1. Inspect production boundaries and reference UI — complete.
2. Add failing Evals; implement compatible five-position room catalog and native-looking shell — complete.
3. Verify offline contracts, actual browser interactions, desktop/mobile layout — complete (80 tests/typechecks/builds; desktop + 390px actual browser).
4. Commit, check active runs/history, deploy the exact source and verify cloud assets + live production composition — complete.
5. Document per-file changes, rollback and user acceptance entry — complete; user functional acceptance remains pending.

## Architecture decision
Retain the room-v1 aggregate, run-v1 checkpoints, owner/contributor/reviewer state machine, engineering-owned membership, exact capability authentication, budgets and idempotent commit/recovery. Existing v1/v2 create commands keep their four-position catalog. A strict create-room-v3 command selects 2–5 film-aligned profiles. Frozen profiles remain the only identity source for both Gemini and UI; old records are not rewritten. Add the fifth bounded member ref at the production Provider boundary, with a new context version for five-member projections. No new tools, external effects or fake file generation.

Input → owner/invariant → output → effect → failure: create-v3 validates exact catalog selection → Collaboration freezes profile snapshot → room-v1 stored atomically → Firestore create; invalid member inputs have no effect. Context builder exposes selected business identities only → Gemini adapter validates the exact current owner/delegation schema → normal persisted delivery/review → UI projection. Runtime IDs, secrets, receipts and checkpoint details remain model-hidden. UI tabs/search/filter derive only local room directory or persisted messages/outcomes; no text creates permission or completion facts.

Rollback: redeploy prior immutable image, preserving Firestore. Since prior software does not understand a fifth member, prefer forward repair; do not replay old work. Release gates include legacy records, five-member production serialization, targeted fifth member, independent review reservation, checkpoint recovery, actual UI and independent Firestore read.

## Errors encountered
- Initial discovery requested nonexistent `src/shared/types.ts`, `src/web/room-ui.tsx` and film `remotion.config.ts`; inspected the actual source tree instead. No files changed by those reads.

## 2026-10-19 follow-up: available controls and member-sheet dismissal
1. Add production-render and dialog-event regression tests — complete (red reproduced first).
2. Hide unsupported navigation and Skills/Tools placeholders; make member details close-button-only — complete.
3. Run focused/full offline Gate and actual desktop/mobile interactions — complete (83 tests, both typechecks/builds; desktop and 390px).
4. Snapshot existing records, commit, deploy and verify exact assets/history — complete (45b8a00, revision 00013; 30 records unchanged).
5. Record per-file changes and release evidence; no PR before acceptance — complete; user acceptance pending.

Boundary: UI-only change. Preserve all contracts, frozen identities, model context, storage and recovery. Existing real member/model controls, recommendations and creation remain available. Rollback uses the prior immutable image without database changes.

## 2026-10-19 follow-up 2: concise creation dialog and centered close icon
1. Add failing actual-component tests for annotated copy and vector icon — complete (red reproduced first).
2. Remove only annotated creation copy; center the shared close icon without changing dismissal or selection rules — complete.
3. Full offline Gate and actual desktop/mobile browser geometry/click checks — complete (85 tests, both typechecks/builds; center delta 0,0).
4. Snapshot rooms/active runs, commit/CI, deploy and verify exact assets/history — complete (78ef020, revision 00014; 30 rooms unchanged).
5. Record per-file release evidence and user acceptance entry; no PR — complete; user acceptance pending.

No server/contract/state changes. Keep required member count enforcement, draft preservation, original avatars and recommendations. Roll back to revision 00013 image if necessary, without data edits or replay.
