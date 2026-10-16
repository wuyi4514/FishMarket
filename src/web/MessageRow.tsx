import { useState } from "react";
import Markdown from "react-markdown";
import type { AgentId, AgentProfile, Message } from "../contracts/group";
import { Avatar, Icon } from "./ChatPrimitives";

const roleNames = { human: "Human", member: "Team member", owner: "Outcome owner", contributor: "Contributor", reviewer: "Independent reviewer", system: "System" };

export function MessageRow({ message, members, onOpenProfile }: { message: Message; members: AgentProfile[]; onOpenProfile: (id: AgentId) => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const member = members.find(item => item.id === message.author);
  const name = message.author === "human" ? "You" : member?.name ?? "FishMarket";
  async function copy() {
    try { await navigator.clipboard.writeText(message.body); setCopyState("copied"); }
    catch { setCopyState("failed"); }
  }
  return <article className={"message message-" + message.author} data-message-id={message.id}>
    {member ? <button type="button" className="avatar-button" aria-label={"View " + name + " profile"} onClick={() => onOpenProfile(member.id)}><Avatar id={member.id}/></button> : <Avatar id={message.author}/>}
    <div className="message-content">
      <div className="message-byline"><strong>{name}</strong>{member && <span className="message-position">{member.role}</span>}{message.role !== "human" && <span className={"role-tag role-" + message.role}>{roleNames[message.role]}</span>}</div>
      <div className="message-body"><Markdown>{message.body}</Markdown></div>
      <div className="message-actions">
        <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
        <button type="button" className="copy-message" aria-label={"Copy " + name + " message"} title="Copy message" onClick={() => void copy()}><Icon type={copyState === "copied" ? "check" : "copy"}/></button>
        <span role="status">{copyState === "copied" ? "Copied" : copyState === "failed" ? "Could not copy. Select the message text to copy it." : ""}</span>
      </div>
    </div>
  </article>;
}
