# Named rooms and Agent job profiles release

Historical release snapshot for source `8816155` / revision `fishmarket-00007-czj`. The current release is `3fc280f` / `fishmarket-00011-86f`; its selected membership and @-only interaction supersede the profile Message/recipient behavior recorded here. See [current release status](release.md). These earlier changes were included in [PR #1](https://github.com/wuyi4514/FishMarket/pull/1), merged into main at `a13059b` on October 16, 2026.

## Release snapshot

- Public entry: https://fishmarket-893821979623.asia-northeast1.run.app
- Source: 8816155b922e10c0fc1d341a64ebb58099b1d5b9 (health release: 8816155).
- Development branch: codex/rooms-agent-profiles; subsequently included in the PR #1 merge into main.
- Cloud Run revision at this release: fishmarket-00007-czj; then 100% traffic, now superseded.
- Image: sha256:e573c6152f3a9daa17b65864e979adcdab039c054a99b32b1467bc2f3f8ad178.
- Cloud Build: ce745fbd-b556-4a55-a8b5-11d50fdecea2, SUCCESS.
- Source CI: https://github.com/wuyi4514/FishMarket/actions/runs/38386896939, success.
- One built container serves web/API; build and runtime WORKDIR are /app. Existing Firestore project, runtime service account, Gemini model and 300-call project cap remain unchanged.

## Actual gates

- Offline: 36 tests, frontend/server TypeScript, web and server builds passed.
- Desktop/mobile: named creation, old in-tab drafts and recipient retention, new/old room switching, refresh restoration, profile entry points, exact position/responsibilities/boundaries, explicit Message action, Escape/focus restoration and 390px no horizontal overflow.
- Predeploy Firestore audit: no running records or unexpired leases. No historical execution was replayed.
- Real deployed collaboration: Human → Sail owner → Reef/Harbor contributors → Sail delivery → Beacon independent review. Six messages, satisfied/achieved deliverable and independently_reviewed result. This case took 19.308 seconds, not a benchmark or guarantee.
- Independent developer-authorized Firestore REST read: room c42ae75c-c0fe-4021-b8a9-640eb101bb86 has the same message count and exact Agent profile facts as the public API projection.
- Duplicate request replay left messages/outcomes unchanged. Missing or another room's capability returned 404.
- Fresh room 7da972ed-6250-44ae-ad8b-b6cf0767ce15 started with no messages/outcomes/run and a separate ID/token. It did not modify the first room.
- Actual Gemini Reef self-introduction named its Research & evidence position, all three supplied responsibilities and both boundaries, including no connected browsing/private database access and no invented evidence.
- Existing public browser migrated the old single-room capability and retrieved all six pre-upgrade Chinese message bodies unchanged. The earlier Sail ownership/review result stayed intact.
- Public browser created Fresh collaboration using the real deployed POST; new room was clean and the old working-room entry remained visible. Refresh restored the selected new room; switching back returned the original six message bodies exactly unchanged.
- All four cloud header Avatar buttons opened their own labelled position dialog with exactly three responsibilities and two boundaries. The deployed 390px new-room dialog, initial focus and Cancel were checked too.
- Screenshots: docs/screenshots/rooms-agent-profile.png (real deployed Reef profile) and docs/screenshots/fresh-room-dialog.png (real deployed mobile new-room prompt). Temporary viewport overrides were reset; the public app tab is retained for user acceptance.

## Scope and recovery

Named room creation is single-flight and pending/error-aware. The workspace index is browser-local; it is not cross-device account sync. Clearing browser storage can lose room access. Sent messages are durable in Firestore; unsent drafts are kept only in this tab. A failed create/read does not replace the old entry. Storage failure retains the new token in memory and warns before refresh. Fresh rooms cannot reset the shared daily call budget.

Job profiles are versioned and frozen for new rooms. Legacy room-v1 records resolve the fixed original profile-v1 catalog without rewriting business state. Permanent position is different from a current outcome owner/contributor/reviewer assignment. The provider sees only bounded business identity fields, not profile versions, tokens, leases, platform IDs or receipts. Job descriptions grant no tool permissions.

The runtime checkpoint contract remains group-run-v1. Legacy checkpoint resume is covered offline; already committed messages and owner identity remain unchanged. In case of a regression, traffic can be returned to prior revision fishmarket-00006-46w without deleting rooms or replaying work. Keep browser workspace storage for a later roll-forward; the older UI only knows its legacy single-room entry.

PPT, video, competition submission, account-wide sync, room deletion and dynamic staffing were not implemented in this iteration. No NeoOrg files, data or local services were changed.

Implementation and deployment verification for this historical version completed; its changes are now integrated into main. Automated/browser evidence describes the recorded cases, not competition submission or organizer acceptance.
