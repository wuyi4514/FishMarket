# Findings

- Public service is FishMarket checkout, branded NeoOrg; film assets/source are in Alpha submissions production-v4. This task changes FishMarket only, not Alpha's locally running product or the accepted film.
- Reference: narrow icon rail, 256px group column, inset composite group avatar/card, neutral gray, compact title + member portraits, Messages/Announcements/Space tabs, 40px avatars, 16px conversation text and inline blue @ chips.
- Current four legacy profiles are frozen per room. Replacing only display names would contradict model identity. New rooms must freeze actual five-role profiles; legacy rooms retain their business facts and receive only visual updates.
- The cloud prototype has persisted Markdown deliveries, criteria, review notes and durable recovery, not the film's file-generation, Skills installation or external tools. Space can expose real deliveries/reviews; empty states must stay honest.
- Existing source baseline a646e5f on codex/video-production-plan was clean; created codex/video-ui-cloud-alignment. No PR authorized before acceptance.
- Network diagnosis: macOS system HTTPS proxy is enabled on localhost:7892; command-line Node/curl did not inherit it. Cloud SDK reads succeeded through the host proxy handling, while direct Firestore connections timed out. QA commands must explicitly use that existing proxy; no network/security setting was changed.

## 2026-10-19 follow-up
- `Modal` currently equates `event.target === event.currentTarget` with backdrop interaction. Native dialog padding also targets the dialog itself, so a blank sheet area incorrectly dismisses it.
- Member details requires an explicit close-button-only policy, including ignoring backdrop and Escape. Creation/directory dialogs retain normal dismissal, but creation padding must not count as backdrop.
- Hide Announcements/Space, the work/team/grid rail entries, the account avatar and uninstalled Skills/Tools tabs. Keep actual Profile/Models, header directory, group search/filters, creation, messaging and recommendations. Hidden delivery-view components need not be deleted or change persisted facts.

## Creation copy / close-icon annotations
- Remove the selected-count suffix, Always included label, reviewer hint and preservation/draft paragraph. Keep the You row, teammate checkboxes, title/intro/name and actions. Removing prose does not change the two-agent minimum or workspace/draft storage behavior.
- Shared close button renders the font glyph × in a fixed 30px circle without explicit centering/padding reset. Reuse the existing symmetric close SVG with grid centering and zero padding to avoid font-metric offsets across all native dialogs.
