import type { AnalyticsPlugin } from "@alyt/core";

export interface PostHogOptions {
  apiKey: string;
  apiHost?: string;
}

export function posthog(options: PostHogOptions): AnalyticsPlugin {
  function getPostHog() {
    if (typeof window !== "undefined" && "posthog" in window) {
      return (window as Record<string, unknown>).posthog as {
        capture(event: string, params?: Record<string, unknown>): void;
        identify(userId: string, traits?: Record<string, unknown>): void;
        reset(): void;
      };
    }
    return null;
  }

  return {
    name: "posthog",
    track(event, params) {
      getPostHog()?.capture(event, params);
    },
    identify(userId, traits) {
      getPostHog()?.identify(userId, traits);
    },
    page(name, params) {
      getPostHog()?.capture("$pageview", { page_title: name, ...params });
    },
    reset() {
      getPostHog()?.reset();
    },
  };
}
