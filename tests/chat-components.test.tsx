// @vitest-environment jsdom
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MEMBERS } from "../src/contracts/group";
import { ChatComposer } from "../src/web/ChatComposer";
import { useTimeline } from "../src/web/useTimeline";
import { MessageRow } from "../src/web/MessageRow";
import { mentionTarget } from "../src/web/chat-interactions";
import { AgentProfileDialog, NewRoomDialog } from "../src/web/RoomDialogs";

afterEach(cleanup);

function ComposerHarness({ onSend, disabled = false }: { onSend: (target: string) => void; disabled?: boolean }) {
  const [draft, onDraft] = useState("");
  return <ChatComposer inputRef={createRef()} draft={draft} onDraft={onDraft} members={MEMBERS} outcomes={[]} outcomeId={null} onOutcome={() => {}} busy={false} disabled={disabled} blocked={false} onSend={() => onSend(mentionTarget(draft, MEMBERS))}/>;
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
    expect(screen.queryByRole("combobox", { name: "Message recipient" })).toBeNull();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenLastCalledWith("reef");
    fireEvent.change(input, { target: { value: "Ask the team", selectionStart: 12 } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(send).toHaveBeenLastCalledWith("team");
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

describe("production creation and profile dialogs", () => {
  function nativeDialogs() {
    // jsdom 26 has dialog elements but not their browser lifecycle methods.
    for (const method of ["showModal", "close"] as const) if (!HTMLDialogElement.prototype[method]) Object.defineProperty(HTMLDialogElement.prototype, method, { configurable: true, writable: true, value() {} });
    vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(function (this: HTMLDialogElement) { this.setAttribute("open", ""); });
    vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (this: HTMLDialogElement) { this.removeAttribute("open"); });
  }
  afterEach(() => vi.restoreAllMocks());
  it("submits exactly selected teammates and prevents creation without a reviewer", () => {
    nativeDialogs(); const create = vi.fn();
    render(<NewRoomDialog defaultTitle="Pair work" busy={false} error={null} hasDraft onClose={() => {}} onCreate={create}/>);
    fireEvent.click(screen.getByRole("checkbox", { name: "Include Delivery - Anchor" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Include Quality - Puffer" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Include Design - Coral" }));
    fireEvent.click(screen.getByRole("button", { name: "Create room ↗" }));
    expect(create).toHaveBeenCalledWith("Pair work", ["reef", "sail"]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Include Content - Anemone" }));
    expect((screen.getByRole("button", { name: "Create room ↗" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.submit(screen.getByRole("textbox", { name: "Room name" }).closest("form")!);
    expect(create).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Choose at least two agents/)).toBeTruthy();
  });
  it("retains position information without any Message action", () => {
    nativeDialogs(); render(<AgentProfileDialog member={MEMBERS[2]!} onClose={() => {}}/>);
    expect(screen.getByText("Strategy & planning")).toBeTruthy();
    expect(screen.getByText("Position responsibilities")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Message Sail/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Back to the room" })).toBeNull();
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeTruthy();
    expect(screen.queryByRole("tab", { name: "Skills" })).toBeNull();
    expect(screen.queryByRole("tab", { name: "Tools" })).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: "Models" }));
    expect(screen.getByText("Gemini · Vertex AI")).toBeTruthy();
  });
  it("only closes member details through its explicit close button", () => {
    nativeDialogs(); const close = vi.fn();
    render(<AgentProfileDialog member={MEMBERS[1]!} onClose={close}/>);
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ left: 850, right: 1280, top: 0, bottom: 800 } as DOMRect);
    fireEvent.click(dialog, { clientX: 870, clientY: 110 }); // Sheet padding, not a child.
    fireEvent.click(screen.getByText("Position responsibilities"));
    fireEvent.click(dialog, { clientX: 300, clientY: 250 }); // Transparent backdrop.
    const cancellation = new Event("cancel", { cancelable: true });
    fireEvent(dialog, cancellation); // Native Escape cancellation must also be prevented.
    expect(cancellation.defaultPrevented).toBe(true);
    expect(close).not.toHaveBeenCalled();
    expect(dialog.hasAttribute("open")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(close).toHaveBeenCalledTimes(1);
  });
  it("keeps creation dismissal available without treating its blank padding as a backdrop", () => {
    nativeDialogs(); const close = vi.fn();
    render(<NewRoomDialog defaultTitle="New room" busy={false} error={null} hasDraft={false} onClose={close} onCreate={() => {}}/>);
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({ left: 250, right: 850, top: 100, bottom: 700 } as DOMRect);
    fireEvent.click(dialog, { clientX: 270, clientY: 120 });
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(dialog, { clientX: 200, clientY: 120 });
    expect(close).toHaveBeenCalledTimes(1);
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(close).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(close).toHaveBeenCalledTimes(3);
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
