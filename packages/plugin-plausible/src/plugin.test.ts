import { describe, expect, it, vi } from "vitest";
import { plausible } from "./plugin.js";

describe("plausible", () => {
  it("returns a plugin with name 'plausible'", () => {
    const plugin = plausible({ domain: "example.com" });
    expect(plugin.name).toBe("plausible");
  });

  it("calls window.plausible on track with props", () => {
    const plausibleMock = vi.fn();
    vi.stubGlobal("window", { plausible: plausibleMock });

    const plugin = plausible({ domain: "example.com" });
    plugin.track("signup", { plan: "pro" });

    expect(plausibleMock).toHaveBeenCalledWith("signup", {
      props: { plan: "pro" },
    });

    vi.unstubAllGlobals();
  });

  it("calls window.plausible on track without props when no params", () => {
    const plausibleMock = vi.fn();
    vi.stubGlobal("window", { plausible: plausibleMock });

    const plugin = plausible({ domain: "example.com" });
    plugin.track("signup");

    expect(plausibleMock).toHaveBeenCalledWith("signup", undefined);

    vi.unstubAllGlobals();
  });

  it("does not throw if window.plausible is undefined", () => {
    vi.stubGlobal("window", {});

    const plugin = plausible({ domain: "example.com" });
    expect(() => plugin.track("event")).not.toThrow();

    vi.unstubAllGlobals();
  });

  it("uses provided client instead of window global", () => {
    const client = vi.fn();

    const plugin = plausible({ domain: "example.com", client });
    plugin.track("signup", { plan: "pro" });

    expect(client).toHaveBeenCalledWith("signup", { props: { plan: "pro" } });
  });
});
