import { useState } from "react";
import Markdown from "react-markdown";
import type { RoomView, AgentProfile } from "../contracts/group";
import { Icon } from "./ChatPrimitives";

export function RoomSpace({ room, members }: { room: RoomView | null; members: AgentProfile[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const entries = room?.outcomes.flatMap(outcome => outcome.deliveries.map((delivery, index) => ({
    id: delivery.id, title: outcome.goals.find(goal => goal.revision === delivery.revision)?.goal ?? "Outcome delivery",
    body: delivery.body, date: delivery.createdAt, version: index + 1,
    author: members.find(member => member.id === delivery.author)?.name ?? delivery.author,
    reviewed: outcome.reviews.some(review => review.deliveryId === delivery.id),
    reviews: outcome.reviews.filter(review => review.deliveryId === delivery.id)
  }))) ?? [];
  const active = entries.find(entry => entry.id === selected);
  return <section className={"room-space" + (active ? " has-preview" : "")} aria-label="Shared Space">
    <div className="space-directory"><h2>Shared context</h2><p>Published deliveries and review records from this group.</p>
      {!entries.length && <div className="space-empty"><Icon type="file"/><strong>No published deliveries yet</strong><span>Reviewed work will stay here with its original versions. Nothing has been generated or uploaded yet.</span></div>}
      {entries.map(entry => <button key={entry.id} className="space-document" onClick={() => setSelected(entry.id)}><Icon type="file"/><span><strong>{entry.title}</strong><small>{entry.author} · V{entry.version} · {entry.reviewed ? "Review recorded" : "Awaiting review"}</small></span><Icon type="arrow"/></button>)}
    </div>
    {active && <aside className="document-preview" aria-label="Delivery preview"><header><strong>{active.title}</strong><button aria-label="Close preview" onClick={() => setSelected(null)}><Icon type="close"/></button></header><article className="message-body"><p className="document-meta">{active.author} · V{active.version} · {new Date(active.date).toLocaleDateString("en", { dateStyle: "medium" })}</p><Markdown>{active.body}</Markdown>{active.reviews.map((review, i) => <section className="saved-review" key={i}><h3>Independent review · {review.verdict === "approve" ? "Accepted" : "Changes requested"}</h3><Markdown>{review.body}</Markdown></section>)}</article></aside>}
  </section>;
}

export function RoomAnnouncements({ room }: { room: RoomView | null }) {
  const outcomes = room?.outcomes ?? [];
  return <section className="room-announcements"><h2>Announcements</h2><p>Committed milestones and requests for your input.</p>
    {!outcomes.length && <div className="space-empty"><Icon type="chat"/><strong>No announcements yet</strong><span>Goal milestones and pending input requests will appear here as the team works.</span></div>}
    {outcomes.map(outcome => <article key={outcome.id}><span className="milestone-state">{outcome.status.replaceAll("_", " ")}</span><h3>{outcome.goals.at(-1)!.goal}</h3>{outcome.gate?.state === "pending" && <p>{outcome.gate.question}</p>}<ul>{outcome.goals.at(-1)!.criteria.map(criterion => <li key={criterion}>{criterion}</li>)}</ul><small>{outcome.deliveries.length} deliveries · {outcome.reviews.length} independent reviews</small></article>)}
  </section>;
}
