import { randomUUID } from "node:crypto";
import type { z } from "zod";
import { describe, expect, it } from "vitest";
import { MEMBERS, admissionSchema, ownerActionSchema, contributionSchema, reviewSchema, projectRoom, type AgentId, type HumanMessageInput } from "../src/contracts/group";
import { Collaboration } from "../src/server/collaboration";
import { FixtureModel } from "../src/server/fixture-model";
import { buildApp } from "../src/server/http";
import { GeminiGateway, type ModelContext, type ModelGateway } from "../src/server/model";
import { MemoryRoomStore } from "../src/server/room-store";

const input = (target: HumanMessageInput["target"] = "team", outcomeId: string | null = null): HumanMessageInput => ({ contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Produce an evidence-aware pilot recommendation with clear next steps.", target, outcomeId });
const protocols = { admission: admissionSchema, owner: ownerActionSchema, contributor: contributionSchema, review: reviewSchema };
const subsets = Array.from({ length: 15 }, (_, index) => MEMBERS.filter((_, bit) => (index + 1) & (1 << bit)).map(member => member.id)).filter(ids => ids.length >= 2);

describe("selected members through the production Gemini and repository boundaries", () => {
  it.each(subsets.map(ids => [ids.join(","), ids] as const))("closes all owner/reviewer assignments for %s without invoking an outsider", async (_name, ids) => {
    for (const target of ids) {
      const contexts: ModelContext[] = [];
      const gateway = new GeminiGateway("project", "model", async request => {
        const context = JSON.parse((request.contents as Array<{ parts: Array<{ text: string }> }>)[0]!.parts[0]!.text) as ModelContext;
        contexts.push(context);
        const serialized = JSON.stringify(request);
        for (const outsider of MEMBERS.filter(member => !ids.includes(member.id))) expect(serialized).not.toContain(outsider.name);
        for (const field of ["accessHash", "leaseUntil", "fence", "receipts", "agent-profile-v1"]) expect(serialized).not.toContain(field);
        const result = await new FixtureModel(0).respond<z.infer<(typeof protocols)[keyof typeof protocols]>>(context, protocols[context.scope]);
        const { contractVersion: _version, ...wire } = result;
        return { text: JSON.stringify(wire) };
      });
      const store = new MemoryRoomStore(); const engine = new Collaboration(store, gateway);
      const created = await engine.create("Selected group", [...ids]);
      const result = await engine.send(created.room.id, input(target)); const outcome = result.outcomes[0]!;
      expect(result.run?.status).toBe("done"); expect(outcome.owner).toBe(target); expect(outcome.status).toBe("satisfied");
      expect(outcome.contributions).toHaveLength(ids.length - 2);
      const reviewer = outcome.reviews.at(-1)!.reviewer;
      expect(reviewer).not.toBe(target); expect(outcome.contributions.map(item => item.agentId)).not.toContain(reviewer);
      expect(result.members).toEqual(ids); expect(projectRoom(result).agentProfiles.map(profile => profile.id)).toEqual(ids);
      expect(result.messages.every(message => message.author === "human" || ids.includes(message.author as AgentId))).toBe(true);
      expect(contexts.every(context => context.contractVersion === "group-model-context-v3" && context.members.length === ids.length)).toBe(true);
      expect(await store.get(result.id)).toEqual(result);
    }
  });

  it("rejects invalid creation and out-of-group targets before messages, receipts or model work", async () => {
    const store = new MemoryRoomStore(); let calls = 0;
    const model: ModelGateway = { respond: async (context, schema) => { calls++; return new FixtureModel(0).respond(context, schema); } };
    const app = buildApp({ store, model, serveWeb: false });
    try {
      for (const members of [[], ["harbor"], ["harbor", "harbor"], ["reef", "outside"], ["reef", "sail", "beacon", "harbor", "reef"]]) {
        expect((await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v2", title: "Invalid", members } })).statusCode).toBe(400);
      }
      const response = await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v2", title: "Pair", members: ["reef", "sail"] } });
      expect(response.statusCode).toBe(201); const created = response.json();
      const before = await store.get(created.room.id);
      const denied = await app.inject({ method: "POST", url: `/api/rooms/${created.room.id}/messages`, headers: { "x-room-token": created.token }, payload: input("harbor") });
      expect(denied.statusCode).toBe(400); expect(denied.json().error).toBe("TARGET_NOT_A_MEMBER");
      expect(await store.get(created.room.id)).toEqual(before); expect(calls).toBe(0);
      const legacy = await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v1", title: "Legacy" } });
      expect(legacy.json().room.members).toEqual(MEMBERS.map(member => member.id));
      expect((await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v1", title: "Invalid", members: ["reef", "sail"] } })).statusCode).toBe(400);
    } finally { await app.close(); }
  });

  it("domain guards reserve an independent reviewer even when an adapter ignores its output schema", async () => {
    for (const members of [["harbor", "reef"], ["harbor", "reef", "sail"]] as AgentId[][]) {
      const model: ModelGateway = { respond: async (context, schema) => context.scope === "owner" ? schema.parse({ contractVersion: "owner-action-v1", action: "request_contributions", body: "Use every remaining teammate.", requests: context.members.filter(member => member.name !== context.identity.name).map(member => ({ memberRef: member.ref, goal: "Assess the supplied evidence." })) }) : new FixtureModel(0).respond(context, schema) };
      const engine = new Collaboration(new MemoryRoomStore(), model); const { room } = await engine.create("Reserve review", members);
      const result = await engine.send(room.id, input());
      expect(result.run?.status).toBe("recovery"); expect(result.outcomes[0]!.contributions).toHaveLength(0);
      expect(result.messages.map(message => message.role)).toEqual(["human"]); expect(result.run?.recovery?.code).toBe("MODEL_CONTRACT_REJECTED");
    }
  });

  it.each([2, 3])("the real Gemini adapter rejects reviewer-exhausting wire output in a %i-Agent room", async count => {
    const members = MEMBERS.slice(0, count).map(member => member.id);
    let generatedSchema = "";
    const gateway = new GeminiGateway("project", "model", async request => {
      const context = JSON.parse((request.contents as Array<{ parts: Array<{ text: string }> }>)[0]!.parts[0]!.text) as ModelContext;
      if (context.scope === "owner") {
        generatedSchema = JSON.stringify(request.config?.responseJsonSchema);
        return { text: JSON.stringify({ action: "request_contributions", body: "Use every teammate.", requests: context.members.filter(member => member.name !== context.identity.name).map(member => ({ memberRef: member.ref, goal: "Review the supplied evidence." })) }) };
      }
      const result = await new FixtureModel(0).respond(context, admissionSchema);
      const { contractVersion: _version, ...wire } = result;
      return { text: JSON.stringify(wire) };
    });
    const store = new MemoryRoomStore(); const engine = new Collaboration(store, gateway); const { room } = await engine.create("Wire negative", members);
    const result = await engine.send(room.id, input());
    expect(generatedSchema).toBeTruthy(); if (count === 2) expect(generatedSchema).not.toContain("request_contributions");
    else expect(generatedSchema).toContain('"maxItems":1');
    expect(result.run?.recovery?.code).toBe("MODEL_CONTRACT_REJECTED"); expect(result.messages).toHaveLength(1); expect(result.outcomes[0]!.contributions).toEqual([]);
    expect(await store.get(room.id)).toEqual(result);
  });

  it("rejects an outsider target on linked human-input gates without consuming the gate", async () => {
    const store = new MemoryRoomStore(); let calls = 0;
    const model: ModelGateway = { respond: async (context, schema) => {
      calls++;
      return context.scope === "owner" ? schema.parse({ contractVersion: "owner-action-v1", action: "request_input", body: "What is the planned pilot cohort?" }) : new FixtureModel(0).respond(context, schema);
    } };
    const engine = new Collaboration(store, model); const { room } = await engine.create("Linked membership", ["reef", "sail"]);
    const waiting = await engine.send(room.id, input("reef")); const before = calls;
    expect(waiting.outcomes[0]!.status).toBe("waiting");
    await expect(engine.send(room.id, input("harbor", waiting.outcomes[0]!.id))).rejects.toThrow("TARGET_NOT_A_MEMBER");
    expect(calls).toBe(before); expect(await store.get(room.id)).toEqual(waiting);
  });

  it("resumes a selected-pair review checkpoint without replay or membership drift", async () => {
    let interrupt = true;
    const model: ModelGateway = { respond: async (context, schema) => {
      if (context.scope === "review" && interrupt) { interrupt = false; throw new Error("Temporary transport interruption"); }
      return new FixtureModel(0).respond(context, schema);
    } };
    const store = new MemoryRoomStore(); const engine = new Collaboration(store, model);
    const { room } = await engine.create("Pair recovery", ["reef", "beacon"]);
    const before = await engine.send(room.id, input("reef")); expect(before.run?.scope).toBe("review"); expect(before.run?.status).toBe("recovery");
    const resumed = await engine.resume(room.id);
    expect(resumed.messages.slice(0, before.messages.length)).toEqual(before.messages); expect(resumed.members).toEqual(["reef", "beacon"]);
    expect(resumed.outcomes[0]!.owner).toBe("reef"); expect(resumed.outcomes[0]!.reviews[0]!.reviewer).toBe("beacon"); expect(resumed.outcomes[0]!.status).toBe("satisfied");
    expect(await store.get(room.id)).toEqual(resumed);
  });
});
