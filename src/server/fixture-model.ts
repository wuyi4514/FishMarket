import type { z } from "zod";
import type { ModelContext, ModelGateway } from "./model.js";

// Explicit offline development fixture. Never used in a production composition.
export class FixtureModel implements ModelGateway {
  constructor(private delay = 200) {}
  async respond<T>(context: ModelContext, schema: z.ZodType<T>): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const name = context.identity.name;
    const output = context.scope === "admission" ? {
      contractVersion: "admission-v1", action: context.goal ? "revise_outcome" : "open_outcome",
      ...(context.goal ? {} : { ownerRef: context.members.find(member => member.name === context.requestedMember)?.ref ?? "M1" }),
      goal: context.goal?.goal ?? "Produce an evidence-aware pilot launch recommendation.",
      criteria: ["Distinguish observed evidence from assumptions.", "Provide actionable next steps with owners and exit criteria."], constraints: ["Do not claim that the proposed actions have already been executed."]
    } : context.scope === "owner" && context.delegation.limit > 0 ? {
      contractVersion: "owner-action-v1", action: "request_contributions",
      body: "I’ll own this decision and ask complementary teammates to assess the supplied facts. I’ll integrate their contributions before an independent review.",
      requests: context.members.filter(member => context.delegation.candidateRefs.includes(member.ref as "M1" | "M2" | "M3" | "M4")).slice(0, context.delegation.limit).map(member => ({ memberRef: member.ref, goal: `Provide a ${member.name} perspective on the goal with explicit assumptions.` }))
    } : context.scope === "contributor" ? {
      contractVersion: "contribution-v1", resultKind: "deliverable",
      body: `### ${name}'s contribution\n\nThe supplied facts support a limited pilot, not a broad launch.\n\n- **Evidence:** five pilot teams tried the workflow; one needed help.\n- **Gap:** repeatable self-service recovery has not been demonstrated.\n- **Next step:** test recovery with a new cohort and record the exact result.`
    } : context.scope === "owner" ? {
      contractVersion: "owner-action-v1", action: "submit_delivery", resultKind: "deliverable",
      body: "## Decision: a bounded pilot, with conditions\n\nThe evidence supports learning from a small release. It does not prove production readiness.\n\n### Proposed next steps\n1. **QA lead:** run twenty recovery tests; exit when all are repeatable without operator help.\n2. **Support lead:** validate the recovery guide with a new user.\n3. **Product lead:** name the pilot accounts and a rollback owner.\n\nThese are proposed actions, not completed work. The responsible human should approve scope before execution."
    } : {
      contractVersion: "review-v1", verdict: "approve",
      body: "**Independent review passed.** The recommendation preserves the evidence gap and gives clear action owners and exit criteria. This review validates the proposed report; it does not authorize or verify a real-world launch.",
      assessments: context.goal!.criteria.map(item => ({ criterionRef: item.ref, result: "satisfied", reason: "The delivery addresses this frozen criterion and labels its limitations." })), issues: []
    };
    return schema.parse(output);
  }
}
