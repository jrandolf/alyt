import type { AnalyticsPlugin } from "@alyt/core";

export type PlausibleClient = (
  event: string,
  options?: { props?: Record<string, unknown> },
) => void;

export interface PlausibleOptions {
  domain: string;
  apiHost?: string;
  client?: PlausibleClient;
}

export function plausible(options: PlausibleOptions): AnalyticsPlugin {
  function getPlausible(): PlausibleClient | null {
    if (options.client) return options.client;
    if (typeof window !== "undefined" && "plausible" in window) {
      return (window as Record<string, unknown>).plausible as PlausibleClient;
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
