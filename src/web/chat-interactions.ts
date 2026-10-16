import type { AgentProfile } from "../contracts/group";

export type MentionQuery = { start: number; end: number; query: string };

export function findMention(text: string, caret: number): MentionQuery | null {
  if (caret < 0 || caret > text.length) return null;
  const match = text.slice(0, caret).match(/(?:^|\s)@([\p{L}\p{N}_-]{0,40})$/u);
  return match ? { start: caret - match[1]!.length - 1, end: caret, query: match[1]! } : null;
}

export function matchingMembers(query: string, members: AgentProfile[]): AgentProfile[] {
  const term = query.trim().toLocaleLowerCase();
  return members.filter(member => `${member.name} ${member.role}`.toLocaleLowerCase().includes(term));
}

export function insertMention(text: string, range: MentionQuery, name: string) {
  const prefix = text.slice(0, range.start) + "@" + name + " ";
  return { text: prefix + text.slice(range.end).replace(/^ /, ""), caret: prefix.length };
}

export function shouldSendMessage(event: { key: string; shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; isComposing?: boolean; keyCode?: number }) {
  return event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229;
}

export function isNearLatest({ scrollHeight, scrollTop, clientHeight }: { scrollHeight: number; scrollTop: number; clientHeight: number }) {
  return scrollHeight - clientHeight - scrollTop <= 80;
}
