# Progress

## 2026-10-16 NeoOrg-aligned chat iteration

- Read frontend-design and planning-with-files skills, restored FishMarket release/user-correction context and inspected NeoOrg group UI/composer/message code.
- Created codex/neoorg-chat-alignment from the clean existing FishMarket checkout; Alpha user changes are untouched.
- Scoped a presentation/interaction iteration with unchanged server workflow/contracts/checkpoints and a source-backed English technical explanation. No PR or final competition submission is authorized.
- Added failing interaction/projection Evals, then implemented shared chat primitives, message row/copy, recipient-backed mention composer, IME-safe keyboard sending, smart timeline following and compact blue/gray styling with profile side sheets.
- First full offline Gate passed: 46 tests, frontend/server typechecks and web/server builds. Beginning real browser verification before release.
- Verified actual desktop @ selection, no-send selection Enter, Shift+Enter, normal Enter, role projection, copy text, members directory and profile side sheet. Verified 390px layout, fresh room, retained old twelve-message history, per-room unsent draft/recipient and recommendation filling. Escape returned focus to the originating member button; temporary viewport reset.
- Added React event tests for keyboard/IME/no-match selection, clipboard failure and actual timeline hook behavior across incoming messages and room changes. Pinned test-only jsdom 26.1.0 for existing Node compatibility after checking the latest package's engine requirement. Final offline Gate is running.
- Added English technical-overview.md with V3-to-implementation matrix, production topology, semantic/engineering boundary, security/cost/recovery limits and evaluator path. Updated README and focused architecture document without claiming deferred NeoOrg infrastructure.

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
- Real model Gate exposed repeated delegation after two contributions committed. Restricted the current owner action schema from the persisted snapshot instead of relying on Prompt instructions; added a shared serialization/input-output negative Eval.
- A real professional-owner browser scenario delivered its report but review coverage was rejected. Bound the review wire schema to the exact current criterion refs/count; also closed idempotent no-op version invalidation with a concurrent duplicate test.
- Expanded the production Gate to consume a genuine Human input gate in the synthetic scenario and still require a delivered, independently reviewed result.
- Real release Gate passed on revision fishmarket-00005-txk: six-message Gemini collaboration, independent review, direct Firestore document read, idempotent replay, private access negative check and directed reply-only question.
- The Chinese browser scenario resumed its saved review checkpoint successfully, preserving Sail as owner and the original five messages, then committed Harbor's independent review.
- Final input-integrity audit preserved accepted human input and complete formal contribution bodies in the bounded model projection; added a trailing-constraint regression.
- Final runtime source 8f40da135d37c507800ce08ae809b9b33ad86bb6 deployed as fishmarket-00006-46w. Both branch and main CI passed (23 offline tests, typecheck and builds).
- Final production Gate passed: six real Gemini messages, satisfied/achieved independently reviewed delivery, independent Firestore REST read, idempotent replay, access denial and targeted reply-only question. Recorded workflow latency was 46.072 seconds for this single verification case.
- One earlier final-version call returned Gemini 504 and correctly persisted recovery; this is an observed service limitation, not a claim of continuous model availability.
- Chinese group was refreshed and still showed six original messages, Sail as owner, Reef/Beacon contributions and Harbor review. Saved the actual screenshot and kept the public app tab open for user acceptance.
- Recorded complete release evidence and per-file changes. PPT, video and competition submission were not performed.

## Room / identity iteration

