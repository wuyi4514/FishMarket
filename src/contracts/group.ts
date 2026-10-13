import { z } from "zod";

export const agentIdSchema = z.enum(["harbor", "reef", "sail", "beacon"]);
export type AgentId = z.infer<typeof agentIdSchema>;
export const jobIdentitySchema = z.object({
  name: z.string().min(1).max(80), role: z.string().min(1).max(100), capability: z.string().min(1).max(400),
  responsibilities: z.array(z.string().min(1).max(300)).min(3).max(5),
  boundaries: z.array(z.string().min(1).max(300)).min(2).max(4)
}).strict();
export const agentProfileSchema = jobIdentitySchema.extend({
  contractVersion: z.literal("agent-profile-v1"), id: agentIdSchema,
  initials: z.string().min(1).max(2), color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
}).strict();
export type AgentProfile = z.infer<typeof agentProfileSchema>;
// Fixed profile-v1 catalog is also the explicit fallback for original room-v1 records.
export const MEMBERS: AgentProfile[] = [
  { contractVersion: "agent-profile-v1", id: "harbor", name: "Harbor", initials: "H", role: "Team coordinator", color: "#ee7c53", capability: "Clarify goals, integrate perspectives, and deliver a decision with clear next steps.",
    responsibilities: ["Turn the human's goal into a clear brief, constraints and acceptance criteria.", "Bring in complementary teammates and integrate their contributions into one coherent delivery.", "Keep ownership, open questions and next steps explicit until the outcome has been reviewed."],
    boundaries: ["Coordination does not make Harbor the owner of every outcome; ownership follows the recorded assignment.", "Do not claim that proposed actions were executed or make the human's final business decision."] },
  { contractVersion: "agent-profile-v1", id: "reef", name: "Reef", initials: "R", role: "Research & evidence", color: "#6b8f83", capability: "Analyze supplied evidence, distinguish assumptions, and identify missing knowledge.",
    responsibilities: ["Analyze the evidence supplied in this room and identify what it actually supports.", "Separate observations, assumptions and unresolved knowledge gaps.", "Recommend focused checks and explain how uncertainty affects the proposed decision."],
    boundaries: ["No external browsing or private database access is connected in this prototype; use supplied facts only.", "Never invent sources, measurements or proof to fill an evidence gap."] },
  { contractVersion: "agent-profile-v1", id: "sail", name: "Sail", initials: "S", role: "Strategy & planning", color: "#bd9b55", capability: "Develop practical options, priorities, responsibilities, and measurable acceptance criteria.",
    responsibilities: ["Develop practical options and compare their trade-offs against the human's constraints.", "Translate a chosen direction into priorities, responsible roles and a workable sequence.", "Define measurable acceptance criteria, checkpoints and rollback conditions."],
    boundaries: ["A proposed plan is not evidence that its actions have happened.", "Do not assign real people, spend money or change external systems without a connected authorized capability."] },
  { contractVersion: "agent-profile-v1", id: "beacon", name: "Beacon", initials: "B", role: "Quality & risk", color: "#8993b8", capability: "Challenge reasoning and independently assess a delivery against its frozen criteria.",
    responsibilities: ["Check the reasoning, evidence gaps and material risks in a proposed delivery.", "Assess every frozen acceptance criterion when assigned an independent review.", "Explain major blockers and actionable repairs while distinguishing honest limitations from false success."],
    boundaries: ["Independent review is allowed only when Beacon is neither the owner nor an author of the reviewed work.", "A reviewed report does not authorize real-world execution or replace the human's decision."] }
];
export function roomProfiles(room: Pick<Room, "members" | "agentProfiles">): AgentProfile[] {
  const profiles = z.array(agentProfileSchema).min(1).max(4).parse(room.agentProfiles ?? MEMBERS.filter(member => room.members.includes(member.id)));
  if (new Set(profiles.map(profile => profile.id)).size !== profiles.length || profiles.length !== room.members.length || profiles.some(profile => !room.members.includes(profile.id))) throw new Error("AGENT_PROFILE_MEMBERSHIP_INVALID");
  return room.members.map(id => profiles.find(profile => profile.id === id)!);
}
export const createRoomSchema = z.object({ contractVersion: z.literal("create-room-v1"), title: z.string().trim().min(1).max(80) }).strict();
export const sendMessageSchema = z.object({
  contractVersion: z.literal("human-message-v1"),
  requestKey: z.uuid(),
  body: z.string().trim().min(1).max(4000),
  target: z.union([z.literal("team"), agentIdSchema]),
  outcomeId: z.uuid().nullable()
}).strict();
export type HumanMessageInput = z.infer<typeof sendMessageSchema>;

