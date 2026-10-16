# Findings

## 2026-10-16 selected membership corrections

- The user requests @-only routing, no profile Message action, plus-only creation, selectable group membership and NeoOrg product branding. Recommendation cards remain in scope and must stay functional.
- Current create-room-v1 always freezes all four Agents. room-v1 already has membership/profile snapshots; no Firestore migration is required. Keep old browser key names to preserve capabilities.
- Existing reviewer selection excluded only delivered contributors; with a smaller group it could accept delegation that exhausts the reviewer after execution. Close this general invariant before enabling selected membership, in both dynamic Provider schema and transactional domain checks.
- Existing selected-recipient state survives removal of its visible @ token. Remove that state and derive target from the current body and current room profiles at submission.
- Reuse the actual NeoOrg brand asset from Alpha/apps/web/public/brand/neoorg-logo.png; no generated replacement or source credentials are needed. Cloud project, service URL and GitHub repository remain FishMarket infrastructure identifiers.
- New Evals first failed on the unchanged baseline. Final local Gate passes 75 tests, both typechecks and both builds. Coverage includes all 11 valid subsets / every selected owner, real Gemini request/response serialization, adapter and domain negatives, linked-gate outsider rejection, selected-pair resume, workspace restoration and actual App→HTTP member/target payloads.
- Desktop and 390px browser checks confirmed selected membership, @-only dispatch, removal of stale recipient routing, minimum-member validation, profile view without Message, plus-only creation and retained recommendations. Production build (not HMR) preserved exact message bodies after creating another group, switching and reloading.
- Dev hot refresh can replace the module navigator while preserving mounted React state. Creation now boots the navigator before appending a group, avoiding replacement of the remembered directory. This is not a production data migration.
- New public asset must be copied into the Docker build stage; added COPY public and an offline brand/container regression. Asset SHA-256 matches NeoOrg's original: 8b6837542c0c39e482ac67756c8f6824427830284bc2b6888e890ca5565eb1f8.
- Predeploy live verification: runtime 138ee5e / fishmarket-00010-vt2, no running records, unchanged runtime IAM/model/budgets. Historical room updateTime 2026-10-13T09:35:06.430425Z; canonical messages/outcomes digest 47edc0f68706888edb57c9829dc19cca202f1c056cb903c0bb1ff63b8ca4f362.

## 2026-10-16 NeoOrg alignment baseline

- User confirms the supplied latest official Q&A is authoritative for this task and permits an existing-product submission; prior fresh-code-only advice is not the implementation boundary of this iteration. Existing implementation provenance remains factual and must not be rewritten.
- FishMarket checkout is clean on codex/ui-copy-cleanup; new work starts on codex/neoorg-chat-alignment. Prior documented runtime source is 55a14fa and must be verified live before release.
- NeoOrg source uses compact 64px group headers, muted blue/gray surfaces, right-aligned human bubbles, left-aligned Agent bodies, hover/focus copy actions, @ member choices, Enter-to-send with IME guards and Shift+Enter newline, and explicit return-to-latest navigation. No announcements, file tools or WorkPlan controls will be shown unless implemented in FishMarket.
- Current FishMarket unconditionally scrolls on message count/run scope, offers only a recipient select and Ctrl/Cmd+Enter, and uses editorial sage styling with both sides left aligned. Profiles are accessible native dialogs; they can become a right-side sheet without changing profile truth or dispatch.
- The current backend already implements a bounded V3 subset. The technical document must not claim NeoOrg PostgreSQL/outbox/worker/tool platform, owner transfer, external execution or long-term memory as present in FishMarket.
- Read all 1,472 lines of NeoOrg V3 reference and the actual FishMarket HTTP/store/model/collaboration production boundaries. The current production model context is group-model-context-v2; admission, owner, contributor and review remain separate scopes. FishMarket stores bounded room aggregates, not NeoOrg's proposed independent PostgreSQL Outcome tables or transactional outbox.
- New seven deterministic/render Evals initially failed because the interaction module did not exist. After implementation, 46 tests, both typechecks and both builds pass. Browser and deployed verification are still pending.
- Actual desktop browser confirmed the @Re query returns Reef from the room profile list; Enter chooses Reef and updates the structured recipient without sending. Shift+Enter preserves an unsent line break; Enter then sends. The real fixture-backed workflow rendered persisted message roles and a reviewed outcome.
- Group member directory opens from the compact header and Reef's right-side sheet shows the exact three responsibilities and two boundaries. This remains a modal, accessible side sheet (not a new non-modal enterprise member subsystem).
- Desktop copy action reported Copied and browser clipboard contained the exact stored Markdown body. A second fixture conversation produced twelve messages; scrolling to history exposed Return to latest messages. A deterministic React hook test will additionally cover incoming messages while away, since browser timing alone is not reliable evidence of that race.
- At 390px, the real browser showed right-aligned human text, readable Agent roles, profile/header access, latest-message navigation and an unobstructed composer without horizontal overflow. Creating a named new room kept the old room; switching back restored all twelve messages, the original unsent draft and @Reef recipient. Recommendation cards still populate the clean room's composer without sending.
- Source comparison confirms src/server, src/contracts and the production smoke script are unchanged. Two test-only dependencies are being added for event-level React and timeline regression tests; npm registry downloads are slow, not a product failure.
- Final release source 138ee5e deployed as fishmarket-00010-vt2 at 100% traffic. Source CI, Cloud Build, exact health/release and local-versus-deployed JS/CSS hashes passed; service account, model, Firestore and scaling limits are unchanged.
- Real production smoke completed in 12.578 seconds for this one case: Sail owned, Reef/Beacon contributed, Harbor reviewed, achieved/satisfied. Independent Firestore, idempotency and room-isolation checks plus a real Reef identity reply passed. Public UI separately sent a real Reef introduction using the new @/Enter controls; refresh preserved exactly both message bodies.
- Historical digest comparison initially used unordered Firestore map JSON, which can produce different strings. Corrected the audit method, not product data: authoritative updateTime remains 2026-10-13T09:35:06.430425Z, before this release; two recursively sorted reads match canonical hash 47edc0f68706888edb57c9829dc19cca202f1c056cb903c0bb1ff63b8ca4f362. No history replay/write occurred.
- Saved actual production desktop, profile-sheet and 390px screenshots. Temporary viewport reset and local preview tab closed. Current work is deployed and ready for user acceptance; PR, main merge, PPT/video and submission were not performed.

