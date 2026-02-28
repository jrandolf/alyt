import { describe, expect, it, vi } from "vitest";
import { googleAnalytics } from "./plugin.js";

describe("googleAnalytics", () => {
  it("returns a plugin with name 'google-analytics'", () => {
    const plugin = googleAnalytics({ measurementId: "G-TEST" });
    expect(plugin.name).toBe("google-analytics");
  });

  it("calls window.gtag on track", () => {
    const gtagMock = vi.fn();
    vi.stubGlobal("window", { gtag: gtagMock });

    const plugin = googleAnalytics({ measurementId: "G-TEST" });
    plugin.track("test_event", { key: "value" });

    expect(gtagMock).toHaveBeenCalledWith("event", "test_event", { key: "value" });

    vi.unstubAllGlobals();
  });

  it("calls gtag set for identify", () => {
    const gtagMock = vi.fn();
    vi.stubGlobal("window", { gtag: gtagMock });

    const plugin = googleAnalytics({ measurementId: "G-TEST" });
    plugin.identify!("user-123", { email: "a@b.com" });

    expect(gtagMock).toHaveBeenCalledWith("set", { user_id: "user-123", email: "a@b.com" });

    vi.unstubAllGlobals();
  });

  it("does not throw if window.gtag is undefined", () => {
    vi.stubGlobal("window", {});

    const plugin = googleAnalytics({ measurementId: "G-TEST" });
    expect(() => plugin.track("event")).not.toThrow();

    vi.unstubAllGlobals();
  });
});
