import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "../src/web/App";

describe("annotated copy cleanup using the production App", () => {
  it("removes exactly the marked auxiliary copy and live-model badge from the actual render", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const removed of ["A HUMAN + AI WORKSPACE", "Gemini · Live", "GOOD WORK STARTS WITH A CONVERSATION", "You bring the context.", "Rooms remembered in this browser", "4 AGENTS + YOU", "Many perspectives.", "One accountable owner.", "Persistent teammates. Shared context.", "A clear path to a reviewed result.", "Your judgment stays at the center."]) expect(html).not.toContain(removed);
    expect(html).not.toContain('class="live-badge'); expect(html).not.toContain('class="sidebar-note"');
  });
  it("retains main content, room and member controls, shortcut and the unmarked safety footnote", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const kept of ["FishMarket", "Bring a goal.", "Build an outcome.", "Start a fresh room", "Working rooms", "Message recipient", "View Harbor profile", "View Reef profile", "View Sail profile", "View Beacon profile", "⌘ / Ctrl + Enter to send", "AI can make mistakes."]) expect(html).toContain(kept);
  });
  it("keeps the three recommended questions but removes duplicate welcome avatars and the decorative fish", () => {
    const html = renderToStaticMarkup(createElement(App));
    for (const question of ["Make a launch decision", "Untangle a team bottleneck", "Start with a simple question"]) expect(html).toContain(question);
    expect(html).toContain('class="example-grid"');
    expect(html).not.toContain('class="welcome-team"'); expect(html).not.toContain('class="welcome-mark"');
    expect(html).toContain('class="brand-icon"'); expect(html).toContain('class="avatar-stack"');
    expect(html.match(/aria-label="View Reef profile"/g)).toHaveLength(2);
  });
});
