import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "../src/web/App";

describe("annotated copy cleanup using the production App", () => {
  it("ships the NeoOrg logo and browser title through the production container build", () => {
    const source = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
    expect(source("../index.html")).toContain("<title>NeoOrg");
    expect(source("../index.html")).toContain('href="/brand/neoorg-logo.png"');
    expect(source("../Dockerfile")).toContain("COPY public ./public");
    expect(readFileSync(new URL("../public/brand/neoorg-logo.png", import.meta.url)).subarray(1, 4).toString()).toBe("PNG");
  });
  it("removes exactly the marked auxiliary copy and live-model badge from the actual render", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const removed of ["A HUMAN + AI WORKSPACE", "Gemini · Live", "GOOD WORK STARTS WITH A CONVERSATION", "You bring the context.", "Rooms remembered in this browser", "4 AGENTS + YOU", "Many perspectives.", "One accountable owner.", "Persistent teammates. Shared context.", "A clear path to a reviewed result.", "Your judgment stays at the center."]) expect(html).not.toContain(removed);
    expect(html).not.toContain('class="live-badge'); expect(html).not.toContain('class="sidebar-note"');
  });
  it("retains main content, room and member controls, shortcut and the unmarked safety footnote", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const kept of ["NeoOrg", "Start with a shared goal", "Create a group chat", "Working rooms", "View Delivery - Anchor profile", "View Product - Spark profile", "View Content - Anemone profile", "View Design - Coral profile", "View Quality - Puffer profile", "⌘ / Ctrl + Enter to send", "AI can make mistakes."]) expect(html).toContain(kept);
    expect(html).not.toContain("Start a fresh room"); expect(html).not.toContain("Message recipient");
    expect(html).not.toContain("Message the whole team"); expect(html).not.toContain("FishMarket</");
    expect(html).toContain('/brand/neoorg-logo.png');
  });
  it("keeps the three recommended questions but removes duplicate welcome avatars and the decorative fish", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const question of ["Make a launch decision", "Untangle a team bottleneck", "Start with a simple question"]) expect(html).toContain(question);
    expect(html).toContain('class="example-grid"');
    expect(html).not.toContain('class="welcome-team"'); expect(html).not.toContain('class="welcome-mark"');
    expect(html).toContain('class="brand-icon"'); expect(html).toContain('class="avatar-stack"');
    expect(html.match(/aria-label="View Product - Spark profile"/g)).toHaveLength(2);
  });
  it("exposes real NeoOrg-aligned group and composer controls without unimplemented actions", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const kept of ["GROUP CHATS", "View room members", "Mention a teammate", "Enter to send · Shift + Enter for a new line"]) expect(html).toContain(kept);
    for (const absent of ["Upload file", "Send email", "Group announcements", "Owner transfer"]) expect(html).not.toContain(absent);
  });
});
