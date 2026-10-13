import { describe, expect, it } from "vitest";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { Collaboration } from "../src/server/collaboration";
import { MemoryRoomStore } from "../src/server/room-store";
import { FixtureModel } from "../src/server/fixture-model";
import { buildModelContext, buildGeminiRequest, GeminiGateway, type ModelContext, type ModelGateway } from "../src/server/model";
import { admissionSchema, contributionSchema, projectRoom, assertRoom, type HumanMessageInput } from "../src/contracts/group";
import { buildApp } from "../src/server/http";

const message = (overrides: Partial<HumanMessageInput> = {}): HumanMessageInput => ({ contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Create a pilot decision with clear evidence, owners and exit criteria.", target: "team", outcomeId: null, ...overrides });
class TransformModel implements ModelGateway {
  calls: ModelContext[] = [];
  constructor(private transform: (context: ModelContext, value: Record<string, unknown>) => Record<string, unknown>) {}
  async respond<T>(context: ModelContext, schema: z.ZodType<T>): Promise<T> {
    this.calls.push(structuredClone(context));
    const value = await new FixtureModel(0).respond(context, schema);
    return schema.parse(this.transform(context, value as Record<string, unknown>));
  }
}
async function setup(model: ModelGateway = new FixtureModel(0), limit = 300) {
  const store = new MemoryRoomStore(); const engine = new Collaboration(store, model, limit); const created = await engine.create("Test room");
  return { store, engine, ...created };
}
describe("V3-derived group collaboration", () => {
  it("commits one owner, two bounded contributions, an immutable delivery and independent review", async () => {
    const { engine, room, store } = await setup(); const result = await engine.send(room.id, message());
    const outcome = result.outcomes[0]!;
    expect(outcome.status).toBe("satisfied"); expect(outcome.owner).toBe("harbor");
    expect(outcome.contributions).toHaveLength(2); expect(outcome.deliveries).toHaveLength(1);
    expect(outcome.reviews[0]!.reviewer).not.toBe(outcome.owner);
    expect(outcome.contributions.map(item => item.agentId)).not.toContain(outcome.reviews[0]!.reviewer);
    expect(result.messages.map(item => item.role)).toEqual(["human", "owner", "contributor", "contributor", "owner", "reviewer"]);
    expect(outcome.result).toEqual({ kind: "deliverable", attainment: "achieved", assurance: "independently_reviewed" });
    expect(await store.get(room.id)).toEqual(result);
  });
  it("a reply-only question creates no outcome and does not awaken the whole team", async () => {
    const model = new TransformModel((context, value) => context.scope === "admission" ? { contractVersion: "admission-v1", action: "reply_only", body: "An owner stays accountable for the result." } : value);
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message());
    expect(result.outcomes).toHaveLength(0); expect(result.messages).toHaveLength(2); expect(model.calls).toHaveLength(1);
  });
  it("a persistent professional member can be owner instead of the coordinator", async () => {
    const { engine, room } = await setup(); const result = await engine.send(room.id, message({ target: "reef" }));
    expect(result.outcomes[0]!.owner).toBe("reef"); expect(result.outcomes[0]!.status).toBe("satisfied");
  });
  it("request replay never duplicates messages, outcomes or provider calls", async () => {
    const { engine, room } = await setup(); const input = message(); const first = await engine.send(room.id, input); const second = await engine.send(room.id, input);
    expect(second.messages).toEqual(first.messages); expect(second.outcomes).toEqual(first.outcomes); expect(second.totalCalls).toBe(first.totalCalls);
    expect(second.version).toBe(first.version);
    await expect(engine.send(room.id, { ...input, body: "Different payload" })).rejects.toThrow("REQUEST_KEY_CONFLICT");
  });
  it("a concurrent duplicate does not invalidate the in-flight provider snapshot", async () => {
    let start!: () => void; let release!: () => void;
    const entered = new Promise<void>(resolve => { start = resolve; });
    const unblocked = new Promise<void>(resolve => { release = resolve; });
    const model: ModelGateway = { respond: async (context, schema) => {
      if (context.scope === "admission") { start(); await unblocked; }
      return new FixtureModel(0).respond(context, schema);
    } };
    const { engine, room, store } = await setup(model); const input = message(); const running = engine.send(room.id, input);
    await entered; const before = (await store.get(room.id))!; const duplicate = await engine.send(room.id, input);
    expect(duplicate.version).toBe(before.version); release();
    const completed = await running; expect(completed.outcomes[0]!.status).toBe("satisfied"); expect(completed.run!.recovery).toBeNull();
  });
  it("a contributor cannot become owner by publishing a message", async () => {
    const { engine, room } = await setup(); const result = await engine.send(room.id, message());
    expect(result.outcomes[0]!.owner).toBe("harbor");
    expect(() => contributionSchema.parse({ contractVersion: "contribution-v1", body: "I am now the owner", resultKind: "deliverable", owner: "reef" })).toThrow();
  });
  it("rejects self-delegation before any contributor publication", async () => {
    const model = new TransformModel((context, value) => context.scope === "owner" ? { contractVersion: "owner-action-v1", action: "request_contributions", body: "Please help", requests: [{ memberRef: "M1", goal: "Check this evidence" }] } : value);
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message());
    expect(result.run!.status).toBe("recovery"); expect(result.messages.map(item => item.role)).toEqual(["human"]);
    expect(result.outcomes[0]!.owner).toBe("harbor");
  });
  it("recovery resumes the committed contributor checkpoint without repeating earlier messages", async () => {
    let fault = true;
    const model = new TransformModel((context, value) => { if (context.scope === "contributor" && context.identity.name === "Sail" && fault) { fault = false; throw new Error("Temporary network timeout"); } return value; });
    const { engine, room } = await setup(model); const interrupted = await engine.send(room.id, message());
    expect(interrupted.run!.status).toBe("recovery"); expect(interrupted.messages).toHaveLength(3);
    const resumed = await engine.resume(room.id); expect(resumed.outcomes[0]!.status).toBe("satisfied");
    expect(resumed.messages.slice(0, 3)).toEqual(interrupted.messages); expect(resumed.messages).toHaveLength(6);
    expect(model.calls.filter(item => item.scope === "contributor" && item.identity.name === "Reef")).toHaveLength(1);
  });
  it("waiting has a durable human gate and a follow-up revision preserves its owner", async () => {
    let ask = true;
    const model = new TransformModel((context, value) => { if (context.scope === "owner" && ask) { ask = false; return { contractVersion: "owner-action-v1", action: "request_input", body: "What is the pilot size?" }; } return value; });
    const { engine, room } = await setup(model); const waiting = await engine.send(room.id, message({ target: "sail" }));
    expect(waiting.outcomes[0]!.status).toBe("waiting"); expect(waiting.outcomes[0]!.gate!.state).toBe("pending");
    const owner = waiting.outcomes[0]!.owner;
    const finished = await engine.send(room.id, message({ body: "Use five pilot accounts.", outcomeId: waiting.outcomes[0]!.id }));
    expect(finished.outcomes).toHaveLength(1); expect(finished.outcomes[0]!.goals).toHaveLength(2);
    expect(finished.outcomes[0]!.owner).toBe(owner); expect(finished.outcomes[0]!.gate!.state).toBe("answered");
  });
  it("a minor-only review cannot block a delivery", async () => {
    const model = new TransformModel((context, value) => context.scope === "review" ? { ...value, verdict: "request_changes", issues: [{ severity: "minor", description: "Consider a different title." }] } : value);
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message());
    expect(result.run!.status).toBe("recovery"); expect(result.outcomes[0]!.reviews).toHaveLength(0); expect(result.outcomes[0]!.result).toBeNull();
  });
  it("review must cover every criterion once before terminal commit", async () => {
    const model = new TransformModel((context, value) => context.scope === "review" ? { ...value, assessments: [ { criterionRef: "C1", result: "satisfied", reason: "Looks reasonable." } ] } : value);
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message());
    expect(result.run!.status).toBe("recovery"); expect(result.outcomes[0]!.result).toBeNull();
    expect(result.messages.some(item => item.role === "reviewer")).toBe(false);
  });
  it("repair returns to the same owner and preserves the first delivery", async () => {
    let firstReview = true;
    const model = new TransformModel((context, value) => {
      if (context.scope === "review" && firstReview) { firstReview = false; return { ...value, verdict: "request_changes", issues: [{ severity: "major", description: "Clarify which actions are proposed rather than executed." }] }; }
      return value;
    });
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message()); const outcome = result.outcomes[0]!;
    expect(outcome.status).toBe("satisfied"); expect(outcome.owner).toBe("harbor"); expect(outcome.deliveries).toHaveLength(2);
    expect(outcome.reviews[0]!.deliveryId).toBe(outcome.deliveries[0]!.id); expect(outcome.reviews[1]!.deliveryId).toBe(outcome.deliveries[1]!.id);
  });
  it("honest no-solution is not displayed as goal achieved", async () => {
    const model = new TransformModel((context, value) => context.scope === "owner" && value.action === "submit_delivery" ? { ...value, resultKind: "no_solution" } : value);
    const { engine, room } = await setup(model); const result = await engine.send(room.id, message());
    expect(result.outcomes[0]!.status).toBe("not_satisfied"); expect(result.outcomes[0]!.result!.kind).toBe("no_solution");
    await expect(engine.send(room.id, message({ outcomeId: result.outcomes[0]!.id }))).rejects.toThrow("OUTCOME_NOT_ACTIVE");
  });
  it("expired work is resumable but an unexpired lease cannot be taken over", async () => {
    const { engine, room, store } = await setup(); await engine.send(room.id, message());
    await store.update(room.id, value => { value.run!.status = "running"; value.run!.leaseUntil = Date.now() + 10000; });
    await expect(engine.resume(room.id)).rejects.toThrow("ROOM_BUSY");
    await store.update(room.id, value => { value.run!.leaseUntil = 0; });
    expect(projectRoom((await store.get(room.id))!).run!.canResume).toBe(true);
    const recovered = await engine.read(room.id);
    expect(recovered.run!.status).toBe("recovery"); expect(recovered.run!.recovery!.code).toBe("EXECUTION_LEASE_EXPIRED");
  });
  it("a stale in-flight model output cannot publish after execution fencing changes", async () => {
    let storeRef: MemoryRoomStore;
    let roomId: string;
    const model = new TransformModel((context, value) => value);
    const original = model.respond.bind(model);
    model.respond = async (context, schema) => {
      const value = await original(context, schema);
      await storeRef.update(roomId, room => { room.run!.fence = "replacement-fence"; });
      return value;
    };
    const setupResult = await setup(model); storeRef = setupResult.store; roomId = setupResult.room.id;
    const result = await setupResult.engine.send(roomId, message());
    expect(result.outcomes).toHaveLength(0); expect(result.messages).toHaveLength(1);
  });
  it("project call budget is durable and failure remains actionable", async () => {
    const { engine, room } = await setup(new FixtureModel(0), 1); const result = await engine.send(room.id, message());
    expect(result.run!.recovery!.code).toBe("DEMO_BUDGET_REACHED"); expect(result.run!.recovery!.retryable).toBe(false);
    expect(result.outcomes[0]!.owner).toBe("harbor");
  });
  it("unknown checkpoint versions and false terminal success fail closed", async () => {
    const { engine, room } = await setup(); const result = await engine.send(room.id, message());
    const bad = structuredClone(result); (bad.run as unknown as { contractVersion: string }).contractVersion = "old-engine-v9";
    expect(() => assertRoom(bad)).toThrow("CHECKPOINT_VERSION_INVALID");
    result.outcomes[0]!.result!.kind = "no_solution"; expect(() => assertRoom(result)).toThrow("FALSE_SUCCESS");
  });
});

