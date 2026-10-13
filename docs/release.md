# FishMarket deployment evidence

## Current status

Initial Cloud Run source deployment completed: fishmarket-00001-br9. Live workflow verification is in progress; this is not yet the final verified release.

- Public URL: https://fishmarket-893821979623.asia-northeast1.run.app
- Project: fishmarket-abc-2026-4514
- Region: asia-northeast1
- Store: Firestore Native, default database, same region
- Model: Gemini 3.5 Flash-Lite via Vertex AI global endpoint
- Runtime identity: dedicated fishmarket-runtime service account
- Cloud Run: one CPU, 512 MiB, zero minimum/two maximum instances, concurrency ten, request timeout ten minutes
- Daily demo model-call limit: 300, enforced with Firestore transactions

## Completed local evidence

- 19 offline tests passed, including production SDK request/response serialization and HTTP composition.
- TypeScript and web/server production builds passed.
- Real Vertex AI probe returned a valid model response from the dedicated project.
- Browser fixture path displayed the human, owner, contributors, immutable delivery and independent review. It is explicitly marked offline and does not count as live-model evidence.

## Required release evidence still pending

- Full deployed Gemini group workflow and independently retrieved Firestore document.
- Idempotent request replay and unauthorized-room access negative check.
- A second live scenario and member-targeted reply-only behavior.
- Public browser send, progressive messages and reload durability.
- Final committed source SHA, successful CI and deployed revision matching that source.

## Operational boundaries

Only report-writing collaboration is supported. No external business actions are executed. A reviewed plan can be a satisfied deliverable without proving that proposed actions were carried out. Persistent agent identities exist in the group; private long-term agent memory, staffing, owner transfer and plugin runtime are deferred.

The room access token remains in the visitor's browser. The server stores its hash and never includes it in a model projection or public room snapshot. There are no credential files in the repository.

## Source deployment

```sh
gcloud run deploy fishmarket --source=. --project=fishmarket-abc-2026-4514 --region=asia-northeast1 --service-account=fishmarket-runtime@fishmarket-abc-2026-4514.iam.gserviceaccount.com --allow-unauthenticated --memory=512Mi --cpu=1 --min-instances=0 --max-instances=2 --concurrency=10 --timeout=600 --set-env-vars=GOOGLE_CLOUD_PROJECT=fishmarket-abc-2026-4514,ROOM_STORE=firestore,GEMINI_MODEL=gemini-3.5-flash-lite,DAILY_MODEL_CALL_LIMIT=300,RELEASE_SHA=COMMITTED_SHA
```

## Production gate

```sh
FISHMARKET_URL=https://fishmarket-893821979623.asia-northeast1.run.app pnpm smoke:production
```

This gate uses the public HTTP API, real deployed Gemini adapter, and an independent authenticated Firestore infrastructure read. It must be run from an authorized developer environment with gcloud authentication; no token is printed or saved.
