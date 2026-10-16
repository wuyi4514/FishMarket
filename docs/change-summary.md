# Implementation changes by file

| File | Completed change |
|---|---|
| src/contracts/group.ts | Stable team identities; strict versioned semantic contracts; room, outcome, delivery, review and checkpoint types; invariants and public projection |
| src/server/collaboration.ts | Transactional admission, single ownership, bounded contribution requests, immutable delivery, independent review, human gates, idempotency, fencing and recovery |
| src/server/model.ts | Scope-specific allowlisted context; official Gemini SDK; compatible JSON Schema projection; engineering-owned output envelope; strict response validation |
| src/server/room-store.ts | Memory/Firestore repository ports; atomic aggregate updates; authoritative daily call budget and store probe |
| src/server/fixture-model.ts | Clearly labelled deterministic development model; excluded by production composition guard |
| src/server/http.ts | Room API, capability checks, validation/error responses, health/config and static frontend serving |
| src/server/index.ts | Starts the new full-stack composition |
| src/web/App.tsx | Human/Agent group timeline, targeting, owner/contributor/reviewer labels, outcome details, gates, polling, persisted room session and resume controls |
| src/web/styles.css | Original paper-and-sage visual design; desktop/mobile layouts; reduced-motion support |
| src/web/main.tsx | React entry with bundled Archivo and Newsreader fonts |
| tests/collaboration.test.ts | Twenty-three offline Evals across contracts, domain transitions, persistence, recovery, actual SDK boundaries, concurrent idempotency, full business inputs and HTTP composition |
| scripts/production-smoke.ts | Live public API workflow, independent Firestore infrastructure read, request replay, access denial and reply-only verification |
| package.json | Pinned SDK/runtime/build dependencies and dev, verify, build and live smoke scripts |
| pnpm-lock.yaml | Reproducible dependency lock |
| Dockerfile | Multi-stage production image containing both built frontend and server, non-root runtime |
| .dockerignore | Keeps local dependencies, credentials, histories and private material out of the container context |
| .gcloudignore | Keeps generated/local/private files and operational planning logs out of the source upload |
| .gitignore | Keeps secrets, generated builds, local state and private submission material out of Git |
| .env.example | Non-secret Cloud Run/Firestore/Gemini configuration example |
| .github/workflows/verify.yml | CI Gate on main and codex branches |
| index.html | FishMarket metadata, responsive viewport and app entry |
| vite.config.ts | Web build and local API proxy |
| tsconfig.json | Strict frontend/shared/test type checking |
| tsconfig.server.json | Strict NodeNext production server build |
| README.md | Product scope, local fixture distinction, production setup and deferred capabilities |
| docs/group-collaboration.md | V3-inspired architecture decision, ownership boundaries, model visibility, recovery and implemented/deferred scope |
| docs/release.md | Deployment configuration and actual validation evidence |
| task_plan.md | Current implementation/deployment plan and error resolutions |
| findings.md | Architecture reference, live tooling facts and provider-boundary findings |
| progress.md | Implementation and verification milestones |
| docs/change-summary.md | This per-file change record |
| docs/screenshots/live-collaboration.png | Actual deployed Chinese collaboration and independent-review screenshot |

Removed uncommitted launch-report scaffold: src/contracts/mission.ts; src/server/ports.ts, store.ts, gemini.ts, orchestrator.ts, app.ts; tests/contracts.test.ts and orchestrator.test.ts; docs/architecture.md; firebase.json and firestore.indexes.json. They were replaced by the independent group implementation and the single-service Cloud Run deployment. No NeoOrg files, data or running services were changed.

## Named rooms and Agent job profiles iteration

| File | Actual changes |
|---|---|
| src/contracts/group.ts | Strict job/profile-v1 schemas, four responsibility/boundary profiles, shared room-bound resolver and legacy projection compatibility |
| src/server/collaboration.ts | New rooms freeze the Agent profile snapshot alongside existing members |
| src/server/model.ts | Model context-v2 reads the frozen jobs; Gemini receives semantic duties/boundaries but no profile versions or room credentials |
| src/web/workspace.ts | Versioned browser directory, legacy migration, room access retention, single-flight creation, fenced selections and monotonic UI projections |
| src/web/App.tsx | Named room navigation, old in-tab drafts/recipients, clickable profiles across member/Avatar surfaces and mobile controls |
| src/web/RoomDialogs.tsx | Native accessible new-room/profile dialogs, pending/errors, initial focus and explicit message action |
| src/web/room-features.css | Room history and editorial dialogs with mobile layouts and visible focus states |
| src/web/main.tsx | Imports the feature stylesheet after the original visual system |
| tests/workspace.test.ts | Creation, isolation, reload, migration, duplicate clicks, failures, selection/poll races and storage preservation Evals |
| tests/agent-profiles.test.ts | Frozen profiles, strict contract negatives, production serialization/UI identity equality, HTTP capability isolation, legacy resume and shared daily cap Evals |
| scripts/production-smoke.ts | Real model job introduction, independent Firestore profile equality, clean room state, isolation and unchanged old messages |
| README.md | New capabilities and honest browser-local/draft/access limits |
| docs/group-collaboration.md | Room/session/profile facts, ownership and additive compatibility boundaries |
| task_plan.md | Iteration scope, release checklist and encountered errors |
| findings.md | Current source/UI evidence and deployment compatibility observations |
| progress.md | Actual implementation and validation milestones |
| docs/change-summary.md | This iteration's per-file record |
| docs/release.md | Updated the running source/revision and retained the prior release evidence as historical baseline |
| docs/rooms-agent-profiles-release.md | Latest source/image/CI, actual offline/live gates, compatibility and rollback boundaries |
| docs/screenshots/rooms-agent-profile.png | Real deployed desktop Agent position/responsibility/boundary screenshot |
| docs/screenshots/fresh-room-dialog.png | Real deployed mobile named-room creation prompt screenshot |

