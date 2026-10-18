# Progress

## 2026-10-18
- Read current contracts, Collaboration, production Gemini builder, Firestore composition, workspace navigation, UI components and film reference source. Reviewed release baseline; read-only cloud verification started.
- Chose additive create-v3/frozen-profile compatibility rather than rewriting existing room identities or seeding fictional film messages.
- Read frontend-design, planning-with-files and browser-use instructions. Scoped planning files keep prior research journals intact.
- Added deterministic Evals before implementation (initial red: missing RoomSpace module); then implemented layout, exact six portraits, five-profile creation, complete-name mentions and persisted delivery/review views. Offline Gate now passes 80 tests, both typechecks and both builds.
- Actual browser verified creation checklist, roles/avatars, message submission, completed text delivery, Space preview, profile tabs and visible no-external-tools boundary. Existing workspace/draft tests consume current creation catalog; legacy tests still explicitly cover v1/v2.
- Predeploy Node fetch to Firestore timed out twice (including env-proxy flag); switched the read-only QA transport to host-proxy-aware curl, passing auth in stdin rather than arguments or files. No production write or retry occurred in these failed read checks.
