import { useState, type ReactNode } from "react";
import Markdown from "react-markdown";
import type { AgentId, AgentProfile, Message } from "../contracts/group";
import { Avatar, Icon } from "./ChatPrimitives";
import { mentionPattern } from "./chat-interactions";

function highlightMentions(node: ReactNode, members: AgentProfile[]): ReactNode {
  if (typeof node !== "string") return Array.isArray(node) ? node.map((child, i) => <span key={i}>{highlightMentions(child, members)}</span>) : node;
  const matches = members.flatMap(member => Array.from(node.matchAll(mentionPattern(member.name, "giu")), match => ({ start: match.index! + match[1]!.length, text: match[2]! }))).sort((a, b) => a.start - b.start);
  let cursor = 0; const parts: ReactNode[] = [];
  for (const match of matches) { if (match.start < cursor) continue; parts.push(node.slice(cursor, match.start), <span className="message-mention" key={match.start}>{match.text}</span>); cursor = match.start + match.text.length; }
  parts.push(node.slice(cursor)); return parts;
}

const roleNames = { human: "Human", member: "Team member", owner: "Outcome owner", contributor: "Contributor", reviewer: "Independent reviewer", system: "System" };

export function MessageRow({ message, members, onOpenProfile }: { message: Message; members: AgentProfile[]; onOpenProfile: (id: AgentId) => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const member = members.find(item => item.id === message.author);
  const name = message.author === "human" ? "You" : member?.name ?? "NeoOrg";
  async function copy() {
    try { await navigator.clipboard.writeText(message.body); setCopyState("copied"); }
    catch { setCopyState("failed"); }
  }
  return <article className={"message message-" + message.author} data-message-id={message.id}>
    {member ? <button type="button" className="avatar-button" aria-label={"View " + name + " profile"} onClick={() => onOpenProfile(member.id)}><Avatar id={member.id}/></button> : <Avatar id={message.author}/>}
    <div className="message-content">
      <div className="message-byline"><strong>{name}</strong>{member && <span className="agent-tag">Agent</span>}{member && <span className="message-position">{member.role}</span>}{message.role !== "human" && <span className={"role-tag role-" + message.role}>{roleNames[message.role]}</span>}</div>
      <div className="message-body"><Markdown components={{ p: ({children}) => <p>{highlightMentions(children, members)}</p>, li: ({children}) => <li>{highlightMentions(children, members)}</li> }}>{message.body}</Markdown></div>
      <div className="message-actions">
        <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
        <button type="button" className="copy-message" aria-label={"Copy " + name + " message"} title="Copy message" onClick={() => void copy()}><Icon type={copyState === "copied" ? "check" : "copy"}/></button>
        <span role="status">{copyState === "copied" ? "Copied" : copyState === "failed" ? "Could not copy. Select the message text to copy it." : ""}</span>
      </div>
    </div>
  </article>;
}
