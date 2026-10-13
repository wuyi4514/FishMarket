import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { MEMBERS, agentProfileSchema, projectRoom, assertRoom, admissionSchema, type Room } from "../src/contracts/group";
import { Collaboration } from "../src/server/collaboration";
import { MemoryRoomStore } from "../src/server/room-store";
import { FixtureModel } from "../src/server/fixture-model";
import { buildModelContext, buildGeminiRequest, type ModelContext, type ModelGateway } from "../src/server/model";
import { buildApp } from "../src/server/http";

describe("room-bound job identity and production projection", () => {
  it("freezes four complete strict profiles in a new room and resolves original legacy rooms", async () => {
    const store = new MemoryRoomStore(); const engine = new Collaboration(store, new FixtureModel(0)); const { room } = await engine.create("Profiles");
    expect(room.agentProfiles).toHaveLength(4);
    for (const profile of room.agentProfiles!) { expect(agentProfileSchema.parse(profile)).toEqual(profile); expect(profile.responsibilities.length).toBeGreaterThanOrEqual(3); expect(profile.boundaries.length).toBeGreaterThanOrEqual(2); }
    const legacy = structuredClone(room); delete legacy.agentProfiles;
    expect(projectRoom(legacy).agentProfiles).toEqual(MEMBERS); expect(() => assertRoom(legacy)).not.toThrow();
    const bad = structuredClone(room); bad.agentProfiles![0]!.contractVersion = "invalid" as "agent-profile-v1";
    expect(() => assertRoom(bad)).toThrow();
    const duplicate = structuredClone(room); duplicate.agentProfiles![1] = duplicate.agentProfiles![0]!;
    expect(() => assertRoom(duplicate)).toThrow();
  });
  it("uses the same frozen job responsibilities in UI, all scopes and the real Gemini request builder", async () => {
    const store = new MemoryRoomStore(); const contexts: ModelContext[] = [];
    const model: ModelGateway = { respond: async <T>(context: ModelContext, schema: z.ZodType<T>) => { contexts.push(structuredClone(context)); return new FixtureModel(0).respond(context, schema); } };
    const engine = new Collaboration(store, model); const { room, token } = await engine.create("Frozen identities");
    await store.update(room.id, value => { value.agentProfiles![0]!.responsibilities[0] = "This room's frozen coordination responsibility."; });
    const result = await engine.send(room.id, { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Prepare a pilot decision", target: "team", outcomeId: null });
    expect(new Set(contexts.map(context => context.scope)).size).toBe(4);
    const profiles = projectRoom(result).agentProfiles;
    for (const context of contexts) {
      const profile = profiles.find(member => member.name === context.identity.name)!;
      expect(context.contractVersion).toBe("group-model-context-v2");
      expect(context.identity.role).toBe(profile.role); expect(context.identity.responsibilities).toEqual(profile.responsibilities); expect(context.identity.boundaries).toEqual(profile.boundaries);
      const serialized = JSON.stringify(buildGeminiRequest(context, admissionSchema, "model"));
      expect(serialized).toContain(profile.responsibilities[0]); expect(serialized).toContain(profile.role);
      for (const forbidden of [room.id, token, "accessHash", "agent-profile-v1", "leaseUntil", "fence", "receipts"]) expect(serialized).not.toContain(forbidden);
    }
    expect(profiles[0]!.responsibilities[0]).toBe("This room's frozen coordination responsibility.");
    const projected = buildModelContext({ ...result, run: { ...result.run!, scope: "admission" } });
    expect(() => buildGeminiRequest({ ...projected, identity: { ...projected.identity, permissions: ["all"] } } as ModelContext, admissionSchema, "model")).toThrow();
  });
  it("HTTP creation and retrieval expose the same jobs while denying cross-room capabilities", async () => {
    const store = new MemoryRoomStore(); const app = buildApp({ store, model: new FixtureModel(0), serveWeb: false });
    try {
      const create = async (title: string) => (await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v1", title } })).json<{ room: ReturnType<typeof projectRoom>; token: string }>();
      const a = await create("Room A"), b = await create("Room B");
      expect(a.room.agentProfiles).toEqual(b.room.agentProfiles); expect(b.room.messages).toHaveLength(0); expect(b.room.run).toBeNull();
      const read = await app.inject({ method: "GET", url: "/api/rooms/" + a.room.id, headers: { "x-room-token": a.token } });
      expect(read.json().agentProfiles).toEqual(a.room.agentProfiles);
      expect((await app.inject({ method: "GET", url: "/api/rooms/" + a.room.id, headers: { "x-room-token": b.token } })).statusCode).toBe(404);
      expect(await store.get(a.room.id)).toMatchObject({ agentProfiles: a.room.agentProfiles });
    } finally { await app.close(); }
  });
  it("resumes an original checkpoint without rewriting earlier messages or changing its owner", async () => {
    const store = new MemoryRoomStore(); let interrupted = false;
    const model: ModelGateway = { respond: async <T>(context: ModelContext, schema: z.ZodType<T>) => {
      if (context.scope === "contributor" && !interrupted) { interrupted = true; throw new Error("Temporary interruption"); }
      return new FixtureModel(0).respond(context, schema);
    } };
    const engine = new Collaboration(store, model); const { room } = await engine.create("Legacy checkpoint");
    const saved = await engine.send(room.id, { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Create a pilot decision", target: "sail", outcomeId: null });
    expect(saved.run!.status).toBe("recovery");
    await store.update(room.id, value => { delete value.agentProfiles; });
    const resumed = await engine.resume(room.id);
    expect(resumed.messages.slice(0, saved.messages.length)).toEqual(saved.messages);
    expect(resumed.outcomes[0]!.owner).toBe("sail"); expect(resumed.outcomes[0]!.status).toBe("satisfied");
    expect(projectRoom(resumed).agentProfiles).toEqual(MEMBERS);
  });
  it("creating fresh rooms cannot reset the project-wide model-call limit", async () => {
    const engine = new Collaboration(new MemoryRoomStore(), new FixtureModel(0), 1);
    const a = await engine.create("First room"), b = await engine.create("Fresh room");
    const input = () => ({ contractVersion: "human-message-v1" as const, requestKey: randomUUID(), body: "Create a pilot plan", target: "team" as const, outcomeId: null });
    await engine.send(a.room.id, input());
    const blocked = await engine.send(b.room.id, input());
    expect(blocked.totalCalls).toBe(0); expect(blocked.messages).toHaveLength(1);
    expect(blocked.run!.recovery!.code).toBe("DEMO_BUDGET_REACHED");
  });
});
