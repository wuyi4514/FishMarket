import { useEffect, useRef, useState, type ReactNode } from "react";
import { MEMBERS, type AgentId, type AgentProfile } from "../contracts/group";
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
export function NewRoomDialog({ defaultTitle, busy, error, hasDraft, onClose, onCreate }: { defaultTitle: string; busy: boolean; error: string | null; hasDraft: boolean; onClose: () => void; onCreate: (title: string, members: AgentId[]) => void }) {
  const [title, setTitle] = useState(defaultTitle);
  const [selected, setSelected] = useState<AgentId[]>(MEMBERS.map(member => member.id));
  return <Modal titleId="new-room-heading" onClose={onClose} busy={busy} className="create-dialog">
    <h2 id="new-room-heading">Create a group chat</h2>
    <p className="dialog-intro">Choose your teammates. Start with a clean shared context.</p>
    <form onSubmit={event => { event.preventDefault(); if (!busy && title.trim() && selected.length >= 2) onCreate(title.trim(), MEMBERS.filter(member => selected.includes(member.id)).map(member => member.id)); }}>
      <label className="room-title-label" htmlFor="new-room-title">Room name</label>
      <input id="new-room-title" data-initial-focus required maxLength={80} value={title} disabled={busy} onChange={event => setTitle(event.target.value)}/>
      <fieldset className="room-members-picker" disabled={busy} aria-describedby="room-members-help"><legend>Members <span>{selected.length + 1} including you</span></legend>
        <div className="included-human"><Avatar id="human" small/><span>You</span><small>Always included</small></div>
        <div className="room-member-options">{MEMBERS.map(member => <label key={member.id} className={"room-member-option" + (selected.includes(member.id) ? " is-selected" : "")}><input type="checkbox" aria-label={"Include " + member.name} checked={selected.includes(member.id)} onChange={event => setSelected(current => event.target.checked ? [...current, member.id] : current.filter(id => id !== member.id))}/><Avatar id={member.id} small/><span><strong>{member.name}</strong><small>{member.role}</small></span></label>)}</div>
        <p id="room-members-help">Choose at least two agents so each delivery can be independently reviewed.</p>
      </fieldset>
      <div className="room-preservation"><span>↗</span><p>Your existing rooms and sent messages stay intact. You can return from the workspace list.{hasDraft ? " Your unsent draft stays with the current room in this tab." : ""}</p></div>
      {error && <p className="dialog-error" role="alert">{error}</p>}
      <div className="dialog-actions"><button type="button" className="secondary-action" disabled={busy} onClick={onClose}>Cancel</button><button type="submit" className="primary-action" disabled={busy || !title.trim() || selected.length < 2}>{busy ? "Creating room…" : "Create room ↗"}</button></div>
    </form>
  </Modal>;
}
export function AgentProfileDialog({ member, onClose }: { member: AgentProfile; onClose: () => void }) {
  return <Modal titleId="agent-profile-heading" onClose={onClose} className="profile-dialog">
    <p className="eyebrow">MEET YOUR TEAMMATE</p>
    <div className="profile-heading"><span className="avatar profile-avatar" style={{ background: member.color }}>{member.initials}</span><div><h2 id="agent-profile-heading">{member.name}</h2><span className="profile-position">{member.role}</span></div></div>
    <p className="dialog-intro">{member.capability}</p>
    <section className="profile-section"><h3>Position responsibilities</h3><ol>{member.responsibilities.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ol></section>
    <section className="profile-section profile-boundaries"><h3>Capability boundaries</h3><ul>{member.boundaries.map(item => <li key={item}>{item}</li>)}</ul></section>
    <p className="profile-scope">This is a persistent job identity. Outcome owner, contributor and independent reviewer are separate assignments for each goal. No teammate has external tools connected in this prototype.</p>
    <div className="dialog-actions"><button type="button" className="secondary-action" onClick={onClose}>Back to the room</button></div>
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
