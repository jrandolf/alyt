import { describe, expect, it, vi } from "vitest";
import { mixpanel } from "./plugin.js";

describe("mixpanel", () => {
  it("returns a plugin with name 'mixpanel'", () => {
    const plugin = mixpanel({ token: "test-token" });
    expect(plugin.name).toBe("mixpanel");
  });

  it("calls mixpanel.track on track", () => {
    const trackMock = vi.fn();
    vi.stubGlobal("window", {
      mixpanel: { track: trackMock },
    });

    const plugin = mixpanel({ token: "test-token" });
    plugin.track("test_event", { key: "value" });

    expect(trackMock).toHaveBeenCalledWith("test_event", { key: "value" });

    vi.unstubAllGlobals();
  });

  it("calls mixpanel.identify and mixpanel.people.set for identify", () => {
    const identifyMock = vi.fn();
    const setMock = vi.fn();
    vi.stubGlobal("window", {
      mixpanel: { identify: identifyMock, people: { set: setMock } },
    });

    const plugin = mixpanel({ token: "test-token" });
    plugin.identify!("user-123", { email: "a@b.com" });

    expect(identifyMock).toHaveBeenCalledWith("user-123");
    expect(setMock).toHaveBeenCalledWith({ email: "a@b.com" });

    vi.unstubAllGlobals();
  });

  it("calls mixpanel.track_pageview on page", () => {
    const trackPageviewMock = vi.fn();
    vi.stubGlobal("window", {
      mixpanel: { track_pageview: trackPageviewMock },
    });

    const plugin = mixpanel({ token: "test-token" });
    plugin.page!("Home", { path: "/" });

    expect(trackPageviewMock).toHaveBeenCalledWith({ page: "Home", path: "/" });

    vi.unstubAllGlobals();
  });

  it("does not throw if window.mixpanel is undefined", () => {
    vi.stubGlobal("window", {});

    const plugin = mixpanel({ token: "test-token" });
    expect(() => plugin.track("event")).not.toThrow();
    expect(() => plugin.identify!("user")).not.toThrow();
    expect(() => plugin.page!("page")).not.toThrow();
    expect(() => plugin.reset!()).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("uses provided client instead of window global", () => {
    const client = {
      track: vi.fn(),
      identify: vi.fn(),
      people: { set: vi.fn() },
      track_pageview: vi.fn(),
      reset: vi.fn(),
    };

    const plugin = mixpanel({ token: "test-token", client: client as never });
    plugin.track("test_event", { key: "value" });
    plugin.identify!("user-123", { email: "a@b.com" });
    plugin.reset!();

    expect(client.track).toHaveBeenCalledWith("test_event", { key: "value" });
    expect(client.identify).toHaveBeenCalledWith("user-123");
    expect(client.people.set).toHaveBeenCalledWith({ email: "a@b.com" });
    expect(client.reset).toHaveBeenCalled();
  });
});
