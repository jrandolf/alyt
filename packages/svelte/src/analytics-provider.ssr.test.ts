import { createAnalytics, type AnalyticsClient } from "@alyt/core";
import { render } from "svelte/server";
import { expect, it, vi } from "vitest";

import Consumer from "./consumer.test.svelte";
import ProviderTree from "./provider-tree.test.svelte";

it("isolates SSR trees without browser globals, plugin effects, or automatic events", () => {
  const track = vi.fn();
  const page = vi.fn();
  const clients: AnalyticsClient[] = [];
  const first = createAnalytics();
  const second = createAnalytics();
  const plugin = { name: "browser-only", track, page };
  for (const client of [first, second]) {
    const result = render(ProviderTree, {
      props: { client, plugin, consent: true, capture: (value) => clients.push(value) },
    });
    expect(result.body).toContain("Track</button>");
    client.track("server");
    client.page("server");
  }
  expect(clients[0]).toBe(first);
  expect(clients[1]).toBe(second);
  expect(track).not.toHaveBeenCalled();
  expect(page).not.toHaveBeenCalled();
  expect(() => render(Consumer, { props: { capture: vi.fn() } }).body).toThrow(
    "getAnalytics must be used within",
  );
});
