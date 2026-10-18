import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { TEAM_CATALOG, type RoomView } from "../src/contracts/group.js";

const base = process.env.FISHMARKET_URL ?? "https://fishmarket-893821979623.asia-northeast1.run.app";
const cli = process.env.GCLOUD_BIN ?? "/Users/xiewuyi1/.local/google-cloud-sdk/bin/gcloud";
const token = execFileSync(cli, ["auth", "print-access-token"], { encoding: "utf8" }).trim();
const endpoint = "https://firestore.googleapis.com/v1/projects/fishmarket-abc-2026-4514/databases/(default)/documents";
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
function canonical(value: any): any { return Array.isArray(value) ? value.map(canonical) : value && typeof value === "object" ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value; }
const evidence = new URL("../docs/changes/video-ui-cloud/", import.meta.url);
const baseline = new URL("cloud-baseline.local", evidence);
function firestoreRead(url: string) {
  // curl honors the developer host's configured HTTPS proxy; credentials go
  // through stdin, never process arguments, files, output or evidence logs.
  return JSON.parse(execFileSync("curl", ["--silent", "--show-error", "--fail", "--max-time", "55", "--config", "-"], { input: `url = ${JSON.stringify(url)}\nheader = ${JSON.stringify("Authorization: Bearer " + token)}\n`, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }));
}
const mode = process.argv[2];
if (mode === "baseline") {
  const data = firestoreRead(endpoint + "/rooms?pageSize=300");
  assert.ok(!data.nextPageToken, "Increase snapshot paging before deployment");
  const documents = data.documents ?? [];
  assert.equal(documents.filter((doc: any) => doc.fields.run?.mapValue?.fields?.status?.stringValue === "running").length, 0, "Do not switch while a run is active");
  await mkdir(evidence, { recursive: true });
  const snapshot = documents.map((doc: any) => ({ name: doc.name, updateTime: doc.updateTime, hash: digest(canonical(doc.fields)) }));
  await writeFile(baseline, JSON.stringify(snapshot));
  console.info(JSON.stringify({ gate: "predeployment", rooms: documents.length, running: 0, historySnapshot: "hashes only, no tokens or chat content" }));
} else if (mode === "history") {
  const snapshots = JSON.parse(await readFile(baseline, "utf8"));
  for (const snapshot of snapshots) {
    const doc = firestoreRead("https://firestore.googleapis.com/v1/" + snapshot.name);
    assert.equal(doc.updateTime, snapshot.updateTime); assert.equal(digest(canonical(doc.fields)), snapshot.hash);
  }
  console.info(JSON.stringify({ gate: "history-unchanged", rooms: snapshots.length, passed: true }));
} else if (mode === "live") {
  async function api<T>(path: string, roomToken?: string, body?: unknown): Promise<T> {
    const response = await fetch(base + path, { method: body === undefined ? "GET" : "POST", headers: { ...(roomToken ? { "x-room-token": roomToken } : {}), ...(body === undefined ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    assert.ok(response.ok, `API ${path}: ${response.status}`); return response.json();
  }
  const health = await api<{ provider: string; store: string; release: string }>("/api/health");
  assert.equal(health.provider, "vertex-ai"); assert.equal(health.store, "firestore");
  if (process.env.EXPECTED_RELEASE) assert.equal(health.release, process.env.EXPECTED_RELEASE);
  const created = await api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v3", title: "Five-position production verification", members: TEAM_CATALOG.map(member => member.id) });
  assert.deepEqual(created.room.agentProfiles, TEAM_CATALOG); assert.equal(created.room.messages.length, 0);
  const command = { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Prepare a concise written plan for a two-week meeting-improvement experiment. Supplied synthetic facts: eight people attend four 45-minute status meetings each week; decisions are not documented. Include the current person-hours calculation, a decision-log proposal, role-based owners, two measurable criteria and rollback conditions. This is a planning report, not executed work. Use complementary professional contributions where useful, then independently review the report. Do not ask for further input or claim external actions.", target: "harbor", outcomeId: null };
  let result = await api<RoomView>(`/api/rooms/${created.room.id}/messages`, created.token, command);
  for (let i = 0; i < 2 && result.run?.status === "recovery" && result.run.recovery?.code === "EXECUTION_INTERRUPTED"; i++) result = await api<RoomView>(`/api/rooms/${created.room.id}/resume`, created.token, {});
  console.info(JSON.stringify({ gate: "five-position-model", release: health.release, roomId: created.room.id, status: result.run?.status, outcome: result.outcomes.at(-1)?.status, recovery: result.run?.recovery?.code, speakers: result.messages.map(message => message.author) }));
  assert.equal(result.run?.status, "done"); assert.ok(result.outcomes[0]?.deliveries.length); assert.ok(result.outcomes[0]?.reviews.length);
  const outcome = result.outcomes[0]!; assert.equal(outcome.owner, "harbor");
  const reviewer = outcome.reviews.at(-1)!.reviewer; assert.notEqual(reviewer, outcome.owner); assert.ok(!outcome.contributions.some(item => item.agentId === reviewer));
  assert.deepEqual((await api<RoomView>(`/api/rooms/${created.room.id}/messages`, created.token, command)).messages, result.messages);
  const direct = await api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v3", title: "Design position identity verification", members: ["coral", "beacon"] });
  const intro = await api<RoomView>(`/api/rooms/${direct.room.id}/messages`, direct.token, { ...command, requestKey: randomUUID(), body: "@Design - Coral Briefly introduce your permanent position, responsibilities and actual capability boundaries. Can you really generate images or export slides in this cloud prototype? Just answer this question; do not create a project.", target: "coral" });
  assert.equal(intro.outcomes.length, 0); assert.equal(intro.messages.at(-1)?.author, "coral");
  const outsider = await fetch(`${base}/api/rooms/${direct.room.id}/messages`, { method: "POST", headers: { "x-room-token": direct.token, "Content-Type": "application/json" }, body: JSON.stringify({ ...command, requestKey: randomUUID(), target: "reef" }) });
  assert.equal(outsider.status, 400); assert.deepEqual((await api<RoomView>(`/api/rooms/${direct.room.id}`, direct.token)).messages, intro.messages);
  for (const group of [created, direct]) {
    const document = firestoreRead(endpoint + "/rooms/" + group.room.id);
    assert.equal(document.fields.members.arrayValue.values.length, group.room.members.length);
    assert.deepEqual(document.fields.agentProfiles.arrayValue.values.map((profile: any) => profile.mapValue.fields.name.stringValue), group.room.agentProfiles.map(profile => profile.name));
  }
  const legacy = await api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "Legacy creation compatibility" });
  assert.equal(legacy.room.agentProfiles[0]?.name, "Harbor"); assert.equal(legacy.room.members.length, 4);
  assert.equal((await fetch(base + `/api/rooms/${created.room.id}`)).status, 404);
  console.info(JSON.stringify({ gate: "new-and-legacy-authority", passed: true, independentFirestoreRead: true, idempotent: true, outsiderRejected: true, designIntroduction: intro.messages.at(-1)?.body }));
} else throw new Error("Use baseline, history or live");
