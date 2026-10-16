# NeoOrg — technical overview

## Product and architectural thesis

NeoOrg is a human-and-AI group workspace for turning a shared goal into a reviewed deliverable. Each new group selects 2–4 persistent teammates from a four-Agent catalog; the human is always included. An ordinary question can receive one reply; substantial work has exactly one accountable outcome owner, selective contributions and an independent review.

The architecture adopts NeoOrg V3's Outcome Ownership design and its conversation-native interaction patterns. The initial prototype was implemented separately as FishMarket; the current product now uses NeoOrg's name and original logo while retaining existing repository/cloud identifiers and business history. It remains a focused Google Cloud implementation, not the complete NeoOrg platform. The broader design is a reference, not evidence that every proposed capability exists here.

## What the evaluator can verify

1. Open the public app without creating an account. A new visitor receives an isolated room.
2. Select a recommended question to populate the composer without automatically sending it.
3. Ask a simple question, or use the `@` picker. A single distinct valid mention in the current draft determines its structured target; removing it restores general group routing. Several distinct mentions remain a group message, not a command to invoke everyone. Group membership is checked independently by the server.
4. Submit a substantial goal. Observe the owner, professional contributions, integrated delivery and review in the same timeline.
5. Expand the outcome strip to inspect its goal, acceptance criteria, contributions and result. A reviewed partial result is not labelled goal achieved.
6. Open a teammate's profile from the sidebar, header or a message. The profile shows their persistent job, responsibilities and capability boundaries, separately from their current outcome role.
7. Use the group-list plus button to name a new room and select its teammates. Verify its member list and @ choices contain only that selection. Switch back and reload: previous messages remain. Access is browser-local, not an account directory.
8. If a real model request is interrupted, use the displayed recovery action when available. Do not create another request to hide the interrupted execution.

Public app: https://fishmarket-893821979623.asia-northeast1.run.app

Public repository: https://github.com/wuyi4514/FishMarket

## Production composition

| Layer | Current implementation | Responsibility |
|---|---|---|
| Browser | React, TypeScript, Vite, Markdown rendering | Room/member selection, mention-derived routing, chat, profiles and persisted outcome projection |
| HTTP application | Fastify in the same Cloud Run container as the web build | Strict input validation, room-capability checks, workflow entry and snapshot retrieval |
| Collaboration kernel | `Collaboration` | Admission, unique owner, bounded contributions, immutable deliveries, review, human-input gates and recovery |
| Model adapter | Official `@google/genai` SDK, Vertex AI | Scope-specific Gemini requests, strict structured output and validated semantic intent |
| Repository | Official `@google-cloud/firestore` SDK | Transactional room/message/checkpoint commits, request receipts, version/fence checks and shared call budget |
| Infrastructure | Cloud Run + Firestore Native + Vertex AI | Public HTTPS application, durable storage and managed model inference |

There is no separate Agent Worker, PostgreSQL service, event bus or transactional outbox in this deployment. A long HTTP request drives bounded workflow steps while the browser polls committed room snapshots. Server execution does not depend on the browser continuing to poll, and the server does not start an untracked promise after returning its response. A process/request interruption is handled through a persisted checkpoint and explicit recovery, not a guarantee of autonomous background continuation.

The existing deployment uses project `fishmarket-abc-2026-4514`, Cloud Run / Firestore region `asia-northeast1`, Vertex AI's `global` endpoint, and configured model `gemini-3.5-flash-lite`. These are release-time configuration facts, not permanent architectural requirements. See [release evidence](release.md) for the deployed version and [this iteration's evidence](neoorg-chat-alignment-release.md).

## Mapping NeoOrg V3 to the competition implementation

| NeoOrg V3 principle | Current implementation | Deliberate limit |
|---|---|---|
| Group outlives a task | Durable room, selected frozen member profiles, multiple sequential outcomes | 2–4 Agents from a fixed catalog; membership is chosen at creation, not edited later |
| One outcome, one owner | `Outcome.owner`, validated owner scope, owner retained through revisions and review repair | No owner transfer or owner-assignment epochs |
| Ordinary chat is not always a task | `reply_only` versus `open_outcome`; linked follow-up can `revise_outcome` | Continuing existing work is selected explicitly in the composer; no general historical outcome search |
| Selective contribution | Engineering reserves one independent reviewer; maximum contributors = min(2, selected Agents − 2) | Sequential execution; no recursive delegation or parallel worker pool |
| Delivery is not completion | Append-only delivery snapshots; independent review tied to a delivery | Text/Markdown deliverables, not a general versioned file/asset service |
| Independent review | Reviewer excludes owner and current contributing authors; every frozen criterion is assessed | One prototype review policy; no separate post-review human-acceptance policy |
| Human judgment remains distinct | Persistent input gate and explicit follow-up tied to the outcome | No external action approvals, scheduled waits or effect execution |
| Engineering owns execution facts | Application allocates IDs, versions, order, receipts, fences and transitions | Bounded single-room aggregate rather than V3's proposed independent relational aggregates |
| Minimal role-specific context | Current production `group-model-context-v3` builder, selected jobs, bounded delegation policy and four mutually exclusive scopes | No authorized on-demand tool search or private long-term Agent memory |
| Recovery is visible | Lease expiry, durable reason/owner/next action, explicit resume and no replay of committed messages | No unattended scheduler or automatic takeover |
| UI projects authoritative facts | Message roles, owner, criteria, outcome status and recovery come from persisted `RoomView` | No state inferred from “done” or similar text in a message |

