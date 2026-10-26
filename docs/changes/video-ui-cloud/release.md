# Source publication — 2026-10-26 (current)

At the user's explicit request, [PR #2](https://github.com/wuyi4514/FishMarket/pull/2) merged the already deployed UI branch into main at `053fb5e77dcd43fe5b1d53cca0e2fd31407eaf5d`. The source branch head was `a040631`; a fresh local `pnpm verify` passed 85 tests, both typechecks and both builds, and PR CI passed. The pending-source-merge statements below are historical snapshots, superseded by this publication.

The cloud runtime remains the previously deployed `78ef020` build described below. Its health endpoint was checked read-only and returned ready with Vertex AI and Firestore. This source merge and README refresh do not redeploy the service, modify stored rooms or replay tasks.

# Creation dialog refinement — 2026-10-19 (deployed runtime snapshot)

- Entry: https://fishmarket-893821979623.asia-northeast1.run.app
- Runtime source / health tag: `78ef020ce74c263f221c59580b6911de9dbce8b3`.
- Revision: `fishmarket-00014-8g4`, Ready/Active, 100% traffic.
- Resolved image: `sha256:b3e9be3a0a6d08936e7dd5db4409edd5de02a2dfaf1f3b3f9f523cf009c9cd07`.
- Regional Cloud Build: `752241bc-36b3-499c-9381-5657c318ef5d`, SUCCESS.
- [Source CI](https://github.com/wuyi4514/FishMarket/actions/runs/39146025170), success.
- Same independent branch `codex/video-ui-cloud-alignment`; no PR or main merge; user acceptance pending.

Removed only the annotated creation-dialog copy: selected-count suffix, Always included, independent-review hint and preservation/draft paragraph. Keep the human row, all selectable members, title/intro/name and actions. Minimum two-agent validation and draft preservation remain unchanged. All shared modal close buttons now reuse the existing symmetric SVG with zero-padding grid centering, rather than a font glyph. The prior member-details close-button-only policy is unchanged.

## Verification

1. Red-first actual-component Evals reproduced copy/icon defects. Full `pnpm verify`: 85 tests, both typechecks and both builds passed. No server, contracts, dependency or Dockerfile changes relative to the previous deployed source.
2. Actual local 1280px and 390px browsers measured button 30×30, icon 18×18 and horizontal/vertical center delta (0,0). The annotated copy is absent; mobile document width remains 390px (356px creation dialog). One selected agent still disables creation. X closes creation and preserves the exact draft. Member profile icon also measures (0,0), while blank/Escape still do not dismiss.
3. [create-dialog-cleanup.jpg](create-dialog-cleanup.jpg) is the actual local fixture screenshot, not a cloud screenshot. Remote browser clicks were not rerun because the previous remote attachment remained unavailable; cloud asset/control-plane checks are independent evidence. Temporary viewport reset; test tab and local dev processes closed.
4. Cloud health reports ready, Firestore, Vertex AI, unchanged `gemini-3.5-flash-lite` and the exact source SHA. Revision digest/traffic/runtime account and actual startup log/probe verified: server listens on 8080 and STARTUP TCP probe passed in one attempt.
5. Public `index-BYr_ZN5L.js` and `index-DhmSfYOb.css`, logo and all six original portraits match the verified build/public bytes exactly.
6. Read-only predeployment snapshot: 30 rooms, zero running records. After deployment all 30 canonical field hashes and update times are unchanged. No cloud room/message/model QA writes, migrations or historical replay performed. Existing runtime account, data, credentials, limits and model configuration preserved; only image/RELEASE_SHA updated.

Refresh the original URL (Cmd/Ctrl + Shift + R if cached). Rollback image: `sha256:a72ff13e4d6d8ff4ce7c6437bb51d1626e27b475f75504d984e5117a9a96cd04` from revision `fishmarket-00013-8fk`; preserve Firestore and do not replay historical work. Accepted video and Alpha's local deployment are untouched. [Per-file changes](change-summary.md).

---

# Available-controls cleanup — 2026-10-19 (previous snapshot)

The following describes revision 00013, superseded by the creation-dialog refinement above.

## Running source and scope

- Entry: https://fishmarket-893821979623.asia-northeast1.run.app
- Exact runtime source / health tag: `45b8a005e1938f26c9231fc0d9a5bd930d72e9bf`.
- Branch: `codex/video-ui-cloud-alignment`; no new PR or main merge; user acceptance pending.
- Revision: `fishmarket-00013-8fk`, Ready, Active, 100% traffic.
- Resolved image: `sha256:a72ff13e4d6d8ff4ce7c6437bb51d1626e27b475f75504d984e5117a9a96cd04`.
- Regional Cloud Build: `fea07830-82e4-4410-b640-91e821f10410`, SUCCESS.
- [Source CI](https://github.com/wuyi4514/FishMarket/actions/runs/39144632677), success.
- One container continues to serve web/API. Runtime account remains `fishmarket-runtime@fishmarket-abc-2026-4514.iam.gserviceaccount.com`. Deployment updates image and RELEASE_SHA only; no schema, credentials, permissions or model changes.

Hidden: Announcements, Space, work/member/grid rail shortcuts, account avatar and uninstalled Skills/Tools detail tabs. Kept: Messages, actual Profile/Models, header room directory, group creation, search/filters, mentions and recommendations. Member details only dismisses through X; padding, transparent backdrop and Escape do not dismiss. The duplicate return button is removed. Other dialogs still support normal cancellation, without mistaking internal padding for backdrop.

## Verification and limits

1. Red-first production-render and dialog-event tests reproduced the bug before implementation. Full `pnpm verify`: 83 tests, both typechecks and both builds passed.
2. Actual local browser at 1280px verified the hidden controls, real Models panel, member padding/outside/Escape no-dismissal, X dismissal and restored trigger focus. Recommendations still fill the composer. New-room padding does not dismiss; backdrop and Escape still cancel. At 390px the member sheet fits without horizontal overflow and blank/Escape do not close it. Temporary viewport reset; test tabs and dev processes stopped.
3. Local screenshot: [member-details-cleanup.jpg](member-details-cleanup.jpg). It is a fixture preview, not a live-cloud screenshot. Remote tab attachment again timed out; remote click verification is not claimed.
4. Cloud health independently reports ready, Firestore, Vertex AI, unchanged `gemini-3.5-flash-lite` and the exact full source SHA above. Ready/Active revision, resolved digest, traffic and runtime account verified using Cloud Run control-plane reads.
5. Public `index-CwAxwY3_.js` and `index-BKESih8d.css`, logo and all six portraits match the verified local build/public assets byte for byte. Source comparison confirms no server/contracts/dependency/Dockerfile changes relative to the previous deployed source.
6. Before deployment: 30 existing rooms, zero running records. After deployment: all 30 canonical field hashes and update times unchanged. No cloud QA room, inference, message write or historical replay was performed for this UI-only follow-up. The earlier live-model evidence below is historical and was not rerun.

Refresh the existing URL with Cmd/Ctrl + Shift + R if cached. No browser storage or group needs to be deleted. The accepted video and Alpha's local deployment are unchanged. Per-file changes are in [change-summary.md](change-summary.md).

Rollback: redeploy the previous immutable image `sha256:bcf65fdf7553928d136a4d01fbda42a08962f6ef6bea34808690cb25b6a32749` from revision `fishmarket-00012-cmx`, preserving Firestore and credentials. Both versions support the same contracts/checkpoints; do not replay historical work.

---

# Film-aligned cloud release — 2026-10-18 (historical snapshot)

The following evidence describes the previous release, not the current visible controls or runtime.

## Previous deployment

- Entry: https://fishmarket-893821979623.asia-northeast1.run.app
- Source: `77755e247870bd8257cde2fd613eedcea608e9e5`; health release tag `77755e2`.
- Branch: `codex/video-ui-cloud-alignment`; no new PR or main merge; user acceptance pending.
- Revision: `fishmarket-00012-cmx`, 100% traffic.
- Image: `sha256:bcf65fdf7553928d136a4d01fbda42a08962f6ef6bea34808690cb25b6a32749`.
- Cloud Build: `94008041-4210-455e-a746-e5e16c7b8c9c`, SUCCESS.
- Source CI: https://github.com/wuyi4514/FishMarket/actions/runs/39142263442, success.
- Existing service account, Firestore database, Vertex AI model, limits and credentials preserved; deployment changed only the image and RELEASE_SHA.

## Verified facts

1. `pnpm verify`: 80 tests, web/server typechecks and both builds passed.
2. Actual local browser: original portraits loaded; group card has left 12px/right 13px insets; full-name mention selection; send; independent reviewed delivery; Space reference opens its actual text/review; profile/Models/Skills/Tools; five-member creation checklist; 390px layout without horizontal overflow. Temporary viewport reset. Local preview uses explicit fixtures, not live-model evidence.
3. Production health returns Firestore / Vertex AI / gemini-3.5-flash-lite / release 77755e2.
4. Production five-position group `2e39196a-b944-4ad8-bb9a-4db836bd3c07`: real Gemini produced six messages, accountable owner retained, written delivery plus independent review, outcome satisfied. This is one functional QA case, not a performance benchmark or fabricated film conversation.
5. Separate two-position group targeted Design - Coral: Gemini returned the correct persistent job/responsibilities and explicitly stated it cannot generate images or export editable slides in this prototype. Outsider targeting failed before publication. Legacy v1 still creates original four profiles.
6. Independent Firestore REST reads matched the stored five-/two-position membership and profile names. Request replay returned unchanged messages; unauthorized reads were rejected.
7. All 27 pre-existing rooms retain identical canonical fields hashes and update times after deployment. No historical work was replayed or rewritten.
8. Production `index-CZsYBtH_.js`, `index-BGyh8ugR.css`, logo and all six portraits match the verified local build byte for byte. The six portraits independently match the accepted film originals byte for byte.

Cloud browser automation initially timed out when attaching to the remote tab; the confirmed browser interaction evidence above is local. Remote asset parity and real model/storage checks are separate evidence, not a claim of completed remote browser interaction.

## Acceptance notes

Refresh the original URL (Cmd/Ctrl + Shift + R if cached). Existing rooms preserve their original roster and profile facts. Use the plus button for the five-position team; no room or browser access needs to be deleted. Recommendations remain available as previously requested. Space initially has no deliveries in a fresh room; it fills only after actual delivery commits.

This restores the visual surface, not film-only mock capabilities. No generated poster/PPT, installed Skill packages, external tools or seeded launch conversation is implied. The actual model and boundaries are visible in profile tabs. Accepted film and the locally running Alpha product remain untouched.

## Rollback / recovery

Previous immutable image: `sha256:4aff477de85812dfbf00ab32bbd1a1f0f7e9fbc1ba7cdd8d8c4b30d8e607246a`. Retain all Firestore data and credentials. Prior code does not understand the fifth position, so prefer a forward repair; do not resume five-position runs under older software. Never replay historical work.

## Reproduce release checks

`pnpm exec tsx scripts/video-ui-cloud-gate.ts baseline|history|live` uses current production catalog/builders and saves only local room hashes for history comparison. On this authoring host, use the existing system HTTPS proxy for Google API connectivity; no proxy/security setting was changed. Tokens go only to the intended authenticated API via memory/stdin, never evidence logs.
