// @vitest-environment jsdom
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MEMBERS } from "../src/contracts/group";
import { ChatComposer } from "../src/web/ChatComposer";
import { useTimeline } from "../src/web/useTimeline";
import { MessageRow } from "../src/web/MessageRow";

afterEach(cleanup);

function ComposerHarness({ onSend, disabled = false }: { onSend: () => void; disabled?: boolean }) {
  const [draft, onDraft] = useState("");
  const [target, onTarget] = useState<"team" | (typeof MEMBERS)[number]["id"]>("team");
  return <ChatComposer inputRef={createRef()} draft={draft} onDraft={onDraft} target={target} onTarget={onTarget} members={MEMBERS} outcomes={[]} outcomeId={null} onOutcome={() => {}} busy={false} disabled={disabled} blocked={false} onSend={onSend}/>;
}

describe("actual production composer events", () => {
  it("Enter first selects a real room member, then sends using the selected target", () => {
    const send = vi.fn(); render(<ComposerHarness onSend={send}/>);
    const input = screen.getByRole("textbox", { name: "Message" }) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "Ask @Re", selectionStart: 7 } });
    expect(screen.getAllByRole("option", { selected: true }).some(element => element.textContent?.includes("Reef"))).toBe(true);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
    expect(input.value).toBe("Ask @Reef ");
    expect((screen.getByRole("combobox", { name: "Message recipient" }) as HTMLSelectElement).value).toBe("reef");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("never sends an IME-confirmation key, Shift+Enter, or an empty/disabled draft", () => {
    const send = vi.fn(); const view = render(<ComposerHarness onSend={send}/>);
    const input = screen.getByRole("textbox", { name: "Message" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.change(input, { target: { value: "中文输入", selectionStart: 4 } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(send).not.toHaveBeenCalled();
    view.rerender(<ComposerHarness onSend={send} disabled/>);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
  });
  it("Escape and no-match Enter do not accidentally dispatch", () => {
    const send = vi.fn(); render(<ComposerHarness onSend={send}/>);
    const input = screen.getByRole("textbox", { name: "Message" });
    fireEvent.change(input, { target: { value: "@Nobody", selectionStart: 7 } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByText("No matching teammates")).toBeTruthy();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("actual timeline hook projection", () => {
  function Harness({ roomId, count }: { roomId: string; count: number }) {
    const timeline = useTimeline(roomId, count, false);
    return <><section aria-label="Timeline" ref={timeline.ref} onScroll={timeline.onScroll}/>{timeline.away && <button onClick={timeline.latest}>Latest {timeline.unread}</button>}</>;
  }
  it("retains the reading position when messages arrive, counts them and resets per room", () => {
    const scrollTo = vi.fn();
    const original = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = scrollTo;
    try {
      const view = render(<Harness roomId="one" count={6}/>);
      const timeline = screen.getByRole("region", { name: "Timeline" });
      Object.defineProperties(timeline, { scrollHeight: { value: 1400, configurable: true }, clientHeight: { value: 400, configurable: true }, scrollTop: { value: 100, configurable: true } });
      fireEvent.scroll(timeline); scrollTo.mockClear();
      view.rerender(<Harness roomId="one" count={8}/>);
      expect(scrollTo).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Latest 2" })).toBeTruthy();
      view.rerender(<Harness roomId="one" count={9}/>);
      expect(screen.getByRole("button", { name: "Latest 3" })).toBeTruthy();
      act(() => fireEvent.click(screen.getByRole("button", { name: "Latest 3" })));
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 1400, behavior: "auto" });
      expect(screen.queryByRole("button")).toBeNull();
      fireEvent.scroll(timeline);
      view.rerender(<Harness roomId="two" count={1}/>);
      expect(screen.queryByRole("button")).toBeNull();
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 1400, behavior: "auto" });
    } finally { HTMLElement.prototype.scrollTo = original; }
  });
});

describe("actual message copy failure", () => {
  it("exposes an actionable fallback without changing the saved message", async () => {
    const body = "This is the exact saved message.";
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")) } });
    render(<MessageRow message={{ id: "copy-1", sequence: 1, author: "reef", role: "member", body, createdAt: "2026-10-16T00:00:00Z", outcomeId: null }} members={MEMBERS} onOpenProfile={() => {}}/>);
    fireEvent.click(screen.getByRole("button", { name: "Copy Reef message" }));
    expect(await screen.findByText("Could not copy. Select the message text to copy it.")).toBeTruthy();
    expect(screen.getByText(body)).toBeTruthy();
  });
});
