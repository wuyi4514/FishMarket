import { randomUUID } from "node:crypto";
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { MEMBERS, agentProfileSchema, type AgentId, type RoomView } from "../src/contracts/group.js";
import { mentionTarget } from "../src/web/chat-interactions.js";

const base = process.env.FISHMARKET_URL;
if (!base || !base.startsWith("https://")) throw new Error("Set FISHMARKET_URL to the deployed HTTPS URL");
async function request<T>(path: string, token?: string, payload?: unknown): Promise<T> {
  const response = await fetch(base + path, {
    method: payload ? "POST" : "GET",
    headers: { ...(token ? { "x-room-token": token } : {}), ...(payload ? { "Content-Type": "application/json" } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {})
  });
  const value = await response.json(); assert.ok(response.ok, JSON.stringify(value)); return value;
}
const health = await request<{ status: string; store: string; provider: string; model: string; release: string }>("/api/health");
assert.equal(health.store, "firestore"); assert.equal(health.provider, "vertex-ai");
console.info(JSON.stringify({ gate: "production-health", ...health }));
const created = await request<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "Production release verification" });
assert.deepEqual(created.room.agentProfiles, MEMBERS);
for (const profile of created.room.agentProfiles) agentProfileSchema.parse(profile);
const input = {
  contractVersion: "human-message-v1", requestKey: randomUUID(), target: "team", outcomeId: null,
  body: "Help us decide whether to launch a small pilot next week. Five teams tested onboarding: four completed independently; one needed operator help. No repeated recovery test is available. Produce an evidence-based pilot recommendation and practical next steps with responsible roles and exit criteria. Ask two complementary teammates to contribute, integrate their findings, and have an independent teammate review the proposal. Treat any proposed actions as not yet executed."
};
const started = Date.now();
let result = await request<RoomView>("/api/rooms/" + created.room.id + "/messages", created.token, input);
for (let recovery = 0; recovery < 2 && result.run?.status === "recovery" && result.run.recovery?.code === "EXECUTION_INTERRUPTED"; recovery++) {
  console.info(JSON.stringify({ gate: "transient-recovery", attempt: recovery + 1, savedMessages: result.messages.length, owner: result.outcomes.at(-1)?.owner }));
  const previousMessages = result.messages;
  result = await request<RoomView>("/api/rooms/" + created.room.id + "/resume", created.token, {});
  assert.deepEqual(result.messages.slice(0, previousMessages.length), previousMessages, "Recovery must preserve already committed messages");
}
for (let humanTurn = 0; humanTurn < 2 && result.outcomes.at(-1)?.status === "waiting"; humanTurn++) {
  const waiting = result.outcomes.at(-1)!;
  console.info(JSON.stringify({ gate: "human-input", owner: waiting.owner, question: waiting.gate?.question }));
  result = await request<RoomView>("/api/rooms/" + created.room.id + "/messages", created.token, {
    contractVersion: "human-message-v1", requestKey: randomUUID(), target: "team", outcomeId: waiting.id,
    body: "For this synthetic verification scenario, use a five-team, two-week pilot. Keep current pilot facts unchanged. Assume QA lead owns recovery testing, Product lead owns the pilot decision and Support lead owns the guide. Propose twenty repeatable recovery tests as an exit criterion and a rollback if onboarding requires help. These are planning assumptions, not executed actions. Document every remaining unknown as a caveat. This request asks only for a complete recommendation and proposed plan; do not require proof of future execution to deliver that report."
  });
}
console.info(JSON.stringify({ gate: "gemini-workflow", seconds: (Date.now() - started) / 1000, status: result.run?.status, recovery: result.run?.recovery, speakers: result.messages.map(message => ({ author: message.author, role: message.role })), outcomes: result.outcomes.map(outcome => ({ owner: outcome.owner, status: outcome.status, result: outcome.result })) }));
assert.equal(result.run?.status, "done");
const outcome = result.outcomes.at(-1)!;
assert.ok(outcome, "A substantial request must create an outcome");
assert.ok(outcome.contributions.length >= 2, "The collaboration request must have complementary contributions");
assert.ok(outcome.deliveries.length >= 1); assert.ok(outcome.reviews.length >= 1);
assert.notEqual(outcome.reviews.at(-1)!.reviewer, outcome.owner);
assert.ok(outcome.result); assert.equal(outcome.result.assurance, "independently_reviewed");
const reread = await request<RoomView>("/api/rooms/" + created.room.id, created.token);
assert.deepEqual(reread, result);
const replay = await request<RoomView>("/api/rooms/" + created.room.id + "/messages", created.token, input);
assert.deepEqual(replay.messages, result.messages); assert.deepEqual(replay.outcomes, result.outcomes);
const denied = await fetch(base + "/api/rooms/" + created.room.id); assert.equal(denied.status, 404);