## 2026-10-10 repository and tool baseline

- Public repository created as `https://github.com/wuyi4514/mission-room-ai-builder-cup-2026` and renamed to `https://github.com/wuyi4514/FishMarket` at the user's request.
- Local checkout: `/Users/xiewuyi1/Documents/FishMarket`.
- Repository was empty at creation and has no shared history with NeoOrg.
- GitHub CLI is authenticated as `wuyi4514` with repository and workflow scopes.
- Local Node.js is v24.14.0 and pnpm is 10.33.0.
- Google Cloud CLI, Firebase CLI, and Docker are not currently installed.

## Official deployment tooling guidance

- Google Cloud's current macOS documentation supports the official versioned archive installer and a Homebrew cask. The CLI requires a supported Python version, then `gcloud init` for browser authorization and project selection.
- Firebase's official documentation supports an npm installation and requires Node.js 18 or later, followed by `firebase login` and `firebase projects:list`.
- Google's current Vertex AI documentation recommends `@google/genai` for Node.js, with `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION=global`, and `GOOGLE_GENAI_USE_VERTEXAI=True`. Deployment requires billing and the Vertex AI API.

## Product direction

- Working title: FishMarket.
- Golden path: a product lead enters a launch brief and constraints; Gemini performs three bounded roles in sequence; the system commits a Launch Readiness Report with evidence gaps, risks, actions, ownership roles, and a Go/Hold/No-Go recommendation.
- Roles: Research Analyst, Launch Planner, Independent Reviewer.
- The product demonstrates knowledge access from supplied evidence, multi-role collaboration, decision support, and workflow execution without reproducing NeoOrg's runtime or domain model.

## 2026-10-13 readiness and deadline verification

- The official homepage still lists October 18, 2026 as the prototype submission deadline. The exact closing hour and time zone have not been verified. Source: https://aibuildercup.com/
- The official FAQ says an end-to-end deployed prototype is sufficient and lists the public repository, deployed URL, deck, and video under three minutes. Source: https://aibuildercup.com/Faqs.html
- The homepage and FAQ now list October 14 as the team-formation closing date, with teams of two to four people. Existing team completeness has not been checked.
- The FishMarket public repository exists but has no commits. Local implementation files are untracked; dependencies are not installed and test/typecheck/build have not run.
- Source inspection confirms an initial UI, strict input/output schemas, a sequential three-role Gemini workflow, Firestore adapter, offline tests, Docker configuration, and Firebase Hosting configuration. This is implementation groundwork, not a verified product.
- Google Cloud CLI is installed and authenticated as the user's account. A read-only listing returns one active project and one open billing account. No FishMarket project is configured in the CLI; cloud API/model quotas, IAM and Firebase readiness are still unverified.
- The pinned React, TypeScript and Vite versions resolve in the package registry.
- A focused new prototype is feasible within the remaining window if cloud/model access is established early. Rebuilding the complete NeoOrg platform is outside the feasible submission scope.

