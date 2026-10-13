# Findings

## 2026-10-10 repository and tool baseline

- Public repository created as `https://github.com/wuyi4514/mission-room-ai-builder-cup-2026` and renamed to `https://github.com/wuyi4514/FishMarket` at the user's request.
- Local checkout: `/Users/xiewuyi1/Documents/FishMarket`.
- Repository was empty at creation and has no shared history with NeoOrg.
- GitHub CLI is authenticated as `wuyi4514` with repository and workflow scopes.
- Local Node.js is v24.14.0 and pnpm is 10.33.0.
- Google Cloud CLI, Firebase CLI, and Docker are not currently installed.

## Official deployment tooling guidance

- Google Cloud's current macOS documentation supports the official versioned archive installer and a Homebrew cask. The CLI requires a supported Python version, then `gcloud init` for browser authorization and project selection.
- Firebase's official documentation supports an npm installation and requires Node.js 18 or later, followed by `firebase login` and `firebase projects:list`.
- Google's current Vertex AI documentation recommends `@google/genai` for Node.js, with `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION=global`, and `GOOGLE_GENAI_USE_VERTEXAI=True`. Deployment requires billing and the Vertex AI API.

## Product direction

- Working title: FishMarket.
- Golden path: a product lead enters a launch brief and constraints; Gemini performs three bounded roles in sequence; the system commits a Launch Readiness Report with evidence gaps, risks, actions, ownership roles, and a Go/Hold/No-Go recommendation.
- Roles: Research Analyst, Launch Planner, Independent Reviewer.
- The product demonstrates knowledge access from supplied evidence, multi-role collaboration, decision support, and workflow execution without reproducing NeoOrg's runtime or domain model.

## 2026-10-13 readiness and deadline verification

- The official homepage still lists October 18, 2026 as the prototype submission deadline. The exact closing hour and time zone have not been verified. Source: https://aibuildercup.com/
- The official FAQ says an end-to-end deployed prototype is sufficient and lists the public repository, deployed URL, deck, and video under three minutes. Source: https://aibuildercup.com/Faqs.html
- The homepage and FAQ now list October 14 as the team-formation closing date, with teams of two to four people. Existing team completeness has not been checked.
- The FishMarket public repository exists but has no commits. Local implementation files are untracked; dependencies are not installed and test/typecheck/build have not run.
- Source inspection confirms an initial UI, strict input/output schemas, a sequential three-role Gemini workflow, Firestore adapter, offline tests, Docker configuration, and Firebase Hosting configuration. This is implementation groundwork, not a verified product.
- Google Cloud CLI is installed and authenticated as the user's account. A read-only listing returns one active project and one open billing account. No FishMarket project is configured in the CLI; cloud API/model quotas, IAM and Firebase readiness are still unverified.
- The pinned React, TypeScript and Vite versions resolve in the package registry.
- A focused new prototype is feasible within the remaining window if cloud/model access is established early. Rebuilding the complete NeoOrg platform is outside the feasible submission scope.

## Group collaboration implementation direction

- User authorized immediate implementation and deployment, deferred PPT/video, and explicitly requested the NeoOrg V3 collaboration architecture as the design reference without copying code.
- Read the complete 1,472-line V3 design. The central principle is one persistent owner per outcome, on-demand contributors, immutable deliveries and independent review; fixed all-agent speaking cycles are not the V3 design.
- Frozen prototype architecture is recorded in docs/group-collaboration.md. Cloud Run will serve both web and API, Firestore will hold messages and workflow checkpoints, and the official Gen AI SDK will call Gemini.
- Created dedicated Google Cloud project fishmarket-abc-2026-4514 successfully. Billing linkage, APIs and runtime permissions are next.
- Official model lifecycle documentation lists Gemini 2.5 Flash retirement during the evaluation window (October 20). Select a newer supported model and prove access with a real call. Source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions
- Initial dependency installation is slow on the preconfigured npm mirror; avoid a Firebase CLI dependency because this release uses Cloud Run directly.
- Cloud Run initial revision fishmarket-00001-br9 is public and serves the group UI plus API. Real health returns Firestore and Vertex AI; the first workflow rejected a model-generated envelope version before any agent publication.
- Corrected the architecture boundary: model wire output is semantic only; protocol versions are constructed by the adapter. A second source deployment is underway.
- Browser verified the local six-message collaboration path and the deployed desktop/mobile landing and composer layouts. Public live chat completion still awaits the corrected revision.
- Second deployed workflow committed admission and two contributions, then rejected an invalid owner action. The official Vertex structured-output documentation does not list const as supported, and explicitly says unsupported fields are ignored. Normalized string const to an equivalent one-value enum in the shared schema adapter, preserving strict application validation. Source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/control-generated-output