## Execution lifecycle

### Admission and ownership

The API first validates the versioned human-message input and private room capability. In one transaction it records the human message, request fingerprint and run checkpoint. Reusing the same request key and payload returns existing facts; using that key with different input is rejected.

Gemini then chooses a semantic admission action. A one-shot answer commits a member reply without creating an outcome. Substantial work freezes a goal and acceptance criteria with one owner. An explicitly linked follow-up can append a new immutable goal revision while keeping the same owner. Platform IDs and the formal revision number are allocated by engineering, not generated by Gemini.

### Contribution, delivery and review

The owner may request complementary contributions, ask for human input, or submit a delivery. The production builder derives eligible local refs and a request limit from frozen membership, excluding the owner and reserving one reviewer. Two-Agent rooms allow direct owner delivery plus independent review; three-Agent rooms allow one contributor; four-Agent rooms allow two. The same dynamic output schema validates the actual Gemini response, and domain checks recheck capacity before any publication. Requested contributors are already ineligible for review; the system does not wait until their work finishes to reserve a reviewer. Contributors cannot finish the parent's outcome. After delegation commits, further contribution requests for that revision disappear from the provider action set and are independently rejected by the domain.

The owner integrates the results into an immutable delivery. The reviewer receives the delivery and the exact frozen criteria, not the owner's private reasoning. Review output must cover every criterion exactly once. Blocking changes require a major or blocker issue; minor-only advice cannot force rework. Rework returns to the same owner, with a bounded repair count.

The outcome becomes `satisfied` only for a deliverable with every criterion satisfied. Otherwise, the recorded result can be partial or no-solution with `not_satisfied`, explicit attainment and independent-review assurance. A normal run termination is not itself evidence of business success. A proposed plan is not evidence that its proposed actions were executed.

### Interruption and recovery

Before a model request, the application reserves call budget and renews the two-minute execution lease. Before publication it checks the aggregate version, execution fence and lease. Stale output cannot overwrite a newer checkpoint.

An interrupted or invalid model response records recovery instead of success. Retryable recovery resumes the last committed scope with a new fence. Already committed messages, contributions and deliveries are not repeated. Uncommitted inference can be attempted again and can incur additional model cost; NeoOrg does not claim exactly-once inference. Budget and non-retryable contract/review failures require the indicated human action rather than blind looping.

## Model / engineering boundary

| Model-visible business facts | Engineering-only authority |
|---|---|
| Persistent job, responsibilities and boundaries | Canonical room/member/outcome/message/delivery IDs and versions |
| Run-local member aliases and the selected teammate's name | Capability tokens/hashes, IAM credentials and request keys |
| Eligible contribution aliases and a bounded request limit | Canonical membership, reviewer reservation and assignment checks |
| Current goal, criteria aliases and constraints | Lease owner/expiry, execution fence and transaction version |
| Bounded relevant public messages and formal contributions | Full room aggregate, private trace and raw infrastructure errors |
| Immutable delivery and relevant review issues | Database receipts, commit ordering and provider usage metadata |

The context has a validated version tag, but the model is not asked to manufacture output protocol versions. The adapter validates the semantic wire result, adds the fixed protocol envelope, and validates the application contract again. The current action set and review criterion enum are built from the frozen production snapshot. Unsupported wire literal syntax is normalized to supported string enums without relaxing application validation.

Source: [`group.ts`](../src/contracts/group.ts), [`model.ts`](../src/server/model.ts), [`collaboration.ts`](../src/server/collaboration.ts).

## Persistence, security and operational limits

