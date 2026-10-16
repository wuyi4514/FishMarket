import { MEMBERS, type AgentId } from "../contracts/group";

export function Icon({ type }: { type: "fish" | "plus" | "send" | "arrow" | "check" | "copy" | "down" | "people" | "close" | "chat" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === "fish" ? <><path d="M3 12c4-7 11-7 16 0-5 7-12 7-16 0Z"/><path d="m19 12 3-4v8l-3-4Z"/><circle cx="7.5" cy="11" r=".8" fill="currentColor"/></> :
    type === "plus" ? <path d="M12 5v14M5 12h14"/> :
    type === "send" ? <><path d="m4 5 16 7-16 7 3-7-3-7Z"/><path d="M7 12h13"/></> :
    type === "check" ? <path d="m5 12 4 4L19 6"/> :
    type === "copy" ? <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></> :
    type === "down" ? <path d="M12 4v16m-6-6 6 6 6-6"/> :
    type === "people" ? <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 5"/></> :
    type === "close" ? <path d="m6 6 12 12M6 18 18 6"/> :
    type === "chat" ? <path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3Z"/> :
    <path d="M5 12h14m-5-5 5 5-5 5"/>}
  </svg>;
}

export function Avatar({ id, small = false }: { id: "human" | AgentId | "system"; small?: boolean }) {
  const member = MEMBERS.find(item => item.id === id);
  return <span className={"avatar" + (small ? " small" : "")} style={{ background: member?.color ?? (id === "human" ? "#52616c" : "#88959b") }} aria-hidden="true">{member?.initials ?? (id === "human" ? "Y" : "·")}</span>;
}
