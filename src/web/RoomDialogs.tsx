import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AgentId, AgentProfile } from "../contracts/group";
import { Avatar } from "./ChatPrimitives";

export function Modal({ titleId, onClose, busy = false, children, className = "" }: { titleId: string; onClose: () => void; busy?: boolean; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!; const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    return () => { dialog.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  return <dialog ref={ref} className={"room-dialog " + className} aria-labelledby={titleId} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <button className="dialog-close" type="button" aria-label="Close dialog" disabled={busy} onClick={onClose}>×</button>
    {children}
  </dialog>;
}
export function NewRoomDialog({ defaultTitle, busy, error, hasDraft, onClose, onCreate }: { defaultTitle: string; busy: boolean; error: string | null; hasDraft: boolean; onClose: () => void; onCreate: (title: string) => void }) {
  const [title, setTitle] = useState(defaultTitle);
  return <Modal titleId="new-room-heading" onClose={onClose} busy={busy} className="create-dialog">
    <p className="eyebrow">A NEW SPACE FOR GOOD WORK</p>
    <h2 id="new-room-heading">Start a fresh room.</h2>
    <p className="dialog-intro">The same teammates. A clean conversation and a new shared context.</p>
    <form onSubmit={event => { event.preventDefault(); if (!busy && title.trim()) onCreate(title.trim()); }}>
      <label className="room-title-label" htmlFor="new-room-title">Room name</label>
      <input id="new-room-title" data-initial-focus required maxLength={80} value={title} disabled={busy} onChange={event => setTitle(event.target.value)}/>
      <div className="room-preservation"><span>↗</span><p>Your existing rooms and sent messages stay intact. You can return from the workspace list.{hasDraft ? " Your unsent draft stays with the current room in this tab." : ""}</p></div>
      {error && <p className="dialog-error" role="alert">{error}</p>}
      <div className="dialog-actions"><button type="button" className="secondary-action" disabled={busy} onClick={onClose}>Keep working here</button><button type="submit" className="primary-action" disabled={busy || !title.trim()}>{busy ? "Creating room…" : "Create room ↗"}</button></div>
    </form>
  </Modal>;
}
export function AgentProfileDialog({ member, onClose, onMessage }: { member: AgentProfile; onClose: () => void; onMessage: () => void }) {
  return <Modal titleId="agent-profile-heading" onClose={onClose} className="profile-dialog">
    <p className="eyebrow">MEET YOUR TEAMMATE</p>
    <div className="profile-heading"><span className="avatar profile-avatar" style={{ background: member.color }}>{member.initials}</span><div><h2 id="agent-profile-heading">{member.name}</h2><span className="profile-position">{member.role}</span></div></div>
    <p className="dialog-intro">{member.capability}</p>
    <section className="profile-section"><h3>Position responsibilities</h3><ol>{member.responsibilities.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol></section>
    <section className="profile-section profile-boundaries"><h3>Capability boundaries</h3><ul>{member.boundaries.map(item => <li key={item}>{item}</li>)}</ul></section>
    <p className="profile-scope">This is a persistent job identity. Outcome owner, contributor and independent reviewer are separate assignments for each goal. No teammate has external tools connected in this prototype.</p>
    <div className="dialog-actions"><button type="button" className="secondary-action" onClick={onClose}>Back to the room</button><button type="button" className="primary-action" onClick={onMessage}>Message {member.name} ↗</button></div>
  </Modal>;
}

export function TeamDialog({ members, onClose, onOpenProfile }: { members: AgentProfile[]; onClose: () => void; onOpenProfile: (id: AgentId) => void }) {
  return <Modal titleId="team-heading" onClose={onClose} className="profile-dialog team-dialog">
    <h2 id="team-heading">Room members</h2>
    <div className="team-directory">
      <div className="member-row"><Avatar id="human"/><div><strong>You</strong><small>Human · Final decision</small></div></div>
      {members.map(member => <button className="member-row member-button" key={member.id} onClick={() => onOpenProfile(member.id)}><Avatar id={member.id}/><div><strong>{member.name}</strong><small>{member.role}</small></div><span className="directory-arrow">↗</span></button>)}
    </div>
  </Modal>;
}
