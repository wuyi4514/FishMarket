import { useEffect, useRef, useState, type FormEvent } from "react";
import { TEAM_CATALOG, type AgentId, type AgentProfile, type RoomView, type Outcome } from "../contracts/group";
import { WorkspaceNavigator, reconcileRoomProjection, type Session, type Workspace, type WorkspaceSelection } from "./workspace";
import { AgentProfileDialog, NewRoomDialog, TeamDialog } from "./RoomDialogs";
import { Avatar, GroupAvatar, Icon } from "./ChatPrimitives";
import { MessageRow } from "./MessageRow";
import { ChatComposer } from "./ChatComposer";
import { useTimeline } from "./useTimeline";
import { mentionTarget } from "./chat-interactions";

const examples = [
  { title: "Make a launch decision", text: "Help us decide whether to launch a small pilot next week. Five teams tested onboarding: four completed it independently; one needed operator help. We have no repeated recovery test yet. Produce an evidence-based recommendation and a practical plan with owners and exit criteria. Ask the relevant teammates to contribute." },
  { title: "Untangle a team bottleneck", text: "Our team spends too much time in status meetings. Eight people attend four 45-minute meetings each week, and decisions still go undocumented. Create a two-week improvement experiment with a clear decision log, responsibilities, and measurable success criteria. Get complementary perspectives and review the proposal independently." },
  { title: "Start with a simple question", text: "What does an outcome owner do in a team? Give me a concise answer." }
];
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
let workspaceNavigator: WorkspaceNavigator | null = null;
function navigator() {
  return workspaceNavigator ??= new WorkspaceNavigator(localStorage, {
    create: (title, members = TEAM_CATALOG.map(member => member.id)) => api<{ room: RoomView; token: string }>("/api/rooms", undefined, { contractVersion: "create-room-v3", title, members }),
    read: session => api<RoomView>("/api/rooms/" + session.id, session)
  });
}
export function App() {
  const [filter, setFilter] = useState<"all" | "pending" | "unread">("all");
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const roomViews = useRef(new Map<string, RoomView>());
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [draft, setDraft] = useState("");
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("live");
  const [modelName, setModelName] = useState("Gemini · Vertex AI");
  const [transitioning, setTransitioning] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [profileId, setProfileId] = useState<AgentId | null>(null);
  const [showTeam, setShowTeam] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(null);
  const selectedRoomRef = useRef<string | null>(null);
  const navigationBusy = useRef(false);
  const roomDrafts = useRef(new Map<string, { draft: string; outcomeId: string | null }>());
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<{ fingerprint: string; key: string } | null>(null);
  function acceptRoom(value: RoomView) {
    if (selectedRoomRef.current !== value.id) return;
    roomViews.current.set(value.id, value);
    setRoom(current => reconcileRoomProjection(current, value, selectedRoomRef.current));
  }
  function install(value: WorkspaceSelection) {
    if (session) roomDrafts.current.set(session.id, { draft, outcomeId });
    const savedDraft = roomDrafts.current.get(value.session.id);
    selectedRoomRef.current = value.session.id;
    roomViews.current.set(value.room.id, value.room);
    setSession(value.session); setRoom(value.room); setWorkspace(value.workspace); setPersistenceWarning(value.persistenceWarning);
    setDraft(savedDraft?.draft ?? "");
    setOutcomeId(savedDraft?.outcomeId ?? value.room.outcomes.find(item => item.status === "waiting")?.id ?? null);
    requestRef.current = null;
  }
  useEffect(() => {
    let active = true;
    navigator().boot().then(value => { if (active) install(value); }).catch(error => { if (active) setError(error.message); });
    api<{ mode: string; model: string }>("/api/config").then(value => { if (active) { setMode(value.mode); setModelName(value.mode === "live" ? value.model + " · Vertex AI" : "Offline development fixture"); } }).catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!session) return;
    let active = true;
    const poll = async () => { try { const value = await api<RoomView>("/api/rooms/" + session.id, session); if (active) acceptRoom(value); } catch {} };
    const timer = setInterval(poll, posting || room?.run?.status === "running" ? 1300 : 8000);
    return () => { active = false; clearInterval(timer); };
  }, [session, posting, room?.run?.status]);
  const working = posting || (room?.run?.status === "running" && !room.run.canResume);
  const timeline = useTimeline(room?.id, room?.messages.length ?? 0, !!working);
  const navigationDisabled = !session || !!working || transitioning;
  const members = room?.agentProfiles ?? TEAM_CATALOG;
  const names = Object.fromEntries(members.map(member => [member.id, member.name]));
  const pendingRooms = new Set([...roomViews.current.values()].filter(value => value.outcomes.some(outcome => outcome.gate?.state === "pending") || value.run?.status === "recovery").map(value => value.id));
  const visibleRooms = workspace?.rooms.filter(entry => entry.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (filter === "all" || filter === "pending" && pendingRooms.has(entry.id) || filter === "unread" && entry.id === session?.id && timeline.unread > 0)) ?? [];
  const profile = members.find(member => member.id === profileId);
  const activeOutcomes = room?.outcomes.filter(item => item.status !== "satisfied" && item.status !== "not_satisfied") ?? [];
  const currentOutcome = room?.outcomes.find(item => item.id === (outcomeId ?? room.run?.outcomeId)) ?? room?.outcomes.at(-1);
  const blocked = room?.run?.status === "recovery" && room.run.recovery?.retryable;
  async function send(event?: FormEvent) {
    event?.preventDefault(); if (!session || !draft.trim() || working || blocked || navigationBusy.current) return;
    const body = draft.trim(); const target = mentionTarget(body, members);
    timeline.latest();
    const fingerprint = JSON.stringify({ body, target, outcomeId });
    requestRef.current = requestRef.current?.fingerprint === fingerprint ? requestRef.current : { fingerprint, key: crypto.randomUUID() };
    setPosting(true); setError(null); setDraft("");
    try {
      const result = await api<RoomView>("/api/rooms/" + session.id + "/messages", session, { contractVersion: "human-message-v1", body, target, outcomeId, requestKey: requestRef.current.key });
      acceptRoom(result);
      const waiting = result.outcomes.find(item => item.id === result.run?.outcomeId && item.status === "waiting");
      setOutcomeId(waiting?.id ?? null); requestRef.current = null;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection interrupted.");
      const latest = await api<RoomView>("/api/rooms/" + session.id, session).catch(() => null);
      if (latest) acceptRoom(latest);
      if (!latest?.messages.some(message => message.author === "human" && message.body === body)) setDraft(body);
    } finally { setPosting(false); }
  }
  async function resume() {
    if (!session || posting || navigationBusy.current) return; setPosting(true); setError(null);
    try { acceptRoom(await api<RoomView>("/api/rooms/" + session.id + "/resume", session, {})); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not resume."); }
    finally { setPosting(false); }
  }
  async function newRoom(title: string, members: AgentId[]) {
    if (working || navigationBusy.current) return;
    navigationBusy.current = true; setTransitioning(true); setCreationError(null); setError(null);
    try {
      // Restore the directory before creation, including after a dev hot reload
      // replaces the module singleton while preserving the mounted UI state.
      await navigator().boot();
      install(await navigator().create(title, members)); setShowNewRoom(false);
    } catch (error) { setCreationError(error instanceof Error ? error.message : "Could not create a room."); }
    finally { navigationBusy.current = false; setTransitioning(false); }
  }
  async function switchRoom(id: string) {
    if (navigationDisabled || navigationBusy.current || id === session?.id) return;
    navigationBusy.current = true; setTransitioning(true); setError(null);
    try { const value = await navigator().select(id); if (value) install(value); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not open the room. Existing access has been preserved."); }
    finally { navigationBusy.current = false; setTransitioning(false); }
  }
  function openNewRoom() { setCreationError(null); setShowNewRoom(true); }
  function profileAvatar(id: "human" | AgentId | "system", small = false) {
    return id === "human" || id === "system" ? <Avatar id={id} small={small}/> : <button className="avatar-button" type="button" aria-label={"View " + names[id] + " profile"} onClick={() => setProfileId(id)}><Avatar id={id} small={small}/></button>;
  }
  return <div className="workspace">
    <nav className="primary-nav" aria-label="NeoOrg navigation">
      <a className="brand" href="/" aria-label="NeoOrg home"><span className="brand-icon"><img className="brand-logo" src="/brand/neoorg-logo.png" alt="NeoOrg"/></span></a>
      <a className="nav-icon active" aria-label="Group chats" title="Group chats" href="#panel-messages" aria-current="page"><Icon type="chat"/></a>
    </nav>
    <aside className="sidebar">
      <div className="workspace-heading"><span className="sr-only">GROUP CHATS</span><div className="room-filters">{(["all", "pending", "unread"] as const).map(value => <button key={value} className={filter === value ? "selected" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === "all" ? "All" : value === "pending" ? "Pending" : "Unread"} <span>{value === "all" ? workspace?.rooms.length ?? 0 : value === "pending" ? pendingRooms.size : timeline.unread ? 1 : 0}</span></button>)}</div><button className="new-room-icon search-icon" aria-label="Search group chats" onClick={() => setSearching(!searching)}><Icon type="search"/></button><button type="button" className="new-room-icon" aria-label="Create a group chat" disabled={navigationDisabled} onClick={openNewRoom}><Icon type="plus"/></button></div>
      {searching && <input className="room-search" aria-label="Search group chats" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search groups"/>}
      <nav className="room-list" aria-label="Working rooms">{visibleRooms.map(entry => <button key={entry.id} className={"room-nav" + (entry.id === session?.id ? " active" : "")} aria-current={entry.id === session?.id ? "page" : undefined} disabled={navigationDisabled} onClick={() => void switchRoom(entry.id)}><GroupAvatar members={roomViews.current.get(entry.id)?.agentProfiles ?? TEAM_CATALOG}/><span className="room-label">{entry.title}<small>{entry.id === session?.id ? "A shared goal and workspace" : "Open conversation"}</small></span></button>)}</nav>
      {workspace && !visibleRooms.length && <p className="room-list-empty">{query ? "No matching groups" : "No groups in this view"}</p>}
      <div className="team-section"><p className="side-label">TEAM MEMBERS</p>
        <div className="member-row"><Avatar id="human" small/><div><strong>You</strong><small>Human decision owner</small></div></div>
        {members.map(member => <button key={member.id} aria-label={"View " + member.name + " profile"} className="member-row member-button" onClick={() => setProfileId(member.id)}>
          <Avatar id={member.id} small/><div><strong>{member.name}</strong><small>{member.role}</small></div>
        </button>)}
      </div>
      <a className="source-link" href="https://github.com/wuyi4514/FishMarket" target="_blank" rel="noreferrer">NeoOrg · Open source <span>↗</span></a>
    </aside>
    <main className="chat-shell">
      <header className="chat-header"><div className="group-identity"><div className="header-title"><h1>{room?.title ?? "Your workspace"}</h1></div></div>
        <div className="header-right"><div className="avatar-stack">{members.map(member => <span key={member.id}>{profileAvatar(member.id, true)}</span>)}</div><button type="button" className="member-count" onClick={() => setShowTeam(true)} aria-label="View room members"><span>{members.length + 1} members</span></button></div>
      </header>
      <div className="conversation-tabs" role="tablist" aria-label="Group views"><button id="tab-messages" role="tab" aria-controls="panel-messages" aria-selected="true" className="selected">Messages</button></div>
      <div className="mobile-workspace"><select aria-label="Working room" value={session?.id ?? ""} disabled={navigationDisabled} onChange={event => void switchRoom(event.target.value)}>{workspace?.rooms.map(entry => <option key={entry.id} value={entry.id}>{entry.title}</option>)}</select><button type="button" aria-label="Create a group chat" title="Create a group chat" disabled={navigationDisabled} onClick={openNewRoom}><Icon type="plus"/></button></div>
      <div className="conversation-panel" id="panel-messages" role="tabpanel" aria-labelledby="tab-messages">
      <div className="conversation-stage"><section ref={timeline.ref} onScroll={timeline.onScroll} className="timeline" aria-label="Group conversation" aria-live="polite">
        {!room?.messages.length ? <div className="welcome">
          <h2>Start with a shared goal</h2><p>Your AI teammates can work from the context in this group.</p>
          <div className="example-grid">{examples.map((example, i) => <button key={example.title} onClick={() => { setDraft(example.text); draftRef.current?.focus(); }}><span className="example-number">0{i + 1}</span><strong>{example.title}</strong><Icon type="arrow"/></button>)}</div>
        </div> : <div className="messages">
          <div className="timeline-date">{new Date(room.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div>
          <div role="log" aria-label="Group messages">{room.messages.map(message => <MessageRow key={message.id} message={message} members={members} onOpenProfile={setProfileId}/>)}</div>
          {working && <div className="thinking"><Avatar id={room.run?.speaker ?? "harbor"} small/><span>{names[room.run?.speaker ?? "harbor"]} is {room.run?.scope === "review" ? "reviewing the delivery" : "working on the next contribution"}<i><b/><b/><b/></i></span></div>}
        </div>}
      </section>{timeline.away && <button type="button" className="latest-messages" aria-label="Return to latest messages" onClick={timeline.latest}><Icon type="down"/>{timeline.unread ? `${timeline.unread} new messages` : "Latest messages"}</button>}</div>
      <div className="composer-zone">
        {currentOutcome && <OutcomeStrip outcome={currentOutcome} members={members} onContinue={() => setOutcomeId(currentOutcome.id)}/>}
        {(room?.run?.status === "recovery" || room?.run?.canResume) && <div className="recovery-banner"><div><strong>The work needs attention</strong><p>{room.run.recovery?.nextAction ?? "The last request was interrupted. Resume the saved step."}</p></div>{room.run.canResume && room.run.recovery?.retryable !== false && <button onClick={resume} disabled={posting}>Resume work ↗</button>}</div>}
        {error && <div className="error-banner" role="alert">{error === "ROOM_BUSY" ? "The team is still working. Your message is saved in the composer." : error}</div>}
        {persistenceWarning && <div className="error-banner" role="alert">{persistenceWarning}</div>}
        <ChatComposer key={session?.id ?? "loading"} inputRef={draftRef} draft={draft} onDraft={setDraft} members={members} outcomes={activeOutcomes} outcomeId={outcomeId} onOutcome={setOutcomeId} busy={!!working} disabled={!session || transitioning} blocked={!!blocked} onSend={event => void send(event)}/>
        <p className="composer-footnote">{mode !== "live" ? "Offline preview uses deterministic fixtures. Production uses real Gemini." : "AI can make mistakes. Review the evidence and make the final business decision."}</p>
      </div>
      </div>
    </main>
    {showNewRoom && <NewRoomDialog defaultTitle={"Working room " + ((workspace?.rooms.length ?? 0) + 1)} busy={transitioning} error={creationError} hasDraft={!!draft.trim()} onClose={() => setShowNewRoom(false)} onCreate={(title, members) => void newRoom(title, members)}/>}
    {showTeam && <TeamDialog members={members} onClose={() => setShowTeam(false)}
      onOpenProfile={id => { setShowTeam(false); setProfileId(id); }}/>}
    {profile && <AgentProfileDialog key={profile.id} member={profile} model={modelName} onClose={() => setProfileId(null)}/>}
  </div>;
}
function OutcomeStrip({ outcome, members, onContinue }: { outcome: Outcome; members: AgentProfile[]; onContinue: () => void }) {
  const names = Object.fromEntries(members.map(member => [member.id, member.name]));
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