- Read planning, frontend-design and browser-use instructions and restored the prior completed release baseline.
- Audited fresh-room handler, browser persistence, member UI, shared identity catalog, model projection and room repository boundaries before changing product code.
- Recorded the target boundary, additive legacy compatibility and release checks; implementation/Evals and cloud update are still pending.
- Added failing workspace/profile Evals before implementation. The baseline failed on the missing navigator and profile fields while the original 23 tests remained green.
- Implemented strict room-bound profile-v1 snapshots and model context-v2, including explicit responsibilities/boundaries without capability tokens or engineering metadata.
- Implemented browser workspace-v1 migration, multi-room access retention, single-flight creation, selection fencing and visible storage failure.
- Implemented native named-room/profile dialogs, per-room in-tab drafts, room list, clickable Agent entries and a mobile room switcher. Added responsive feature styles without replacing the original visual system.
- First implementation Gate passed: 33 tests, TypeScript, web build and server build. Browser and production gates are pending.
- Added room-features.css and imported it after the existing stylesheet; desktop room history and editorial profile dialogs were visually checked in the in-app browser.
- Desktop verified named creation, old draft/recipient retention, refresh selection restoration, previous six-message result retrieval, native Escape/focus restoration and Agent-to-recipient action.
- Expanded the production smoke script to require persisted profile equality, clean new room state, cross-room capability denial, unchanged old messages and an actual Gemini self-introduction from the supplied job identity.
- Mobile dialog, room switching/cancellation and focus were visually verified. Extracted the actual UI projection reconciler and added negative Evals for stale poll/version regression plus legacy checkpoint resume under the new identity context.
- Predeploy Firestore query found zero running records and zero unexpired execution leases. No historical execution was resumed or changed by this inspection.
- Updated README, architecture and per-file summary for browser-local access and stable job/execution-role separation. Added a negative Eval proving fresh rooms cannot reset the shared daily call cap.
- Final offline Gate passed: 36 Evals, typecheck and both builds. Committed runtime source 8816155b922e10c0fc1d341a64ebb58099b1d5b9 and pushed only codex/rooms-agent-profiles; no PR or main merge.
- Source CI https://github.com/wuyi4514/FishMarket/actions/runs/38386896939 passed. Cloud Build ce745fbd-b556-4a55-a8b5-11d50fdecea2 passed; deployed revision fishmarket-00007-czj serves 100% traffic with unchanged runtime SA, model, data store and daily cap.
- Real production Gate passed: reviewed achieved multi-agent outcome, exact persisted profile equality through independent Firestore read, request idempotency, fresh-room isolation, unauthorized capability denial and actual model self-introduction.
- The existing public browser room migrated without a data rewrite: all six pre-upgrade message bodies remained identical after retrieval. Final cloud UI creation/switch/reload verification is in progress.
- Cloud UI named creation, selected-room refresh and old-room switch retrieval passed. All six original Chinese message bodies remained identical; new room stayed clean and retained both navigation entries.
- Verified all four cloud header profile buttons and the deployed mobile new-room prompt/cancel; saved desktop profile and mobile creation screenshots. Reset viewport and closed the temporary local preview tab. Public app tab is retained for user acceptance.
- Updated current release evidence and per-file summary. This iteration is complete and deployed; user acceptance remains pending. PPT/video/submission/main merge/PR were not performed.

## Annotated UI copy cleanup

- Read frontend-design, browser-use and planning instructions, restored prior release context and created codex/ui-copy-cleanup from the clean current checkout.
- Mapped the eight red-box blocks to App.tsx. Recorded a presentation-only scope and preserved the unmarked safety footnote and functional controls.
- Added production-App render assertions before editing. Updated App.tsx to remove the eight annotated blocks; adjusted room-features.css so the source footer stays at the bottom, the shortcut aligns left and mobile header collapses the removed badge space.
- Baseline focused test failed as expected on the still-present header eyebrow; retained-content test already passed. Actual product edits are now under the offline/browser Gate.
- Complete offline Gate passed: 38 tests, typecheck and web/server builds. Desktop copy/layout checked in the actual browser; no model or Firestore code changed.
- Verified local mobile layout, profile dialog, new-room open/cancel, example filling and enabled Send. Reclaimed mobile title width freed by the removed badge; viewport reset afterward.
- Committed first cleanup source 8cc1991 and started its Cloud Run deployment. User then added welcome-area cleanup, explicitly correcting that recommended questions must be retained; extended the render Gate before applying that addition.
- Additional baseline test failed on welcome-team as expected. Removed only the decorative fish and duplicate welcome row from App.tsx and their feature styles; kept all three question cards, brand fish and both member profile entry surfaces.
- Final corrected local Gate passed: 39 tests, typecheck and both builds. Browser verified the retained recommendation still fills its original prompt; no decorative welcome fish or repeated member row remains.
- Committed final corrected runtime source 55a14fa3851cc9ff64cef4f344dbd615f138f78a and pushed codex/ui-copy-cleanup; final Cloud Run deployment is underway. All three recommendations and header profile interaction were checked on mobile.
- Corrected cloud source deployed successfully as fishmarket-00009-5zq at 100% traffic. Source CI passed; live health/release and exact built JS/CSS hashes verified. Server/contracts/workspace/profile behavior matches the prior release byte-for-byte in Git.
- Live recommendation filling, selected-room restore and absence of the removed DOM blocks verified; no production model invocation or history replay was performed.
- Saved final cloud desktop screenshot and verified cloud profile/new-room controls. Reset the temporary viewport, closed preview tab and retained the public app. Updated release and per-file records; final cleanup is complete and deployed, with user acceptance still pending.
