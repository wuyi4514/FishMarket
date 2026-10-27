# NeoOrg README showcase refresh

## Scope
Refresh the public GitHub README with a clear product story, representative media, working demo links, collaboration flow, quick start, architecture/scope and contribution guidance. English remains the default, with a Chinese counterpart. Documentation/media only; no application, dependency, workflow, credential, license or deployment changes.

## Branch and publication boundary
The draft started on clean `codex/readme-showcase` from origin/main. The user then explicitly requested merging the already deployed video/UI branch first and basing the README on that latest version. Preserve the documentation draft, verify and publish the accepted UI branch through its own PR, then update this branch from the new main and refresh all version-sensitive copy and visuals. No runtime restart or new model calls are needed for this source publication.

## Phases
1. Inspect main/default README, actual code/docs/media, repository metadata and primary reference READMEs — complete.
2. Compose original English/Chinese README and choose accurate existing visuals — complete.
3. Check links/assets/anchors, render the GitHub view and run the repository Gate — complete. Actual GitHub views confirmed both languages, video cover, current interface image and portable SVG diagrams. The verified latest code passes 85 tests, both typechecks and both builds; this README change has no additional application diff.
4. Merge the user-authorized video/UI branch and publish the README through a separate GitHub workflow — UI merged in PR #2; the README's authoritative publication/check status is tracked in [PR #3](https://github.com/wuyi4514/FishMarket/pull/3) and the default-branch history.
5. Remove public evaluation-deployment entry points at the user's request — removal and local checks complete. Both READMEs route to the video/local preview; linked documents and the QA script no longer expose the deployed address. Current tracked-tree scan, link/anchor checks, missing/blank QA-configuration checks and the 85-test/typecheck/build Gate passed. Publication status is tracked by the follow-up PR and default-branch history; hosted service/access policy remain unchanged.

## Guardrails
No invented Star/customer/benchmark claims, community links, license badges or unsupported feature promises. Keep NeoOrg's organizational-workspace vision separate from this focused Google Cloud prototype. Preserve truthful fixture versus live mode, browser-local room access and model/storage/security boundaries. After the UI merge, document the latest five-profile groups and actual available controls; preserve legacy groups' frozen profiles.
