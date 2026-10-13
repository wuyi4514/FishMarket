import { createHash, randomUUID } from "node:crypto";
import { ZodError } from "zod";
import {
  MEMBERS, admissionSchema, ownerActionSchema, contributionSchema, reviewSchema,
  type Room, type Message, type HumanMessageInput, type Outcome, type AgentId,
  type Admission, type OwnerAction, type ContributionResult, type ReviewResult
} from "../contracts/group.js";
import { buildModelContext, resolveMember, type ModelGateway } from "./model.js";
import type { RoomStore } from "./room-store.js";

export const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const terminal = (outcome: Outcome) => outcome.status === "satisfied" || outcome.status === "not_satisfied";
function addMessage(room: Room, author: Message["author"], role: Message["role"], body: string, outcomeId: string | null) {
  room.messages.push({ id: randomUUID(), sequence: room.messages.length + 1, author, role, body, outcomeId, createdAt: new Date().toISOString() });
}
function activeOutcome(room: Room): Outcome | undefined { return room.outcomes.find(item => item.id === room.run?.outcomeId); }
function requiredOutcome(room: Room): Outcome { const value = activeOutcome(room); if (!value || terminal(value)) throw new Error("OUTCOME_NOT_ACTIVE"); return value; }
function reviewerFor(room: Room, outcome: Outcome): AgentId {
  const authors = outcome.contributions.filter(item => item.revision === outcome.goals.length && item.state === "delivered").map(item => item.agentId);
  const candidates = MEMBERS.filter(member => room.members.includes(member.id) && member.id !== outcome.owner && !authors.includes(member.id));
  const candidate = candidates.at(-1);
  if (!candidate) throw new Error("INDEPENDENT_REVIEWER_UNAVAILABLE"); return candidate.id;
}
export class Collaboration {
  constructor(readonly store: RoomStore, private model: ModelGateway, private dailyLimit = 300) {}
  async create(title: string) {
    const id = randomUUID(), token = randomUUID(); const now = new Date().toISOString();
    const room: Room = { contractVersion: "room-v1", id, title, accessHash: hash(token), version: 0, members: MEMBERS.map(member => member.id), messages: [], outcomes: [], run: null, receipts: [], totalCalls: 0, createdAt: now, updatedAt: now };
    await this.store.create(room); return { room, token };
  }
  async read(id: string): Promise<Room> {
    const snapshot = await this.store.get(id);
    if (!snapshot) throw new Error("ROOM_NOT_FOUND");
    if (snapshot.run?.status !== "running" || snapshot.run.leaseUntil >= Date.now()) return snapshot;
    return this.store.update(id, room => {
      if (room.run?.status !== "running" || room.run.leaseUntil >= Date.now()) return;
      room.run.status = "recovery";
      room.run.recovery = { code: "EXECUTION_LEASE_EXPIRED", owner: activeOutcome(room)?.owner ?? room.run.speaker, nextAction: "The execution was interrupted. Resume the committed checkpoint; ownership and earlier messages are preserved.", retryable: true };
    });
  }
  async send(id: string, input: HumanMessageInput): Promise<Room> {
    const fingerprint = hash(JSON.stringify(input)); let duplicate = false;
    const fence = randomUUID(), runId = randomUUID();
    const room = await this.store.update(id, current => {
      const receipt = current.receipts.find(item => item.key === input.requestKey);
      if (receipt) { if (receipt.fingerprint !== fingerprint) throw new Error("REQUEST_KEY_CONFLICT"); duplicate = true; return; }
      if (current.run?.status === "running" || (current.run?.status === "recovery" && current.run.recovery?.retryable)) throw new Error("ROOM_BUSY");
      if (current.messages.length > 155 || current.outcomes.length >= 30 || current.receipts.length >= 50) throw new Error("ROOM_CAPACITY_OR_VERSION");
      if (input.outcomeId) {
        const outcome = current.outcomes.find(item => item.id === input.outcomeId);
        if (!outcome || terminal(outcome)) throw new Error("OUTCOME_NOT_ACTIVE");
      }
      const linked = current.outcomes.find(item => item.id === input.outcomeId);
      const speaker = linked?.owner ?? (input.target === "team" ? current.members[0]! : input.target);
      if (!current.members.includes(speaker)) throw new Error("MEMBER_REF_INVALID");
      addMessage(current, "human", "human", input.body, input.outcomeId);
      current.receipts.push({ key: input.requestKey, fingerprint });
      current.run = { contractVersion: "group-run-v1", target: input.target === "team" ? null : input.target, id: runId, status: "running", scope: "admission", speaker, outcomeId: input.outcomeId, contributionId: null, fence, leaseUntil: Date.now() + 120000, calls: 0, reviewRepairs: 0, recovery: null };
    });
    if (duplicate) return room;
    return this.execute(id, fence, input.target === "team" ? null : input.target);
  }
  async resume(id: string): Promise<Room> {
    const fence = randomUUID();
    await this.store.update(id, room => {
      if (!room.run || room.run.status === "done") throw new Error("NO_RECOVERY");
      if (room.run.status === "running" && room.run.leaseUntil >= Date.now()) throw new Error("ROOM_BUSY");
      if (room.run.calls >= 16 || room.totalCalls >= 80) throw new Error("RUN_BUDGET_EXHAUSTED");
      room.run.fence = fence; room.run.status = "running"; room.run.recovery = null; room.run.leaseUntil = Date.now() + 120000;
    });
    const restored = (await this.store.get(id))!;
    return this.execute(id, fence, restored.run!.target);
  }
  private async execute(id: string, fence: string, target: AgentId | null = null): Promise<Room> {
    for (let step = 0; step < 16; step++) {
      let snapshot = (await this.store.get(id))!;
      if (!snapshot.run || snapshot.run.fence !== fence || snapshot.run.status !== "running") return snapshot;
      try {
        await this.store.claimBudget(new Date().toISOString().slice(0, 10), this.dailyLimit);
        snapshot = await this.store.update(id, room => {
          if (room.run?.fence !== fence || room.version !== snapshot.version) throw new Error("STALE_EXECUTION");
          if (room.run.calls >= 16 || room.totalCalls >= 80) throw new Error("RUN_BUDGET_EXHAUSTED");
          room.run.calls++; room.totalCalls++; room.run.leaseUntil = Date.now() + 120000;
        });
        const context = buildModelContext(snapshot, target);
        const scope = snapshot.run!.scope;
        const intent = scope === "admission" ? await this.model.respond(context, admissionSchema)
          : scope === "owner" ? await this.model.respond(context, ownerActionSchema)
          : scope === "contributor" ? await this.model.respond(context, contributionSchema)
          : await this.model.respond(context, reviewSchema);
        snapshot = await this.store.update(id, room => {
          if (room.version !== snapshot.version || room.run?.fence !== fence || room.run.leaseUntil < Date.now()) throw new Error("STALE_EXECUTION");
          this.apply(room, intent, target); room.run!.leaseUntil = Date.now() + 120000;
        });
        if (snapshot.run?.status !== "running") return snapshot;
      } catch (error) {
        console.error(JSON.stringify({ event: "collaboration.recovery", room: id, error: error instanceof Error ? error.message.slice(0, 600) : "UNKNOWN" }));
        return this.store.update(id, room => {
          if (room.run?.fence !== fence || room.run.status !== "running") return;
          const invalid = error instanceof ZodError || (error instanceof Error && /MODEL_|REF_|CRITERIA_|INVALID/.test(error.message));
          const budget = error instanceof Error && /BUDGET/.test(error.message);
          room.run.status = "recovery";
          room.run.recovery = { code: budget ? "DEMO_BUDGET_REACHED" : invalid ? "MODEL_CONTRACT_REJECTED" : "EXECUTION_INTERRUPTED", owner: activeOutcome(room)?.owner ?? room.run.speaker, nextAction: budget ? "The demo limit has been reached. Try tomorrow or start a new room for a per-room limit." : "Resume from the last committed step. Existing messages and deliveries will not be repeated.", retryable: !budget };
        });
      }
    }
    throw new Error("RUN_BUDGET_EXHAUSTED");
  }
  private apply(room: Room, intent: Admission | OwnerAction | ContributionResult | ReviewResult, target: AgentId | null) {
    const run = room.run!;
    if (run.scope === "admission") {
      const admission = admissionSchema.parse(intent);
      if (admission.action === "reply_only") { addMessage(room, run.speaker, "member", admission.body, run.outcomeId); run.status = "done"; return; }
      if (admission.action === "revise_outcome") {
        const outcome = requiredOutcome(room);
        outcome.goals.push({ goal: admission.goal, criteria: admission.criteria, constraints: admission.constraints, revision: outcome.goals.length + 1 });
        outcome.status = "active"; outcome.result = null;
        if (outcome.gate) outcome.gate.state = "answered";
        run.speaker = outcome.owner;
      } else {
        const owner = resolveMember(room, admission.ownerRef);
        if (target && owner !== target) throw new Error("REQUESTED_OWNER_INVALID");
        const outcome: Outcome = { id: randomUUID(), owner, goals: [{ goal: admission.goal, criteria: admission.criteria, constraints: admission.constraints, revision: 1 }], status: "active", contributions: [], deliveries: [], reviews: [], gate: null, result: null };
        room.outcomes.push(outcome); run.outcomeId = outcome.id; run.speaker = owner;
      }
      run.scope = "owner"; return;
    }
    const outcome = requiredOutcome(room); const goal = outcome.goals.at(-1)!;
    if (run.scope === "owner") {
      if (run.speaker !== outcome.owner) throw new Error("OWNER_ASSIGNMENT_INVALID");
      const action = ownerActionSchema.parse(intent);
      if (action.action === "request_input") {
        outcome.gate = { id: randomUUID(), question: action.body, state: "pending" }; outcome.status = "waiting";
        addMessage(room, outcome.owner, "owner", action.body, outcome.id); run.status = "done"; return;
      }
      if (action.action === "request_contributions") {
        if (outcome.contributions.some(item => item.revision === goal.revision)) throw new Error("CONTRIBUTIONS_ALREADY_REQUESTED");
        const agents = action.requests.map(item => resolveMember(room, item.memberRef));
        if (agents.includes(outcome.owner) || new Set(agents).size !== agents.length) throw new Error("CONTRIBUTOR_ASSIGNMENT_INVALID");
        const requests = action.requests.map((request, index) => ({ id: randomUUID(), agentId: agents[index]!, goal: request.goal, revision: goal.revision, state: "requested" as const, body: null, resultKind: null }));
        outcome.contributions.push(...requests); reviewerFor(room, outcome);
        addMessage(room, outcome.owner, "owner", action.body, outcome.id);
        run.scope = "contributor"; run.speaker = requests[0]!.agentId; run.contributionId = requests[0]!.id; return;
      }
      const delivery = { id: randomUUID(), revision: goal.revision, body: action.body, resultKind: action.resultKind, author: outcome.owner, createdAt: new Date().toISOString() };
      outcome.deliveries.push(delivery); outcome.status = "in_review";
      addMessage(room, outcome.owner, "owner", action.body, outcome.id);
      run.scope = "review"; run.speaker = reviewerFor(room, outcome); run.contributionId = null; return;
    }
    if (run.scope === "contributor") {
      const contribution = outcome.contributions.find(item => item.id === run.contributionId);
      if (!contribution || contribution.agentId !== run.speaker || contribution.state !== "requested" || contribution.revision !== goal.revision) throw new Error("CONTRIBUTION_ASSIGNMENT_INVALID");
      const result = contributionSchema.parse(intent);
      contribution.body = result.body; contribution.resultKind = result.resultKind; contribution.state = "delivered";
      addMessage(room, contribution.agentId, "contributor", result.body, outcome.id);
      const next = outcome.contributions.find(item => item.revision === goal.revision && item.state === "requested");
      run.scope = next ? "contributor" : "owner"; run.speaker = next?.agentId ?? outcome.owner; run.contributionId = next?.id ?? null; return;
    }
    const delivery = outcome.deliveries.at(-1)!;
    const reviewer = reviewerFor(room, outcome);
    if (run.speaker !== reviewer || outcome.status !== "in_review" || delivery.revision !== goal.revision) throw new Error("REVIEW_ASSIGNMENT_INVALID");
    const verdict = reviewSchema.parse(intent);
    const expected = goal.criteria.map((_, index) => `C${index + 1}`);
    if (verdict.assessments.length !== expected.length || expected.some(ref => verdict.assessments.filter(item => item.criterionRef === ref).length !== 1)) throw new Error("CRITERIA_COVERAGE_INVALID");
    if (verdict.verdict === "request_changes" && !verdict.issues.some(issue => issue.severity !== "minor")) throw new Error("MINOR_ONLY_REVIEW_INVALID");
    if (verdict.verdict === "approve" && verdict.issues.some(issue => issue.severity !== "minor")) throw new Error("APPROVED_BLOCKER_INVALID");
    outcome.reviews.push({ ...verdict, deliveryId: delivery.id, reviewer });
    addMessage(room, reviewer, "reviewer", verdict.body, outcome.id);
    if (verdict.verdict === "request_changes") {
      run.reviewRepairs++;
      if (run.reviewRepairs > 3) {
        run.status = "recovery"; run.scope = "owner"; run.speaker = outcome.owner;
        run.recovery = { code: "REVIEW_REPAIR_LIMIT", owner: outcome.owner, nextAction: "Clarify the acceptance criteria in a new message before continuing.", retryable: false }; return;
      }
      outcome.status = "active"; run.scope = "owner"; run.speaker = outcome.owner; return;
    }
    const achieved = delivery.resultKind === "deliverable" && verdict.assessments.every(item => item.result === "satisfied");
    outcome.status = achieved ? "satisfied" : "not_satisfied";
    outcome.result = { kind: delivery.resultKind, attainment: achieved ? "achieved" : verdict.assessments.some(item => item.result === "satisfied") ? "partially_achieved" : "not_achieved", assurance: "independently_reviewed" };
    run.status = "done";
  }
}
