# Progress

## 2026-10-18
- Read current contracts, Collaboration, production Gemini builder, Firestore composition, workspace navigation, UI components and film reference source. Reviewed release baseline; read-only cloud verification started.
- Chose additive create-v3/frozen-profile compatibility rather than rewriting existing room identities or seeding fictional film messages.
- Read frontend-design, planning-with-files and browser-use instructions. Scoped planning files keep prior research journals intact.
- Added deterministic Evals before implementation (initial red: missing RoomSpace module); then implemented layout, exact six portraits, five-profile creation, complete-name mentions and persisted delivery/review views. Offline Gate now passes 80 tests, both typechecks and both builds.
- Actual browser verified creation checklist, roles/avatars, message submission, completed text delivery, Space preview, profile tabs and visible no-external-tools boundary. Existing workspace/draft tests consume current creation catalog; legacy tests still explicitly cover v1/v2.
- Predeploy Node fetch to Firestore timed out twice (including env-proxy flag); switched the read-only QA transport to host-proxy-aware curl, passing auth in stdin rather than arguments or files. No production write or retry occurred in these failed read checks.
- Diagnosed macOS system proxy; explicitly using the existing local proxy completed the predeployment snapshot: 27 rooms, zero running records. Postdeployment all 27 canonical field hashes and update times remained unchanged.
- Committed/pushed 77755e2; source CI 39142263442 passed. Cloud Build 94008041-4210-455e-a746-e5e16c7b8c9c succeeded; revision fishmarket-00012-cmx serves 100% traffic. Only the image and release tag changed.
- Real deployed Gemini/Firestore Gate passed: five-position reviewed written delivery, targeted Design - Coral actual identity/boundary answer, selected-pair outsider rejection, idempotent replay, separate Firestore reads and v1 creation compatibility. Exact public JS/CSS/logo/six avatar bytes match the build, with portrait provenance independently checked against film files.
- Remote browser-tab attachment timed out; local actual browser and production asset/model/storage evidence remain explicitly separated in the release record. No remote-browser success is claimed from an HTTP response alone.
- Saved local desktop screenshot `local-browser.jpg` (offline verification conversation). Closed temporary local UI test tabs and reset viewport override. The accepted film and Alpha's local services were untouched.
