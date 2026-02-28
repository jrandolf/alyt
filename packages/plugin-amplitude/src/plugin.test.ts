import { describe, expect, it, vi } from "vitest";
import { amplitude } from "./plugin.js";

describe("amplitude", () => {
  it("returns a plugin with name 'amplitude'", () => {
    const plugin = amplitude({ apiKey: "test-key" });
    expect(plugin.name).toBe("amplitude");
  });

  it("calls amplitude.track on track", () => {
    const trackMock = vi.fn();
    vi.stubGlobal("window", {
      amplitude: { track: trackMock, setUserId: vi.fn(), reset: vi.fn() },
    });

    const plugin = amplitude({ apiKey: "test-key" });
    plugin.track("test_event", { key: "value" });

    expect(trackMock).toHaveBeenCalledWith("test_event", { key: "value" });

    vi.unstubAllGlobals();
  });

  it("calls amplitude.setUserId on identify", () => {
    const setUserIdMock = vi.fn();
    vi.stubGlobal("window", {
      amplitude: { track: vi.fn(), setUserId: setUserIdMock, reset: vi.fn() },
    });

    const plugin = amplitude({ apiKey: "test-key" });
    plugin.identify!("user-123");

    expect(setUserIdMock).toHaveBeenCalledWith("user-123");

    vi.unstubAllGlobals();
  });

  it("calls amplitude.track with 'Page View' on page", () => {
    const trackMock = vi.fn();
    vi.stubGlobal("window", {
      amplitude: { track: trackMock, setUserId: vi.fn(), reset: vi.fn() },
    });

    const plugin = amplitude({ apiKey: "test-key" });
    plugin.page!("Home", { url: "/home" });

    expect(trackMock).toHaveBeenCalledWith("Page View", {
      page_title: "Home",
      url: "/home",
    });

    vi.unstubAllGlobals();
  });

  it("does not throw if window.amplitude is undefined", () => {
    vi.stubGlobal("window", {});

    const plugin = amplitude({ apiKey: "test-key" });
    expect(() => plugin.track("event")).not.toThrow();
    expect(() => plugin.identify!("user")).not.toThrow();
    expect(() => plugin.page!("page")).not.toThrow();
    expect(() => plugin.reset!()).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("uses provided client instead of window global", () => {
    const client = {
      track: vi.fn(),
      setUserId: vi.fn(),
      reset: vi.fn(),
    };

    const plugin = amplitude({ apiKey: "test-key", client: client as never });
    plugin.track("test_event", { key: "value" });
    plugin.identify!("user-123");
    plugin.reset!();

    expect(client.track).toHaveBeenCalledWith("test_event", { key: "value" });
    expect(client.setUserId).toHaveBeenCalledWith("user-123");
    expect(client.reset).toHaveBeenCalled();
  });
});
