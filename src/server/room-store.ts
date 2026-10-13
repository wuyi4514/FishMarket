import { Firestore } from "@google-cloud/firestore";
import { assertRoom, type Room } from "../contracts/group.js";

export interface RoomStore {
  create(room: Room): Promise<void>;
  get(id: string): Promise<Room | null>;
  update(id: string, mutate: (room: Room) => void): Promise<Room>;
  claimBudget(day: string, limit: number): Promise<void>;
  probe(): Promise<void>;
}
export class MemoryRoomStore implements RoomStore {
  private rooms = new Map<string, Room>();
  private budgets = new Map<string, number>();
  async create(room: Room) { assertRoom(room); if (this.rooms.has(room.id)) throw new Error("ROOM_EXISTS"); this.rooms.set(room.id, structuredClone(room)); }
  async get(id: string) { return structuredClone(this.rooms.get(id) ?? null); }
  async update(id: string, mutate: (room: Room) => void) {
    const room = structuredClone(this.rooms.get(id));
    if (!room) throw new Error("ROOM_NOT_FOUND");
    mutate(room); room.version++; room.updatedAt = new Date().toISOString(); assertRoom(room);
    this.rooms.set(id, structuredClone(room)); return room;
  }
  async claimBudget(day: string, limit: number) {
    const used = this.budgets.get(day) ?? 0;
    if (used >= limit) throw new Error("DAILY_DEMO_BUDGET"); this.budgets.set(day, used + 1);
  }
  async probe() {}
}
export class FirestoreRoomStore implements RoomStore {
  private db: Firestore;
  constructor(projectId: string) { this.db = new Firestore({ projectId }); }
  async create(room: Room) { assertRoom(room); await this.db.collection("rooms").doc(room.id).create(room); }
  async get(id: string) { const snap = await this.db.collection("rooms").doc(id).get(); return snap.exists ? snap.data() as Room : null; }
  async update(id: string, mutate: (room: Room) => void) {
    const ref = this.db.collection("rooms").doc(id);
    return this.db.runTransaction(async tx => {
      const snap = await tx.get(ref); if (!snap.exists) throw new Error("ROOM_NOT_FOUND");
      const room = snap.data() as Room;
      mutate(room); room.version++; room.updatedAt = new Date().toISOString(); assertRoom(room);
      tx.set(ref, room); return room;
    });
  }
  async claimBudget(day: string, limit: number) {
    const ref = this.db.collection("demoBudgets").doc(day);
    await this.db.runTransaction(async tx => {
      const snap = await tx.get(ref); const used = Number(snap.data()?.used ?? 0);
      if (used >= limit) throw new Error("DAILY_DEMO_BUDGET");
      tx.set(ref, { used: used + 1, limit });
    });
  }
  async probe() { await this.db.collection("_health").doc("ready").get(); }
}
