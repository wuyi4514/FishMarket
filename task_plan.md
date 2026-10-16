# FishMarket implementation and deployment plan

## Authorized goal

Implement one Human and multiple persistent Gemini agents collaborating in a group. Follow the Outcome Ownership V3 design while writing independent code and using official SDKs. Deploy FishMarket and prove the real Gemini / Firestore chain. PPT, video and final competition submission are deferred by the user.

## Current phase

2026-10-16: Apply the user's annotated interaction corrections, rename the visible product to NeoOrg, and support real selected membership. Keep the FishMarket repository/cloud resource identities, saved browser capabilities, old rooms and history intact.

## Phase 8: NeoOrg branding and selected group membership

Status: implementing

- [x] Inspect command, model serialization, contributor/reviewer assignment, persistence and UI boundaries.
- [x] Add failing Evals for selected membership, no outsider execution, reviewer capacity, @-only routing and annotated UI.
- [x] Implement create-room-v2 with 2–4 selected Agents and explicit v1 compatibility; freeze the same selected profiles in Firestore and Provider context.
- [x] Remove hidden recipient state, the profile Message action and duplicate create entry; use the existing NeoOrg logo and product title.
- [ ] Pass offline Gate, desktop/mobile interaction checks and current-production-composition Gemini/Firestore checks.
- [ ] Commit/push an independent branch without a PR, deploy exact source and verify release/assets and history preservation.

### Architecture decision and rollback

Keep the room-v1 aggregate/run-v1 checkpoint, capability authentication, owner assignment, independent review and existing transactional/no-replay recovery. Add a strict create-room-v2 input with unique 2–4 Agent IDs; v1 deliberately retains all four original members. The server, not the UI or model, owns the frozen membership and delegation capacity. New model-context-v3 exposes only selected job identities, local member refs and a bounded delegation policy; IDs, tokens, versions and execution metadata remain engineering-only. Dynamic output schemas and domain checks both reserve one non-author reviewer before any contributor publication. Two-Agent groups perform owner delivery plus independent review; three-Agent groups can request one contributor.

The composer derives its single structured target from current body text: exactly one distinct valid room-member mention targets that member; zero or several means general group admission. Removing a mention removes its routing effect. No sticky invisible recipient or multi-dispatch is introduced. Existing goal continuation still preserves its recorded owner.

Rollback: redeploy the previous image and retain data; selected groups remain room-v1 records understood by the prior read side, but the previous engine cannot reliably delegate in small groups, so prefer a forward fix. Never resume/replay historical work during deployment. Release requires selected-membership negative cases, actual Gemini wire projection, checkpoint resume, repository commit and visible membership; HTTP 200 alone is insufficient.

## Phase 7: NeoOrg-aligned group chat and technical explanation

Status: complete_deployed_pending_user_acceptance

- [x] Locate the clean FishMarket checkout and create codex/neoorg-chat-alignment.
- [x] Inspect NeoOrg group layout, message/composer behavior and V3 architectural reference.
- [x] Freeze UI projection boundaries and add failing interaction/render Evals before implementation.
- [x] Align compact group header, neutral blue chat surfaces, human/agent message layout, profile side sheet, mention selection, sending/copy and non-disruptive latest-message navigation.
- [x] Retain recommended questions, named fresh rooms, per-room drafts/recipients and profile facts; add no pretend tools, announcements or file actions.
- [x] Expand English technical explanation with implemented V3 mapping, exact production boundaries, data/security/recovery, limits and evaluator guidance.
- [x] Run offline Gate and real desktop/mobile interaction checks; commit reversible source without a PR.
- [x] Verify deployment baseline, preserve Firestore and secrets, deploy the tested commit and verify exact source/assets; user acceptance remains separate.

### Architecture / release decision

Keep: current admission/owner/contributor/review contracts, persisted RoomView, single-image Cloud Run composition, Firestore transactions, capabilities and recovery. Stop: unconditional scrolling on every message/scope update, left-aligned human messages and recipient selection hidden behind only a select. UI affordances must not create permissions or infer outcome facts from text. New mention interactions select the existing single structured target; they do not introduce multi-target dispatch. No backend schema/migration, model prompt or checkpoint format change is planned. Rollback is redeployment of the previous image/source; no business-history replay.

