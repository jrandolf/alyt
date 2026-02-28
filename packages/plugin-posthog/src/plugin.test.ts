import { describe, expect, it, vi } from "vitest";
import { posthog } from "./plugin.js";

describe("posthog", () => {
  it("returns a plugin with name 'posthog'", () => {
    const plugin = posthog({ apiKey: "phc_test" });
    expect(plugin.name).toBe("posthog");
  });

  it("calls posthog.capture on track", () => {
    const captureMock = vi.fn();
    vi.stubGlobal("window", { posthog: { capture: captureMock } });

    const plugin = posthog({ apiKey: "phc_test" });
    plugin.track("test_event", { key: "value" });

    expect(captureMock).toHaveBeenCalledWith("test_event", { key: "value" });

    vi.unstubAllGlobals();
  });

  it("calls posthog.identify on identify", () => {
    const identifyMock = vi.fn();
    vi.stubGlobal("window", { posthog: { identify: identifyMock } });

    const plugin = posthog({ apiKey: "phc_test" });
    plugin.identify!("user-123", { email: "a@b.com" });

    expect(identifyMock).toHaveBeenCalledWith("user-123", { email: "a@b.com" });

    vi.unstubAllGlobals();
  });

  it("calls posthog.capture with $pageview on page", () => {
    const captureMock = vi.fn();
    vi.stubGlobal("window", { posthog: { capture: captureMock } });

    const plugin = posthog({ apiKey: "phc_test" });
    plugin.page!("Home", { path: "/" });

    expect(captureMock).toHaveBeenCalledWith("$pageview", {
      page_title: "Home",
      path: "/",
    });

    vi.unstubAllGlobals();
  });

  it("does not throw if window.posthog is undefined", () => {
    vi.stubGlobal("window", {});

    const plugin = posthog({ apiKey: "phc_test" });
    expect(() => plugin.track("event")).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("uses provided client instead of window global", () => {
    const client = {
      capture: vi.fn(),
      identify: vi.fn(),
      reset: vi.fn(),
    };

    const plugin = posthog({ apiKey: "phc_test", client: client as never });
    plugin.track("test_event", { key: "value" });
    plugin.identify!("user-123", { email: "a@b.com" });
    plugin.reset!();

    expect(client.capture).toHaveBeenCalledWith("test_event", { key: "value" });
    expect(client.identify).toHaveBeenCalledWith("user-123", { email: "a@b.com" });
    expect(client.reset).toHaveBeenCalled();
  });
});