Cloud revision fishmarket-00007-czj is deployed; actual browser reload/switch proof and screenshots are recorded in the iteration release document. User acceptance is still pending.

## Annotated copy cleanup

| File | Actual changes |
|---|---|
| src/web/App.tsx | Removed eight auxiliary text/badge blocks plus welcome fish/duplicate member row; kept all three recommended questions, room/profile controls, main headline, shortcut and safety footnote |
| src/web/room-features.css | Footer alignment, shortcut spacing and mobile header sizing after copy removal |
| tests/ui-copy.test.ts | Production-App negatives and retained controls/content, explicit three-question retention and no duplicate welcome profiles |
| task_plan.md | Scoped cleanup checklist and baseline failure record |
| findings.md | Annotated targets and actual desktop/mobile observations |
| progress.md | Implementation and validation milestones |
| docs/change-summary.md | This cleanup's per-file record |
| docs/release.md | Final source/revision/image/CI, exact asset verification and retained recommendation/profile/room evidence |
| docs/screenshots/ui-copy-cleanup.png | Actual final cloud desktop screenshot with recommended questions retained |

No server, contracts, model, workspace persistence or profile dialog behavior changed. Final cloud revision fishmarket-00009-5zq is deployed and verified on source 55a14fa.

## NeoOrg-aligned group chat — 2026-10-16

| File | Actual change |
|---|---|
| src/web/App.tsx | Compact group header/member directory, integration of the production composer/message rows, scroll navigation; preserves room/workflow state |
| src/web/ChatPrimitives.tsx | Shared FishMarket SVG controls and stable member avatars |
| src/web/ChatComposer.tsx | Room-profile @ choices, existing structured recipient selection, keyboard navigation, IME-safe Enter, Shift+Enter and growing draft field |
| src/web/chat-interactions.ts | Deterministic mention parsing/insertion/filtering, keyboard and near-latest policies |
| src/web/MessageRow.tsx | Human/Agent message layout, job versus persisted execution role, exact body copy and visible clipboard failure |
| src/web/useTimeline.ts | Follow only near the end, count new messages without moving a reader, explicit latest navigation and room reset |
| src/web/RoomDialogs.tsx | Real member directory; preserves accessible native profile/new-room dialog behavior |
| src/web/chat-alignment.css | NeoOrg-inspired compact blue/gray conversation and modal profile side sheet; desktop/mobile and focus states |
| src/web/main.tsx | Loads the scoped chat iteration stylesheet after existing styles |
| tests/chat-interactions.test.ts | Seven production-policy/render Evals, including no status inferred from prose or raw HTML injection |
| tests/chat-components.test.tsx | Five actual React event/hook/clipboard Evals, including IME and incoming-message history-reading behavior |
| tests/ui-copy.test.ts | Preserves prior removed-copy/retained-question assertions and verifies new real controls without fake tools |
| package.json | Pins two test-only dependencies; production dependency versions unchanged |
| pnpm-lock.yaml | Reproducible test dependency graph |
| README.md | Current UI capabilities and honest NeoOrg design relationship; links technical explanation |
| docs/group-collaboration.md | Actual side-sheet/mention/scroll boundaries, corrected profile entry points and technical overview link |
| docs/technical-overview.md | English product/architecture explanation, V3 implementation mapping, provider/engineering boundary, limits, security, recovery and evaluator path |
| docs/neoorg-chat-alignment-release.md | This iteration's source/Gate/deployment/rollback evidence, with pending states explicit |
| docs/release.md | Current deployed source, image, revision, CI, actual live Gate and retained historical baseline |
| docs/screenshots/neoorg-chat-alignment.png | Actual deployed desktop conversation with real Gemini reply |
| docs/screenshots/neoorg-chat-profile.png | Actual deployed permanent role/responsibilities side sheet |
| docs/screenshots/neoorg-chat-mobile.png | Actual deployed 390px group conversation |
| task_plan.md | Scope, boundary decision, rollback and release checklist |
| findings.md | Source comparison, actual browser findings and dependency compatibility evidence |
| progress.md | Actual implementation and verification milestones |
| docs/change-summary.md | Per-file iteration record |

No server, shared contract, model prompt, Firestore schema or checkpoint format change. No NeoOrg production service/data was modified and no historical work was replayed.
