# NeoOrg verified release

## Public entry

https://fishmarket-893821979623.asia-northeast1.run.app

Public source: https://github.com/wuyi4514/FishMarket

The film-aligned UI is implemented and deployed from `codex/video-ui-cloud-alignment` at `77755e247870bd8257cde2fd613eedcea608e9e5`, revision `fishmarket-00012-cmx`, 100% traffic. [Source CI](https://github.com/wuyi4514/FishMarket/actions/runs/39142263442) and 80 offline tests/typechecks/builds passed. Real Gemini collaboration/independent review, separate Firestore reads, idempotency, outsider denial, exact deployed assets and all 27 historical room hashes/update times were verified. No PR or main merge has been performed for this update; user acceptance is pending. See [current release details](changes/video-ui-cloud/release.md) and [per-file changes](changes/video-ui-cloud/change-summary.md).

[PR #1](https://github.com/wuyi4514/FishMarket/pull/1) integrated the earlier product version at `a13059b`. The historical snapshots below are retained for traceability, not the current runtime.

[Submission-page text](submission-description.md) is prepared in Chinese and English. No form has been filled or submitted. PPT and video are outside the current documentation work.

## Running source and infrastructure

- Runtime source commit: 77755e247870bd8257cde2fd613eedcea608e9e5 (health release tag: 77755e2).
- Cloud Run revision: fishmarket-00012-cmx, serving 100% of traffic.
- Project: fishmarket-abc-2026-4514; region: asia-northeast1.
- One container serves both built web and API; no separate worker checkout.
- Firestore Native default database in asia-northeast1.
- Vertex AI global endpoint; Gemini 3.5 Flash-Lite.
- Dedicated runtime service account with datastore.user and aiplatform.user.
- One CPU, 512 MiB, zero minimum/two maximum instances, concurrency ten, ten-minute HTTP timeout.
- Atomic daily model-call budget: 300. Per-room budget: 80; per-execution budget: 16.
- No credential files, API keys or private room tokens are committed or sent to Gemini.

Documentation/QA-only commits after this runtime source do not change the deployed src, dependencies, build configuration or Dockerfile.

The current UI source differs from main and remains on the independent acceptance branch. The historical sections below describe their original release snapshots, not the currently running revision or UI.

## NeoOrg selected groups and branding (previous release, 2026-10-16)

NeoOrg original logo/wordmark/browser title; @-only draft-derived routing; no To or profile Message action; plus-only creation with 2–4 selected Agents. Provider and domain both reserve an independent reviewer. Existing rooms, capabilities, checkpoints and historical messages are preserved.

- Offline Gate: 75 tests, typechecks and builds; real desktop/mobile browser verification.
- [Source CI](https://github.com/wuyi4514/FishMarket/actions/runs/38844706253) and Cloud Build 95fc495b-1c73-4dba-9ec4-96e8aa2e19c8 passed.
- Image sha256:4aff477de85812dfbf00ab32bbd1a1f0f7e9fbc1ba7cdd8d8c4b30d8e607246a; runtime source and exact JS/CSS/Logo bytes verified.
- Real Gemini/Firestore Gate passed for four-, two- and three-Agent groups, including independent review, outsider rejection, selected-profile equality, idempotency and room isolation.
- Historical digest/updateTime and actual public-browser old message bodies remained unchanged.
- Full evidence, caveats and screenshots: [selected-members release](neoorg-selected-members-release.md). Development branch codex/neoorg-room-members was merged into main through PR #1 at a13059b.

## NeoOrg-aligned group chat (previous release, 2026-10-16)

Compact group header, blue/gray conversation, human-right/Agent-left messages, job and outcome-role separation, exact message copy, recipient-backed @ selection, IME-safe Enter/Shift+Enter, member directory/profile side sheet and non-disruptive latest navigation. Recommended questions, fresh rooms and existing workflow facts are retained.

- Gate: 52 tests, both typechecks and both builds; actual desktop and 390px mobile browser verification.
- Source CI: https://github.com/wuyi4514/FishMarket/actions/runs/38840710664, success.
- Cloud Build: 9592065c-1eb8-4a36-8ee2-700ad664c515, success.
- Immutable image: sha256:b206050cd4ea7937e73519a78d3098e166b2743e4eb160cb5a0d090d0eeb17bf.
- Runtime health reports the exact source SHA, Firestore, Vertex AI and the unchanged Gemini model. Deployed index-DaXU1kNG.js and index-jBBkQwe6.css match local verified bytes.
- Real production workflow: Sail owner, Reef/Beacon contributors, Harbor independent reviewer; six messages, achieved/satisfied, 12.578 seconds for this single recorded run (not a benchmark/guarantee). Independent Firestore read, idempotency, room isolation and actual job-identity response passed.
- Public browser @ selection and Enter triggered a real Reef reply. Refresh restored the same two message bodies, and the original room remained available. Profiles and the 390px production layout were checked and screenshots saved.
- Historical six-message record still has Firestore updateTime 2026-10-13T09:35:06.430425Z, before this deployment. No migration or historical replay occurred; no running/unexpired executions existed before release.
- Development branch: codex/neoorg-chat-alignment. This earlier iteration is included in the later PR #1 merge into main.

See [iteration evidence and rollback](neoorg-chat-alignment-release.md) and the [English technical overview](technical-overview.md).

## Annotated UI cleanup baseline (source 55a14fa)

Removed the eight originally annotated copy/badge blocks plus the decorative welcome fish and duplicate welcome member row. The user's correction explicitly retains all three recommended question cards. Brand fish, main headline, room navigation, sidebar/header position profiles, composer shortcut and the unmarked safety footnote remain.

- Gate: 39 offline tests, frontend/server typecheck, web/server builds.
- Source CI: https://github.com/wuyi4514/FishMarket/actions/runs/38420278977, success.
- Runtime health reports the exact source SHA, Firestore, Vertex AI and the unchanged Gemini model.
- Immutable image: sha256:5d30f038e2470f1bbfa639c7d32f7efaa7a8a292efde2c7c03f351dfaec817fe.
- Deployed JS/CSS bytes match the local verified build: index-G_ZrbG4J.js and index-CxKiCbf_.css.
- Actual desktop/mobile UI checked. Recommended questions still fill the composer; Agent profiles and new-room dialog/cancel work; selected room restores after refresh.
- Screenshot: docs/screenshots/ui-copy-cleanup.png.
- Predeploy query found no running/unexpired execution records. Source diff confirms server, contracts, workspace persistence and profile dialog behavior are unchanged. No production model QA call or historical replay was needed for this presentation-only release.
- Development branch: codex/ui-copy-cleanup. This earlier iteration is included in the later PR #1 merge into main.

## Named-room / job-profile baseline

The prior feature release added named fresh rooms, browser-local room navigation and permanent Agent job identities consumed by Gemini. See [historical evidence](rooms-agent-profiles-release.md) for its 36-test Gate, source CI, immutable image and real Gemini/Firestore verification. The current release builds on that baseline with selectable membership, reviewer-capacity enforcement, context-v3, @-only routing and NeoOrg branding; it is not a UI-only release.

## Initial release verification (2026-10-13, source 8f40da1)

| Gate | Actual evidence |
|---|---|
| Offline release | 23 tests, TypeScript, web build and server build passed |
| GitHub CI | Runtime source passed on main and codex/group-chat-v1; main run https://github.com/wuyi4514/FishMarket/actions/runs/38376001606 |
| Production health | Firestore ready; Vertex AI; model name and exact runtime source SHA returned |
| Live English collaboration | Human → Harbor owner → Reef contributor → Sail contributor → Harbor delivery → Beacon independent review; six messages; satisfied deliverable with achieved/independently_reviewed result |
| Final live scenario latency | 46.072 seconds in the recorded production Gate; not a benchmark or latency guarantee |
| Independent Firestore read | Real document 4becc8d3-eaa7-4fdc-aa7a-37c887f288f4 retrieved through Firestore REST with developer auth; six stored messages |
| Idempotent request replay | Existing messages/outcomes unchanged; unauthorized access without capability denied |
| Directed ordinary question | Reef answered; two messages; no outcome; real Gemini |
| Live Chinese professional-owner case | Sail remained owner; Reef and Beacon contributed; Harbor independently reviewed the immutable delivery |
| Real checkpoint resume | Previously saved Chinese review checkpoint resumed without repeating the original five messages; one review appended |
| Browser refresh | Same six-message group and reviewed terminal result returned after reload; no model replay |
| Responsive UI | Desktop and 390px mobile layout checked in an actual browser |
| Screenshot | docs/screenshots/live-collaboration.png |

The earlier source candidates were rejected honestly on contract/action/criterion mismatches. Those failed test room facts were preserved. The shared production boundaries were corrected and regression tests added; none of those failures were turned into successful historical records.

One final-release model call returned a real 504 DEADLINE_EXCEEDED and correctly left durable recovery. A later complete Gate passed. Gemini availability is external; the product exposes an explicit Resume action. The production verification script only performs bounded recovery for interrupted execution and never hides schema failures.

## Implemented and deferred

Implemented: persistent group identities, member targeting, reply-only admission, unique outcome owner, on-demand bounded contributions, human input gate, immutable goal revisions/deliveries, independent review, explicit attainment and durable recovery.

Deferred product capabilities: owner transfer, external business actions, scheduled waits, staffing, plugins, private long-term agent memory, multiple simultaneous runs in one room and comparative A/B benchmarks. Submission text is prepared; PPT/video work, form filling and final competition submission remain outside this documentation phase.

A reviewed report is not proof that the proposed business actions were executed. Visitors receive an isolated capability-protected room without login. This is the limited V3-inspired prototype, not the complete NeoOrg platform.

## Reproduce the production Gate

```sh
FISHMARKET_URL=https://fishmarket-893821979623.asia-northeast1.run.app pnpm smoke:production
```

Uses the public API, real deployed model adapter and independent Firestore read. Run from a developer environment with authorized gcloud access. Tokens are neither logged nor saved.

## Deploy from a committed source

```sh
gcloud run deploy fishmarket --source=. --project=fishmarket-abc-2026-4514 --region=asia-northeast1 --service-account=fishmarket-runtime@fishmarket-abc-2026-4514.iam.gserviceaccount.com --allow-unauthenticated --memory=512Mi --cpu=1 --min-instances=0 --max-instances=2 --concurrency=10 --timeout=600 --set-env-vars=GOOGLE_CLOUD_PROJECT=fishmarket-abc-2026-4514,ROOM_STORE=firestore,GEMINI_MODEL=gemini-3.5-flash-lite,DAILY_MODEL_CALL_LIMIT=300,RELEASE_SHA=COMMITTED_SHA
```
