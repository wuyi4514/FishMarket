// @vitest-environment jsdom
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { z } from "zod";
import { TEAM_CATALOG, MEMBERS, admissionSchema, type RoomView } from "../src/contracts/group";
import { buildApp } from "../src/server/http";
import { MemoryRoomStore } from "../src/server/room-store";
import { FixtureModel } from "../src/server/fixture-model";
import { GeminiGateway, buildGeminiRequest, type ModelContext } from "../src/server/model";
import { mentionTarget } from "../src/web/chat-interactions";
import { MessageRow } from "../src/web/MessageRow";
import { Avatar, GroupAvatar } from "../src/web/ChatPrimitives";
import { RoomSpace } from "../src/web/RoomSpace";
import { Collaboration } from "../src/server/collaboration";

afterEach(cleanup);

it("create-v3 freezes five real film-aligned positions through HTTP, Provider serialization, commit and replay", async () => {
  const store = new MemoryRoomStore(), contexts: ModelContext[] = [];
  // The transport returns normal wire payloads, not a bypass around GeminiGateway.
  const gateway = new GeminiGateway("project", "model", async request => {
    const context = JSON.parse((request.contents as any)[0].parts[0].text) as ModelContext;
    contexts.push(context);
    const contracts = await import("../src/contracts/group");
    const schemas = { admission: contracts.admissionSchema, owner: contracts.ownerActionSchema, contributor: contracts.contributionSchema, review: contracts.reviewSchema };
    const result = await new FixtureModel(0).respond<z.infer<(typeof schemas)[keyof typeof schemas]>>(context, schemas[context.scope]);
    const { contractVersion, ...wire } = result;
    for (const field of ["accessHash", "receipts", "leaseUntil", "fence", "agent-profile-v1"]) expect(JSON.stringify(request)).not.toContain(field);
    return { text: JSON.stringify(wire) };
  });
  const app = buildApp({ store, model: gateway, serveWeb: false });
  try {
    const payload = { contractVersion: "create-room-v3", title: "Native UI", members: TEAM_CATALOG.map(member => member.id) };
    const response = await app.inject({ method: "POST", url: "/api/rooms", payload });
    expect(response.statusCode).toBe(201);
    const created = response.json<{ room: RoomView; token: string }>();
    expect(created.room.agentProfiles).toEqual(TEAM_CATALOG);
    const command = { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Prepare a bounded launch plan with assumptions and review.", target: "coral", outcomeId: null };
    const request = { method: "POST" as const, url: `/api/rooms/${created.room.id}/messages`, headers: { "x-room-token": created.token }, payload: command };
    const finished = (await app.inject(request)).json<RoomView>();
    expect(finished.run?.status).toBe("done");
    expect(finished.outcomes[0]?.owner).toBe("coral");
    expect(finished.outcomes[0]?.status).toBe("satisfied");
    expect(finished.outcomes[0]?.reviews[0]?.reviewer).not.toBe("coral");
    expect(contexts[0]?.members).toHaveLength(5);
    expect(contexts.every(context => context.contractVersion === "group-model-context-v4")).toBe(true);
    expect(contexts[0]?.identity.name).toBe("Design - Coral");
    expect((await store.get(created.room.id))?.agentProfiles).toEqual(TEAM_CATALOG);
    expect((await app.inject(request)).json().messages).toEqual(finished.messages);
    for (const members of [["coral"], ["coral", "coral"], ["coral", "unknown"]]) expect((await app.inject({ method: "POST", url: "/api/rooms", payload: { ...payload, members } })).statusCode).toBe(400);
    const legacy = (await app.inject({ method: "POST", url: "/api/rooms", payload: { contractVersion: "create-room-v1", title: "Legacy" } })).json();
    expect(legacy.room.agentProfiles).toEqual(MEMBERS);
  } finally { await app.close(); }
});

it("exact named mentions route only selected profiles and render chips without changing copy text", () => {
  expect(mentionTarget("@Design - Coral please review", TEAM_CATALOG)).toBe("coral");
  expect(mentionTarget("@Design - Coral and @Quality - Puffer", TEAM_CATALOG)).toBe("team");
  expect(mentionTarget("@Design - Coraline", TEAM_CATALOG)).toBe("team");
  const body = "Handoff to @Product - Spark, then @Design - Coral. Do not treat x@Design - Coral as a mention.";
  const view = render(<MessageRow message={{ id: "one", sequence: 1, author: "harbor", role: "owner", body, createdAt: "2026-10-18T09:12:00Z", outcomeId: null }} members={TEAM_CATALOG} onOpenProfile={() => {}}/>);
  expect(view.container.querySelectorAll(".message-mention")).toHaveLength(2);
  expect(view.container.querySelector(".message-body")?.textContent).toBe(body);
});

it("five-position checkpoints recover without identity drift and selected pairs cannot invoke outsiders", async () => {
  const store = new MemoryRoomStore(); let interrupted = false;
  const engine = new Collaboration(store, { respond: async (context, schema) => {
    if (context.scope === "contributor" && !interrupted) { interrupted = true; throw new Error("Temporary interruption"); }
    return new FixtureModel(0).respond(context, schema);
  } });
  const created = await engine.create("Recover five positions", TEAM_CATALOG.map(member => member.id), "team");
  const input = { contractVersion: "human-message-v1" as const, requestKey: randomUUID(), body: "Prepare a written launch plan", target: "coral" as const, outcomeId: null };
  const before = await engine.send(created.room.id, input);
  expect(before.run?.status).toBe("recovery");
  const after = await engine.resume(created.room.id);
  expect(after.messages.slice(0, before.messages.length)).toEqual(before.messages);
  expect(after.agentProfiles).toEqual(before.agentProfiles);
  expect(after.outcomes[0]?.owner).toBe("coral");
  expect(after.outcomes[0]?.status).toBe("satisfied");
  const pair = await engine.create("Pair", ["coral", "beacon"], "team");
  await expect(engine.send(pair.room.id, { ...input, requestKey: randomUUID(), target: "harbor" })).rejects.toThrow("TARGET_NOT_A_MEMBER");
  expect((await store.get(pair.room.id))?.messages).toEqual([]);
  const result = await engine.send(pair.room.id, { ...input, requestKey: randomUUID() });
  expect(result.outcomes[0]?.contributions).toHaveLength(0);
  expect(result.outcomes[0]?.reviews[0]?.reviewer).toBe("beacon");
});

it("uses original portrait files and a four-tile group avatar, never letter placeholders", () => {
  const view = render(<><Avatar id="human"/><GroupAvatar members={TEAM_CATALOG}/></>);
  expect(view.container.querySelectorAll(".group-avatar img")).toHaveLength(4);
  const src = view.container.querySelector(".avatar img")!.getAttribute("src")!;
  expect(src).toBe("/avatars/human-03.webp");
  const bytes = readFileSync(new URL("../public" + src, import.meta.url));
  expect(bytes.length).toBeGreaterThan(1000);
});

it("Space exposes only committed delivery/review content and an honest empty state", () => {
  const base = { agentProfiles: TEAM_CATALOG, outcomes: [] } as unknown as RoomView;
  const view = render(<RoomSpace room={base} members={TEAM_CATALOG}/>);
  expect(screen.getByText("No published deliveries yet")).toBeTruthy();
  expect(screen.queryByText(/\.pptx/)).toBeNull();
  view.rerender(<RoomSpace room={{ ...base, outcomes: [{ id: "goal", owner: "harbor", goals: [{ goal: "Launch plan", criteria: ["Bounded"], constraints: [], revision: 1 }], status: "satisfied", contributions: [], deliveries: [{ id: "d1", revision: 1, body: "# Real committed report", resultKind: "deliverable", author: "harbor", createdAt: "2026-10-18" }], reviews: [], result: null, gate: null }] }} members={TEAM_CATALOG}/>);
  fireEvent.click(screen.getByRole("button", { name: /Launch plan/ }));
  expect(screen.getByRole("heading", { name: "Real committed report" })).toBeTruthy();
});