const body = z.string().trim().min(1).max(6000);
const refs = z.enum(["M1", "M2", "M3", "M4"]);
export const goalSchema = z.object({
  goal: z.string().trim().min(4).max(1200),
  criteria: z.array(z.string().trim().min(3).max(300)).min(1).max(5),
  constraints: z.array(z.string().max(300)).max(5)
}).strict();
export const admissionSchema = z.discriminatedUnion("action", [
  z.object({ contractVersion: z.literal("admission-v1"), action: z.literal("reply_only"), body }).strict(),
  z.object({ contractVersion: z.literal("admission-v1"), action: z.literal("open_outcome"), ownerRef: refs, ...goalSchema.shape }).strict(),
  z.object({ contractVersion: z.literal("admission-v1"), action: z.literal("revise_outcome"), ...goalSchema.shape }).strict()
]);
const resultKindSchema = z.enum(["deliverable", "partial", "no_solution"]);
export const ownerActionSchema = z.discriminatedUnion("action", [
  z.object({ contractVersion: z.literal("owner-action-v1"), action: z.literal("request_contributions"),
    body, requests: z.array(z.object({ memberRef: refs, goal: z.string().min(4).max(600) }).strict()).min(1).max(2)
  }).strict(),
  z.object({ contractVersion: z.literal("owner-action-v1"), action: z.literal("request_input"), body }).strict(),
  z.object({ contractVersion: z.literal("owner-action-v1"), action: z.literal("submit_delivery"), body, resultKind: resultKindSchema }).strict()
]);
export const contributionSchema = z.object({ contractVersion: z.literal("contribution-v1"), body, resultKind: resultKindSchema }).strict();
export const assessmentSchema = z.object({ criterionRef: z.enum(["C1", "C2", "C3", "C4", "C5"]), result: z.enum(["satisfied", "unsatisfied", "unknown"]), reason: z.string().min(3).max(400) }).strict();
export const reviewSchema = z.object({
  contractVersion: z.literal("review-v1"), verdict: z.enum(["approve", "request_changes"]), body,
  assessments: z.array(assessmentSchema).min(1).max(5),
  issues: z.array(z.object({ severity: z.enum(["blocker", "major", "minor"]), description: z.string().min(3).max(500) }).strict()).max(5)
}).strict();
export type Admission = z.infer<typeof admissionSchema>;
export type OwnerAction = z.infer<typeof ownerActionSchema>;
export type ContributionResult = z.infer<typeof contributionSchema>;
export type ReviewResult = z.infer<typeof reviewSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type ResultKind = z.infer<typeof resultKindSchema>;
export type Scope = "admission" | "owner" | "contributor" | "review";

// Wire payloads contain semantics only. The adapter owns the protocol envelope.
const admissionWireSchema = z.discriminatedUnion("action", [
  admissionSchema.options[0].omit({ contractVersion: true }),
  admissionSchema.options[1].omit({ contractVersion: true }),
  admissionSchema.options[2].omit({ contractVersion: true })
]);
const ownerWireSchema = z.discriminatedUnion("action", [
  ownerActionSchema.options[0].omit({ contractVersion: true }),
  ownerActionSchema.options[1].omit({ contractVersion: true }),
  ownerActionSchema.options[2].omit({ contractVersion: true })
]);
export const wireProtocols = {
  admission: { schema: admissionWireSchema, version: "admission-v1" },
  owner: { schema: ownerWireSchema, version: "owner-action-v1" },
  contributor: { schema: contributionSchema.omit({ contractVersion: true }), version: "contribution-v1" },
  review: { schema: reviewSchema.omit({ contractVersion: true }), version: "review-v1" }
} as const;

