# NeoOrg-aligned chat iteration — 2026-10-16

## Scope and boundary

Align the existing FishMarket conversation with NeoOrg interaction patterns and improve the technical explanation. Preserve FishMarket identity, public URL, private room capabilities, all stored messages, model adapter, workflow contracts and checkpoint formats. No database migration or automatic history replay is part of this release.

## Verification status

- Offline Gate: 52 tests, both typechecks and both builds passed. React event tests include IME, member-selection Enter, no-match selection, clipboard failure and non-disruptive incoming-message scroll behavior.
- Browser Gate: desktop and 390px mobile checks passed for mention selection, sending/newline, copy, member directory/profile sheet, Escape/focus restoration, fresh rooms, old draft/recipient preservation and recommendation filling. Local fixture behavior is not presented as real-model evidence.
- Production deployment has not yet changed; live post-release checks are pending.
- Baseline verified live: source `55a14fa3851cc9ff64cef4f344dbd615f138f78a`, revision `fishmarket-00009-5zq`, Firestore / Vertex AI / `gemini-3.5-flash-lite`.
- Predeploy Firestore check: zero running records and zero unexpired leases. A historical six-message room was read independently; its messages/outcomes digest is `b72100f465e83e38fcac936bb009c88faf858155ce5a579dd3747b53fc26a222`, retained for post-release comparison. No capability or credential was logged.
- User acceptance, PR, deck/video and competition submission remain separate and have not occurred.

## Intended user-visible changes

Compact group header and members directory; blue/gray conversation surfaces; right-aligned human bubbles and left-aligned Agent messages; separate permanent job and outcome-role labels; hover/focus copy; recipient-backed @ selection; IME-safe Enter sending and Shift+Enter newline; profile side sheet; smart following and return to latest.

Recommended questions, named room creation, per-room drafts/recipient state, refresh retrieval, outcome criteria/review/recovery and the safety footnote remain available.

## Rollback

Redeploy the prior immutable image/source with the existing service account, environment and Firestore database. This frontend-only change introduces no new backend data format; do not delete rooms, mutate historical runs or replay unfinished work during rollback.
