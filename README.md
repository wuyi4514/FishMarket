# NeoOrg

A human and persistent AI teammates collaborating in one group chat. One outcome has one accountable owner; other members contribute only when needed; an independent reviewer assesses the immutable delivery.

This AI Builder Cup 2026 Future of Work prototype adopts NeoOrg's Outcome Ownership design. Initially implemented separately as FishMarket on Google Cloud, it now uses the NeoOrg product name and original logo. Its repository, cloud resource names, public URL and saved room-access keys remain unchanged for continuity. It does not claim to implement the complete NeoOrg platform.

## What works

- Persistent groups with a human and 2–5 selected teammates: Delivery - Anchor, Product - Spark, Content - Anemone, Design - Coral and Quality - Puffer. Original groups preserve their original frozen profiles.
- Named fresh rooms, preserved browser-local room history, switching and reload restoration.
- Clickable Agent position profiles; room-bound responsibilities and capability boundaries shared with Gemini.
- General chat, @-only member targeting, and Gemini-selected outcome ownership. Removing a mention removes its routing effect; several distinct mentions remain a group message, not multi-dispatch.
- Film-aligned three-column layout and original portraits, full-name @ chips/picker, IME-safe Enter sending, message copy and non-disruptive latest-message navigation.
- Messages, role profiles and actual configured-model details. Unavailable Announcements/Space, account/workspace shortcuts and uninstalled Skills/Tools entries are hidden. Written deliveries and independent reviews remain persisted; no mock film content or file-generation tools are installed.
- Bounded contributor requests, visible professional contributions, owner integration; smaller groups reserve an independent reviewer before delegation.
- Frozen acceptance criteria, immutable deliveries and independent review.
- Honest goal attainment, human input gates, and durable checkpoint recovery.
- Atomic Firestore state/message persistence, request idempotency, lease fencing and private room capabilities.
- A single Cloud Run image serving web + API, calling real Gemini through Vertex AI.

See the [technical overview and NeoOrg architecture mapping](docs/technical-overview.md), [architecture and scope](docs/group-collaboration.md) and [release evidence](docs/release.md).

## Submission text and source status

Copy-ready Chinese and English text with the deployed app and repository links is in [the submission description](docs/submission-description.md). It describes actual Gemini/Vertex AI, Cloud Run and Firestore usage; Firebase Hosting and Firebase Authentication are not used.

[PR #1](https://github.com/wuyi4514/FishMarket/pull/1) merged the prior product iterations into main at `a13059b` on October 16, 2026. The film-UI cleanup is deployed from independent branch `codex/video-ui-cloud-alignment`, source `45b8a00`, revision `fishmarket-00013-8fk`. Its [source CI](https://github.com/wuyi4514/FishMarket/actions/runs/39144632677), 83 offline tests/typechecks/builds, actual local desktop/mobile checks and exact cloud-asset/history verification passed. Backend/model contracts are unchanged from the earlier live Gemini/Firestore gate. Remote browser attachment timed out; no remote click verification is claimed. This update has not created a PR or merged into main; user acceptance remains pending. No competition submission is performed by this update. See the [release record](docs/changes/video-ui-cloud/release.md).

## Local offline development

Requires Node.js 22.12+ and pnpm 10.33.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:4173. This explicitly labelled preview uses an in-memory store and deterministic model fixtures. It is not evidence of live Gemini or Firestore. Production rejects fixture mode.

```sh
pnpm verify
```

## Production

Set GOOGLE_CLOUD_PROJECT, ROOM_STORE=firestore, GEMINI_MODEL to a supported model, and RELEASE_SHA. The service account needs roles/datastore.user and roles/aiplatform.user. No API key or credentials are committed or sent to the browser.

```sh
pnpm build
pnpm start
```

A long-running HTTP message request drives the workflow while the browser polls committed room state. Refreshing only retrieves state. If execution is interrupted, the lease expires; the explicit Resume action continues the persisted checkpoint without repeating committed messages.

Anonymous visitors can create their own room. Each room has an unguessable capability stored in that browser. Do not enter private business data into a public demo.

The workspace list is remembered only in this browser, not synchronized across devices. Creating a fresh room keeps previous rooms and their sent messages; unsent drafts stay separately in the current tab. Clearing browser storage can lose room access. Fresh rooms do not reset the project-wide daily model-call limit.

## Deliberately deferred

External business actions, owner transfer, dynamic staffing, plugins, long-term private memory, scheduled waits and simultaneous runs in the same room. A proposed business plan is not proof that its actions have been executed. Deck/video are outside this implementation request.
