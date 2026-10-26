# README design and source findings

## Current repository
- GitHub default branch is main at a13059b. The previous UI branch contains 47 changed files including application/contracts and has not been merged. The README refresh starts independently from main.
- Main README is prose-heavy and lacks a visual hero, demo video entry, concise navigation, Chinese counterpart and a contributor path. Existing code has 2–4 selected profiles, ownership, bounded contributions, independent review, input gates and explicit recovery.
- Original NeoOrg logo and actual prototype screenshots already exist on main. No LICENSE file is present; do not invent one or claim an OSI license.
- Existing verify.yml runs pnpm verify on main and codex branches. Existing package scripts/pinned pnpm and Node requirements are authoritative for commands.

## Primary layout references inspected on 2026-10-26
- https://github.com/langgenius/dify — product visual and direct product/docs entry points, quick start, feature sections and contribution guidance. GitHub API reported 159581 stars at inspection; this is reference selection evidence, not a README claim.
- https://github.com/OpenHands/OpenHands — centered identity/value proposition, verified build badges, focused navigation, screenshot, quick start and architecture. GitHub API reported 91879 stars at inspection.
- Reuse organizational ideas only. All NeoOrg copy is original. No borrowed logos, images, marketing claims or infrastructure.

## Content boundary
The product video at https://youtu.be/3ylBl1l6doA presents the broader NeoOrg story. The public app is a limited-feature prototype. This distinction belongs near the media rather than buried in an operational release log. Main source quick start uses deterministic local fixtures; Cloud Run uses real Vertex AI and Firestore.

## Updated source baseline after user steering
- User explicitly requested merging the deployed UI branch and basing the README on the latest source. PR #2 merged at 053fb5e on 2026-10-26. The earlier four-profile finding describes only the initial inspection; current main has 2–5 selected teammates, original portraits, composite group avatars and highlighted full-name mentions.
- Current details expose Profile and the actual configured Models tab. Unavailable navigation and uninstalled Skills/Tools entries are hidden. Legacy rooms preserve their frozen profiles. README copy and screenshots must reflect this version.