// Independent infrastructure read: verify the actual Firestore document, not only API output.
const project = process.env.GOOGLE_CLOUD_PROJECT ?? "fishmarket-abc-2026-4514";
const cli = process.env.GCLOUD_BIN ?? "/Users/xiewuyi1/.local/google-cloud-sdk/bin/gcloud";
const accessToken = execFileSync(cli, ["auth", "print-access-token"], { encoding: "utf8" }).trim();
const documentResponse = await fetch("https://firestore.googleapis.com/v1/projects/" + project + "/databases/(default)/documents/rooms/" + created.room.id, { headers: { Authorization: "Bearer " + accessToken } });
assert.ok(documentResponse.ok, "Independent Firestore read must succeed");
const document = await documentResponse.json() as { fields: Record<string, { stringValue?: string; arrayValue?: { values?: unknown[] } }> };
assert.equal(document.fields.id!.stringValue, created.room.id);
assert.equal(document.fields.messages!.arrayValue!.values!.length, replay.messages.length);
type FirestoreValue = { stringValue?: string; arrayValue?: { values?: FirestoreValue[] }; mapValue?: { fields?: Record<string, FirestoreValue> } };
function decodeProfileValue(value: FirestoreValue): unknown {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeProfileValue);
  if (value.mapValue) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, child]) => [key, decodeProfileValue(child)]));
  throw new Error("UNEXPECTED_PROFILE_VALUE");
}
assert.deepEqual(decodeProfileValue(document.fields.agentProfiles as FirestoreValue), result.agentProfiles, "Firestore and public profile facts must agree");
console.info(JSON.stringify({ gate: "firestore-authority-and-idempotency", roomId: created.room.id, messages: replay.messages.length, independentlyRead: true, privateCapability: true, passed: true }));

