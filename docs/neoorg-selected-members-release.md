# NeoOrg branding and selected-group release — 2026-10-16

## Running version

- Public application: https://fishmarket-893821979623.asia-northeast1.run.app
- Source: `3fc280f7d31e2ef741efa29d57fe100c53c54892`, branch `codex/neoorg-room-members`.
- Cloud Run revision: `fishmarket-00011-86f`, 100% traffic.
- Cloud Build: `95fc495b-1c73-4dba-9ec4-96e8aa2e19c8`, success.
- Image: `sha256:4aff477de85812dfbf00ab32bbd1a1f0f7e9fbc1ba7cdd8d8c4b30d8e607246a`.
- [Source CI](https://github.com/wuyi4514/FishMarket/actions/runs/38844706253): success, including the complete `pnpm verify` Gate on Node 22.
- Product name, original Logo, browser title/favicon and Gemini identity: NeoOrg. Repository, Cloud project/service URL and browser capability keys remain FishMarket identifiers to preserve continuity.

[PR #1](https://github.com/wuyi4514/FishMarket/pull/1) merged this release and its prerequisite iterations into main at `a13059baa6f54a063e1a7253b063d9d4db0d5fce` on October 16, 2026, following the user's explicit request. [Main CI](https://github.com/wuyi4514/FishMarket/actions/runs/38845919226) passed; its tree exactly matches the pre-merge head `3ca86af`. The running source remains `3fc280f`: evidence-only and merge commits changed no application files and required no redeployment.

[Submission-page text](submission-description.md) is prepared separately. No form filling, upload or final competition submission has occurred. This documentation update does not prepare PPT or video, or claim organizer acceptance.

## Actual implementation boundary

The composer has only @ targeting: no To dropdown, clear-target control, profile Message action or invisible sticky recipient. One distinct valid current-room mention yields the existing single structured target. Removing it removes the routing effect; several distinct mentions remain a general group message rather than invoking everyone. Existing outcome continuation still keeps its recorded owner.

Desktop/mobile expose a plus-only creation entry. New rooms use strict create-room-v2 with 2–4 unique selected Agents; the human is included. Frozen membership/profile snapshots drive the timeline, member directory, profile access, @ choices and actual Gemini input. Legacy v1 creation still uses the original four Agents; old room-v1 data/run-v1 checkpoints and browser capability keys are unchanged. Membership is selected at creation, not edited later.

Context-v3 exposes selected jobs and a bounded delegation policy, not canonical IDs, credentials or checkpoint metadata. The exact Provider output schema and transactional domain both limit contributors to min(2, selected Agent count − 2). Requested authors are already excluded from review. Two-Agent groups deliver directly and use the other Agent for independent review. Out-of-group explicit targets fail before a message, receipt, budget claim or model invocation, including on linked human-input gates.

## Offline and browser Gates

- 75 deterministic Evals passed, including every valid selected subset / every selected owner through the production Gemini adapter and repository.
- Both TypeScript checks and frontend/server production builds passed; Git diff whitespace check passed.
- Negatives cover reviewer-exhausting output at the actual Gemini wire boundary and in the domain, invalid/duplicate/single-member inputs, unknown/out-of-group target, linked input gate preservation, selected-pair checkpoint resume and exact minimal serialization.
- The actual App posts selected members and derives the target from edited draft text through the real HTTP composition. Existing recommendation, keyboard/IME, clipboard failure, timeline, legacy profile/checkpoint and workspace tests remain in the Gate.
- Desktop and 390px mobile browser checks exercised checkboxes/minimum count, creation/cancel, selected avatars/member count, @ candidates, profile information without Message and plus-only entry. The production web build preserved exact messages after creating another group, switching and reloading.
- Deployed browser restored the prior Group chat acceptance room with both original bodies unchanged. A new Reef/Sail group showed only those two Agents plus the human and two @ candidates. Real @Sail and later plain group greetings returned Sail and Reef respectively, without creating outcomes.
- Production JS/CSS and Logo were independently downloaded and matched local verified bytes: index-kEAxRMD0.js, index-tMzZPhCB.css, and the original Logo SHA-256 `8b6837542c0c39e482ac67756c8f6824427830284bc2b6888e890ca5565eb1f8`.
- One initial browser wait ended before asynchronous room restoration; later DOM/AX confirmed restoration with no console error. No historical work was resumed or rewritten to satisfy a UI wait.

## Real Gemini / Firestore Gate

`pnpm smoke:production` passed against the deployed revision using Vertex AI `gemini-3.5-flash-lite` and the production Firestore store. No fixture runs in that composition.

| Group | Actual participants and roles | Persisted result |
|---|---|---|
| Legacy four-Agent creation | Sail owner; Reef/Beacon contributors; Harbor reviewer | 6 messages, satisfied/achieved; one recorded workflow took 15.062 seconds |
| Reef + Beacon | Reef owner; Beacon independent reviewer; no contributor | 3 messages, satisfied/achieved; one recorded workflow took 6.748 seconds |
| Harbor + Reef + Sail | Harbor owner; Sail contributor; Reef independent reviewer | 5 messages, satisfied/achieved; one recorded workflow took 13.182 seconds |

These are individual verification cases, not latency guarantees or comparative benchmarks. The live Gate independently read Firestore, compared exact selected IDs/profile snapshots, rejected outsider targets without changing the public aggregate, checked idempotent request replay and room isolation, and verified an actual job-identity reply now names NeoOrg. No excluded Agent published or participated in these selected-group outcomes. Revision logs separately confirm admission/owner/contributor/review requests used the configured Gemini model.

Evidence room IDs (not capabilities): four-Agent `33c90279-b734-46b2-a5e4-3376260ceed9`; pair `4a999eca-4e7f-40d0-87f6-5bf02569a386`; trio `e1f021ed-5272-4103-9086-b71687944297`.

## Data and operational continuity

Predeploy inspection found no running records. All 21 pre-existing Firestore room snapshots passed the new membership/author/reviewer invariants without mutation. Runtime service account, Firestore database, Vertex endpoint/model, 300 UTC-day / 80 per-room / 16 per-run call limits, CPU/memory, scale-to-zero and maximum two instances were preserved; only RELEASE_SHA changed in the environment.

Historical six-message room `4becc8d3-eaa7-4fdc-aa7a-37c887f288f4` retained updateTime `2026-10-13T09:35:06.430425Z` and canonical messages/outcomes digest `47edc0f68706888edb57c9829dc19cca202f1c056cb903c0bb1ff63b8ca4f362` before and after deployment. Historical prose that says FishMarket remains unchanged; current branding does not rewrite past business facts.

The prior image is recoverable, but the old engine did not correctly reserve a reviewer for newly selectable small groups. Prefer a forward fix. If rolling back, preserve data/capabilities and do not replay old work; do not claim small-group delegation is fully supported by the older source.

## Actual cloud screenshots

- [Selected group and NeoOrg brand](screenshots/neoorg-selected-room.png).
- [Desktop member selection](screenshots/neoorg-member-selection.png).
- [390px mobile member selection](screenshots/neoorg-mobile-member-selection.png).
