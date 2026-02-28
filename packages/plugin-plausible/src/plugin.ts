import type { AnalyticsPlugin } from "@alyt/core";

export interface PlausibleOptions {
  domain: string;
  apiHost?: string;
}

export function plausible(options: PlausibleOptions): AnalyticsPlugin {
  function getPlausible() {
    if (typeof window !== "undefined" && "plausible" in window) {
      return (window as Record<string, unknown>).plausible as (
        event: string,
        options?: { props?: Record<string, unknown> },
      ) => void;
    }
    return null;
  }

  return {
    name: "plausible",
    track(event, params) {
      getPlausible()?.(event, params ? { props: params } : undefined);
    },
  };
}
