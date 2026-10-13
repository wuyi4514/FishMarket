# FishMarket verified release

## Public entry

https://fishmarket-893821979623.asia-northeast1.run.app

Public source: https://github.com/wuyi4514/FishMarket

The implementation/deployment request is complete and ready for user acceptance. This does not represent competition submission or acceptance of the product by the user. PPT and video remain deferred.

## Running source and infrastructure

- Runtime source commit: 8816155b922e10c0fc1d341a64ebb58099b1d5b9 (health release: 8816155).
- Cloud Run revision: fishmarket-00007-czj, serving 100% of traffic.
- Project: fishmarket-abc-2026-4514; region: asia-northeast1.
- One container serves both built web and API; no separate worker checkout.
- Firestore Native default database in asia-northeast1.
- Vertex AI global endpoint; Gemini 3.5 Flash-Lite.
- Dedicated runtime service account with datastore.user and aiplatform.user.
- One CPU, 512 MiB, zero minimum/two maximum instances, concurrency ten, ten-minute HTTP timeout.
- Atomic daily model-call budget: 300. Per-room budget: 80; per-execution budget: 16.
- No credential files, API keys or private room tokens are committed or sent to Gemini.

Documentation/QA-only commits after this runtime source do not change the deployed src, dependencies, build configuration or Dockerfile.

## Latest named-room / job-profile iteration

The latest release adds named fresh rooms, preserved browser-local room navigation and clickable permanent Agent job identities consumed by Gemini. See [iteration evidence](rooms-agent-profiles-release.md) for its 36-test Gate, source CI, immutable image and real Gemini/Firestore verification. No PR or main merge was performed before user acceptance.

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

Deferred: owner transfer, external business actions, scheduled waits, staffing, plugins, private long-term agent memory, multiple simultaneous runs in one room, comparative A/B benchmark, deck/video/submission.

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
