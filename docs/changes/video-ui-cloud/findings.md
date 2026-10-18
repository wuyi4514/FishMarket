# Findings

- Public service is FishMarket checkout, branded NeoOrg; film assets/source are in Alpha submissions production-v4. This task changes FishMarket only, not Alpha's locally running product or the accepted film.
- Reference: narrow icon rail, 256px group column, inset composite group avatar/card, neutral gray, compact title + member portraits, Messages/Announcements/Space tabs, 40px avatars, 16px conversation text and inline blue @ chips.
- Current four legacy profiles are frozen per room. Replacing only display names would contradict model identity. New rooms must freeze actual five-role profiles; legacy rooms retain their business facts and receive only visual updates.
- The cloud prototype has persisted Markdown deliveries, criteria, review notes and durable recovery, not the film's file-generation, Skills installation or external tools. Space can expose real deliveries/reviews; empty states must stay honest.
- Existing source baseline a646e5f on codex/video-production-plan was clean; created codex/video-ui-cloud-alignment. No PR authorized before acceptance.
- Network diagnosis: macOS system HTTPS proxy is enabled on localhost:7892; command-line Node/curl did not inherit it. Cloud SDK reads succeeded through the host proxy handling, while direct Firestore connections timed out. QA commands must explicitly use that existing proxy; no network/security setting was changed.
