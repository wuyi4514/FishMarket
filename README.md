# NeoOrg

A human and persistent AI teammates collaborating in one group chat. One outcome has one accountable owner; other members contribute only when needed; an independent reviewer assesses the immutable delivery.

This AI Builder Cup 2026 Future of Work prototype adopts NeoOrg's Outcome Ownership design. Initially implemented separately as FishMarket on Google Cloud, it now uses the NeoOrg product name and original logo. Its repository, cloud resource names, public URL and saved room-access keys remain unchanged for continuity. It does not claim to implement the complete NeoOrg platform.

## What works

- Persistent groups with a human and 2–4 selected teammates from four stable Agent identities.
- Named fresh rooms, preserved browser-local room history, switching and reload restoration.
- Clickable Agent position profiles; room-bound responsibilities and capability boundaries shared with Gemini.
- General chat, @-only member targeting, and Gemini-selected outcome ownership. Removing a mention removes its routing effect; several distinct mentions remain a group message, not multi-dispatch.
- NeoOrg-aligned chat layout, @ teammate picker, IME-safe Enter sending, message copy and non-disruptive latest-message navigation.
- Bounded contributor requests, visible professional contributions, owner integration; smaller groups reserve an independent reviewer before delegation.
- Frozen acceptance criteria, immutable deliveries and independent review.
- Honest goal attainment, human input gates, and durable checkpoint recovery.
- Atomic Firestore state/message persistence, request idempotency, lease fencing and private room capabilities.
- A single Cloud Run image serving web + API, calling real Gemini through Vertex AI.

See the [technical overview and NeoOrg architecture mapping](docs/technical-overview.md), [architecture and scope](docs/group-collaboration.md) and [release evidence](docs/release.md).

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
