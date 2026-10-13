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
| tests/collaboration.test.ts | Twenty offline Evals across contracts, domain transitions, persistence, recovery, actual SDK boundaries and HTTP composition |
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

Removed uncommitted launch-report scaffold: src/contracts/mission.ts; src/server/ports.ts, store.ts, gemini.ts, orchestrator.ts, app.ts; tests/contracts.test.ts and orchestrator.test.ts; docs/architecture.md; firebase.json and firestore.indexes.json. They were replaced by the independent group implementation and the single-service Cloud Run deployment. No NeoOrg files, data or running services were changed.
