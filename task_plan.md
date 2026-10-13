# FishMarket delivery plan

## Goal

Implement and deploy FishMarket: one Human and several persistent Gemini agents collaborating in a durable group, based on Outcome Ownership V3 principles. Verify real Gemini and Firestore end to end. The official deck, demo video and submission are deferred at the user's request.

## Current phase

Phase 1: V3 group collaboration architecture and cloud foundation in progress.

## Submission sprint targets (Asia/Shanghai)

These are planning targets, not completed milestones. Exact dashboard closing time remains to be checked; aim to finish the submission on October 17.

| Date | Target | Evidence required |
|---|---|---|
| October 13 | Freeze the launch-readiness scope; install dependencies and verify the initial implementation | Offline Evals, typecheck and build results |
| October 14 | Run a complete public cloud mission | Real Gemini output and committed Firestore report through the deployed app |
| October 15 | Stabilize failures, report retrieval, browser usability and reproducible deployment | Negative tests and production smoke evidence |
| October 16 | Produce the official deck and demo video | Accurate English PDF under 5 MB and video under three minutes |
| October 17 | Verify URLs, prepare field preview and submit after final approval | Anonymous access checks and submission receipt |
| October 18 | Contingency buffer | No dependency on an unverified closing hour |

### Scope for this sprint

- One seeded launch-readiness scenario plus editable mission and supplied evidence.
- Three bounded Gemini roles producing evidence analysis, an action plan and an independent readiness decision.
- A persisted report with an honest failure state, public access and readable role contributions.
- Firebase Hosting, Cloud Run and Firestore deployment; public source and competition materials.
- Group chat is the primary interface. Admission selects reply-only or an outcome with exactly one owner; contributors are requested as needed, followed by immutable delivery and independent review.
- An agent marketplace, plugin infrastructure, long-term memory and complex multi-tenant authorization are deferred.

### Timing assessment

- Budget roughly two to three days for implementation and cloud verification, one day for materials, and one day for final checks and buffer.
- The first critical milestone is a real cloud workflow by October 14. Billing visibility is confirmed, while API/model quota and deployment permissions still need verification.
- Team formation must be checked separately because the official site now lists October 14 as its closing date.

## Phase 1: Architecture and foundation

- **Status:** in_progress
- [x] Create an independent public GitHub repository and local checkout
- [ ] Freeze the user journey, contracts, ownership, persistence, and failure semantics
- [ ] Verify Google Cloud and Firebase account, project, billing, CLI, and API access
- [ ] Create the monorepo, deterministic Evals, CI, and local development path

## Phase 2: Evals-first product implementation

- **Status:** pending
- [ ] Define strict versioned request and Gemini response contracts with negative tests
- [ ] Build the Mission workspace and the seeded product-launch scenario
- [ ] Build the Cloud Run API and sequential Gemini role workflow
- [ ] Persist Mission state and the final Launch Readiness Report in Firestore
- [ ] Implement explicit failed states, retry ownership, and no false completion

## Phase 3: Google Cloud deployment

- **Status:** pending
- [ ] Create or select a dedicated Google Cloud/Firebase project
- [ ] Enable billing and required APIs with minimal permissions
- [ ] Deploy API to Cloud Run, data to Firestore, and web to Firebase Hosting
- [ ] Verify public access, actual Gemini usage, durable report retrieval, logs, and restart recovery

## Phase 4: Release gate and public repository

- **Status:** pending
- [ ] Run unit, contract, build, container, and production smoke tests
- [ ] Validate accessibility and responsive behavior in a real browser
- [ ] Scan tracked files and history for secrets, private data, and copied NeoOrg content
- [ ] Push a clean release commit and record deployment revisions

## Phase 5: Competition materials

- **Status:** deferred_by_user
- [ ] Complete the official 16-slide English template and export a PDF under 5 MB
- [ ] Create accurate process, architecture, screenshots, benchmark, and cost slides
- [ ] Write and record a 2:45–2:55 English demo video
- [ ] Publish the video and verify every submission URL anonymously
- [ ] Draft the final solution brief within 1024 characters

## Phase 6: Submission

- **Status:** deferred_by_user
- [ ] Prepare a field-by-field preview in the authenticated dashboard
- [ ] Receive explicit user approval for the final version
- [ ] Submit and preserve the receipt

## Architecture guardrails

- This repository must not copy NeoOrg source code, prompts, schemas, tests, screenshots, brand assets, data, Git history, or deployed services.
- The model owns semantic analysis and recommendations. Engineering owns IDs, versions, authorization, status, retries, persistence, and terminal state.
- A completed workflow requires a committed report or an explicit durable failure. A model response alone is not completion.
- Gemini outputs cross a strict, versioned schema boundary. Unknown fields, invalid enums, and oversized content fail closed before persistence.
- Firestore is the authoritative project store. The browser never writes official workflow state directly.
- Public evaluator access must require no account, invitation, secret, or manual intervention.
- Every claim about Firebase, Firestore, Cloud Run, or Gemini must be backed by production code and deployed evidence.

## Errors encountered

| Error | Attempt | Resolution |
|---|---:|---|
| Initial architecture patch used delete/add on the same path | 1 | Replaced the obsolete architecture document with a separately named group-collaboration document |
| Typecheck rejected unknown Fastify error fields and a duplicated member ID property | 1 | Guarded the error type and removed the redundant property |
| Dependency mirror produced timeout warnings | 1 | Used the official npm registry for the scoped installation and removed unnecessary Firebase CLI dependencies |
| Serialization test expected a response-field name in the input context | 1 | Corrected the assertion to check the actual criterion reference in the production context |
| First deployed Gemini admission returned an invalid protocol version | 1 | Removed engineering-owned version from model wire schemas; adapter now constructs the fixed version envelope after strict semantic validation |
| Multi-scope boundary regression had ambiguous TypeScript generic inference | 1 | Explicitly used the union of current scope outputs in the test |
| Deployed owner reply had an invalid action discriminator | 1 | Official Vertex documentation says unsupported schema fields are ignored; normalized Zod string const to supported enum at the adapter boundary and froze reference enums |
| Initial commit failed because the new repository lacked Git author identity | 1 | Set repository-local identity to the authenticated GitHub user and its verified-account noreply address |
