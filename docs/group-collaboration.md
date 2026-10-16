# NeoOrg group collaboration

## Design basis and scope

This prototype follows the Outcome Ownership principles in NeoOrg's V3 design: a durable group, persistent agent identities, exactly one owner per outcome, bounded contributions, immutable deliveries, independent review, and engineering-owned recovery. Its initial implementation was built separately; the current UI adopts NeoOrg group-chat patterns. It implements a focused subset, not the complete NeoOrg platform. The [technical overview](technical-overview.md) maps the V3 reference to actual code, deployed infrastructure and deliberately deferred capabilities.

The human works in a group timeline. Four persistent members are available; any eligible member can become owner. A targeted message restricts admission to that member. Ordinary questions are reply-only. Substantial work creates an outcome, selected semantically by Gemini. Follow-up input on an open outcome creates a new immutable goal revision while retaining its owner. The group survives outcome completion.

## Architecture decision

Keep: single ownership, selective activation, contributor capsules, distinct owner/contributor/review scopes, minimal model context, persisted message projection, transaction fencing, bounded review repair and checkpoint recovery.

Stop: fixed all-agent speaking cycles, Contributor completion as overall success, hidden ownership inferred from prose, model-generated platform identifiers, and in-memory background work after an HTTP response.

The deployment is a single Cloud Run image serving the web and API, with a dedicated Firestore database and Gemini through Google's Gen AI SDK. A request stays open while the workflow executes; the web polls persisted snapshots to display progressive messages. This avoids an untracked background promise. If the process or request fails, its durable execution lease expires and an explicit recovery action can resume the committed checkpoint. No previously committed model output or message is replayed.

## Boundary matrix

| Boundary | Input | Invariant / owner | Output / effect | Failure and recovery |
|---|---|---|---|---|
| HTTP admission | Strict versioned human message, request key and room capability | API validates access, size and request identity | Atomic human message and run checkpoint | Invalid access/input has no model invocation |
| Gemini adapter | Scope-specific business projection | Model supplies semantics; SDK request/output checked against current strict schemas | Validated semantic intent, no database side effect | Invalid/timeout output opens durable recovery |
| Domain transition | Semantic intent + frozen checkpoint/version | Engineering owns owner assignment, goal revision, delivery and message identities, order and terminal semantics | One transaction advances state and publishes messages | Stale version/fence is rejected before publication |
| Firestore | Complete bounded room aggregate | Transaction, version, request receipt and lease fencing are authoritative | Atomic message/state/checkpoint commit | Retain last committed step; resume after lease expiry |
| UI | Public persisted projection | Timeline and role tags come from state, not natural language | Group, owner, review, result and recovery controls | Refresh retrieves existing room without replay |

## Model visibility

Engineering facts: room/outcome/message/delivery IDs, aggregate version, goal revision number, access capability hash, request keys, lease owner/expiry, retries, provider usage, release metadata and transaction receipts. These never enter model context.

Model facts: current goal and criteria, current role, bounded relevant messages, member capability aliases, contribution requests/results, immutable delivery and review issues. Aliases are generated from the frozen snapshot, are not permissions, and are resolved before commit.

The Gemini output wire schema contains semantic fields only. The adapter validates that wire payload and constructs its fixed protocol-version envelope before the application contract is checked. The model never generates or copies the engineering-owned protocol version.

The current action schema is also constructed from the frozen snapshot: already-committed delegation is absent from the owner's provider action set, and linked admission cannot open a duplicate outcome. The same restricted schema validates the response; domain guards still independently recheck before commit.

## Prototype policies

- One active execution per room; concurrent human sends receive a visible busy response and preserve the draft.
- At most min(2, selected Agent count − 2) requested contributors per goal revision, no recursive delegation. Engineering reserves an independent reviewer before requests commit, counting requested authors as well as delivered ones.
- Reviewer is neither owner nor an author of the reviewed delivery.
- Review covers every frozen criterion; changes require a blocker or major issue. Up to three repair rounds.
- Success requires independently accepted deliverable and satisfied criteria. Partial/no-solution results are explicit not-satisfied outcomes.
- Technical errors are recovery states, never successful business outcomes.
- Human input is a durable gate tied to the outcome; the owner retains responsibility while waiting.
- Public rooms require an unguessable room capability; the browser has no Firestore write permission. Public access requires no account.
- Bound context, message/room capacity, per-room execution budget and daily project usage protect the demo.

## Rooms and substantive job identity

The browser keeps a strict browser-workspace-v1 directory of room IDs, capability tokens, names and the selected room. It migrates the original fishmarket.room.v1 entry without changing the server record; branding does not rename these keys. Named room creation keeps old entries; new rooms have distinct random IDs/capabilities and empty messages, outcomes and execution state. Strict create-room-v2 accepts 2–4 unique selected Agent IDs; explicit v1 compatibility retains the original all-four default. The human is included in every group. Creation is single-flight, pending/error states are visible, and navigation rejects stale responses. Drafts are retained separately per room in the current tab. A reload restores the selected room and retrieves its existing server facts without running Gemini. The directory is browser-local, not account-wide or cross-device synchronization; clearing browser storage can lose room access.

New room aggregates freeze strict agent-profile-v1 job identities only for selected members: role, capability, three responsibilities and two boundaries per member. Legacy room-v1 records without this additive field resolve against the fixed original profile-v1 catalog, without rewriting outcomes or checkpoints. The same room-bound profiles feed the public UI and group-model-context-v3. The context adds eligible local contribution aliases and an engineering-derived capacity; both output schema and transactional domain enforce it. Provider context contains bounded semantic job facts, not profile versions, internal IDs or capability tokens. Unknown/malformed profile data fails closed. Explicit out-of-group targets fail before any side effect, including on linked-outcome messages.

Native modal profile side sheets can be opened from member rows, header avatars, the room member directory and Agent message avatars. Viewing a profile has no dispatch or ownership effect and no Message action. Permanent position is separate from per-outcome owner, contributor and reviewer assignments. Descriptions do not confer tools or external execution rights. Original workflow schemas/checkpoints remain compatible, and no historic task is replayed during release.

The @ member picker uses the current room's profiles and inserts a visible mention. At submission, exactly one distinct valid room-member mention determines the single structured target. Deleting it removes that routing effect. None or several use group admission; mentions do not grant permissions or imply multi-dispatch. There is no sticky hidden recipient, To control or duplicate new-room text entry. Enter sends except during IME composition or member selection; Shift+Enter inserts a newline. Copy operates on the stored message body. The timeline follows new messages only when the reader remains near the bottom, otherwise providing a return-to-latest control. These presentation controls never infer workflow status from message text.

## Deferred capabilities (unchanged)

Owner transfer, external effects, scheduled waits, dynamic staffing, tool plugins, long-term private memory, multiple simultaneous runs in one room and comparative A/B benchmarks are outside this release. They must not be claimed as implemented.

## Gates

Offline gates cover schemas, admission, sole owner, contribution scopes, immutable delivery/review, criteria coverage, negative metadata assertions at actual SDK serialization, idempotent entry, transaction fencing and checkpoint resume. Production gates require real Gemini output, real Firestore persistence, public browser interaction, reload/retrieval and the running release SHA.
