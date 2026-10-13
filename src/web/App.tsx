import { useEffect, useRef, useState, type FormEvent } from "react";
import Markdown from "react-markdown";
import { MEMBERS, type AgentId, type RoomView, type Outcome } from "../contracts/group";

type Session = { id: string; token: string };
const storageKey = "fishmarket.room.v1";
const examples = [
  { title: "Make a launch decision", text: "Help us decide whether to launch a small pilot next week. Five teams tested onboarding: four completed it independently; one needed operator help. We have no repeated recovery test yet. Produce an evidence-based recommendation and a practical plan with owners and exit criteria. Ask the relevant teammates to contribute." },
  { title: "Untangle a team bottleneck", text: "Our team spends too much time in status meetings. Eight people attend four 45-minute meetings each week, and decisions still go undocumented. Create a two-week improvement experiment with a clear decision log, responsibilities, and measurable success criteria. Get complementary perspectives and review the proposal independently." },
  { title: "Start with a simple question", text: "What does an outcome owner do in a team? Give me a concise answer." }
];
let bootPromise: Promise<{ session: Session; room: RoomView }> | null = null;
async function api<T>(path: string, session?: Session, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(session ? { "x-room-token": session.token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const value = await response.json();
  if (!response.ok) throw new Error(value.error ?? "The request could not be completed.");
  return value as T;
}
async function boot() {
  let saved: Session | null = null;
  try { saved = JSON.parse(localStorage.getItem(storageKey) ?? "null"); } catch {}
  if (saved?.id && saved.token) {
    try { return { session: saved, room: await api<RoomView>("/api/rooms/" + saved.id, saved) }; } catch (error) {
      if (!(error instanceof Error) || error.message !== "ROOM_NOT_FOUND") throw error;
    }
  }
  const created = await api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "The working room" });
  const session = { id: created.room.id, token: created.token };
  localStorage.setItem(storageKey, JSON.stringify(session));
  return { session, room: created.room };
}
const names = Object.fromEntries(MEMBERS.map(member => [member.id, member.name]));
const roleNames = { human: "Human", member: "Team member", owner: "Outcome owner", contributor: "Contributor", reviewer: "Independent reviewer", system: "System" };
function Icon({ type }: { type: "fish" | "plus" | "send" | "arrow" | "check" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "fish" ? <><path d="M3 12c4-7 11-7 16 0-5 7-12 7-16 0Z"/><path d="m19 12 3-4v8l-3-4Z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/></> :
    type === "plus" ? <path d="M12 5v14M5 12h14"/> :
    type === "send" ? <><path d="m4 5 16 7-16 7 3-7-3-7Z"/><path d="M7 12h13"/></> :
    type === "check" ? <path d="m5 12 4 4L19 6"/> : <path d="M5 12h14m-5-5 5 5-5 5"/>}
  </svg>;
}
function Avatar({ id, small = false }: { id: "human" | AgentId | "system"; small?: boolean }) {
  const member = MEMBERS.find(item => item.id === id);
  return <span className={"avatar" + (small ? " small" : "")} style={{ background: member?.color ?? (id === "human" ? "#303b34" : "#9a9f98") }}>{member?.initials ?? (id === "human" ? "Y" : "·")}</span>;
}
export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [draft, setDraft] = useState("");
  const [target, setTarget] = useState<"team" | AgentId>("team");
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("live");
  const endRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<{ body: string; key: string } | null>(null);
  useEffect(() => {
    let active = true;
    bootPromise ??= boot();
    bootPromise.then(value => { if (active) { setSession(value.session); setRoom(value.room); setOutcomeId(value.room.outcomes.find(item => item.status === "waiting")?.id ?? null); } }).catch(error => { if (active) setError(error.message); bootPromise = null; });
    api<{ mode: string }>("/api/config").then(value => { if (active) setMode(value.mode); }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!session) return;
    let active = true;
    const poll = async () => { try { const value = await api<RoomView>("/api/rooms/" + session.id, session); if (active) setRoom(value); } catch {} };
    const timer = setInterval(poll, posting || room?.run?.status === "running" ? 1300 : 8000);
    return () => { active = false; clearInterval(timer); };
  }, [session, posting, room?.run?.status]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [room?.messages.length, room?.run?.scope]);
  const working = posting || (room?.run?.status === "running" && !room.run.canResume);
  const activeOutcomes = room?.outcomes.filter(item => item.status !== "satisfied" && item.status !== "not_satisfied") ?? [];
  const currentOutcome = room?.outcomes.find(item => item.id === (outcomeId ?? room.run?.outcomeId)) ?? room?.outcomes.at(-1);
  const blocked = room?.run?.status === "recovery" && room.run.recovery?.retryable;
  async function send(event?: FormEvent) {
    event?.preventDefault(); if (!session || !draft.trim() || working || blocked) return;
    const body = draft.trim();
    requestRef.current = requestRef.current?.body === body ? requestRef.current : { body, key: crypto.randomUUID() };
    setPosting(true); setError(null); setDraft("");
    try {
      const result = await api<RoomView>("/api/rooms/" + session.id + "/messages", session, { contractVersion: "human-message-v1", body, target, outcomeId, requestKey: requestRef.current.key });
      setRoom(result);
      const waiting = result.outcomes.find(item => item.id === result.run?.outcomeId && item.status === "waiting");
      setOutcomeId(waiting?.id ?? null); requestRef.current = null;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection interrupted.");
      const latest = await api<RoomView>("/api/rooms/" + session.id, session).catch(() => null);
      if (latest) setRoom(latest);
      if (!latest?.messages.some(message => message.author === "human" && message.body === body)) setDraft(body);
    } finally { setPosting(false); }
  }
  async function resume() {
    if (!session || posting) return; setPosting(true); setError(null);
    try { setRoom(await api<RoomView>("/api/rooms/" + session.id + "/resume", session, {})); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not resume."); }
    finally { setPosting(false); }
  }
  async function newRoom() {
    if (working) return;
    setError(null);
    try {
      const created = await api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v1", title: "The working room" });
      const value = { id: created.room.id, token: created.token };
      localStorage.setItem(storageKey, JSON.stringify(value)); setSession(value); setRoom(created.room); setOutcomeId(null); setDraft(""); requestRef.current = null;
    } catch (error) { setError(error instanceof Error ? error.message : "Could not create a room."); }
  }
  return <div className="workspace">
    <aside className="sidebar">
      <a className="brand" href="/"><span className="brand-icon"><Icon type="fish"/></span>FishMarket<span className="brand-period">.</span></a>
      <p className="side-label">YOUR WORKSPACE</p>
      <div className="room-nav"><span className="room-symbol">#</span><div>The working room<small>A place to get things done</small></div><span className="active-dot"/></div>
      <button className="new-room" disabled={!!working} onClick={newRoom}><Icon type="plus"/> Start a fresh room</button>
      <div className="team-section"><p className="side-label">YOUR TEAM <span>4 AGENTS + YOU</span></p>
        <div className="member-row"><Avatar id="human" small/><div>You<small>The human in the loop</small></div><span className="human-tag">Human</span></div>
        {MEMBERS.map(member => <button key={member.id} className={"member-row member-button" + (target === member.id ? " selected" : "")} onClick={() => { setTarget(member.id); draftRef.current?.focus(); }}>
          <Avatar id={member.id} small/><div>{member.name}<small>{member.role}</small></div><span className="member-online"/>
        </button>)}
      </div>
      <div className="sidebar-note"><span className="note-line"/><p>Many perspectives.<br/><strong>One accountable owner.</strong></p><small>Persistent teammates. Shared context.<br/>A clear path to a reviewed result.</small></div>
      <a className="source-link" href="https://github.com/wuyi4514/FishMarket" target="_blank" rel="noreferrer">Open source <span>↗</span></a>
    </aside>
    <main className="chat-shell">
      <header className="chat-header"><div><p className="eyebrow">A HUMAN + AI WORKSPACE</p><h1>The working room <span>↗</span></h1></div>
        <div className="header-right"><div className="avatar-stack"><Avatar id="human" small/>{MEMBERS.map(member => <Avatar id={member.id} key={member.id} small/>)}</div><span className={"live-badge" + (mode !== "live" ? " fixture" : "")}><i/>{mode === "live" ? "Gemini · Live" : "Offline preview"}</span></div>
      </header>
      <section className="timeline" aria-label="Group conversation" aria-live="polite">
        {!room?.messages.length ? <div className="welcome">
          <div className="welcome-mark"><Icon type="fish"/></div><p className="eyebrow">GOOD WORK STARTS WITH A CONVERSATION</p>
          <h2>Bring a goal.<br/><em>Build an outcome.</em></h2>
          <p className="welcome-copy">You bring the context. Your AI teammates bring different perspectives. One takes ownership, brings in the right people, and follows through to a reviewed result.</p>
          <div className="example-grid">{examples.map((example, i) => <button key={example.title} onClick={() => { setDraft(example.text); setTarget("team"); draftRef.current?.focus(); }}><span className="example-number">0{i + 1}</span><strong>{example.title}</strong><Icon type="arrow"/></button>)}</div>
          <div className="welcome-team">{MEMBERS.map(member => <div key={member.id}><Avatar id={member.id}/><strong>{member.name}</strong><span>{member.role}</span></div>)}</div>
        </div> : <div className="messages">
          <div className="timeline-date">{new Date(room.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}<span> · Shared working context</span></div>
          {room.messages.map(message => <article className={"message message-" + message.author} key={message.id}>
            <Avatar id={message.author}/><div className="message-content"><div className="message-byline"><strong>{message.author === "human" ? "You" : names[message.author] ?? "FishMarket"}</strong><span className={"role-tag role-" + message.role}>{roleNames[message.role]}</span><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
              <div className="message-body"><Markdown>{message.body}</Markdown></div></div>
          </article>)}
          {working && <div className="thinking"><Avatar id={room.run?.speaker ?? "harbor"} small/><span>{names[room.run?.speaker ?? "harbor"]} is {room.run?.scope === "review" ? "reviewing the delivery" : "working on the next contribution"}<i><b/><b/><b/></i></span></div>}
          <div ref={endRef}/>
        </div>}
      </section>
      <div className="composer-zone">
        {currentOutcome && <OutcomeStrip outcome={currentOutcome} onContinue={() => setOutcomeId(currentOutcome.id)}/>}
        {(room?.run?.status === "recovery" || room?.run?.canResume) && <div className="recovery-banner"><div><strong>The work needs attention</strong><p>{room.run.recovery?.nextAction ?? "The last request was interrupted. Resume the saved step."}</p></div>{room.run.canResume && room.run.recovery?.retryable !== false && <button onClick={resume} disabled={posting}>Resume work ↗</button>}</div>}
        {error && <div className="error-banner" role="alert">{error === "ROOM_BUSY" ? "The team is still working. Your message is saved in the composer." : error}</div>}
        <form className="composer" onSubmit={send}>
          <div className="compose-context"><label><span>To</span><select aria-label="Message recipient" value={target} onChange={event => setTarget(event.target.value as "team" | AgentId)}><option value="team">The team</option>{MEMBERS.map(member => <option value={member.id} key={member.id}>@{member.name}</option>)}</select></label>
            {activeOutcomes.length > 0 && <label><select aria-label="Work to continue" value={outcomeId ?? ""} onChange={event => setOutcomeId(event.target.value || null)}><option value="">New goal / general chat</option>{activeOutcomes.map(outcome => <option key={outcome.id} value={outcome.id}>Continue: {outcome.goals.at(-1)!.goal.slice(0, 45)}</option>)}</select></label>}
          </div>
          <textarea ref={draftRef} aria-label="Message" placeholder="Share a goal, add evidence, or ask a teammate…" value={draft} maxLength={4000} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) { event.preventDefault(); void send(); } }}/>
          <div className="composer-bottom"><span>Your judgment stays at the center. <small>⌘ / Ctrl + Enter to send</small></span><button className="send-button" type="submit" disabled={!session || !draft.trim() || !!working || !!blocked}>{working ? "Working" : "Send"}<Icon type="send"/></button></div>
        </form>
        <p className="composer-footnote">{mode !== "live" ? "Offline preview uses deterministic fixtures. Production uses real Gemini." : "AI can make mistakes. Review the evidence and make the final business decision."}</p>
      </div>
    </main>
  </div>;
}
function OutcomeStrip({ outcome, onContinue }: { outcome: Outcome; onContinue: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const labels = { active: "In progress", waiting: "Your input needed", in_review: "Independent review", satisfied: "Reviewed · Goal achieved", not_satisfied: "Reviewed · Goal not fully achieved" };
  const done = outcome.status === "satisfied" || outcome.status === "not_satisfied";
  const goal = outcome.goals.at(-1)!;
  return <div className={"outcome-strip outcome-" + outcome.status}>
    <button className="outcome-summary" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><span className="outcome-icon">{done ? <Icon type="check"/> : "↗"}</span><span><strong>{labels[outcome.status]}</strong><small>{goal.goal}</small></span><span className="owner-chip">{names[outcome.owner]} owns this</span><span className="expand-icon">{expanded ? "−" : "+"}</span></button>
    {expanded && <div className="outcome-detail"><p className="side-label">ACCEPTANCE CRITERIA</p><ul>{goal.criteria.map((criterion, index) => <li key={index}>{criterion}</li>)}</ul>
      {outcome.contributions.filter(item => item.revision === goal.revision).map(item => <p className="contribution-line" key={item.id}><strong>{names[item.agentId]}</strong><span>{item.state === "delivered" ? "Contribution delivered" : "Contribution requested"}</span></p>)}
      <p className="assurance">{done ? "Independent review recorded. Business execution remains a human decision." : outcome.status === "waiting" ? "The owner keeps responsibility while waiting for your input." : "The owner integrates contributions and is accountable for the final delivery."}</p>
      {!done && <button className="continue-button" onClick={onContinue}>Continue this goal ↗</button>}
    </div>}
  </div>;
}
