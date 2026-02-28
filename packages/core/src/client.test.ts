import { describe, expect, it, vi } from "vitest";
import { createAnalytics } from "./client.js";
import type { AnalyticsPlugin } from "./types.js";

function mockPlugin(name = "test"): AnalyticsPlugin {
  return {
    name,
    track: vi.fn(),
    identify: vi.fn(),
    page: vi.fn(),
    reset: vi.fn(),
  };
}

describe("createAnalytics", () => {
  it("fans out track calls to all plugins", () => {
    const p1 = mockPlugin("p1");
    const p2 = mockPlugin("p2");
    const client = createAnalytics({ plugins: [p1, p2] });

    client.track("test_event", { key: "value" });

    expect(p1.track).toHaveBeenCalledWith("test_event", { key: "value" });
    expect(p2.track).toHaveBeenCalledWith("test_event", { key: "value" });
  });

  it("fans out identify calls to plugins that support it", () => {
    const withIdentify = mockPlugin("with");
    const without: AnalyticsPlugin = { name: "without", track: vi.fn() };
    const client = createAnalytics({ plugins: [withIdentify, without] });

    client.identify("user-123", { email: "a@b.com" });

    expect(withIdentify.identify).toHaveBeenCalledWith("user-123", { email: "a@b.com" });
  });

  it("fans out page calls", () => {
    const p = mockPlugin();
    const client = createAnalytics({ plugins: [p] });

    client.page("Home", { path: "/" });

    expect(p.page).toHaveBeenCalledWith("Home", { path: "/" });
  });

  it("fans out reset calls", () => {
    const p = mockPlugin();
    const client = createAnalytics({ plugins: [p] });

    client.reset();

    expect(p.reset).toHaveBeenCalled();
  });

  it("sends track only to specified plugins when using only option", () => {
    const p1 = mockPlugin("p1");
    const p2 = mockPlugin("p2");
    const client = createAnalytics({ plugins: [p1, p2] });

    client.track("event", { key: "value" }, { only: ["p1"] });

    expect(p1.track).toHaveBeenCalledWith("event", { key: "value" });
    expect(p2.track).not.toHaveBeenCalled();
  });

  it("supports addPlugin after creation", () => {
    const client = createAnalytics();
    const p = mockPlugin();

    client.addPlugin(p);
    client.track("event");

    expect(p.track).toHaveBeenCalledWith("event", undefined);
  });

  it("supports removePlugin", () => {
    const p = mockPlugin("removable");
    const client = createAnalytics({ plugins: [p] });

    client.removePlugin("removable");
    client.track("event");

    expect(p.track).not.toHaveBeenCalled();
  });

  it("works with no plugins", () => {
    const client = createAnalytics();
    expect(() => client.track("event")).not.toThrow();
  });
});
