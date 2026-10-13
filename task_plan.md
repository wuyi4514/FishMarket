# FishMarket implementation and deployment plan

## Authorized goal

Implement one Human and multiple persistent Gemini agents collaborating in a group. Follow the Outcome Ownership V3 design while writing independent code and using official SDKs. Deploy FishMarket and prove the real Gemini / Firestore chain. PPT, video and final competition submission are deferred by the user.

## Current phase

Cloud release verification. The independent implementation is committed and pushed; the final runtime release and live semantic Gate are pending.

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
- [x] Twenty offline Evals, TypeScript and production builds

## Phase 3: Deploy and verify

Status: in_progress

- [x] Deploy initial full-stack Cloud Run image with Firestore and Vertex AI
- [x] Verify live service health and basic model access
- [ ] Complete real multi-agent outcome through independent review
- [ ] Independently read the stored Firestore document
- [ ] Prove idempotent replay, private room access and targeted reply-only behavior
- [ ] Validate a second live business scenario, browser interaction and reload durability
- [ ] Verify deployed source SHA, revision, service account, logs and CI

## Phase 4: Handoff

Status: pending

- [ ] Save release evidence and per-file changes
- [ ] Push final documentation and verify public repository accessibility
- [ ] Open the verified deployed app for user acceptance

## Deferred scope

PPT, video and final competition submission are out of this turn. Owner transfer, external business effects, scheduled waits, staffing, plugins, private long-term memory and simultaneous executions in one room are deferred. This prototype does not claim the complete NeoOrg V3 platform or measured superiority over it.

## Guardrails

- Independent code, prompts, schemas, tests and assets; architecture ideas and mature SDKs are reused.
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

## Evidence

Implementation: source commit e7717e1 (full hash available from Git).
Local Gate: 20 tests + typecheck + web/server build passed.
Cloud project: fishmarket-abc-2026-4514.
Public entry: https://fishmarket-893821979623.asia-northeast1.run.app
Final release evidence belongs in docs/release.md.