export type Message = {
  id: string; sequence: number; author: "human" | AgentId | "system";
  role: "human" | "member" | "owner" | "contributor" | "reviewer" | "system";
  body: string; createdAt: string; outcomeId: string | null;
};
export type Contribution = { id: string; agentId: AgentId; goal: string; revision: number; state: "requested" | "delivered"; body: string | null; resultKind: ResultKind | null };
export type Delivery = { id: string; revision: number; body: string; resultKind: ResultKind; author: AgentId; createdAt: string };
export type Outcome = {
  id: string; owner: AgentId; goals: Array<Goal & { revision: number }>;
  status: "active" | "waiting" | "in_review" | "satisfied" | "not_satisfied";
  contributions: Contribution[]; deliveries: Delivery[];
  reviews: Array<ReviewResult & { deliveryId: string; reviewer: AgentId }>;
  gate: { id: string; question: string; state: "pending" | "answered" } | null;
  result: { kind: ResultKind; attainment: "achieved" | "partially_achieved" | "not_achieved"; assurance: "independently_reviewed" } | null;
};
export type Recovery = { code: string; owner: "human" | AgentId; nextAction: string; retryable: boolean };
export type Run = {
  contractVersion: "group-run-v1"; target: AgentId | null;
  id: string; status: "running" | "recovery" | "done"; scope: Scope;
  speaker: AgentId; outcomeId: string | null; contributionId: string | null;
  fence: string; leaseUntil: number; calls: number; reviewRepairs: number; recovery: Recovery | null;
};
export type Room = {
  contractVersion: "room-v1"; id: string; title: string; accessHash: string; version: number;
  members: AgentId[]; agentProfiles?: AgentProfile[]; messages: Message[]; outcomes: Outcome[]; run: Run | null;
  receipts: Array<{ key: string; fingerprint: string }>; totalCalls: number; createdAt: string; updatedAt: string;
};
export type RoomView = Omit<Room, "accessHash" | "receipts" | "totalCalls" | "run" | "agentProfiles"> & {
  agentProfiles: AgentProfile[];
  run: Pick<Run, "status" | "scope" | "speaker" | "outcomeId" | "recovery"> & { canResume: boolean } | null;
};
export function projectRoom(room: Room, now = Date.now()): RoomView {
  const { accessHash: _access, receipts: _receipts, totalCalls: _calls, run, ...view } = room;
  return { ...view, agentProfiles: roomProfiles(room), run: run ? {
    status: run.status, scope: run.scope, speaker: run.speaker, outcomeId: run.outcomeId,
    recovery: run.recovery, canResume: run.status === "recovery" || (run.status === "running" && run.leaseUntil < now)
  } : null };
}
export function assertRoom(room: Room): void {
  roomProfiles(room);
  if (room.contractVersion !== "room-v1" || room.messages.length > 180 || room.outcomes.length > 30) throw new Error("ROOM_CAPACITY_OR_VERSION");
  if (room.messages.some((message, i) => message.sequence !== i + 1)) throw new Error("MESSAGE_ORDER_INVALID");
  if (room.run && room.run.contractVersion !== "group-run-v1") throw new Error("CHECKPOINT_VERSION_INVALID");
  for (const outcome of room.outcomes) {
    if (!room.members.includes(outcome.owner)) throw new Error("OWNER_NOT_A_MEMBER");
    if (outcome.goals.length < 1 || outcome.goals.some((goal, i) => goal.revision !== i + 1)) throw new Error("GOAL_REVISION_INVALID");
    if (outcome.status === "waiting" && outcome.gate?.state !== "pending") throw new Error("WAIT_WITHOUT_GATE");
    if ((outcome.status === "satisfied" || outcome.status === "not_satisfied") && !outcome.result) throw new Error("TERMINAL_WITHOUT_RESULT");
    if (outcome.status === "satisfied" && (outcome.result?.kind !== "deliverable" || outcome.result.attainment !== "achieved")) throw new Error("FALSE_SUCCESS");
  }
}