## Group collaboration implementation direction

- User authorized immediate implementation and deployment, deferred PPT/video, and explicitly requested the NeoOrg V3 collaboration architecture as the design reference without copying code.
- Read the complete 1,472-line V3 design. The central principle is one persistent owner per outcome, on-demand contributors, immutable deliveries and independent review; fixed all-agent speaking cycles are not the V3 design.
- Frozen prototype architecture is recorded in docs/group-collaboration.md. Cloud Run will serve both web and API, Firestore will hold messages and workflow checkpoints, and the official Gen AI SDK will call Gemini.
- Created dedicated Google Cloud project fishmarket-abc-2026-4514 successfully. Billing linkage, APIs and runtime permissions are next.
- Official model lifecycle documentation lists Gemini 2.5 Flash retirement during the evaluation window (October 20). Select a newer supported model and prove access with a real call. Source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions
- Initial dependency installation is slow on the preconfigured npm mirror; avoid a Firebase CLI dependency because this release uses Cloud Run directly.
- Cloud Run initial revision fishmarket-00001-br9 is public and serves the group UI plus API. Real health returns Firestore and Vertex AI; the first workflow rejected a model-generated envelope version before any agent publication.
- Corrected the architecture boundary: model wire output is semantic only; protocol versions are constructed by the adapter. A second source deployment is underway.
- Browser verified the local six-message collaboration path and the deployed desktop/mobile landing and composer layouts. Public live chat completion still awaits the corrected revision.
- Second deployed workflow committed admission and two contributions, then rejected an invalid owner action. The official Vertex structured-output documentation does not list const as supported, and explicitly says unsupported fields are ignored. Normalized string const to an equivalent one-value enum in the shared schema adapter, preserving strict application validation. Source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output
- Production is verified on runtime source 8f40da135d37c507800ce08ae809b9b33ad86bb6, revision fishmarket-00006-46w. Evidence and operational limitations are recorded in docs/release.md.
- The current source is a limited V3-inspired group prototype, not a full NeoOrg reconstruction. Material preparation and competition submission remain outside this turn.

## Room / identity iteration baseline

- User requested working fresh-room creation and clickable Agent job/responsibility information, not new competition materials or a PR.
- Current fresh-room API already writes a real empty aggregate, but the UI keeps only one room capability in fishmarket.room.v1; new creation loses the old entry point, has no pending lock and shows a hardcoded room title.
- Sidebar member buttons currently change the composer recipient; header avatars are non-interactive. Shared MEMBERS has a short role/capability only. The production model receives capability but no explicit job/responsibility/boundary facts.
- Preserve the existing editorial sage/paper visual language. Native accessible dialogs provide focus trapping, Escape dismissal and named room creation. The workspace list is local to this browser, not cross-device sync.
- Existing production source is 8f40da1; Google Cloud deployment, Firestore and IAM are not being replaced. Existing rooms, checkpoints and credentials remain intact.
- browser-use doctor found a live daemon but no active browser connection; use the enabled in-app browser or connect an available isolated browser for UI verification.
- Desktop 1280x900 browser now shows the room list and interactive header/sidebar/welcome Agent entries. Reef profile visibly renders the exact role, three responsibilities, two boundaries and separate Message action from the shared room projection.
- Native profile dialog traps focus and exposes a labelled heading; explicit position identity remains distinct from per-outcome execution assignments. Local build uses the clearly labelled offline fixture, not production model evidence.
- Local browser created named Pilot decision room, showed a clean timeline and kept the original working-room entry. New-room prompt explicitly says the previous unsent draft stays in this tab. The Message Reef action selected Reef separately from viewing the profile.
- Browser revealed that React autoFocus ran before native showModal, leaving focus on Close. Changed the shared modal to focus the declared initial field only after showModal.
- Switching back to the original room restored its unsent note and @Reef recipient. A local directed collaboration then committed six messages with Reef as sole owner and Beacon as independent reviewer; new profile clicks did not change outcome ownership.
- After creating a second room, refresh restored that selected clean room. Switching back retrieved the original six messages and reviewed result. Escape closed Sail's profile and returned focus to its original Agent button. At 390px the header exposes clickable Agent avatars plus a visible room selector and fresh-room action.
- Mobile 390x844 rendered the complete Beacon position dialog without horizontal overflow. Named-room input received initial focus, Cancel preserved the original room, and the mobile selector switched to the clean second room. Reset the temporary viewport afterward.
- Cloud source 8816155 deployed successfully as fishmarket-00007-czj. Source CI and Cloud Build passed. Health reports real Firestore / Vertex AI / Gemini 3.5 Flash-Lite and release 8816155.
- Real production Gate completed in 19.308 seconds for this case: Sail owned the outcome, Reef/Harbor contributed, Beacon independently reviewed; achieved/satisfied with six messages. Independent Firestore REST read confirmed the exact profile facts and stored messages. Fresh-room isolation and cross-room capability denial passed.
- Real Gemini Reef introduction repeated its actual persistent role, three responsibilities and two capability boundaries from the supplied profile rather than a generic identity.
- Browser initially observed the new shell before async room retrieval completed; the attempted new-room action could not match an enabled entry. After the real GET completed, legacy migration restored the same six old message bodies byte-for-byte. No data was lost and no history was replayed.
- Cloud browser submitted named Fresh collaboration via the real API. It showed no inherited conversation/result, an active new title and the preserved original room entry. Assertions on a reload/switch must wait for the selected-room heading rather than reading message nodes while a fetch is pending.
- Final cloud UI checks: refresh restored Fresh collaboration with both remembered room entries; switching to the original room after it became selected returned all six original message bodies exactly unchanged.
- Cloud header Harbor/Reef/Sail/Beacon dialogs each displayed the correct position plus three responsibilities and two boundaries. Saved actual cloud desktop/mobile screenshots. Public browser is retained for user acceptance; temporary preview tab and viewport overrides were cleaned up.

