# Progress

## 2026-10-10

- Created the public GitHub repository and independent local checkout.
- Confirmed the repository began empty and shares no files or history with NeoOrg.
- Loaded the planning and frontend design workflows.
- Audited local GitHub, Google Cloud, Firebase, Node, pnpm, and Docker tooling.
- Verified current official installation and Vertex AI SDK guidance.
- Started Phase 1 architecture and repository foundation.
- Renamed the product and public repository from Mission Room to FishMarket at the user's request.

## 2026-10-13

- Rechecked official submission requirements and deadline: October 18; an end-to-end deployed prototype is sufficient.
- Confirmed that local scaffold files remain untracked and the public repository has no commits. No dependency installation, tests, build or deployment has been completed.
- Confirmed Google Cloud login, one visible active project and an open billing account using read-only checks; no FishMarket project is configured yet.
- Inspected the initial architecture, role orchestration, API and tests to assess the remaining implementation work.
- Recorded a narrowed submission scope and daily targets through October 17, with October 18 reserved as contingency.
- This session updated planning documents only; it did not change application code or deploy cloud services.
- User authorized the group-chat implementation/deployment and selected V3 Outcome Ownership as the design reference, with no source-code copying.
- Read the complete V3 spec and wrote a bounded prototype architecture with scope-specific model inputs, unique ownership, durable recovery and independent review.
- Created the dedicated FishMarket Cloud project; dependency installation is underway.
- Replaced the launch-report scaffold with independent group collaboration contracts, model projection, transactional room store, owner/contributor/review workflow, explicit offline fixtures, HTTP API and group UI.
- Offline Gate passed: 19 tests, TypeScript and web/server builds. Test coverage includes owner stability, duplicate entry, human gate, independent review, review repair, stale fencing, model metadata rejection and checkpoint resume.
- Dedicated Firestore database and runtime service account were created. Runtime IAM is limited to Firestore data access and Vertex AI usage.
- A real Vertex AI Gemini 3.5 Flash-Lite probe succeeded. Cloud Run source deployment has started; complete live workflow and browser verification are pending.
- Initial deployed full workflow failed closed on an invalid model-generated protocol version. Fixed the shared boundary by excluding that field from wire schemas and having the adapter construct the authoritative envelope. Existing failed room facts remain unchanged.
- Added read-side expiry detection to persist an actionable recovery case for a crashed request, and filtered review issues to the current goal revision.
- Desktop offline collaboration UI and deployed 390-pixel mobile landing/composer layouts were visually verified. Corrected source deployment is in progress.
