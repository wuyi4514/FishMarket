# Changes by file

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
| docs/changes/video-ui-cloud/{task_plan,findings,progress}.md | Scoped architecture decision, actual checks, errors and release progress |

No accepted film, local Alpha service, secret, historical conversation or competition submission was changed. No PR has been created.