## Annotated UI copy cleanup

- User screenshot marks eight blocks: header eyebrow, live-model badge, welcome eyebrow, welcome explanatory paragraph, browser-local room note, team count, entire sidebar slogan/description, composer judgment sentence.
- Keep the unmarked main welcome headline, room labels, team roles, examples, shortcut and bottom AI safety footnote. This is not permission to delete browser debugging UI outside the product.
- Current source branch is based on d534dfa and runtime 8816155; worktree was clean. This change only affects rendering/styles and leaves model/persistence behavior unchanged.
- Offline Gate passed with 38 tests, frontend/server typecheck and both builds. Desktop 1280x900 preview visibly removes the eight annotated blocks while preserving the main headline, examples, clickable Agent identities, composer shortcut and clearly labelled fixture footnote.
- Local 390x844 mobile layout has no horizontal overflow. Header/profile entry, new-room open/cancel and example-to-composer/Send availability worked. Removed badge space is reclaimed by the title instead of keeping the previous fixed 190px maximum.
- While the first copy-cleanup source was deploying, user added two welcome-area removals and then corrected the request: retain the three recommended question cards. Final target removes only the duplicate welcome Agent row and decorative welcome fish, in addition to the earlier eight blocks. No welcome-area code had yet been removed before the correction.
- Added a failing render test before the additional edit, then removed the two welcome decorations while preserving recommendation handlers and both sidebar/header profile entry points. First eight-block revision was deployed as fishmarket-00008-kwd; the final corrected version must supersede it.
- Final corrected Gate passes 39 tests, typecheck and both builds. Desktop browser confirms no welcome fish/duplicate row, and clicking Make a launch decision still fills its original recommendation into the composer. Left brand and both Agent entry points remain.
- On the final corrected mobile build, each of the three recommended question cards filled a draft and Harbor's header profile opened normally. Temporary viewport was reset. No QA send/model call was needed for this presentation-only change.
- Final cloud revision fishmarket-00009-5zq serves 100% traffic on source 55a14fa3851cc9ff64cef4f344dbd615f138f78a. Health reports that exact source; downloaded JS/CSS hashes equal the local verified build. Source CI https://github.com/wuyi4514/FishMarket/actions/runs/38420278977 passed.
- Live browser restored the selected Fresh collaboration room, found exactly three recommendation buttons and no welcome fish, duplicate members, sidebar slogan or live badge. Clicking the simple-question card filled its original prompt; QA draft was cleared without sending.
- Saved the actual final 1280x900 cloud screenshot after closing the temporary preview tab. Cloud Reef profile and new-room open/cancel still worked. Temporary viewport was reset and the public app is retained for user acceptance.
