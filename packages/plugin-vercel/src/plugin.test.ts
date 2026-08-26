import { track as vercelTrack } from "@vercel/analytics";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { vercelAnalytics } from "./plugin.js";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

describe("vercelAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns a plugin with name 'vercel'", () => {
    const plugin = vercelAnalytics();
    expect(plugin.name).toBe("vercel");
  });

  it("calls vercelTrack on track", () => {
    const plugin = vercelAnalytics();
    plugin.track("test_event", { key: "value" });

    expect(vercelTrack).toHaveBeenCalledWith("test_event", { key: "value" });
  });

  it("does not define identify", () => {
    const plugin = vercelAnalytics();
    expect(plugin.identify).toBeUndefined();
  });

  it("does not define page", () => {
    const plugin = vercelAnalytics();
    expect(plugin.page).toBeUndefined();
  });

  it("does not define reset", () => {
    const plugin = vercelAnalytics();
    expect(plugin.reset).toBeUndefined();
  });

  it("uses provided client instead of default vercelTrack", () => {
    const client = { track: vi.fn() };

    const plugin = vercelAnalytics({ client });
    plugin.track("test_event", { key: "value" });

    expect(client.track).toHaveBeenCalledWith("test_event", { key: "value" });
    expect(vercelTrack).not.toHaveBeenCalledWith("test_event", {
      key: "value",
    });
  });
});
