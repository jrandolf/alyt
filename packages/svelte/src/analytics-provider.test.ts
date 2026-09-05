import { createAnalytics, type AnalyticsClient } from "@alyt/core";
import { flushSync, mount, unmount } from "svelte";
import { fromStore, writable } from "svelte/store";
import { afterEach, describe, expect, it, vi } from "vitest";

import Consumer from "./consumer.test.svelte";
import ProviderTree from "./provider-tree.test.svelte";
import { createTracker } from "./tracker.test-fixture.js";

const mounted: ReturnType<typeof mount>[] = [];

afterEach(async () => {
  for (const component of mounted.splice(0)) {
    await unmount(component);
  }
  document.body.replaceChildren();
});

describe("AnalyticsProvider", () => {
  it("returns the exact client, scopes nested providers, and preserves the parent", () => {
    const client = createAnalytics();
    const nested = createAnalytics();
    const clients: AnalyticsClient[] = [];
    mounted.push(
      mount(ProviderTree, {
        target: document.body,
        props: { client, nested, capture: (value) => clients.push(value) },
      }),
    );
    flushSync();
    expect(clients).toEqual([client, nested, client]);
    expect(clients[0]).toBe(client);
    expect(document.body.querySelectorAll("button")).toHaveLength(3);
  });

  it("supports setAnalytics without a provider and existing generated trackers", () => {
    const track = vi.fn();
    const skipped = vi.fn();
    const client = createAnalytics({
      plugins: [
        { name: "selected", track },
        { name: "skipped", track: skipped },
      ],
    });
    const capture = (value: AnalyticsClient) => {
      createTracker(value).signupClicked("header", { only: ["selected"] });
    };
    mounted.push(
      mount(ProviderTree, {
        target: document.body,
        props: { client, capture, direct: true },
      }),
    );
    flushSync();
    expect(track).toHaveBeenCalledExactlyOnceWith("signup_clicked", {
      source: "header",
    });
    expect(skipped).not.toHaveBeenCalled();
  });

  it("registers plugins after consent and removes them on revocation and unmount", async () => {
    const track = vi.fn();
    const identify = vi.fn();
    const page = vi.fn();
    const reset = vi.fn();
    const plugin = { name: "consented", track, identify, page, reset };
    const client = createAnalytics();
    const consent = fromStore(writable(false));
    const component = mount(ProviderTree, {
      target: document.body,
      props: {
        client,
        plugin,
        capture: vi.fn(),
        get consent() {
          return consent.current;
        },
      },
    });
    mounted.push(component);
    flushSync();
    client.track("before");
    expect(track).not.toHaveBeenCalled();

    flushSync(() => {
      consent.current = true;
    });
    expect(track).not.toHaveBeenCalled();
    expect(page).not.toHaveBeenCalled();
    document.body.querySelector("button")?.click();
    client.identify("user", { plan: "pro" });
    client.page("Home");
    client.reset();
    expect(track).toHaveBeenCalledExactlyOnceWith("clicked", undefined);
    expect(identify).toHaveBeenCalledExactlyOnceWith("user", { plan: "pro" });
    expect(page).toHaveBeenCalledExactlyOnceWith("Home", undefined);
    expect(reset).toHaveBeenCalledOnce();

    flushSync(() => {
      consent.current = false;
    });
    client.track("revoked");
    expect(track).toHaveBeenCalledTimes(1);
    flushSync(() => {
      consent.current = true;
    });
    client.track("reaccepted");
    expect(track).toHaveBeenCalledTimes(2);
    await unmount(component);
    mounted.splice(mounted.indexOf(component), 1);
    client.track("unmounted");
    expect(track).toHaveBeenCalledTimes(2);
  });

  it("throws a useful error without context", () => {
    expect(() =>
      mount(Consumer, {
        target: document.body,
        props: { capture: vi.fn() },
      }),
    ).toThrow("getAnalytics must be used within an <AnalyticsProvider>");
  });
});
