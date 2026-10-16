import { useEffect, useState, type FormEvent, type RefObject } from "react";
import type { AgentProfile, Outcome } from "../contracts/group";
import { Avatar, Icon } from "./ChatPrimitives";
import { findMention, insertMention, matchingMembers, shouldSendMessage, type MentionQuery } from "./chat-interactions";

export function ChatComposer({ inputRef: textarea, draft, onDraft, members, outcomes, outcomeId, onOutcome, busy, disabled, blocked, onSend }: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  draft: string; onDraft: (value: string) => void;
  members: AgentProfile[]; outcomes: Outcome[]; outcomeId: string | null; onOutcome: (id: string | null) => void;
  busy: boolean; disabled: boolean; blocked: boolean; onSend: (event?: FormEvent) => void;
}) {
  const [mention, setMention] = useState<MentionQuery | null>(null);
  const [index, setIndex] = useState(0);
  const candidates = matchingMembers(mention?.query ?? "", members);
  useEffect(() => {
    const element = textarea.current;
    if (element) { element.style.height = "auto"; element.style.height = Math.min(150, Math.max(64, element.scrollHeight)) + "px"; }
  }, [draft]);
  function sync(text: string, caret: number) { setMention(findMention(text, caret)); setIndex(0); }
  function choose(member: AgentProfile) {
    if (!mention) return;
    const next = insertMention(draft, mention, member.name);
    onDraft(next.text); setMention(null);
    requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(next.caret, next.caret); });
  }
  function openMentions() {
    const caret = textarea.current?.selectionStart ?? draft.length;
    const existing = findMention(draft, caret);
    if (existing) setMention(existing);
    else {
      const prefix = draft.slice(0, caret);
      const addition = (prefix && !/\s$/.test(prefix) ? " " : "") + "@";
      const text = prefix + addition + draft.slice(caret);
      onDraft(text); sync(text, caret + addition.length);
      requestAnimationFrame(() => textarea.current?.setSelectionRange(caret + addition.length, caret + addition.length));
    }
    setIndex(0); textarea.current?.focus();
  }
  return <form className="composer" onSubmit={event => { setMention(null); onSend(event); }}>
    {mention && <div className="mention-menu" id="mention-menu" role="listbox" aria-label="Choose a teammate">
      <div className="mention-menu-title">Message a teammate</div>
      {candidates.map((member, i) => <button key={member.id} id={"mention-" + member.id} type="button" role="option" aria-selected={index === i} className={index === i ? "is-active" : ""} onMouseDown={event => event.preventDefault()} onMouseEnter={() => setIndex(i)} onClick={() => choose(member)}><Avatar id={member.id} small/><span><strong>{member.name}</strong><small>{member.role}</small></span></button>)}
      {!candidates.length && <p className="mention-empty">No matching teammates</p>}
    </div>}
    {outcomes.length > 0 && <div className="compose-context"><label><select aria-label="Work to continue" value={outcomeId ?? ""} onChange={event => onOutcome(event.target.value || null)}><option value="">New goal / general chat</option>{outcomes.map(outcome => <option key={outcome.id} value={outcome.id}>Continue: {outcome.goals.at(-1)!.goal.slice(0, 45)}</option>)}</select></label></div>}
    <textarea ref={textarea} aria-label="Message" aria-controls={mention ? "mention-menu" : undefined} aria-expanded={!!mention} aria-autocomplete="list" aria-activedescendant={mention && candidates[index] ? "mention-" + candidates[index]!.id : undefined} placeholder="Message the team, or @ a teammate…" value={draft} disabled={disabled} maxLength={4000}
      onChange={event => { onDraft(event.target.value); sync(event.target.value, event.target.selectionStart); }}
      onClick={event => sync(event.currentTarget.value, event.currentTarget.selectionStart)}
      onBlur={event => { if (!event.relatedTarget || !event.currentTarget.form?.contains(event.relatedTarget)) setMention(null); }}
      onKeyDown={event => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) return;
        if (mention && event.key === "Escape") { event.preventDefault(); setMention(null); return; }
        if (mention && (event.key === "ArrowDown" || event.key === "ArrowUp") && candidates.length) { event.preventDefault(); setIndex(current => (current + (event.key === "ArrowDown" ? 1 : -1) + candidates.length) % candidates.length); return; }
        if (mention && event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) { event.preventDefault(); if (candidates[index]) choose(candidates[index]!); return; }
        if (shouldSendMessage({ key: event.key, shiftKey: event.shiftKey, isComposing: event.nativeEvent.isComposing, keyCode: event.nativeEvent.keyCode })) { event.preventDefault(); if (!disabled && !busy && !blocked && draft.trim()) { setMention(null); onSend(); } }
      }}/>
    <div className="composer-bottom"><button className="mention-trigger" type="button" aria-label="Mention a teammate" title="Choose a teammate" onClick={openMentions} disabled={disabled}>@</button><span className="composer-hint" title="⌘ / Ctrl + Enter to send">Enter to send · Shift + Enter for a new line</span><button className="send-button" type="submit" disabled={disabled || !draft.trim() || busy || blocked}>{busy ? "Working" : "Send"}<Icon type="send"/></button></div>
  </form>;
}
