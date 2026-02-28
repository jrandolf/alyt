import { createAnalytics } from "@alyt/core";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { AnalyticsProvider } from "./analytics-provider.js";
import { useAnalytics } from "./use-analytics.js";

describe("useAnalytics", () => {
  it("returns the client from context", () => {
    const client = createAnalytics();

    const { result } = renderHook(() => useAnalytics(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <AnalyticsProvider client={client}>{children}</AnalyticsProvider>
      ),
    });

    expect(result.current).toBe(client);
  });

  it("throws if used outside provider", () => {
    expect(() => {
      renderHook(() => useAnalytics());
    }).toThrow("useAnalytics must be used within an <AnalyticsProvider>");
  });
});
