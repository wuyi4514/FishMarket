// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "../src/web/App";
import { buildApp } from "../src/server/http";
import { MemoryRoomStore } from "../src/server/room-store";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it("the actual App posts selected members and derives targets from edited @ text through HTTP", async () => {
  localStorage.clear(); HTMLElement.prototype.scrollTo = vi.fn();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); } });
  const app = buildApp({ store: new MemoryRoomStore(), model: { respond: async (_context, schema) => schema.parse({ contractVersion: "admission-v1", action: "reply_only", body: "Hello from the selected teammate." }) }, serveWeb: false });
  const posts: Array<{ path: string; body: Record<string, unknown> }> = [];
  vi.stubGlobal("fetch", async (path: string, options: RequestInit = {}) => {
    if (options.body) posts.push({ path, body: JSON.parse(String(options.body)) });
    const response = await app.inject({ method: (options.method ?? "GET") as "GET" | "POST", url: path, headers: options.headers as Record<string, string>, payload: options.body as string | undefined });
    return new Response(response.body, { status: response.statusCode, headers: { "Content-Type": "application/json" } });
  });
  try {
    render(<App/>);
    const createButton = screen.getAllByRole("button", { name: "Create a group chat" })[0]!;
    await waitFor(() => expect((createButton as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(createButton);
    fireEvent.change(screen.getByRole("textbox", { name: "Room name" }), { target: { value: "Selected UI pair" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Include Harbor" })); fireEvent.click(screen.getByRole("checkbox", { name: "Include Beacon" }));
    fireEvent.click(screen.getByRole("button", { name: "Create room ↗" }));
    await screen.findByRole("heading", { name: "Selected UI pair", level: 1 });
    expect(posts.at(-1)!.body).toEqual({ contractVersion: "create-room-v2", title: "Selected UI pair", members: ["reef", "sail"] });
    expect(screen.queryByRole("button", { name: "View Harbor profile" })).toBeNull();
    expect(screen.getByRole("button", { name: "The working room Open conversation" })).toBeTruthy();
    const input = screen.getByRole("textbox", { name: "Message" });
    fireEvent.change(input, { target: { value: "@Sa", selectionStart: 3 } }); fireEvent.keyDown(input, { key: "Enter" });
    expect((input as HTMLTextAreaElement).value).toBe("@Sail ");
    await act(async () => { fireEvent.change(input, { target: { value: "@Sail Hello", selectionStart: 11 } }); fireEvent.keyDown(input, { key: "Enter" }); });
    expect(posts.at(-1)!.body.target).toBe("sail");
    await waitFor(() => expect((screen.getAllByRole("button", { name: "Create a group chat" })[0] as HTMLButtonElement).disabled).toBe(false));
    await act(async () => { fireEvent.change(input, { target: { value: "Hello team", selectionStart: 10 } }); fireEvent.keyDown(input, { key: "Enter" }); });
    expect(posts.at(-1)!.body.target).toBe("team");
    expect(screen.queryByRole("combobox", { name: "Message recipient" })).toBeNull();
    await waitFor(() => expect(screen.getAllByText("Hello from the selected teammate.")).toHaveLength(2));
  } finally { cleanup(); await app.close(); }
});
