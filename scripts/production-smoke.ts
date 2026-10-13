import { randomUUID } from "node:crypto";
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import type { RoomView } from "../src/contracts/group.js";

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
console.info(JSON.stringify({ gate: "firestore-authority-and-idempotency", roomId: created.room.id, messages: replay.messages.length, independentlyRead: true, privateCapability: true, passed: true }));

const ordinary = await request<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "Reply-only verification" });
const answer = await request<RoomView>("/api/rooms/" + ordinary.room.id + "/messages", ordinary.token, { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Hello! In one sentence, what does a team owner do?", target: "reef", outcomeId: null });
assert.equal(answer.outcomes.length, 0); assert.equal(answer.messages.length, 2); assert.equal(answer.messages[1]!.author, "reef");
console.info(JSON.stringify({ gate: "reply-only-and-member-targeting", passed: true, roomId: ordinary.room.id }));