## Phase 1: Architecture and cloud foundation

Status: complete

- [x] Read the entire NeoOrg V3 design as the architectural reference
- [x] Freeze the implemented subset and the layer/ownership/recovery matrix
- [x] Create independent public repo and dedicated Google Cloud project
- [x] Link billing, enable APIs, create Firestore and scoped runtime service account
- [x] Install and pin dependencies, configure offline development and CI

## Phase 2: Group implementation

Status: complete_offline

- [x] Human timeline and four persistent Agent identities
- [x] Strict admission, owner, contribution and review schemas
- [x] One owner; on-demand contributions; immutable delivery; independent review
- [x] Human input gate and immutable goal revisions
- [x] Atomic Firestore message/state checkpoints and request idempotency
- [x] Fenced execution and explicit checkpoint recovery
- [x] Version envelopes owned by engineering and supported Vertex schema projection
- [x] Twenty-three offline Evals, TypeScript and production builds

## Phase 3: Deploy and verify

Status: complete

- [x] Deploy initial full-stack Cloud Run image with Firestore and Vertex AI
- [x] Verify live service health and basic model access
- [x] Complete real multi-agent outcome through independent review
- [x] Independently read the stored Firestore document
- [x] Prove idempotent replay, private room access and targeted reply-only behavior
- [x] Validate a second live business scenario, browser interaction and reload durability
- [x] Verify deployed source SHA, revision, service account, logs and CI

## Phase 4: Handoff

Status: complete

- [x] Save release evidence and per-file changes
- [x] Push implementation and verify public repository accessibility; final evidence documents are being committed
- [x] Open the verified deployed app for user acceptance

## Deferred scope

PPT, video and final competition submission are out of this turn. Owner transfer, external business effects, scheduled waits, staffing, plugins, private long-term memory and simultaneous executions in one room are deferred. This prototype does not claim the complete NeoOrg V3 platform or measured superiority over it.

## Phase 5: Room navigation and Agent identities

Status: complete

- [x] Freeze room/session and profile boundaries, then add failing Evals
- [x] Named new-room creation, saved browser workspace, switching, reload and legacy migration
- [x] Accessible profile dialogs from sidebar, header and conversation; explicit message action
- [x] Versioned room-bound job profiles consumed by the production Gemini builder
- [x] Offline Gate and desktop/mobile browser interaction including failure and race checks
- [x] Commit, push development branch (no PR), deploy and verify exact running version
- [x] Real Gemini / Firestore identity and room-isolation verification; release evidence and handoff

### Iteration boundary decision

The existing create-room command and capability-protected API remain authoritative. A versioned browser-local workspace remembers room capabilities; it is not an account-wide room directory. Old access is preserved on creation and transient fetch failure. Navigation does not replay work, and in-flight responses cannot overwrite another selected room. New room creation is single-flight and exposes a pending/error state.

New rooms freeze versioned Agent profiles in their aggregate. Legacy room-v1 aggregates without profiles resolve to the fixed original profile-v1 catalog without rewriting business history. Both public UI projection and model context resolve the same profile snapshot. Model-visible job responsibilities and boundaries are business facts; profile versions, room tokens, aggregate IDs and execution metadata remain engineering-only. A job profile grants no tools or real-world authority. Existing owner/contributor/reviewer state and all outcome rules remain unchanged.

## Guardrails

### Phase 6: Annotated UI copy cleanup

**Status:** complete

- [x] Add failing render assertions for the eight annotated blocks, preserving working controls
- [x] Remove annotated header/welcome/sidebar/composer copy and live badge
- [x] Remove welcome fish and duplicate welcome member row, retain the three recommended questions per user's correction
- [x] Verify offline Gate and desktop/mobile layout, profile and new-room interactions
- [x] Commit/push a development branch, deploy and verify source/revision/assets (no PR)
- [x] Record actual release evidence and screenshot; preserve rooms, credentials and workflow history

This is a presentation-only change. No Agent context, profile, model, Firestore, workflow, permission, budget or recovery contract is changed. Keep the main welcome headline, existing safety footnote, room navigation, member identity details and send shortcut.

