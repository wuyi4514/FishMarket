# Changes by file

## 2026-10-19 follow-up

| File | Completed change |
| --- | --- |
| src/web/App.tsx | Hide Announcements/Space, work/member/grid rail shortcuts and account avatar; keep Messages, real directory, recommendations and room controls |
| src/web/RoomDialogs.tsx | Close-button-only member details; hide uninstalled Skills/Tools and duplicate return action; distinguish true backdrop from dialog padding for normal dialogs |
| src/web/video-alignment.css | Remove unused account-entry styling |
| tests/ui-copy.test.ts | Production-render negative coverage for unavailable navigation and positive Messages/member/recommendation checks |
| tests/chat-components.test.tsx | Member padding/backdrop/Escape no-dismissal and explicit close; normal creation dismissal and model/profile visibility regression |
| README.md | Correct currently available UI controls |
| docs/technical-overview.md | Document visible features and explicit member-sheet dismissal without claiming unavailable capabilities |
| docs/release.md | Current runtime source/revision, 83-test Gate and verified evidence limits |
| docs/changes/video-ui-cloud/release.md | Exact cloud digest/build/CI/traffic, unchanged history, rollback and local versus remote browser evidence; preserve prior snapshot |
| docs/changes/video-ui-cloud/task_plan.md | Follow-up scope, UI-only boundary and phase status |
| docs/changes/video-ui-cloud/findings.md | Root cause and keep/hide decision |
| docs/changes/video-ui-cloud/progress.md | Red-first tests, 83-test Gate, actual desktop/mobile evidence and cloud snapshot |
| docs/changes/video-ui-cloud/member-details-cleanup.jpg | Actual local fixture browser screenshot, not cloud-live evidence |
| docs/changes/video-ui-cloud/change-summary.md | This per-file follow-up record |

## Original film-alignment release

| File | Completed change |
| --- | --- |
| src/web/App.tsx | Film-aligned icon rail, group toolbar/search/filter, inset composite room cards, five-position team, compact header, Messages/Announcements/Space navigation; identities resolve from frozen room profiles |
| src/web/video-alignment.css | Reference-matched neutral shell, 64px icon rail/248px group column, portrait sizing, readable messages, inset cards, mention chips, composer, profile and responsive layout |
| src/web/ChatPrimitives.tsx | Original portrait images, four-tile composite group avatar, navigation/file/search icons |
| src/web/MessageRow.tsx | Agent badge, position byline and non-destructive full-name @ highlighting; message copy still uses original saved text |
| src/web/chat-interactions.ts | Exact complete-name mention matching, rejects partial/outsider names; no hidden recipient state |
| src/web/RoomDialogs.tsx | Five-position selection and original avatars; Profile/Models/Skills/Tools detail tabs with actual prototype boundaries |
| src/web/RoomSpace.tsx | Persisted delivery/review directory and scrollable preview; committed milestone/input-request view; honest empty states |
| src/web/workspace.ts | New room selection defaults to current five-position catalog/create-v3; preserves browser capability keys and historical room access |
| src/web/main.tsx | Load scoped visual alignment stylesheet after existing styles |
| src/contracts/group.ts | Additive strict create-v3, five-position catalog and bounded fifth member reference; legacy profile fallback and v1/v2 creation retained |
| src/server/collaboration.ts | Freeze catalog selected by command version; no historical profile rewrite or workflow change |
| src/server/http.ts | Route v3 catalog choice through existing strict creation endpoint |
| src/server/model.ts | Context-v4 accepts fifth member while v3 rejects fifth-member content; existing production Gemini wire schemas remain dynamically scoped |
| public/avatars/*.webp | Six byte-identical portraits from the accepted film: human-03 and agents 03/05/07/08/10 |
| tests/video-ui.test.tsx | Five-position HTTP/real Provider-builder/commit/replay Evals, recovery, outsider negative, mention chips, portraits and actual Space preview |
| tests/app-membership.test.tsx | Current App creates selected v3 positions and sends edited complete-name @ targets through actual HTTP |
| tests/chat-components.test.tsx | Current five-position checklist and minimum independent-review capacity |
| tests/workspace.test.ts | Current catalog through actual workspace/Collaboration transport; existing isolation/reload/race tests retained |
| tests/ui-copy.test.ts | New shell/positions while retaining recommendations, shortcut and non-fake controls |
| scripts/video-ui-cloud-gate.ts | Read-only deployment/history hash checks; separate real Gemini/Firestore/outsider/idempotency/legacy live gate; no logged capabilities |
| .gcloudignore | Exclude local QA evidence and room hash baselines from source upload |
| docs/technical-overview.md | Current five-position compatibility and exact UI versus capability boundaries |
| README.md / docs/release.md | Current release/branch status, new five-position UI and actual cloud verification, clearly separate prior main merge |
| docs/changes/video-ui-cloud/release.md | Exact runtime commit, revision, image, CI, live/history/asset evidence, acceptance and rollback boundaries |
| docs/changes/video-ui-cloud/local-browser.jpg | Captured actual desktop UI from the local verification build; offline fixture conversation, not a cloud/live-model screenshot |
| docs/changes/video-ui-cloud/{task_plan,findings,progress}.md | Scoped architecture decision, actual checks, errors and release progress |

No accepted film, local Alpha service, secret, historical conversation or competition submission was changed. No PR has been created.