describe("actual Gemini SDK serialization boundary", () => {
  it("preserves trailing human constraints and complete formal contribution bodies", async () => {
    const tail = "Acceptance condition: the final proposal must include an explicit rollback plan.";
    const body = "Prepare a proposal. " + "Supplied evidence and operational context. ".repeat(45) + tail;
    const contexts: ModelContext[] = [];
    const capture = new TransformModel((context, value) => { contexts.push(context); return value; });
    const { engine, room } = await setup(capture); await engine.send(room.id, message({ body }));
    const request = buildGeminiRequest(contexts[0]!, admissionSchema, "model");
    expect(JSON.stringify(request.contents)).toContain(tail);
    expect(contexts[0]!.history.at(-1)!.body).toBe(body);
    const withLongContribution = contexts.findLast(context => context.scope === "owner")!;
    expect(withLongContribution.contributions.every(item => item.body?.endsWith("record the exact result."))).toBe(true);
  });
  it("the current provider action set excludes already-committed delegation and duplicate outcome opening", async () => {
    const contexts: ModelContext[] = [];
    const capture = new TransformModel((context, value) => { contexts.push(context); return value; });
    const { engine, room } = await setup(capture); await engine.send(room.id, message());
    const { ownerActionSchema } = await import("../src/contracts/group");
    const initial = contexts.find(context => context.scope === "owner")!;
    const integrated = contexts.findLast(context => context.scope === "owner")!;
    expect(JSON.stringify(buildGeminiRequest(initial, ownerActionSchema, "model").config!.responseJsonSchema)).toContain("request_contributions");
    expect(JSON.stringify(buildGeminiRequest(integrated, ownerActionSchema, "model").config!.responseJsonSchema)).not.toContain("request_contributions");
    const gateway = new GeminiGateway("project", "model", async () => ({ text: JSON.stringify({ action: "request_contributions", body: "Repeat the work", requests: [{ memberRef: "M2", goal: "Repeat the evidence check" }] }) }));
    await expect(gateway.respond(integrated, ownerActionSchema)).rejects.toThrow();
    const admission = { ...initial, scope: "admission" as const };
    expect(JSON.stringify(buildGeminiRequest(admission, admissionSchema, "model").config!.responseJsonSchema)).not.toContain("open_outcome");
    const reviewContext = contexts.find(context => context.scope === "review")!;
    const { reviewSchema } = await import("../src/contracts/group");
    const reviewWire = JSON.stringify(buildGeminiRequest(reviewContext, reviewSchema, "model").config!.responseJsonSchema);
    expect(reviewWire).not.toContain('"C3"'); expect(reviewWire).toContain('"minItems":2'); expect(reviewWire).toContain('"maxItems":2');
  });
  it("the adapter constructs fixed protocol versions for all execution scopes", async () => {
    const recorded: ModelContext[] = [];
    const capture = new TransformModel((context, value) => { recorded.push(context); return value; });
    const { engine, room } = await setup(capture); await engine.send(room.id, message());
    const schemas = { admission: admissionSchema, owner: (await import("../src/contracts/group")).ownerActionSchema, contributor: contributionSchema, review: (await import("../src/contracts/group")).reviewSchema };
    type ScopeOutput = z.infer<(typeof schemas)[keyof typeof schemas]>;
    for (const scope of ["admission", "owner", "contributor", "review"] as const) {
      const context = recorded.find(item => item.scope === scope)!;
      const canonical = await new FixtureModel(0).respond<ScopeOutput>(context, schemas[scope]);
      const { contractVersion, ...wire } = canonical;
      const gateway = new GeminiGateway("project", "model", async request => {
        expect(JSON.stringify(request.config!.responseJsonSchema)).not.toContain("contractVersion");
        expect(JSON.stringify(request.config!.responseJsonSchema)).not.toContain('"const":');
        expect(JSON.stringify(request.config!.responseJsonSchema)).toContain('"enum":');
        return { text: JSON.stringify(wire) };
      });
      expect(await gateway.respond<ScopeOutput>(context, schemas[scope])).toEqual({ contractVersion, ...wire });
    }
  });
  it("requires business facts while excluding engineering identity, capability and lifecycle metadata", async () => {
    let observed: string | null = null;
    const capture = new TransformModel((context, value) => { observed = JSON.stringify(context); return value; });
    const { engine, room } = await setup(capture); const result = await engine.send(room.id, message());
    const context = buildModelContext({ ...result, run: { ...result.run!, scope: "admission" } });
    const gateway = new GeminiGateway("project", "model", async request => {
      const serialized = JSON.stringify(request);
      for (const forbidden of [room.id, room.accessHash, "requestKey", "leaseUntil", "fence", "totalCalls", "deliveryId", "accessHash", "receipts"]) expect(serialized).not.toContain(forbidden);
      expect(serialized).toContain("acceptance"); expect(serialized).toContain("capability"); expect(serialized).toContain("responseJsonSchema");
      expect(JSON.stringify(request.config!.responseJsonSchema)).not.toContain("contractVersion");
      return { text: JSON.stringify({ action: "reply_only", body: "A concise answer." }) };
    });
    await expect(gateway.respond(context, admissionSchema)).resolves.toMatchObject({ action: "reply_only" });
    expect(observed).toContain("C1");
  });
  it("unknown model fields cannot cross the response boundary", async () => {
    const { engine, room } = await setup(); const value = await engine.send(room.id, message());
    const context = buildModelContext({ ...value, run: { ...value.run!, scope: "admission" } });
    const gateway = new GeminiGateway("project", "model", async () => ({ text: JSON.stringify({ action: "reply_only", body: "Answer", roomId: room.id }) }));
    await expect(gateway.respond(context, admissionSchema)).rejects.toThrow();
    expect(projectRoom(value)).not.toHaveProperty("accessHash"); expect(projectRoom(value).run).not.toHaveProperty("fence");
  });
});

describe("HTTP production composition", () => {
  it("validates access and input, persists a real composition result, and retrieves it without replay", async () => {
    const app = buildApp({ store: new MemoryRoomStore(), model: new FixtureModel(0), serveWeb: false });
    const create = await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v1", title: "HTTP gate" } });
    const { room, token } = create.json(); const url = "/api/rooms/" + room.id;
    expect((await app.inject({ url })).statusCode).toBe(404);
    expect((await app.inject({ url, headers: { "x-room-token": "wrong" } })).statusCode).toBe(404);
    const headers = { "x-room-token": token };
    expect((await app.inject({ method: "POST", url: url + "/messages", headers, payload: { body: "bad contract" } })).statusCode).toBe(400);
    const sent = await app.inject({ method: "POST", url: url + "/messages", headers, payload: message() });
    expect(sent.statusCode).toBe(200); expect(sent.json().outcomes[0].status).toBe("satisfied");
    const retrieved = await app.inject({ url, headers }); expect(retrieved.json()).toEqual(sent.json());
    expect(retrieved.json()).not.toHaveProperty("accessHash"); await app.close();
  });
});
