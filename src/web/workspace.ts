import { z } from "zod";
import { createRoomSchema, type RoomView } from "../contracts/group";

export const workspaceKey = "fishmarket.workspace.v1";
export const legacyRoomKey = "fishmarket.room.v1";
const sessionSchema = z.object({ id: z.uuid(), token: z.uuid() }).strict();
const savedRoomSchema = sessionSchema.extend({ title: z.string().min(1).max(80), createdAt: z.string() }).strict();
const workspaceSchema = z.object({ contractVersion: z.literal("browser-workspace-v1"), activeRoomId: z.uuid(), rooms: z.array(savedRoomSchema).min(1).max(100) }).strict().superRefine((value, context) => {
  if (!value.rooms.some(room => room.id === value.activeRoomId) || new Set(value.rooms.map(room => room.id)).size !== value.rooms.length) context.addIssue({ code: "custom", message: "Invalid room directory" });
});
export type Session = z.infer<typeof sessionSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceSelection = { session: Session; room: RoomView; workspace: Workspace; persistenceWarning: string | null };
export interface RoomTransport { create(title: string): Promise<{ room: RoomView; token: string }>; read(session: Session): Promise<RoomView>; }
type StorageAccess = Pick<Storage, "getItem" | "setItem">;

export function reconcileRoomProjection(current: RoomView | null, incoming: RoomView, selectedRoomId: string | null): RoomView | null {
  if (incoming.id !== selectedRoomId) return current;
  return current?.id === incoming.id && current.version > incoming.version ? current : incoming;
}

export class WorkspaceNavigator {
  workspace: Workspace | null = null;
  selection: WorkspaceSelection | null = null;
  private bootPending: Promise<WorkspaceSelection> | null = null;
  private createPending: Promise<WorkspaceSelection> | null = null;
  private epoch = 0;
  constructor(private storage: StorageAccess, private transport: RoomTransport) {}
  boot(): Promise<WorkspaceSelection> {
    if (this.selection) return Promise.resolve(this.selection);
    if (this.bootPending) return this.bootPending;
    this.bootPending = this.restore().finally(() => { this.bootPending = null; });
    return this.bootPending;
  }
  private async restore(): Promise<WorkspaceSelection> {
    const saved = this.storage.getItem(workspaceKey);
    const legacy = this.storage.getItem(legacyRoomKey);
    let session: Session | null = null;
    try {
      if (saved) { this.workspace = workspaceSchema.parse(JSON.parse(saved)); const entry = this.workspace.rooms.find(room => room.id === this.workspace!.activeRoomId)!; session = { id: entry.id, token: entry.token }; }
      else if (legacy) session = sessionSchema.parse(JSON.parse(legacy));
    } catch { throw new Error("SAVED_WORKSPACE_INVALID: Saved room access is incompatible or damaged. It has not been deleted."); }
    if (session) {
      try { return this.commit(session, await this.transport.read(session)); }
      catch (error) { if (!(error instanceof Error) || error.message !== "ROOM_NOT_FOUND") throw error; }
    }
    return this.create("The working room");
  }
  create(title: string): Promise<WorkspaceSelection> {
    if (this.createPending) return this.createPending;
    const clean = createRoomSchema.parse({ contractVersion: "create-room-v1", title });
    if ((this.workspace?.rooms.length ?? 0) >= 100) return Promise.reject(new Error("This browser already remembers 100 rooms. Existing room access has been preserved."));
    this.epoch++;
    this.createPending = this.transport.create(clean.title).then(created => this.commit({ id: created.room.id, token: created.token }, created.room)).finally(() => { this.createPending = null; });
    return this.createPending;
  }
  async select(id: string): Promise<WorkspaceSelection | null> {
    if (this.createPending) throw new Error("WORKSPACE_BUSY");
    const entry = this.workspace?.rooms.find(room => room.id === id); if (!entry) throw new Error("ROOM_NOT_REMEMBERED");
    const epoch = ++this.epoch; const session = { id: entry.id, token: entry.token };
    const room = await this.transport.read(session);
    if (epoch !== this.epoch) return null;
    return this.commit(session, room);
  }
  private commit(session: Session, room: RoomView): WorkspaceSelection {
    if (room.id !== session.id) throw new Error("ROOM_RESPONSE_MISMATCH");
    const entry = { ...session, title: room.title, createdAt: room.createdAt };
    const rooms = this.workspace?.rooms ?? [];
    const workspace = workspaceSchema.parse({ contractVersion: "browser-workspace-v1", activeRoomId: session.id, rooms: rooms.some(item => item.id === session.id) ? rooms.map(item => item.id === session.id ? entry : item) : [...rooms, entry] });
    let persistenceWarning: string | null = null;
    try { this.storage.setItem(workspaceKey, JSON.stringify(workspace)); }
    catch { persistenceWarning = "This browser could not save room access. Keep this tab open; a refresh may lose access to the new room."; }
    this.workspace = workspace;
    this.selection = { session, room, workspace, persistenceWarning };
    return this.selection;
  }
}