User's latest correction explicitly keeps the three recommended question cards. The additional removals are only the decorative welcome fish and duplicate welcome member row; the left brand fish and sidebar/header Agent profile entry points stay.

## Existing guardrails

- Preserve honest provenance. The original prototype was separately implemented; the user now authorizes NeoOrg-based reuse/alignment under the latest event clarification. Never rewrite history or copy credentials/private business data.
- Exactly one persistent owner per outcome. Contributions never close the parent outcome.
- Protocol identity, versions, order, lease, transaction, retry and terminal facts are engineering-owned.
- Strict minimal model projection; no room capability, dynamic platform IDs or audit metadata enter the provider.
- Persisted terminal state distinguishes deliverable quality from real-world business execution.
- Unknown/failing model output produces durable recovery, not successful completion.
- Runtime publication must match its frozen version and execution fence.
- Cloud Run stays in its request while executing; it does not rely on detached background promises.
- Public visitors need no login and receive isolated capability-protected rooms.

## Errors and resolution

| Error | Resolution |
|---|---|
| Initial patch deleted/added the same path | Replaced obsolete architecture document with separately named group-collaboration document |
| Dependency mirror timeout warnings | Installed from official npm registry and removed unneeded Firebase CLI |
| Fastify error was unknown; duplicate member ID field | Added type guard and removed redundant property |
| Test expected response-field name in context | Asserted actual frozen criterion reference |
| Live admission generated wrong version | Removed version from wire schema; adapter builds authoritative envelope |
| Cross-scope test generic ambiguity | Explicit union of production scope outputs |
| Live owner generated wrong action discriminator | Normalized unsupported Zod const to Vertex-supported enum; kept strict output validation |
| New Git repo lacked author identity | Configured only this repo with authenticated user's GitHub noreply identity |
| Owner attempted repeated delegation after contributions committed | Restricted the current provider input/output action schema from persisted facts; retained domain guards and added a production-boundary negative Eval |
| Restricted wire schema returned an unknown static type | Declared the object payload output type without weakening runtime schema validation |
| Live review assessed refs outside the frozen criteria set | Compiled its exact criterion enum and assessment count from the current goal for both provider input and output validation |
| Audit found idempotent no-op updates could bump the version of an in-flight run | Added explicit no-op transaction results and a concurrent duplicate Eval |
| Context audit found human/contribution tails could be truncated | Preserved complete accepted human input and formal contributions inside the bounded projection; added a trailing-constraint serialization Eval |
| New iteration baseline lacked workspace module and room profiles | First observed failing new Evals, then implemented the shared contracts and browser navigator; all 33 tests now pass |
| Browser terminal-label wait timed out before polling displayed the result | Inspected the current accessibility tree; it showed all six persisted messages and the reviewed achieved result. No product change or replay was needed |
| Initial production browser reload observed an empty shell before async retrieval | Verified the completed server GET and the later UI; original six bodies were identical. Proceeded only after the saved room was visibly available |
| Annotated-copy render test failed on the unchanged baseline | Removed only the eight requested blocks and kept the control/safety assertions |
| Additional welcome-area test failed on the unchanged duplicate row | Kept recommended questions as corrected by the user, removed only the welcome fish/duplicate row |
| New chat Eval could not import the not-yet-implemented production module | Expected pre-implementation red; implemented shared interactions and verified the complete Gate |
| Latest jsdom requires a newer Node patch than local/runtime policy | Checked official package metadata and pinned test-only jsdom 26.1.0, compatible with Node 22 and current Node 24; no runtime upgrade |
| Test dependency download was slow with transient registry resets | Kept source unchanged during download; used prefer-offline for the compatible pinned test version |

## Evidence

Runtime implementation: source commit 138ee5eeaf3dbb87467be70ce43c2fa95b278cfb (prior cleanup source 55a14fa, feature source 8816155).
Local Gate: 52 tests + typecheck + web/server build passed.
Cloud project: fishmarket-abc-2026-4514.
Public entry: https://fishmarket-893821979623.asia-northeast1.run.app
Final release evidence is in docs/release.md and docs/rooms-agent-profiles-release.md.
