import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { Collaboration } from "../src/server/collaboration";
import { MemoryRoomStore } from "../src/server/room-store";
import { FixtureModel } from "../src/server/fixture-model";
import { projectRoom, type RoomView } from "../src/contracts/group";
import { WorkspaceNavigator, reconcileRoomProjection, workspaceKey, legacyRoomKey, type RoomTransport } from "../src/web/workspace";

class BrowserStorage {
  data = new Map<string, string>();
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); }
}
function setup() {
  const storage = new BrowserStorage();
  const engine = new Collaboration(new MemoryRoomStore(), new FixtureModel(0));
  let creates = 0;
  const transport: RoomTransport = {
    create: async (title, members) => { creates++; const created = await engine.create(title, members, "team"); return { room: projectRoom(created.room), token: created.token }; },
    read: async session => projectRoom(await engine.read(session.id))
  };
  return { storage, engine, transport, navigator: new WorkspaceNavigator(storage, transport), creates: () => creates };
}
describe("browser workspace using the production room composition", () => {
  it("passes selected members through creation and restores the same group on reload", async () => {
    const { navigator, storage, transport } = setup(); const old = await navigator.boot();
    const created = await navigator.create("Selected pair", ["reef", "sail"]);
    expect(created.room.members).toEqual(["reef", "sail"]);
    expect((await new WorkspaceNavigator(storage, transport).boot()).room.agentProfiles.map(profile => profile.id)).toEqual(["reef", "sail"]);
    expect((await navigator.select(old.session.id))!.room.members).toHaveLength(5);
    expect(created.workspace.rooms).toHaveLength(2);
  });
  it("creates named isolated rooms, retains old access and restores the selected room on reload", async () => {
    const { navigator, engine, storage, transport } = setup();
    const first = await navigator.boot();
    await engine.send(first.session.id, { contractVersion: "human-message-v1", requestKey: randomUUID(), body: "Create a pilot plan", target: "team", outcomeId: null });
    const second = await navigator.create("  Launch planning  ");
    expect(second.room.title).toBe("Launch planning"); expect(second.room.messages).toEqual([]); expect(second.room.outcomes).toEqual([]); expect(second.room.run).toBeNull();
    expect(second.session.id).not.toBe(first.session.id); expect(second.session.token).not.toBe(first.session.token);
    expect(second.workspace.rooms).toHaveLength(2);
    const old = (await navigator.select(first.session.id))!;
    expect(old.room.messages).toHaveLength(6); expect(old.room.outcomes[0]!.status).toBe("satisfied");
    expect(old.session.token).toBe(first.session.token);
    const reloaded = await new WorkspaceNavigator(storage, transport).boot();
    expect(reloaded.session).toEqual(first.session); expect(reloaded.room.messages).toEqual(old.room.messages);
  });
  it("migrates the actual legacy capability without discarding its room", async () => {
    const { storage, transport } = setup(); const created = await transport.create("Original room");
    const session = { id: created.room.id, token: created.token };
    storage.setItem(legacyRoomKey, JSON.stringify(session));
    const restored = await new WorkspaceNavigator(storage, transport).boot();
    expect(restored.session).toEqual(session); expect(restored.workspace.rooms[0]!.title).toBe("Original room");
    expect(JSON.parse(storage.getItem(workspaceKey)!)).toMatchObject({ contractVersion: "browser-workspace-v1", activeRoomId: session.id });
  });
  it("makes boot and repeated create clicks single-flight and never returns a stale boot room", async () => {
    const { navigator, creates } = setup();
    const first = await Promise.all([navigator.boot(), navigator.boot()]); expect(creates()).toBe(1);
    const results = await Promise.all([navigator.create("Fresh room"), navigator.create("Fresh room")]);
    expect(creates()).toBe(2); expect(results[0].session).toEqual(results[1].session);
    expect((await navigator.boot()).session).toEqual(results[0].session); expect(results[0].session).not.toEqual(first[0].session);
  });
  it("preserves the current room and saved capabilities on create and read failures", async () => {
    const { navigator, transport, storage, creates } = setup(); const first = await navigator.boot();
    const saved = storage.getItem(workspaceKey);
    transport.create = async () => { throw new Error("NETWORK_FAILURE"); };
    await expect(navigator.create("Will not replace old room")).rejects.toThrow("NETWORK_FAILURE");
    expect(storage.getItem(workspaceKey)).toBe(saved); expect(navigator.selection!.session).toEqual(first.session);
    transport.read = async () => { throw new Error("NETWORK_FAILURE"); };
    await expect(new WorkspaceNavigator(storage, transport).boot()).rejects.toThrow("NETWORK_FAILURE"); expect(creates()).toBe(1);
    expect(storage.getItem(workspaceKey)).toBe(saved);
  });
  it("does not let a slow earlier room selection replace the latest selection", async () => {
    const { navigator, transport } = setup(); const first = await navigator.boot(); const second = await navigator.create("Second room");
    let release!: (value: RoomView) => void;
    const read = transport.read;
    transport.read = async session => session.id === first.session.id ? new Promise(resolve => { release = resolve; }) : read(session);
    const slow = navigator.select(first.session.id); await navigator.select(second.session.id);
    release(first.room); expect(await slow).toBeNull(); expect(navigator.selection!.session).toEqual(second.session);
  });
  it("retains a newly created capability in memory and surfaces storage failure", async () => {
    const { navigator, storage } = setup(); const first = await navigator.boot();
    storage.setItem = () => { throw new Error("QUOTA_EXCEEDED"); };
    const second = await navigator.create("Unsaved access");
    expect(second.workspace.rooms).toHaveLength(2); expect(second.session.id).not.toBe(first.session.id);
    expect(second.persistenceWarning).toContain("Keep this tab open"); expect(navigator.selection!.session).toEqual(second.session);
  });
  it("fails closed on corrupt or incompatible saved access instead of silently replacing it", async () => {
    const { storage, transport, creates } = setup(); storage.setItem(workspaceKey, JSON.stringify({ contractVersion: "browser-workspace-v99" }));
    await expect(new WorkspaceNavigator(storage, transport).boot()).rejects.toThrow("SAVED_WORKSPACE_INVALID"); expect(creates()).toBe(0);
  });
  it("rejects stale poll projections across room navigation and never regresses an aggregate version", async () => {
    const { navigator } = setup(); const first = await navigator.boot(); const second = await navigator.create("Another room");
    expect(reconcileRoomProjection(second.room, first.room, second.room.id)).toBe(second.room);
    const newer = { ...second.room, version: 5 };
    expect(reconcileRoomProjection(newer, second.room, second.room.id)).toBe(newer);
    expect(reconcileRoomProjection(second.room, newer, second.room.id)).toBe(newer);
  });
});
