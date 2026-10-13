import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { timingSafeEqual } from "node:crypto";
import Fastify from "fastify";
import staticFiles from "@fastify/static";
import { createRoomSchema, sendMessageSchema, projectRoom } from "../contracts/group.js";
import { Collaboration, hash } from "./collaboration.js";
import { GeminiGateway, type ModelGateway } from "./model.js";
import { FixtureModel } from "./fixture-model.js";
import { MemoryRoomStore, FirestoreRoomStore, type RoomStore } from "./room-store.js";

export function buildApp(options: { store?: RoomStore; model?: ModelGateway; serveWeb?: boolean } = {}) {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const fixture = process.env.GEMINI_MODE === "fixture";
  if (fixture && process.env.NODE_ENV === "production") throw new Error("FIXTURE_FORBIDDEN_IN_PRODUCTION");
  const store = options.store ?? (process.env.ROOM_STORE === "memory" ? new MemoryRoomStore() : project ? new FirestoreRoomStore(project) : null);
  if (!store) throw new Error("GOOGLE_CLOUD_PROJECT_REQUIRED");
  const modelName = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
  const model = options.model ?? (fixture ? new FixtureModel(700) : project ? new GeminiGateway(project, modelName) : null);
  if (!model) throw new Error("GOOGLE_CLOUD_PROJECT_REQUIRED");
  const collaboration = new Collaboration(store, model, Number(process.env.DAILY_MODEL_CALL_LIMIT ?? 300));
  const app = Fastify({ logger: { redact: ["req.headers.x-room-token", "req.headers.authorization"] }, bodyLimit: 16 * 1024, requestTimeout: 600000 });
  app.get("/api/health", async () => {
    await store.probe();
    return { status: "ready", service: "fishmarket", store: store instanceof FirestoreRoomStore ? "firestore" : "memory", provider: fixture ? "offline-fixture" : "vertex-ai", model: fixture ? "fixture" : modelName, release: process.env.RELEASE_SHA ?? "local" };
  });
  app.get("/api/config", async () => ({ mode: fixture ? "offline-fixture" : "live", model: modelName }));
  app.post("/api/rooms", async (request, reply) => {
    const input = createRoomSchema.parse(request.body);
    const { room, token } = await collaboration.create(input.title);
    return reply.code(201).send({ room: projectRoom(room), token });
  });
  app.addHook("preHandler", async (request, reply) => {
    const params = request.params as { id?: string };
    if (!params.id || !request.url.startsWith("/api/rooms/")) return;
    if (!/^[0-9a-f-]{36}$/.test(params.id)) return reply.code(404).send({ error: "ROOM_NOT_FOUND" });
    const token = request.headers["x-room-token"];
    const room = await store.get(params.id);
    const supplied = typeof token === "string" ? hash(token) : "";
    if (!room || supplied.length !== room.accessHash.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(room.accessHash))) return reply.code(404).send({ error: "ROOM_NOT_FOUND" });
  });
  app.get<{ Params: { id: string } }>("/api/rooms/:id", async request => projectRoom(await collaboration.read(request.params.id)));
  app.post<{ Params: { id: string } }>("/api/rooms/:id/messages", async request => projectRoom(await collaboration.send(request.params.id, sendMessageSchema.parse(request.body))));
  app.post<{ Params: { id: string } }>("/api/rooms/:id/resume", async request => projectRoom(await collaboration.resume(request.params.id)));
  app.setErrorHandler((error, _request, reply) => {
    const message = error instanceof Error ? error.message : "REQUEST_FAILED";
    const validation = error instanceof Error && error.name === "ZodError";
    const status = message === "ROOM_BUSY" || message === "REQUEST_KEY_CONFLICT" ? 409 : /CAPACITY|BUDGET/.test(message) ? 429 : /NOT_FOUND/.test(message) ? 404 : validation ? 400 : 500;
    if (status === 500) app.log.error({ err: error }, "Request failed");
    return reply.code(status).send({ error: status === 500 ? "REQUEST_FAILED" : validation ? "INPUT_INVALID" : message });
  });
  const webRoot = resolve(process.cwd(), "dist/web");
  if (options.serveWeb !== false && existsSync(webRoot)) {
    app.register(staticFiles, { root: webRoot });
    app.setNotFoundHandler((request, reply) => request.url.startsWith("/api/") ? reply.code(404).send({ error: "NOT_FOUND" }) : reply.sendFile("index.html"));
  }
  return app;
}