const ordinary = await request<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "Reply-only verification" });
assert.equal(ordinary.room.messages.length, 0); assert.equal(ordinary.room.outcomes.length, 0); assert.equal(ordinary.room.run, null);
assert.notEqual(ordinary.room.id, created.room.id); assert.notEqual(ordinary.token, created.token);
const wrongCapability = await fetch(base + "/api/rooms/" + created.room.id, { headers: { "x-room-token": ordinary.token } }); assert.equal(wrongCapability.status, 404);
const answer = await request<RoomView>("/api/rooms/" + ordinary.room.id + "/messages", ordinary.token, { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Hello Reef! Briefly introduce your permanent position, its three main responsibilities and your actual capability boundaries in this room. Use your supplied identity, not a generic description. This is just a quick introduction, not a new project.", target: "reef", outcomeId: null });
assert.equal(answer.outcomes.length, 0); assert.equal(answer.messages.length, 2); assert.equal(answer.messages[1]!.author, "reef");
assert.deepEqual((await request<RoomView>("/api/rooms/" + created.room.id, created.token)).messages, result.messages, "A fresh room must not change the prior room");
console.info(JSON.stringify({ gate: "fresh-room-isolation-and-identity", passed: true, roomId: ordinary.room.id, profile: answer.agentProfiles.find(member => member.id === "reef"), actualGeminiIntroduction: answer.messages[1]!.body }));

// The smallest group and a three-Agent group must use the SAME production
// catalog/builders as the four-Agent scenario, not a reduced handwritten model.
for (const members of [["reef", "beacon"], ["harbor", "reef", "sail"]] as AgentId[][]) {
  const profiles = MEMBERS.filter(member => members.includes(member.id));
  const group = await request<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v2", title: `Selected ${members.length}-Agent release verification`, members });
  assert.deepEqual(group.room.members, members); assert.deepEqual(group.room.agentProfiles, profiles);
  const outsider = MEMBERS.find(member => !members.includes(member.id))!;
  const before = await request<RoomView>(`/api/rooms/${group.room.id}`, group.token);
  const forbidden = await fetch(`${base}/api/rooms/${group.room.id}/messages`, { method: "POST", headers: { "x-room-token": group.token, "Content-Type": "application/json" }, body: JSON.stringify({ ...input, requestKey: randomUUID(), target: outsider.id }) });
  assert.equal(forbidden.status, 400); assert.equal((await forbidden.json()).error, "TARGET_NOT_A_MEMBER");
  assert.deepEqual(await request<RoomView>(`/api/rooms/${group.room.id}`, group.token), before, "Outsider target must cause no publication or execution");
  const body = `@${profiles[0]!.name} Produce a concise two-week meeting-improvement experiment. Eight people attend four 45-minute meetings weekly and decisions are undocumented. Include current person-hours, a proposed decision log, role-based owners, measurable success and rollback criteria. These are synthetic supplied facts and planning assumptions, not executed work. ${members.length > 2 ? "Ask one eligible teammate for a complementary contribution and integrate it." : "Work directly with the supplied facts, without requesting contributors."} Submit the complete report for independent review; no human action approval or external research is needed for this planning deliverable.`;
  const command = { ...input, body, target: mentionTarget(body, profiles), requestKey: randomUUID() };
  const start = Date.now(); let small = await request<RoomView>(`/api/rooms/${group.room.id}/messages`, group.token, command);
  for (let attempt = 0; attempt < 2 && small.run?.status === "recovery" && small.run.recovery?.code === "EXECUTION_INTERRUPTED"; attempt++) {
    const saved = small.messages;
    small = await request<RoomView>(`/api/rooms/${group.room.id}/resume`, group.token, {});
    assert.deepEqual(small.messages.slice(0, saved.length), saved);
  }
  console.info(JSON.stringify({ gate: "selected-members-gemini", members, roomId: group.room.id, seconds: (Date.now() - start) / 1000, status: small.run?.status, recovery: small.run?.recovery, outcome: small.outcomes.at(-1)?.status, speakers: small.messages.map(message => ({ author: message.author, role: message.role })) }));
  assert.equal(small.run?.status, "done"); const work = small.outcomes.at(-1)!;
  assert.equal(work.owner, profiles[0]!.id); assert.equal(work.status, "satisfied");
  assert.equal(work.contributions.length, members.length - 2); assert.ok(work.deliveries.length); assert.ok(work.reviews.length);
  const reviewer = work.reviews.at(-1)!.reviewer;
  assert.notEqual(reviewer, work.owner); assert.ok(!work.contributions.some(item => item.agentId === reviewer));
  assert.ok(small.messages.every(message => message.author === "human" || members.includes(message.author as AgentId)));
  assert.deepEqual((await request<RoomView>(`/api/rooms/${group.room.id}/messages`, group.token, command)).messages, small.messages);
  const storedResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/rooms/${group.room.id}`, { headers: { Authorization: "Bearer " + accessToken } });
  assert.ok(storedResponse.ok); const stored = await storedResponse.json();
  assert.deepEqual(decodeProfileValue(stored.fields.members), members); assert.deepEqual(decodeProfileValue(stored.fields.agentProfiles), profiles);
  assert.equal(stored.fields.messages.arrayValue.values.length, small.messages.length);
  assert.deepEqual((await request<RoomView>(`/api/rooms/${group.room.id}`, group.token)).members, members);
  console.info(JSON.stringify({ gate: "selected-members-firestore-replay-and-authority", roomId: group.room.id, members, messages: small.messages.length, reviewer, passed: true }));
}