- Firestore stores a bounded `room-v1` aggregate with profiles, ordered messages, outcomes, receipts and a `group-run-v1` checkpoint. A transaction commits workflow state and user-visible messages together. This is a small-demo storage model, not an unbounded enterprise chat log.
- A room receives a random capability; the server stores its SHA-256 hash and validates the request header. Unauthorized reads are denied. This is possession-based room access, not account authentication, tenant isolation or enterprise RBAC. Clearing local storage can lose access; do not share room tokens.
- Browser code has no direct Firestore access and no Gemini credential. Cloud Run uses its attached service account / Application Default Credentials with scoped Firestore and Vertex AI roles. No user-provided API key is needed in the demo browser.
- Job descriptions do not confer tool permissions. There are no connected external tools, web-search evidence retrieval, mail sending, spending or business-system writes. Supplied evidence is evaluated as supplied, not independently fetched or externally verified.
- One execution runs per room. Busy responses preserve the draft. The browser fences old-room and old-version responses, and switching rooms retains separate in-tab drafts. Routing is derived from each draft, never retained in hidden recipient state.
- `create-room-v2` requires 2–4 unique known Agent IDs. The server freezes exactly the selected jobs. Legacy `create-room-v1` deliberately creates all four original members. Both persist as `room-v1`; existing capabilities, profiles and checkpoints need no rewrite. Any explicit out-of-group target is rejected before a message, receipt, budget claim or model invocation, even when continuing an existing outcome.
- Current limits include 4,000-character human input, at most two requested contributors per revision, 16 calls per execution, 80 calls per room, and a shared 300-call UTC-day limit. These are call-count limits, not a fixed currency-cost guarantee. Context keeps up to 12 recent messages and a bounded character budget, not the full history.
- Current Cloud Run configuration allows scale-to-zero with a maximum of two instances. Cold starts and model/provider errors remain possible. Health probes storage readiness; they do not prove a real Gemini inference succeeds.
- Public-demo users should not enter confidential business information. The application does not claim deletion/export administration, enterprise retention compliance or a production security certification.

Source: [`http.ts`](../src/server/http.ts), [`room-store.ts`](../src/server/room-store.ts), [`workspace.ts`](../src/web/workspace.ts).

## Conversation-native UI

The current iteration adapts NeoOrg's compact group header, quiet blue/gray surfaces, right-aligned human bubbles, left-aligned professional Agent messages, role tags, hover/focus message copy, profile side sheets and non-disruptive latest-message navigation.

The `@` picker inserts a visible mention in the body; there is no separate To dropdown or profile Message action. Exactly one distinct current-room mention determines the existing single structured target at send time. No mention or several distinct mentions use group admission, which can choose an appropriate owner; this is not multi-dispatch or a new authorization system. Continuing an existing goal keeps its recorded owner, irrespective of a different teammate mentioned in the draft.

Enter sends, Shift+Enter inserts a line break, and Ctrl/Cmd+Enter also sends. IME composition is not submitted by a candidate-confirmation Enter. When the member picker is open, Enter selects the highlighted member before any send. Recommended questions fill the draft without dispatching. Profile viewing never changes the draft or creates work. Desktop and mobile each expose a plus-only creation entry. Clipboard failure is visible and manual text selection remains available.

Only readers already near the end follow new messages automatically. Reading earlier messages leaves the scroll position intact and exposes a return-to-latest control. These UI controls do not mutate workflow facts, prompts or checkpoints.

## Verification and evidence

`pnpm verify` runs deterministic Evals, TypeScript checks and web/server builds without model credentials. Tests exercise the actual contracts/builders/HTTP composition, including sole ownership, review independence and criteria coverage, minimal provider serialization, idempotency, stale fences, checkpoint recovery, room isolation and browser-workspace reconciliation. The UI iteration adds production-render and keyboard/mention/scroll policy regressions.

`pnpm smoke:production` is a separately named live Gate. It drives the deployed API through real Gemini, independently reads the Firestore document, checks replay idempotency and room isolation, and checks a targeted job-identity answer. It is not a comparative benchmark. Browser verification checks the actual built interface. Neither offline fixtures nor a successful health response are presented as live-model evidence.

There is no measured claim here that four Agents outperform one Agent, that the full NeoOrg V3 benchmark has passed, or that external business goals have been executed. See [release evidence](release.md) for actual runs, failures and remaining acceptance boundaries.

## Evolution path, not implemented features

The NeoOrg design supplies a longer-term direction: explicit owner transfer, independent outcome aggregates, workers/outbox, authorized extension tools, exact external-effect receipts, scheduled waits, stronger identity/RBAC, durable personal memory and comparative A/B/C Evals. Each needs its own contracts, persistence/recovery design and release Gate. None is implied by the current chat UI or included as an existing competition-prototype feature.
