# NeoOrg-aligned chat iteration — 2026-10-16

Historical release snapshot for source `138ee5e` / revision `fishmarket-00010-vt2`. Its UI, branding and recipient behavior describe that version, not the current application. The current release is `3fc280f` / `fishmarket-00011-86f`; see [current release status](release.md) and [selected-group evidence](neoorg-selected-members-release.md). This iteration was later included in [PR #1](https://github.com/wuyi4514/FishMarket/pull/1), merged into main at `a13059b`.

## Scope and boundary

Align the existing FishMarket conversation with NeoOrg interaction patterns and improve the technical explanation. Preserve FishMarket identity, public URL, private room capabilities, all stored messages, model adapter, workflow contracts and checkpoint formats. No database migration or automatic history replay is part of this release.

## Verification status

- Offline Gate: 52 tests, both typechecks and both builds passed. React event tests include IME, member-selection Enter, no-match selection, clipboard failure and non-disruptive incoming-message scroll behavior.
- Browser Gate: desktop and 390px mobile checks passed for mention selection, sending/newline, copy, member directory/profile sheet, Escape/focus restoration, fresh rooms, old draft/recipient preservation and recommendation filling. Local fixture behavior is not presented as real-model evidence.
- Source commit: `138ee5eeaf3dbb87467be70ce43c2fa95b278cfb`, development branch `codex/neoorg-chat-alignment`.
- Source CI passed: https://github.com/wuyi4514/FishMarket/actions/runs/38840710664 .
- At this release, Cloud Run revision `fishmarket-00010-vt2` served 100% traffic; it has since been superseded. Cloud Build `9592065c-1eb8-4a36-8ee2-700ad664c515` succeeded. Immutable image: `sha256:b206050cd4ea7937e73519a78d3098e166b2743e4eb160cb5a0d090d0eeb17bf`. Only RELEASE_SHA was updated; existing credentials, model, store and scaling configuration were retained.
- Baseline verified live: source `55a14fa3851cc9ff64cef4f344dbd615f138f78a`, revision `fishmarket-00009-5zq`, Firestore / Vertex AI / `gemini-3.5-flash-lite`.
- Predeploy Firestore check: zero running records and zero unexpired leases. A historical six-message room was read independently. No capability or credential was logged.
- History verification: the first raw-JSON digest was not canonical because Firestore map-key response order varies. Instead, independently verified the record's authoritative last-write timestamp, `2026-10-13T09:35:06.430425Z`, which predates this deployment. Two recursively key-sorted reads return canonical digest `47edc0f68706888edb57c9829dc19cca202f1c056cb903c0bb1ff63b8ca4f362`. The historical record was not modified by release; no business data was rewritten to satisfy a check.
- At this snapshot no PR had been created. Source integration was subsequently completed through PR #1; competition submission is still not performed. PPT/video are outside the current documentation work.

## Intended user-visible changes

Compact group header and members directory; blue/gray conversation surfaces; right-aligned human bubbles and left-aligned Agent messages; separate permanent job and outcome-role labels; hover/focus copy; recipient-backed @ selection; IME-safe Enter sending and Shift+Enter newline; profile side sheet; smart following and return to latest.

Recommended questions, named room creation, per-room drafts/recipient state, refresh retrieval, outcome criteria/review/recovery and the safety footnote remain available.

## Live gates and public browser

- Health reports source `138ee5eeaf3dbb87467be70ce43c2fa95b278cfb`, Firestore, Vertex AI and `gemini-3.5-flash-lite`.
- JS `/assets/index-DaXU1kNG.js`: SHA-256 `9155dcdf95c7d5a876558a7180ea172aca8c7316d77c048ae64c72761844e4f8`, identical to local build.
- CSS `/assets/index-jBBkQwe6.css`: SHA-256 `391cef0defe74c25c52746928af70870b5c36f4f5956ac49159d6d9b52be18c2`, identical to local build.
- The production smoke for this historical revision passed: Sail as owner, Reef and Beacon as contributors, Harbor as independent reviewer, achieved/satisfied outcome, six persisted messages. This case took 12.578 seconds; it is not a comparative or latency benchmark.
- Independent Firestore read confirmed the workflow and profiles; replay did not add messages/outcomes; unauthenticated and cross-room access were denied; a fresh room stayed isolated; real Gemini introduced Reef's actual responsibilities and boundaries.
- In the public UI, created `Group chat acceptance` while retaining the old room; typed @Re, used Enter to select Reef without sending, then sent a simple introduction via Enter. Real Gemini returned a reply-only answer, visibly declaring its supplied-evidence/no-browsing boundary. Refresh restored the same two bodies without creating an outcome or repeating model work.
- Desktop and 390px cloud layouts, profile side sheet and original room entry were checked. Browser viewport reset; temporary local preview tab closed. Production tab retained for user acceptance.
- New revision ERROR-severity logs returned no entries in the bounded release check.

## Actual deployed screenshots

- [Desktop group chat](screenshots/neoorg-chat-alignment.png)
- [Position profile side sheet](screenshots/neoorg-chat-profile.png)
- [390px group chat](screenshots/neoorg-chat-mobile.png)

## Rollback

Redeploy the prior immutable image/source with the existing service account, environment and Firestore database. This frontend-only change introduces no new backend data format; do not delete rooms, mutate historical runs or replay unfinished work during rollback.
