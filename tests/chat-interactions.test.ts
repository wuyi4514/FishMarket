import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MEMBERS, type Message } from "../src/contracts/group";
import { findMention, insertMention, matchingMembers, shouldSendMessage, isNearLatest } from "../src/web/chat-interactions";
import { MessageRow } from "../src/web/MessageRow";

describe("production chat interaction policies", () => {
  it("recognizes a caret-local mention but never an email address", () => {
    expect(findMention("Please ask @Re", 14)).toEqual({ start: 11, end: 14, query: "Re" });
    expect(findMention("@", 1)?.query).toBe("");
    expect(findMention("mail name@example.com", 21)).toBeNull();
    expect(findMention("@Reef already answered", 22)).toBeNull();
    expect(findMention("hello", -1)).toBeNull();
  });
  it("selects only the current room's real profiles and preserves surrounding text", () => {
    expect(matchingMembers("reef", MEMBERS).map(member => member.id)).toEqual(["reef"]);
    expect(matchingMembers("", MEMBERS.slice(0, 1))).toHaveLength(1);
    expect(matchingMembers("unknown", MEMBERS)).toEqual([]);
    expect(insertMention("Ask @Re about this", { start: 4, end: 7, query: "Re" }, "Reef"))
      .toEqual({ text: "Ask @Reef about this", caret: 10 });
  });
  it("supports Enter and modifiers without sending an IME composition or Shift+Enter", () => {
    expect(shouldSendMessage({ key: "Enter" })).toBe(true);
    expect(shouldSendMessage({ key: "Enter", ctrlKey: true })).toBe(true);
    expect(shouldSendMessage({ key: "Enter", metaKey: true })).toBe(true);
    expect(shouldSendMessage({ key: "Enter", shiftKey: true })).toBe(false);
    expect(shouldSendMessage({ key: "Enter", isComposing: true })).toBe(false);
    expect(shouldSendMessage({ key: "Enter", keyCode: 229 })).toBe(false);
    expect(shouldSendMessage({ key: "a" })).toBe(false);
  });
  it("follows the timeline only when the reader remains near the latest message", () => {
    expect(isNearLatest({ scrollHeight: 1200, clientHeight: 500, scrollTop: 700 })).toBe(true);
    expect(isNearLatest({ scrollHeight: 1200, clientHeight: 500, scrollTop: 621 })).toBe(true);
    expect(isNearLatest({ scrollHeight: 1200, clientHeight: 500, scrollTop: 600 })).toBe(false);
  });
});

describe("persisted production message projection", () => {
  const message: Message = { id: "message-1", sequence: 1, author: "reef", role: "contributor", body: "**Evidence**, not a completion claim.", createdAt: "2026-10-16T02:00:00Z", outcomeId: null };
  it("renders professional identity separately from the saved outcome role, with copy access", () => {
    const html = renderToStaticMarkup(createElement(MessageRow, { message, members: MEMBERS, onOpenProfile: () => {} }));
    expect(html).toContain("Research &amp; evidence");
    expect(html).toContain("Contributor");
    expect(html).toContain('aria-label="Copy Reef message"');
    expect(html).toContain('data-message-id="message-1"');
    expect(html).not.toContain("Goal achieved");
    expect(html).toContain("<strong>Evidence</strong>");
  });
  it("renders human messages on their own side and never infers outcome status from prose", () => {
    const html = renderToStaticMarkup(createElement(MessageRow, { message: { ...message, author: "human", role: "human", body: "Everything is completed" }, members: MEMBERS, onOpenProfile: () => {} }));
    expect(html).toContain("message-human");
    expect(html).toContain("Everything is completed");
    expect(html).not.toContain("Reviewed");
  });
  it("does not inject raw HTML or treat a body as control instructions", () => {
    const html = renderToStaticMarkup(createElement(MessageRow, { message: { ...message, body: '<script>alert("x")</script>' }, members: MEMBERS, onOpenProfile: () => {} }));
    expect(html).not.toContain('<script>');
  });
});
